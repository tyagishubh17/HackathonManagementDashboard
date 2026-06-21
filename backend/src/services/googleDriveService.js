const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const stream = require("stream");

// Fallback directory for local storage if Drive fails or is not configured
const fallbackDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(fallbackDir)) {
  fs.mkdirSync(fallbackDir, { recursive: true });
}

let drive;
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

try {
  const KEY_PATH = path.resolve(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || "./config/service-account.json");
  if (fs.existsSync(KEY_PATH) && FOLDER_ID) {
    const auth = new google.auth.GoogleAuth({
      keyFile: KEY_PATH,
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });
    drive = google.drive({ version: "v3", auth });
  } else {
    console.warn("Google Drive credentials not found. Falling back to local storage.");
  }
} catch (err) {
  console.warn("Failed to initialize Google Drive. Falling back to local storage:", err.message);
}

exports.uploadFile = async (fileBuffer, fileName, mimeType, folderName = null) => {
  if (drive) {
    try {
      const bufferStream = new stream.PassThrough();
      bufferStream.end(fileBuffer);

      let parentId = FOLDER_ID;

      if (folderName) {
        try {
          const sanitizedFolderName = folderName.replace(/['"\\/]/g, '').trim();
          const q = `mimeType='application/vnd.google-apps.folder' and name='${sanitizedFolderName.replace(/'/g, "\\'")}' and '${FOLDER_ID}' in parents and trashed=false`;
          const listRes = await drive.files.list({ q, fields: "files(id, name)" });
          
          if (listRes.data.files && listRes.data.files.length > 0) {
            parentId = listRes.data.files[0].id;
          } else {
            const folderMetadata = {
              name: sanitizedFolderName,
              mimeType: "application/vnd.google-apps.folder",
              parents: [FOLDER_ID],
            };
            const folder = await drive.files.create({
              resource: folderMetadata,
              fields: "id",
            });
            parentId = folder.data.id;
          }
        } catch (folderErr) {
          console.warn("Failed to find or create Google Drive subfolder, falling back to parent folder:", folderErr.message);
          parentId = FOLDER_ID;
        }
      }

      const fileMetadata = {
        name: fileName,
        parents: [parentId],
      };
      
      const media = {
        mimeType,
        body: bufferStream,
      };

      const file = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: "id, webViewLink, webContentLink",
      });

      // Try to set "anyone with link can view" permission
      try {
        await drive.permissions.create({
          fileId: file.data.id,
          requestBody: {
            role: "reader",
            type: "anyone",
          },
        });
      } catch (permErr) {
        console.warn("Failed to set public permissions on Google Drive file (might be restricted by domain):", permErr.message);
      }

      return {
        fileId: file.data.id,
        webViewLink: file.data.webViewLink,
        webContentLink: file.data.webContentLink,
        isLocal: false,
      };
    } catch (err) {
      console.error("Google Drive upload failed:", err);
      // Fall through to local fallback
    }
  }

  // Local fallback
  let localSubDir = fallbackDir;
  let relativePathPrefix = "/uploads";
  let finalFileId = "";

  if (folderName) {
    const sanitizedFolder = folderName.replace(/[^a-zA-Z0-9-_]/g, "_");
    localSubDir = path.join(fallbackDir, sanitizedFolder);
    if (!fs.existsSync(localSubDir)) {
      fs.mkdirSync(localSubDir, { recursive: true });
    }
    relativePathPrefix = `/uploads/${sanitizedFolder}`;
    finalFileId = `${sanitizedFolder}/${Date.now()}-${fileName}`;
  } else {
    finalFileId = `${Date.now()}-${fileName}`;
  }

  const localPath = path.join(fallbackDir, finalFileId);
  fs.writeFileSync(localPath, fileBuffer);
  
  return {
    fileId: finalFileId,
    webViewLink: `${relativePathPrefix}/${path.basename(finalFileId)}`,
    webContentLink: `${relativePathPrefix}/${path.basename(finalFileId)}`,
    isLocal: true,
  };
};

exports.deleteFile = async (fileId, isLocal = false) => {
  if (isLocal) {
    const localPath = path.join(fallbackDir, fileId);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
    return;
  }

  if (drive) {
    try {
      await drive.files.delete({ fileId });
    } catch (err) {
      console.error("Failed to delete from Google Drive:", err);
    }
  }
};

exports.downloadFileStream = async (fileId, isLocal = false) => {
  if (isLocal) {
    const localPath = path.join(fallbackDir, fileId);
    if (fs.existsSync(localPath)) {
      return { stream: fs.createReadStream(localPath), isLocal: true };
    }
    throw new Error("File not found locally");
  }

  if (drive) {
    const response = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
    return { stream: response.data, isLocal: false };
  }
  throw new Error("Google Drive not configured");
};
