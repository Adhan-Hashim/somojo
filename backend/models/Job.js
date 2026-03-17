const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    company: {
        type: String,
        required: true,
    },
    companyLogo: {
        type: String,
        default: 'https://via.placeholder.com/150', // placeholder logo
    },
    location: {
        type: String,
        required: true,
    },
    locationPoint: {
        type: {
            type: String,
            enum: ['Point'], // 'location.type' must be 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
        }
    },
    type: {
        type: String, // Full-time, Part-time, Internship, etc.
        required: true,
    },
    workplaceType: {
        type: String, // Remote, On-site, Hybrid
        default: 'On-site',
    },
    salary: {
        type: String, // e.g., "$70,000 - $90,000 a year"
        default: 'Not specified',
    },
    description: {
        type: String,
        required: true,
    },
    requirements: {
        type: [String], // Array of requirement bullets
        default: [],
    },
    benefits: {
        type: [String], // Array of benefit strings
        default: [],
    },
    responsibilities: {
        type: [String],
        default: [],
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, // Employer who created the post
    },
    status: {
        type: String,
        enum: ['active', 'closed', 'draft', 'pending'],
        default: 'pending'
    },
    category: {
        type: String,
        default: 'Other'
    }
}, { timestamps: true });

// Create 2dsphere index for geospatial queries
JobSchema.index({ locationPoint: '2dsphere' });

module.exports = mongoose.model('Job', JobSchema);
