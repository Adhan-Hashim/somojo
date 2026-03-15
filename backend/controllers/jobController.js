const Job = require('../models/Job');
const User = require('../models/User');
const aiService = require('../services/aiService');
const emailService = require('../services/emailService');
const locationService = require('../services/locationService');

// @desc    Get all active jobs
// @route   GET /api/jobs
// @access  Public or Private
exports.getJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'active' })
            .populate('postedBy', ['name', 'email'])
            .sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        console.error("[getJobs] ERROR:", err.message);
        res.status(500).json({ message: 'Server Error fetching active jobs', error: err.message });
    }
};

// @desc    Get jobs posted by the logged-in user
// @route   GET /api/jobs/my-jobs
// @access  Private (Employer)
exports.getMyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.user.id })
            .sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        console.error("[getMyJobs] ERROR:", err.message);
        res.status(500).json({ message: 'Server Error fetching employer jobs', error: err.message });
    }
};

// @desc    Get nearby jobs
// @route   GET /api/jobs/nearby
// @access  Public
exports.getNearbyJobs = async (req, res) => {
    try {
        const { lng, lat, maxDistance = 50000 } = req.query;

        if (!lng || !lat) {
            return res.status(400).json({ message: "Longitude and Latitude are required" });
        }

        const jobs = await Job.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    distanceField: "dist.calculated",
                    maxDistance: parseInt(maxDistance),
                    query: { status: 'active' },
                    spherical: true
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "postedBy",
                    foreignField: "_id",
                    as: "postedBy"
                }
            },
            {
                $unwind: "$postedBy"
            }
        ]);

        res.json(jobs);
    } catch (err) {
        console.error("[getNearbyJobs] ERROR:", err.message);
        res.status(500).json({ message: 'Server Error fetching nearby jobs', error: err.message });
    }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('postedBy', ['name', 'email']);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.json(job);
    } catch (err) {
        console.error("[getJobById] ERROR:", err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(500).json({ message: 'Server Error fetching job details', error: err.message });
    }
};

// @desc    Create a new job posting (Employers only)
// @route   POST /api/jobs
// @access  Private (Employer)
exports.createJob = async (req, res) => {
    // Ensure user is an employer
    if (req.user.role !== 'employer') {
        return res.status(403).json({ message: 'Only employers can post jobs' });
    }

    const {
        title,
        company,
        location,
        locationPoint,
        type,
        workplaceType,
        pay,
        salary,
        description,
        requirements,
        benefits,
        responsibilities,
    } = req.body;

    try {
        let finalLocationPoint = locationPoint;

        if (!finalLocationPoint && location) {
            const coords = await locationService.geocodeLocationWithAI(location);
            if (coords) {
                finalLocationPoint = {
                    type: "Point",
                    coordinates: coords
                };
            }
        }

        const newJob = new Job({
            title,
            company,
            location,
            locationPoint: finalLocationPoint,
            type: type || "Full-time",
            workplaceType,
            salary: pay || salary || "Not specified",
            description: description || "Detailed description coming soon.",
            requirements: requirements || [],
            benefits: benefits || [],
            responsibilities,
            postedBy: req.user.id,
            status: 'pending'
        });

        const job = await newJob.save();

        // Notify Admins
        try {
            const admins = await User.find({ role: 'admin' });
            if (admins.length > 0) {
                for (const admin of admins) {
                    await emailService.sendAdminJobNotification(admin.email, job, req.user);
                }
            } else {
                console.log("No admins found to notify about new job posting.");
            }
        } catch (emailErr) {
            console.error("Error notifying admins about new job:", emailErr);
        }

        res.json(job);
    } catch (err) {
        console.error("[createJob] ERROR:", err.message);
        res.status(500).json({ message: 'Server Error creating job posting', error: err.message });
    }
};

// @desc    Update a job posting
// @route   PUT /api/jobs/:id
// @access  Private (Employer only and Must own the job)
exports.updateJob = async (req, res) => {
    try {
        let job = await Job.findById(req.params.id);

        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Make sure user owns the job posting
        if (job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        job = await Job.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(job);
    } catch (err) {
        console.error("[updateJob] ERROR:", err.message);
        res.status(500).json({ message: 'Server Error updating job', error: err.message });
    }
};

// @desc    Delete a job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Employer only and Must own the job)
exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Make sure user owns the job posting
        if (job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await job.deleteOne();

        res.json({ message: 'Job removed' });
    } catch (err) {
        console.error("[deleteJob] ERROR:", err.message);
        res.status(500).json({ message: 'Server Error removing job', error: err.message });
    }
};

// @desc    Enhance a job description using AI
// @route   POST /api/jobs/enhance
// @access  Private (Employer)
exports.enhanceJob = async (req, res) => {
    // Ensure user is an employer
    if (req.user.role !== 'employer') {
        return res.status(403).json({ message: 'Only employers can enhance jobs' });
    }

    const { title, company, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ message: 'Job title and description are required for AI enhancement' });
    }

    try {
        const enhancedDescription = await aiService.enhanceJobDescription({ title, company, description });
        res.json({ enhancedDescription });
    } catch (err) {
        console.error("[enhanceJob] ERROR:", err.message);
        res.status(500).json({ message: 'Server Error generating AI Job Description', error: err.message });
    }
};
