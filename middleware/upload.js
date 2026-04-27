require('dotenv').config();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif',
  'pdf', 'txt', 'doc', 'docx', 'xlsx', 'csv'
];

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'file-uploader',
    resource_type: 'auto',
  },
});

const fileFilter = (req, file, cb) => {
  const ext = file.originalname.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      new Error('File type not allowed. Accepted: jpg, png, gif, pdf, txt, doc, docx, xlsx, csv'),
      false
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = upload;