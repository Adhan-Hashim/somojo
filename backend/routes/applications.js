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
router.get('/my-applications', authMiddleware, (req, res) => require('../controllers/applicationController').getMyApplications(req, res));

// @route   POST /api/applications/:jobId
// @desc    Apply to a job and generate AI match score
// @access  Private (Job Seekers)
router.post('/:jobId', authMiddleware, (req, res) => require('../controllers/applicationController').applyForJob(req, res));

// @route   GET /api/applications/job/:jobId
// @desc    Get all applications for a specific job
// @access  Private (Employer)
router.get('/job/:jobId', authMiddleware, (req, res) => require('../controllers/applicationController').getJobApplications(req, res));

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
        console.error("[applicationStatus] ERROR:", err.message);
        res.status(500).json({ message: 'Server Error checking application status', error: err.message });
    }
});

// @route   PUT /api/applications/:applicationId/status
// @desc    Update application status (Employer only)
// @access  Private (Employer)
router.put('/:applicationId/status', authMiddleware, (req, res) => require('../controllers/applicationController').updateApplicationStatus(req, res));

// @route   POST /api/applications/:applicationId/re-evaluate
// @desc    Re-trigger AI evaluation (Employer only)
// @access  Private (Employer)
router.post('/:applicationId/re-evaluate', authMiddleware, (req, res) => require('../controllers/applicationController').reEvaluateApplication(req, res));

// @route   POST /api/applications/:applicationId/contact
// @desc    Send message to candidate (Employer only)
// @access  Private (Employer)
router.post('/:applicationId/contact', authMiddleware, (req, res) => require('../controllers/applicationController').contactCandidate(req, res));

module.exports = router;
