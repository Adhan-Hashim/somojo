const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Profile = require('../models/Profile');
const authMiddleware = require('../middleware/authMiddleware');
const aiService = require('../services/aiService');

// @route   GET /api/jobs/nearby
// @desc    Get nearby jobs using MongoDB $geoNear
// @access  Public
router.get('/nearby', (req, res) => require('../controllers/jobController').getNearbyJobs(req, res));

// @route   GET /api/jobs/my-jobs
// @desc    Get jobs posted by logged in employer
// @access  Private
router.get('/my-jobs', authMiddleware, (req, res) => require('../controllers/jobController').getMyJobs(req, res));

// @route   GET /api/jobs
// @desc    Get all jobs
// @access  Public
router.get('/', (req, res) => require('../controllers/jobController').getJobs(req, res));

// @route   GET /api/jobs/recommended
// @desc    Get jobs ranked by AI fit for the logged-in user
// @access  Private (Job Seekers)
router.get('/recommended', authMiddleware, async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'active' }).sort({ createdAt: -1 });
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) return res.json(jobs);
        const rankedJobs = await aiService.rankJobsForCandidate(profile, jobs);
        res.json(rankedJobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error fetching recommendations', error: err.message });
    }
});

// @route   GET /api/jobs/:id
// @desc    Get job by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json(job);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Job not found' });
        res.status(500).json({ message: 'Server Error fetching job details', error: err.message });
    }
});

// @route   POST /api/jobs
// @desc    Create a new job (Legacy direct route)
// @access  Private (Employer)
router.post('/', authMiddleware, (req, res) => require('../controllers/jobController').createJob(req, res));

// @route   POST /api/jobs/enhance
// @desc    Use AI to rewrite and enhance a job description
// @access  Private (Employer)
router.post('/enhance', authMiddleware, (req, res) => require('../controllers/jobController').enhanceJob(req, res));

module.exports = router;
