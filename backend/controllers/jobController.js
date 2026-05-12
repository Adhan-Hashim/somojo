const Job = require('../models/Job');
const User = require('../models/User');
const aiService = require('../services/aiService');
const emailService = require('../services/emailService');
const locationService = require('../services/locationService');
const Profile = require('../models/Profile');

/**
 * Calculates a basic relevance score (0-100) between a search query and a job.
 * This provides the data for the 'Sort by Relevance' frontend feature.
 */
const calculateRelevance = (job, query = "", userProfile = null) => {
    let score = 0;
    const q = query.toLowerCase().trim();
    if (!q) return 0;

    const title = (job.title || "").toLowerCase();
    const company = (job.company || "").toLowerCase();
    const description = (job.description || "").toLowerCase();
    const category = (job.category || "").toLowerCase();

    // 1. Exact Title Match (High Priority)
    if (title === q) score += 100;
    else if (title.includes(q)) score += 80;

    // 2. Partial Title Match (e.g. "Video Editor" matching "Video")
    const queryWords = q.split(/\s+/);
    queryWords.forEach(word => {
        if (title.includes(word)) score += 20;
        if (company.includes(word)) score += 10;
        if (category.includes(word)) score += 15;
    });

    // 3. Keyword Density in description
    const descMatches = (description.match(new RegExp(q, "gi")) || []).length;
    score += Math.min(descMatches * 5, 20);

    // 4. Personalized candidate match (Bonus if user skills match job category/title)
    if (userProfile && userProfile.skills) {
        let skillMatches = 0;
        userProfile.skills.forEach(skill => {
            const s = skill.toLowerCase();
            if (title.includes(s) || category.includes(s) || description.includes(s)) {
                skillMatches++;
            }
        });
        score += Math.min(skillMatches * 10, 30);
    }

    return Math.min(score, 100);
};

// @desc    Get all active jobs
// @route   GET /api/jobs
// @access  Public or Private
exports.getJobs = async (req, res) => {
    try {
        const { location, q, category } = req.query;
        const matchQuery = { status: 'active' };

        if (q) {
            matchQuery.$or = [
                { title: { $regex: q, $options: 'i' } },
                { company: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ];
        }

        if (category) {
            matchQuery.category = { $regex: category, $options: 'i' };
        }

        if (location) {
            // Case-insensitive regex match on the location field
            // We split by commas and take the first part (usually the city) to try a broader match if the full string fails
            const locationParts = location.split(',').map(p => p.trim()).filter(p => p);
            const mainLocation = locationParts[0];
            
            matchQuery.$or = matchQuery.$or || [];
            matchQuery.$or.push({ location: { $regex: location, $options: 'i' } });
            if (mainLocation && mainLocation !== location) {
                matchQuery.$or.push({ location: { $regex: mainLocation, $options: 'i' } });
            }
        }

        const jobsList = await Job.find(matchQuery)
            .populate('postedBy', ['name', 'email'])
            .sort({ createdAt: -1 });

        // Calculate relevance scores for each job
        let userProfile = null;
        if (req.user && req.user.role === 'job-seeker') {
            userProfile = await Profile.findOne({ user: req.user.id });
        }

        const jobsWithScores = jobsList.map(job => {
            const jobObj = job.toObject();
            jobObj.aiMatchScore = calculateRelevance(jobObj, q || category || "", userProfile);
            return jobObj;
        });

        // If a search query or category is provided, we sort by relevance by default for better user experience
        if (q || category) {
            jobsWithScores.sort((a, b) => b.aiMatchScore - a.aiMatchScore);
        }

        res.json(jobsWithScores);
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
        let { lng, lat, location, maxDistance = 50, q, category } = req.query;

        if (!lng || !lat) {
            if (!location) {
                return res.status(400).json({ message: "Longitude/Latitude or a location string is required" });
            }
            const coords = await locationService.geocodeLocationWithAI(location);
            if (!coords) {
                console.log(`[getNearbyJobs] AI Geocoding failed for "${location}". Falling back to text-based search.`);
                
                const fallbackMatchQuery = { status: 'active' };
                if (q) {
                    fallbackMatchQuery.$or = [
                        { title: { $regex: q, $options: 'i' } },
                        { company: { $regex: q, $options: 'i' } },
                        { description: { $regex: q, $options: 'i' } }
                    ];
                }
                if (category) {
                    fallbackMatchQuery.category = { $regex: category, $options: 'i' };
                }

                // Apply location filter to fallback
                const locationParts = location.split(',').map(p => p.trim()).filter(p => p);
                const mainLocation = locationParts[0];
                
                fallbackMatchQuery.$or = fallbackMatchQuery.$or || [];
                fallbackMatchQuery.$or.push({ location: { $regex: location, $options: 'i' } });
                if (mainLocation && mainLocation !== location) {
                    fallbackMatchQuery.$or.push({ location: { $regex: mainLocation, $options: 'i' } });
                }

                const fallbackJobsList = await Job.find(fallbackMatchQuery)
                    .populate('postedBy', ['name', 'email'])
                    .sort({ createdAt: -1 });
                
                // Score fallback jobs
                let userProfileFallback = null;
                if (req.user && req.user.role === 'job-seeker') {
                    userProfileFallback = await Profile.findOne({ user: req.user.id });
                }

                const fallbackWithScores = fallbackJobsList.map(job => {
                    const jobObj = job.toObject();
                    jobObj.aiMatchScore = calculateRelevance(jobObj, q || category || "", userProfileFallback);
                    return jobObj;
                });

                // Always sort by score for fallback since it's a direct text search
                fallbackWithScores.sort((a, b) => b.aiMatchScore - a.aiMatchScore);
                
                return res.json(fallbackWithScores);
            }
            lng = coords[0];
            lat = coords[1];
        }

        // Distance in meters (1 km = 1000 meters)
        // If the frontend sends km, we convert. If it sends something already large, assume meters.
        const distanceInMeters = parseInt(maxDistance) < 1000 ? parseInt(maxDistance) * 1000 : parseInt(maxDistance);

        const matchQuery = { status: 'active' };
        if (q) {
            matchQuery.$or = [
                { title: { $regex: q, $options: 'i' } },
                { company: { $regex: q, $options: 'i' } }
            ];
        }
        if (category) {
            matchQuery.category = { $regex: category, $options: 'i' };
        }

        const jobs = await Job.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    distanceField: "dist.calculated",
                    maxDistance: distanceInMeters,
                    query: matchQuery,
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
            },
            {
                $project: {
                    "postedBy.password": 0,
                    "postedBy.resetPasswordToken": 0,
                    "postedBy.resetPasswordExpire": 0
                }
            }
        ]);

        // Score geoNear jobs
        let userProfileGeo = null;
        if (req.user && req.user.role === 'job-seeker') {
            userProfileGeo = await Profile.findOne({ user: req.user.id });
        }

        const geoJobsWithScores = jobs.map(job => {
            // job is an object from aggregation
            job.aiMatchScore = calculateRelevance(job, q || category || "", userProfileGeo);
            return job;
        });

        // Always prioritize relevance score for sorting
        geoJobsWithScores.sort((a, b) => b.aiMatchScore - a.aiMatchScore);

        res.json(geoJobsWithScores);
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

        // Count past applicants
        const Application = require('../models/Application');
        const applicantCount = await Application.countDocuments({ job: req.params.id });

        // Convert to plain object to add new field
        const jobObj = job.toObject();
        jobObj.applicants = applicantCount;

        res.json(jobObj);
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

        // Auto-categorize using AI
        const category = await aiService.categorizeJob({ title, description });

        const newJob = new Job({
            title,
            company,
            location,
            locationPoint: finalLocationPoint,
            category,
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

// @desc    Get counts of active jobs by category
// @route   GET /api/jobs/categories/counts
// @access  Public
exports.getCategoryCounts = async (req, res) => {
    try {
        const categories = [
            "Retail & Sales",
            "Restaurant & Food",
            "Warehouse",
            "Customer Support",
            "Delivery & Driver",
            "Facilities",
            "Events",
            "Healthcare"
        ];

        // Aggregate counts from database
        const counts = await Job.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        // Map counts to our categories, default to 0
        const result = {};
        categories.forEach(cat => {
            const found = counts.find(c => c._id === cat);
            result[cat] = found ? found.count : 0;
        });

        res.json(result);
    } catch (err) {
        console.error("[getCategoryCounts] ERROR:", err.message);
        res.status(500).json({ message: 'Server Error fetching category counts', error: err.message });
    }
};

exports.getRelatedJobs = async (req, res) => {
    try {
        const { q, category } = req.query;
        const queryText = q || category;

        if (!queryText) {
            return res.status(400).json({ message: 'Query or category is required for related jobs' });
        }

        const activeJobs = await Job.find({ status: 'active' });
        console.log(`[getRelatedJobs] Found ${activeJobs.length} active jobs. Querying for: ${queryText}`);
        const relatedJobs = await aiService.findRelatedJobsWithAI(queryText, activeJobs);
        console.log(`[getRelatedJobs] Returning ${relatedJobs.length} related jobs.`);

        res.json(relatedJobs);
    } catch (err) {
        console.error("[getRelatedJobs] ERROR:", err.message);
        res.status(500).json({ message: 'Server Error fetching related jobs', error: err.message });
    }
};

// @desc    Bulk re-categorize all jobs using AI (Migration tool)
// @route   POST /api/jobs/bulk-categorize
// @access  Private (Admin)
exports.bulkCategorizeJobs = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can run bulk categorization' });
        }

        const Job = require('../models/Job');
        const jobs = await Job.find({});
        let updatedCount = 0;

        for (const job of jobs) {
            const newCategory = await aiService.categorizeJob({
                title: job.title,
                description: job.description
            });
            
            job.category = newCategory;
            await job.save();
            updatedCount++;
        }

        res.json({ message: `Successfully categorized ${updatedCount} jobs`, count: updatedCount });
    } catch (err) {
        console.error("[bulkCategorizeJobs] ERROR:", err.message);
        res.status(500).json({ message: 'Server Error during bulk categorization', error: err.message });
    }
};
