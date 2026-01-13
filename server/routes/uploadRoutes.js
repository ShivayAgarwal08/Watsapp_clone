const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');

router.post('/', upload.single('file'), (req, res) => {
  if(!req.file) {
     return res.status(400).json({ message: 'No file uploaded' });
  }
  // Return the path like /uploads/filename.jpg
  res.json({ 
     filePath: `/uploads/${req.file.filename}`,
     fileName: req.file.originalname,
     fileSize: req.file.size
  });
});

module.exports = router;
