const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET /api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'email']);

        if (!profile) {
            return res.status(404).json({ message: 'There is no profile for this user' });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/profile/search
// @desc    Semantic search across all profiles using AI
// @access  Private
const profileController = require('../controllers/profileController');
router.post('/search', authMiddleware, profileController.searchProfiles);

// @route   POST /api/profile/employer-branding
// @desc    Generate Employer Branding Profile using AI
// @access  Private
router.post('/employer-branding', authMiddleware, profileController.generateEmployerBrand);

// @route   POST /api/profile
// @desc    Create or update user profile
// @access  Private
router.post('/', authMiddleware, profileController.createOrUpdateProfile);

// @route   PUT /api/profile/save-job/:jobId
// @desc    Toggle saving a job
// @access  Private
router.put('/save-job/:jobId', authMiddleware, profileController.toggleSaveJob);

module.exports = router;
