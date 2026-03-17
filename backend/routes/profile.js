const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const profileController = require('../controllers/profileController');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/resumes');
    },
    filename: (req, file, cb) => {
        cb(null, `resume-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF and DOC are allowed.'));
        }
    }
});

// @route   GET /api/profile/me
router.get('/me', authMiddleware, profileController.getCurrentProfile);

// @route   POST /api/profile/search
router.post('/search', authMiddleware, profileController.searchProfiles);

// @route   POST /api/profile/employer-branding
router.post('/employer-branding', authMiddleware, profileController.generateEmployerBrand);

// @route   POST /api/profile/upload-resume
router.post('/upload-resume', authMiddleware, upload.single('resume'), profileController.uploadResume);

// @route   POST /api/profile/autofill
router.post('/autofill', authMiddleware, profileController.autofillFromResume);

// @route   POST /api/profile
router.post('/', authMiddleware, profileController.createOrUpdateProfile);

// @route   PUT /api/profile/save-job/:jobId
router.put('/save-job/:jobId', authMiddleware, profileController.toggleSaveJob);

// @route   GET /api/profile/user/:userId
router.get('/user/:userId', authMiddleware, profileController.getProfileByUserId);

module.exports = router;
