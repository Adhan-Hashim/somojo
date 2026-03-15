const Profile = require('../models/Profile');
const aiService = require('../services/aiService');

// @desc    Get current users profile
// @route   GET /api/profile/me
// @access  Private
exports.getCurrentProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'email']);

        if (!profile) {
            return res.status(400).json({ message: 'There is no profile for this user' });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Create or update user profile
// @route   POST /api/profile
// @access  Private
exports.createOrUpdateProfile = async (req, res) => {
    const {
        headline,
        bio,
        location,
        website,
        contact, // Now expected to be a string
        skills,
        interests,
        preferences,
        resumeUrl,
        experience,
        education,
        certifications
    } = req.body;

    // Build profile object
    const profileFields = { user: req.user.id };
    if (headline !== undefined) profileFields.headline = headline;
    if (bio !== undefined) profileFields.bio = bio;
    if (location !== undefined) profileFields.location = location;
    if (website !== undefined) profileFields.website = website;
    if (contact !== undefined) profileFields.contact = contact;
    if (skills !== undefined) profileFields.skills = skills;
    if (interests !== undefined) profileFields.interests = interests;
    if (preferences !== undefined) profileFields.preferences = preferences;
    if (resumeUrl !== undefined) profileFields.resumeUrl = resumeUrl;
    if (experience !== undefined) profileFields.experience = experience;
    if (education !== undefined) profileFields.education = education;
    if (certifications !== undefined) profileFields.certifications = certifications;

    try {
        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
            // Update existing profile
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            );
            return res.json(profile);
        }

        // Create new profile
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Add profile experience
// @route   PUT /api/profile/experience
// @access  Private
exports.addExperience = async (req, res) => {
    const { title, company, location, startDate, endDate, current, description } = req.body;

    const newExp = { title, company, location, startDate, endDate, current, description };

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        // Add to beginning of array
        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete experience from profile
// @route   DELETE /api/profile/experience/:exp_id
// @access  Private
exports.deleteExperience = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        // Get remove index
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        if (removeIndex >= 0) {
            profile.experience.splice(removeIndex, 1);
            await profile.save();
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Add profile education
// @route   PUT /api/profile/education
// @access  Private
exports.addEducation = async (req, res) => {
    const { school, degree, fieldOfStudy, startDate, endDate, current } = req.body;

    const newEdu = { school, degree, fieldOfStudy, startDate, endDate, current };

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete education from profile
// @route   DELETE /api/profile/education/:edu_id
// @access  Private
exports.deleteEducation = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        // Get remove index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
        if (removeIndex >= 0) {
            profile.education.splice(removeIndex, 1);
            await profile.save();
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Semantic search across all profiles using AI
// @route   POST /api/profile/search
// @access  Private (Employer)
exports.searchProfiles = async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ message: "Search query is required" });
    }

    try {
        // Fetch all active job seeker profiles
        // We populate user to get the name/email
        const allProfiles = await Profile.find()
            .populate({
                path: 'user',
                match: { role: 'job-seeker' },
                select: 'name email location'
            });

        // Filter out profiles where the user was null (e.g. wasn't a job-seeker)
        const jobSeekerProfiles = allProfiles.filter(p => p.user !== null);

        // Score them using Gemini
        const rankedProfiles = await aiService.searchProfilesWithAI(query, jobSeekerProfiles);

        res.json(rankedProfiles);
    } catch (err) {
        console.error("Error searching profiles:", err);
        res.status(500).send('Server Error');
    }
};

// @desc    Toggle saving a job to user profile
// @route   PUT /api/profile/save-job/:jobId
// @access  Private
exports.toggleSaveJob = async (req, res) => {
    try {
        const jobId = req.params.jobId;

        let profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            // If they don't have a profile yet, create a basic one
            profile = new Profile({ user: req.user.id, savedJobs: [] });
        }

        // Check if job is already saved
        const isSaved = profile.savedJobs.includes(jobId);

        if (isSaved) {
            // Remove from saved jobs
            profile.savedJobs = profile.savedJobs.filter(id => id.toString() !== jobId);
        } else {
            // Add to saved jobs
            profile.savedJobs.push(jobId);
        }

        await profile.save();
        res.json({ savedJobs: profile.savedJobs, isSaved: !isSaved });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Generate Employer Branding Profile using AI
// @route   POST /api/profile/employer-branding
// @access  Private (Employer)
exports.generateEmployerBrand = async (req, res) => {
    const { companyName, companyDescription } = req.body;

    if (!companyName || !companyDescription) {
        return res.status(400).json({ message: "Company name and description are required" });
    }

    try {
        // Find or create profile
        let profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            profile = new Profile({ user: req.user.id });
        }

        // Generate AI content
        const brandingData = await aiService.generateEmployerBranding(companyName, companyDescription);

        // Update profile
        profile.employerBranding = brandingData;

        // Also update headline and bio if they are empty
        if (!profile.headline) profile.headline = `${companyName} Employer Profile`;
        if (!profile.bio) profile.bio = companyDescription;

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error("Error generating employer branding:", err);
        res.status(500).send('Server Error');
    }
};
// @desc    Autofill profile details using AI and an uploaded resume
// @route   POST /api/profile/autofill
// @access  Private (Job Seeker)
exports.autofillFromResume = async (req, res) => {
    const { resumeData, mimeType } = req.body;

    if (!resumeData || !mimeType) {
        return res.status(400).json({ message: "Resume data and MIME type are required" });
    }

    try {
        // 1. Parse resume with AI
        const extractedData = await aiService.parseResumeWithAI(resumeData, mimeType);

        if (!extractedData || Object.keys(extractedData).length === 0) {
            return res.status(422).json({ message: "AI failed to extract meaningful data from this resume." });
        }

        // 2. Fetch current profile
        let profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            profile = new Profile({ user: req.user.id });
        }

        // 3. Smart Merge - Only fill if profile fields are empty/default
        // Headline
        if (!profile.headline && extractedData.headline) {
            profile.headline = extractedData.headline;
        }

        // Bio
        if (!profile.bio && extractedData.bio) {
            profile.bio = extractedData.bio;
        }

        // Skills
        if ((!profile.skills || profile.skills.length === 0) && extractedData.skills) {
            profile.skills = extractedData.skills;
        }

        // Experience - Only add if currently empty
        if ((!profile.experience || profile.experience.length === 0) && extractedData.experience) {
            profile.experience = extractedData.experience;
        }

        // Education - Only add if currently empty
        if ((!profile.education || profile.education.length === 0) && extractedData.education) {
            profile.education = extractedData.education;
        }

        // Certifications - Only add if currently empty
        if ((!profile.certifications || profile.certifications.length === 0) && extractedData.certifications) {
            profile.certifications = extractedData.certifications;
        }

        // 4. Save
        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error("Autofill Error:", err);
        res.status(500).send('Server Error during autofill');
    }
};
// @desc    Upload resume PDF and autofill profile details using AI
// @route   POST /api/profile/upload-resume
// @access  Private (Job Seeker)
exports.uploadResume = async (req, res) => {
    try {
        console.log(`[UPLOAD] User ${req.user.id} uploading file: ${req.file?.originalname}`);
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const fs = require('fs');
        const resumePath = `/uploads/resumes/${req.file.filename}`;

        console.log(`[UPLOAD] File saved at: ${req.file.path}`);

        // 1. Convert file buffer to base64 for AI parsing
        const fileBuffer = fs.readFileSync(req.file.path);
        const base64Data = fileBuffer.toString('base64');
        const mimeType = req.file.mimetype;

        console.log(`[UPLOAD] Starting AI parsing for user ${req.user.id}...`);

        // 2. Parse with AI
        const extractedData = await aiService.parseResumeWithAI(base64Data, mimeType);

        console.log(`[UPLOAD] AI Parsing complete. Extracted Data:`, JSON.stringify(extractedData, null, 2));

        // 3. Update/Create profile
        let profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            profile = new Profile({ user: req.user.id });
        }

        // Store file path
        profile.resumeUrl = resumePath;

        // Smart Merge extracted data
        if (extractedData.headline) profile.headline = extractedData.headline;
        if (extractedData.bio) profile.bio = extractedData.bio;
        if (extractedData.location) profile.location = extractedData.location;
        if (extractedData.contact) profile.contact = extractedData.contact;

        // Support both skills and interests from AI
        if (extractedData.skills && extractedData.skills.length > 0) {
            profile.skills = extractedData.skills;
        }
        if (extractedData.interests && extractedData.interests.length > 0) {
            profile.interests = extractedData.interests;
        }

        if (extractedData.experience && extractedData.experience.length > 0) {
            profile.experience = extractedData.experience.map(exp => {
                let endDate = exp.endDate;
                let current = false;
                if (endDate && (endDate.toLowerCase().includes('present') || endDate.toLowerCase().includes('current'))) {
                    endDate = null;
                    current = true;
                }

                return {
                    title: exp.title || 'Position',
                    company: exp.company || 'Company',
                    location: exp.location || '',
                    duration: exp.duration || '',
                    description: exp.description || '',
                    startDate: exp.startDate || null,
                    endDate: endDate,
                    current: current,
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5)
                };
            });
        }

        if (extractedData.education && extractedData.education.length > 0) {
            profile.education = extractedData.education.map(edu => ({
                school: edu.school || 'University',
                degree: edu.degree || 'Degree',
                fieldOfStudy: edu.fieldOfStudy || '',
                year: edu.year || '',
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5)
            }));
        }

        if (extractedData.certifications && extractedData.certifications.length > 0) {
            profile.certifications = extractedData.certifications.map(cert => ({
                name: cert.name || 'Certification',
                issuer: cert.issuer || '',
                year: cert.year || '',
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5)
            }));
        }

        if (extractedData.preferences) {
            profile.preferences = {
                titles: extractedData.preferences.titles || [],
                types: extractedData.preferences.types || [],
                schedules: extractedData.preferences.schedules || [],
                basePay: extractedData.preferences.basePay || "",
                relocation: extractedData.preferences.relocation || "Not open to relocation"
            };
        }

        await profile.save();

        res.json({
            message: "Resume uploaded and profile autofilled successfully",
            profile,
            resumePath,
            extractedData // Returning this for temporary debugging on frontend if needed
        });
    } catch (err) {
        console.error("Upload/Autofill Error:", err);
        res.status(500).json({ message: "Error processing resume", error: err.message });
    }
};
