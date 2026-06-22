const mongoose = require("mongoose");
const stream = require("stream");

let bucket;

mongoose.connection.once("open", () => {
  bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads",
  });
});

/**
 * Uploads a file buffer to MongoDB GridFS.
 * @param {Buffer} fileBuffer - The file buffer to upload.
 * @param {String} fileName - The original file name.
 * @param {String} mimeType - The mime type of the file.
 * @param {String} folderName - Optional, ignored in GridFS but kept for compatibility.
 * @returns {Object} File metadata containing fileId and pseudo-urls.
 */
exports.uploadFile = async (fileBuffer, fileName, mimeType, folderName = null) => {
  return new Promise((resolve, reject) => {
    if (!bucket) {
      return reject(new Error("GridFSBucket is not initialized yet."));
    }

    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    // Create a unique filename
    const uniqueFileName = `${Date.now()}-${fileName}`;

    const uploadStream = bucket.openUploadStream(uniqueFileName, {
      contentType: mimeType,
    });

    bufferStream.pipe(uploadStream)
      .on("error", (err) => {
        reject(err);
      })
      .on("finish", () => {
        resolve({
          fileId: uploadStream.id.toString(),
          fileName: uniqueFileName,
          mimeType,
          // Since it's stored in MongoDB, viewUrl and webContentLink can point to an API route we will create if needed, 
          // but usually it's handled via a dedicated download controller.
          viewUrl: `/api/files/download/${uploadStream.id.toString()}`,
          webContentLink: `/api/files/download/${uploadStream.id.toString()}`,
          isLocal: false, // Since it's in DB, we treat it as remote/DB
        });
      });
  });
};

/**
 * Deletes a file from MongoDB GridFS.
 * @param {String} fileId - The GridFS file ID.
 * @param {Boolean} isLocal - Ignored for GridFS.
 */
exports.deleteFile = async (fileId, isLocal = false) => {
  if (!bucket) throw new Error("GridFSBucket is not initialized.");
  try {
    const objectId = new mongoose.Types.ObjectId(fileId);
    await bucket.delete(objectId);
  } catch (err) {
    console.error("Failed to delete from GridFS:", err);
  }
};

/**
 * Gets a read stream for a file from MongoDB GridFS.
 * @param {String} fileId - The GridFS file ID.
 * @param {Boolean} isLocal - Ignored for GridFS.
 * @returns {Object} { stream, isLocal }
 */
exports.downloadFileStream = async (fileId, isLocal = false) => {
  if (!bucket) throw new Error("GridFSBucket is not initialized.");
  try {
    const objectId = new mongoose.Types.ObjectId(fileId);
    const downloadStream = bucket.openDownloadStream(objectId);
    return { stream: downloadStream, isLocal: false };
  } catch (err) {
    throw new Error("File not found in GridFS");
  }
};
