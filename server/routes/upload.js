const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');
const User = require('../models/User');
const { logger } = require('../middleware/errorHandler');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'resumes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `resume-${req.user.id}-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOC/DOCX files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  }
});

// @desc    Upload resume
// @route   POST /api/upload/resume
// @access  Private
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Delete old resume if exists
    const user = await User.findById(req.user.id);
    if (user.profile.resumeUrl) {
      const oldFilePath = path.join(__dirname, '..', 'uploads', 'resumes', path.basename(user.profile.resumeUrl));
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Update user profile with new resume URL
    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    user.profile.resumeUrl = resumeUrl;
    await user.save();

    logger.info(`Resume uploaded for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      resumeUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    // Clean up uploaded file if there's an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Download resume
// @route   GET /api/upload/resume/:filename
// @access  Private
const downloadResume = async (req, res, next) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Send file
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resume
// @route   DELETE /api/upload/resume
// @access  Private
const deleteResume = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.profile.resumeUrl) {
      return res.status(400).json({
        success: false,
        message: 'No resume found to delete'
      });
    }

    // Delete file from filesystem
    const filename = path.basename(user.profile.resumeUrl);
    const filePath = path.join(uploadsDir, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove resume URL from user profile
    user.profile.resumeUrl = undefined;
    await user.save();

    logger.info(`Resume deleted for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Routes
router.post('/resume', authenticateToken, uploadLimiter, upload.single('resume'), uploadResume);
router.get('/resume/:filename', authenticateToken, downloadResume);
router.delete('/resume', authenticateToken, deleteResume);

module.exports = router;