const express = require('express');
const router = express.Router();
const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/saved-jobs/:jobId
// @desc    Save a job for later
// @access  Private
router.post('/:jobId', authMiddleware, async (req, res) => {
    try {
        const jobId = req.params.jobId;

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if already saved
        const existingSave = await SavedJob.findOne({
            user: req.user.id,
            job: jobId
        });

        if (existingSave) {
            return res.status(400).json({ message: 'Job already saved' });
        }

        // Create saved job
        const savedJob = new SavedJob({
            user: req.user.id,
            job: jobId
        });

        await savedJob.save();
        res.status(201).json({ message: 'Job saved successfully' });
    } catch (err) {
        console.error(err.message);
        if (err.code === 11000) { // Duplicate key error
            return res.status(400).json({ message: 'Job already saved' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/saved-jobs/:jobId
// @desc    Remove a saved job
// @access  Private
router.delete('/:jobId', authMiddleware, async (req, res) => {
    try {
        const jobId = req.params.jobId;

        const savedJob = await SavedJob.findOneAndDelete({
            user: req.user.id,
            job: jobId
        });

        if (!savedJob) {
            return res.status(404).json({ message: 'Saved job not found' });
        }

        res.json({ message: 'Job removed from saved list' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/saved-jobs
// @desc    Get all saved jobs for current user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        const savedJobs = await SavedJob.find({ user: req.user.id })
            .populate({
                path: 'job',
                select: 'title company location type pay category requirements posted applicants'
            })
            .sort({ createdAt: -1 });

        // Format response to match frontend expectations
        const formattedJobs = savedJobs.map(saved => ({
            _id: saved.job._id,
            title: saved.job.title,
            company: saved.job.company,
            location: saved.job.location,
            type: saved.job.type,
            pay: saved.job.pay,
            category: saved.job.category,
            requirements: saved.job.requirements,
            posted: saved.job.posted,
            applicants: saved.job.applicants,
            savedAt: saved.createdAt
        }));

        res.json(formattedJobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/saved-jobs/check/:jobId
// @desc    Check if a job is saved by current user
// @access  Private
router.get('/check/:jobId', authMiddleware, async (req, res) => {
    try {
        const savedJob = await SavedJob.findOne({
            user: req.user.id,
            job: req.params.jobId
        });

        res.json({ isSaved: !!savedJob });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;