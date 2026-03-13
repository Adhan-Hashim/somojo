const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const Profile = require('../models/Profile');
const authMiddleware = require('../middleware/authMiddleware');
const aiService = require('../services/aiService');

// @route   GET /api/applications/my-applications
// @desc    Get current user's (Job Seeker) applications
// @access  Private (Job Seeker)
const applicationController = require('../controllers/applicationController');
router.get('/my-applications', authMiddleware, applicationController.getMyApplications);

// @route   POST /api/applications/:jobId
// @desc    Apply to a job and generate AI match score
// @access  Private (Job Seekers)
router.post('/:jobId', authMiddleware, applicationController.applyForJob);

// @route   GET /api/applications/job/:jobId
// @desc    Get all applications for a specific job
// @access  Private (Employer)
router.get('/job/:jobId', authMiddleware, applicationController.getJobApplications);

// @route   GET /api/applications/status/:jobId
// @desc    Check if current user has applied to a job
// @access  Private (Job Seeker)
router.get('/status/:jobId', authMiddleware, async (req, res) => {
    try {
        const application = await Application.findOne({
            job: req.params.jobId,
            applicant: req.user.id
        });

        if (!application) {
            return res.json({ status: 'none' });
        }

        res.json({
            status: application.status,
            appliedAt: application.createdAt,
            aiMatchScore: application.aiMatchScore,
            aiAnalysis: application.aiAnalysis
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/applications/:applicationId/status
// @desc    Update application status (Employer only)
// @access  Private (Employer)
router.put('/:applicationId/status', authMiddleware, applicationController.updateApplicationStatus);

// @route   POST /api/applications/:applicationId/contact
// @desc    Send message to candidate (Employer only)
// @access  Private (Employer)
router.post('/:applicationId/contact', authMiddleware, applicationController.contactCandidate);

module.exports = router;
