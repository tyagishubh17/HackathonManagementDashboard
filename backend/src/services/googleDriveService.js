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

exports.uploadFile = async (fileBuffer, fileName, mimeType) => {
  if (drive) {
    try {
      const bufferStream = new stream.PassThrough();
      bufferStream.end(fileBuffer);

      const fileMetadata = {
        name: fileName,
        parents: [FOLDER_ID],
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

      // Set "anyone with link can view" permission
      await drive.permissions.create({
        fileId: file.data.id,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });

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
  const uniqueName = `${Date.now()}-${fileName}`;
  const localPath = path.join(fallbackDir, uniqueName);
  fs.writeFileSync(localPath, fileBuffer);
  
  return {
    fileId: uniqueName,
    webViewLink: `/uploads/${uniqueName}`,
    webContentLink: `/uploads/${uniqueName}`,
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
