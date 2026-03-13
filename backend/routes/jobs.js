const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Profile = require('../models/Profile');
const authMiddleware = require('../middleware/authMiddleware');
const aiService = require('../services/aiService');
const jobController = require('../controllers/jobController');

// @route   GET /api/jobs/nearby
// @desc    Get nearby jobs using MongoDB $geoNear
// @access  Public
router.get('/nearby', jobController.getNearbyJobs);

// @route   GET /api/jobs
// @desc    Get all jobs
// @access  Public
router.get('/', jobController.getJobs);

// @route   GET /api/jobs/recommended
// @desc    Get jobs ranked by AI fit for the logged-in user
// @access  Private (Job Seekers)
router.get('/recommended', authMiddleware, async (req, res) => {
    try {
        // Fetch the active jobs
        const jobs = await Job.find({ status: 'active' }).sort({ createdAt: -1 });

        // Fetch the user's profile
        const profile = await Profile.findOne({ user: req.user.id });

        if (!profile) {
            // If they don't have a profile yet, we just return the standard jobs list
            return res.json(jobs);
        }

        // Pass to the AI Service for ranking
        const rankedJobs = await aiService.rankJobsForCandidate(profile, jobs);

        res.json(rankedJobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/jobs/:id
// @desc    Get job by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.json(job);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/jobs
// @desc    Create a new job (Legacy direct route)
// @access  Private (Employer)
router.post('/', authMiddleware, jobController.createJob);

// @route   POST /api/jobs/enhance
// @desc    Use AI to rewrite and enhance a job description
// @access  Private (Employer)
router.post('/enhance', authMiddleware, jobController.enhanceJob);

module.exports = router;
