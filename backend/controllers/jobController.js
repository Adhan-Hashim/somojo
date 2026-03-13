const Job = require('../models/Job');
const aiService = require('../services/aiService');
const locationService = require('../services/locationService');

// @desc    Get all active jobs
// @route   GET /api/jobs
// @access  Public or Private (depends on your needs, making it Public for now)
exports.getJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'active' })
            .populate('postedBy', ['name', 'email'])
            .sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get nearby jobs
// @route   GET /api/jobs/nearby
// @access  Public
exports.getNearbyJobs = async (req, res) => {
    try {
        const { lng, lat, maxDistance = 50000 } = req.query; // maxDistance default 50km

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
                // Optional: Lookup to mimic .populate('postedBy')
                $lookup: {
                    from: "users",
                    localField: "postedBy",
                    foreignField: "_id",
                    as: "postedBy"
                }
            },
            {
                // Convert array to single object
                $unwind: "$postedBy"
            }
        ]);

        res.json(jobs);
    } catch (err) {
        console.error("Error fetching nearby jobs:", err.message);
        res.status(500).send('Server Error');
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
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(500).send('Server Error');
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
        locationPoint, // <--- Frontend explicit coordinate [lng, lat] passing
        type,
        workplaceType,
        pay, // Frontend sends "pay"
        salary,
        description,
        requirements,
        benefits,
        responsibilities,
        category
    } = req.body;

    try {
        let finalLocationPoint = locationPoint;

        // Attempt to convert the location string to a GeoJSON point ONLY IF explicit coords were not provided
        if (!finalLocationPoint && location) {
            const coords = await locationService.geocodeLocationWithAI(location);
            if (coords) {
                finalLocationPoint = {
                    type: "Point",
                    coordinates: coords // [lng, lat]
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
            postedBy: req.user.id
        });

        const job = await newJob.save();
        res.json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
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
        console.error(err.message);
        res.status(500).send('Server Error');
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
        console.error(err.message);
        res.status(500).send('Server Error');
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
        console.error(err.message);
        res.status(500).send('Server Error generating AI Job Description');
    }
};
