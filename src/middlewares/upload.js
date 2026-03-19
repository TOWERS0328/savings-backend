const multer    = require('multer');
const cloudinary = require('../config/cloudinary');

const storage = multer.memoryStorage();
const upload  = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo se permiten imágenes'), false);
  },
});

async function uploadToCloudinary(req, res, next) {
  if (!req.file) return next();

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'savings', resource_type: 'image' },
        (error, result) => error ? reject(error) : resolve(result)
      );
      stream.end(req.file.buffer);
    });

    req.fileUrl = result.secure_url;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { single: upload.single('file'), uploadToCloudinary };