const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 900 // Automatically deletes standard MongoDB Document after 15 minutes
    }
});

module.exports = mongoose.model('OTP', OTPSchema);
