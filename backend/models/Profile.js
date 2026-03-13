const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    headline: {
        type: String,
        default: '',
    },
    bio: {
        type: String,
        default: '',
    },
    location: {
        type: String,
        default: '',
    },
    locationPoint: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
        }
    },
    website: {
        type: String,
        default: '',
    },
    contact: {
        type: String, // E.g., phone number
        default: '',
    },
    experience: [
        {
            title: { type: String, required: true },
            company: { type: String, required: true },
            location: { type: String, default: '' },
            startDate: { type: Date },
            endDate: { type: Date },
            current: { type: Boolean, default: false },
            description: { type: String, default: '' },
            duration: { type: String, default: '' }, // Support frontend 'duration'
        }
    ],
    education: [
        {
            school: { type: String, required: true },
            degree: { type: String, required: true },
            fieldOfStudy: { type: String, default: '' },
            year: { type: String, default: '' }, // Support frontend 'year'
            startDate: { type: Date },
            endDate: { type: Date },
            current: { type: Boolean, default: false },
        }
    ],
    certifications: [
        {
            name: { type: String, required: true },
            issuer: { type: String, default: '' },
            year: { type: String, default: '' },
        }
    ],
    skills: {
        type: [String],
        default: [],
    },
    savedJobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    }],
    interests: {
        type: [String],
        default: [],
    },
    preferences: {
        titles: { type: [String], default: [] },
        types: { type: [String], default: [] },
        schedules: { type: [String], default: [] },
        basePay: { type: String, default: '' },
        relocation: { type: String, default: 'Not open to relocation' }
    },
    resumeUrl: {
        type: String, // URL/Path to resume file
        default: '',
    },
    aiSummary: {
        type: String, // Auto-generated summary of the candidate's strengths
        default: '',
    },
    employerBranding: {
        manifesto: { type: String, default: '' },
        whyJoinUs: { type: String, default: '' },
        testimonials: [{ quote: String, author: String, role: String }]
    }
}, { timestamps: true });

// Create 2dsphere index
ProfileSchema.index({ locationPoint: '2dsphere' });

module.exports = mongoose.model('Profile', ProfileSchema);
