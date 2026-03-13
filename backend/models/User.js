const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
        required: false,
    },
    otpExpiresAt: {
        type: Date,
        required: false,
    },
    role: {
        type: String,
        enum: ['job-seeker', 'employer', 'admin'],
        default: 'job-seeker'
    },
    isBanned: {
        type: Boolean,
        default: false,
    },
    contact: {
        type: String,
        required: false,
    },
    location: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', UserSchema);
