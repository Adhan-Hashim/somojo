const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['applied', 'accepted', 'rejected', 'saved', 'withdrawn'],
        default: 'applied',
    },
    coverLetter: {
        type: String,
        default: '',
    },
    resumeUrl: {
        type: String, // Specific resume submitted for this application
        default: '',
    },
    aiMatchScore: {
        type: Number, // 0-100 indicating fit
        default: null,
    },
    aiAnalysis: {
        type: String, // LLM generated reasoning for the score
        default: '',
    },
    lastStatusUpdate: {
        type: Date,
        default: Date.now,
    },
    messages: [{
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        }
    }],
    agreement: {
        fields: [{
            question: String,
            answer: String,
        }],
        status: {
            type: String,
            enum: ['none', 'pending', 'sent', 'accepted', 'rejected'],
            default: 'none',
        },
        employerSignature: String,
        candidateSignature: String,
        sentAt: Date,
        acceptedAt: Date,
    }
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);
