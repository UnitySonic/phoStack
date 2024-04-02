const express = require('express');
const multer = require('multer');

const pictureController = require('./picture.controller');

const pictureRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 100000000 },
});

// Route for handling file upload
pictureRouter.post('/', upload.single('file'), pictureController.savePicture);

// Route for fetching pictures associated with a specific user
pictureRouter.get('/:userId', pictureController.fetchPicture);

module.exports = pictureRouter;
