//const cloudinary = require('cloudinary');
//
//cloudinary.config({
//    cloud_name: "duelyepmz",
//    api_key: "238651275937365",
//    api_secret: "VAntf888sLkPLBejGbJL-ZAdFac"
//  });
//
//module.exports = cloudinary;

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: "duelyepmz",
  api_key: "238651275937365",
  api_secret: "VAntf888sLkPLBejGbJL-ZAdFac"
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile-photos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif']
  }
});

// Configure multer
const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };