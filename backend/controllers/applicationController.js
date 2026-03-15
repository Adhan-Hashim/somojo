const Application = require('../models/Application');
const Job = require('../models/Job');
const Profile = require('../models/Profile');
const User = require('../models/User');
const emailService = require('../services/emailService');
const aiService = require('../services/aiService');
const fs = require('fs');
const path = require('path');

const logEmail = (msg) => {
    try {
        const logPath = path.join(__dirname, '../email-debug.log');
        const timestamp = new Date().toISOString();
        fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
    } catch (e) {
        console.error("Logging failed:", e);
    }
};

// @desc    Apply for a job
// @route   POST /api/applications/:jobId
// @access  Private (Job Seeker)
exports.applyForJob = async (req, res) => {
    // Ensure user is not an employer (they shouldn't be applying to jobs)
    if (req.user.role === 'employer') {
        return res.status(403).json({ message: 'Employers cannot apply to jobs' });
    }

    const { coverLetter, resumeUrl } = req.body || {};
    const jobId = req.params.jobId;

    try {
        const job = await Job.findById(jobId).populate('postedBy', ['name', 'email']);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Check if user already applied
        const existingApplication = await Application.findOne({
            job: jobId,
            applicant: req.user.id
        });

        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }

        // Default to profile resume if none provided specifically
        let finalResumeUrl = resumeUrl;
        if (!finalResumeUrl) {
            const profile = await Profile.findOne({ user: req.user.id });
            if (profile && profile.resumeUrl) {
                finalResumeUrl = profile.resumeUrl;
            }
        }

        const application = new Application({
            job: jobId,
            applicant: req.user.id,
            coverLetter,
            resumeUrl: finalResumeUrl
        });

        await application.save();

        // Send Email Notifications
        try {
            const seekerEmail = req.user.email;
            const employerEmail = job.postedBy?.email;

            logEmail(`Attempting emails for Job: ${job.title}, Seeker: ${seekerEmail}, Employer: ${employerEmail}`);

            if (seekerEmail) {
                logEmail(`Sending confirmation to seeker: ${seekerEmail}`);
                await emailService.sendApplicationConfirmation(seekerEmail, req.user.name, job);
            }

            if (employerEmail && job.postedBy) {
                logEmail(`Sending notification to employer: ${employerEmail}`);
                await emailService.sendEmployerNotification(
                    employerEmail,
                    job.postedBy.name || 'Employer',
                    req.user.name,
                    job
                );
            } else {
                logEmail(`No employer email found for job ${job._id}`);
            }
            logEmail(`All triggers completed.`);
        } catch (mailErr) {
            logEmail(`TRIGGER ERROR: ${mailErr.message}`);
            console.error("[EMAIL_TRIGGER] Error:", mailErr);
        }

        // 🔥 BACKGROUND PROCESS: Generate AI Match Score
        (async () => {
            try {
                const profile = await Profile.findOne({ user: req.user.id });
                if (profile && aiService.evaluateCandidate) {
                    const aiResult = await aiService.evaluateCandidate(profile, job);

                    application.aiMatchScore = aiResult.score;
                    application.aiAnalysis = aiResult.reasoning;
                    await application.save();
                    logEmail(`[AI] Evaluated applicant ${req.user.id} against job ${job._id}. Score: ${aiResult.score}`);
                }
            } catch (aiErr) {
                logEmail(`[AI] Evaluation Failed: ${aiErr.message}`);
                console.error('[AI] Background Evaluation Failed', aiErr);
            }
        })();

        res.json(application);
    } catch (err) {
        console.error("[applyForJob] CRITICAL ERROR:", err);
        res.status(500).json({
            message: 'Server Error during application submission',
            error: err.message
        });
    }
};

// @desc    Get current user's (Job Seeker) applications
// @route   GET /api/applications/my-applications
// @access  Private (Job Seeker)
exports.getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ applicant: req.user.id })
            .populate({
                path: 'job',
                select: 'title company location type pay category requirements posted applicants logoSeed'
            })
            .sort({ createdAt: -1 });

        // Format the response to match frontend expectations
        const formattedApplications = applications.map(app => ({
            _id: app._id,
            status: app.status,
            aiMatchScore: app.aiMatchScore,
            aiAnalysis: app.aiAnalysis,
            messages: app.messages || [],
            createdAt: app.createdAt,
            appliedAt: app.createdAt,
            updatedAt: app.updatedAt,
            lastStatusUpdate: app.lastStatusUpdate,
            job: app.job
        }));

        res.json(formattedApplications);
    } catch (err) {
        console.error("[getMyApplications] CRITICAL ERROR:", err);
        res.status(500).json({ message: 'Server Error fetching applications', error: err.message });
    }
};

// @desc    Get applications for a specific job (Employer view)
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer)
exports.getJobApplications = async (req, res) => {
    if (req.user.role !== 'employer') {
        return res.status(403).json({ message: 'Only employers can view job applications' });
    }

    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Verify the employer owns the job
        if (job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const applications = await Application.find({ job: req.params.jobId })
            .populate('applicant', ['name', 'email'])
            .sort({ createdAt: -1 });

        // Manually attach profile details for each applicant
        const appsWithProfiles = await Promise.all(applications.map(async (app) => {
            const appObj = app.toObject();
            const profile = await Profile.findOne({ user: app.applicant._id }).select('skills interests');
            if (profile) {
                appObj.applicant.interests = profile.interests || [];
                appObj.applicant.skills = profile.skills || [];
            } else {
                appObj.applicant.interests = [];
                appObj.applicant.skills = [];
            }
            return appObj;
        }));

        res.json(appsWithProfiles);
    } catch (err) {
        console.error("[getJobApplications] CRITICAL ERROR:", err);
        res.status(500).json({ message: 'Server Error fetching job applications', error: err.message });
    }
};

// @desc    Update application status (Employer action)
// @route   PUT /api/applications/:id/status
// @access  Private (Employer)
exports.updateApplicationStatus = async (req, res) => {
    if (req.user.role !== 'employer') {
        return res.status(403).json({ message: 'Only employers can update status' });
    }

    const { status } = req.body;

    try {
        let application = await Application.findById(req.params.applicationId)
            .populate('job')
            .populate('applicant', ['name', 'email']);

        if (!application) return res.status(404).json({ message: 'Application not found' });

        // Verify the employer owns the job that this application is for
        if (application.job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const oldStatus = application.status;
        application.status = status;
        application.lastStatusUpdate = Date.now();
        await application.save();

        // Send notification email if status changed to accepted or rejected
        if (oldStatus !== status && (status === 'accepted' || status === 'rejected')) {
            try {
                logEmail(`Status update trigger: ${status} for applicant ${application.applicant.email} on job ${application.job.title}`);
                await emailService.sendApplicationStatusUpdate(
                    application.applicant.email,
                    application.applicant.name,
                    application.job,
                    status
                );
                logEmail(`Status update email sent.`);
            } catch (mailErr) {
                logEmail(`STATUS UPDATE TRIGGER ERROR: ${mailErr.message}`);
                console.error("Mail trigger failed during status update:", mailErr);
            }
        }

        res.json(application);
    } catch (err) {
        console.error("[updateApplicationStatus] CRITICAL ERROR:", err);
        res.status(500).json({ message: 'Server Error updating application status', error: err.message });
    }
};

// @desc    Send message to candidate (Employer action)
// @route   POST /api/applications/:applicationId/contact
// @access  Private (Employer)
exports.contactCandidate = async (req, res) => {
    if (req.user.role !== 'employer') {
        return res.status(403).json({ message: 'Only employers can send messages' });
    }

    const { message } = req.body;
    const applicationId = req.params.applicationId;

    try {
        if (!message || message.trim().length === 0) {
            return res.status(400).json({ message: 'Message cannot be empty' });
        }

        const application = await Application.findById(applicationId)
            .populate('applicant', ['name', 'email'])
            .populate('job');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check if user is the employer who posted the job
        if (application.job.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized. You did not post this job.' });
        }

        // Add message to application
        const newMessage = {
            from: req.user.id,
            message: message.trim(),
            timestamp: new Date()
        };
        application.messages.push(newMessage);

        await application.save();

        // Send Email Notification to Candidate
        try {
            logEmail(`Messaging trigger: message for applicant ${application.applicant.email} on job ${application.job.title}`);
            if (emailService.sendCandidateMessageNotification) {
                await emailService.sendCandidateMessageNotification(
                    application.applicant.email,
                    application.applicant.name,
                    application.job,
                    message.trim()
                );
                logEmail(`Message notification email sent.`);
            }
        } catch (mailErr) {
            logEmail(`MESSAGE TRIGGER ERROR: ${mailErr.message}`);
            console.error("Mail trigger failed during messaging:", mailErr);
        }

        res.json({
            message: 'Message sent successfully',
            messageId: application.messages[application.messages.length - 1]._id
        });
    } catch (err) {
        console.error("[contactCandidate] CRITICAL ERROR:", err);
        res.status(500).json({ message: 'Server Error sending message', error: err.message });
    }
};
// @desc    Re-trigger AI evaluation (Employer action)
// @route   POST /api/applications/:applicationId/re-evaluate
// @access  Private (Employer)
exports.reEvaluateApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.applicationId).populate('job');
        if (!application) return res.status(404).json({ message: 'Application not found' });

        if (application.job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const profile = await Profile.findOne({ user: application.applicant });
        if (!profile) return res.status(404).json({ message: 'Applicant profile not found' });

        const aiResult = await aiService.evaluateCandidate(profile, application.job);

        application.aiMatchScore = aiResult.score;
        application.aiAnalysis = aiResult.reasoning;
        await application.save();

        res.json({
            message: 'AI Evaluation re-triggered successfully',
            score: application.aiMatchScore,
            analysis: application.aiAnalysis
        });
    } catch (err) {
        console.error("[reEvaluateApplication] ERROR:", err);
        res.status(500).json({ message: 'Failed to re-evaluate application', error: err.message });
    }
};
