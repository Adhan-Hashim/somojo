const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUser, verifyOTP, resendOTP, verifyAdminLoginOTP } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const OTP = require('../models/OTP');

router.post('/register', registerUser);
// @route   POST /api/auth/verify-otp
// @desc    Verify Email OTP to complete registration
// @access  Public
router.post('/verify-otp', verifyOTP);

// @route   POST /api/auth/resend-otp
// @desc    Resend Email OTP
// @access  Public
router.post('/resend-otp', resendOTP);

// @route   POST /api/auth/verify-admin-otp
// @desc    Verify OTP for admin login
// @access  Public
router.post('/verify-admin-otp', verifyAdminLoginOTP);
router.post('/login', loginUser);
router.get('/me', auth, getUser);

// Temporary endpoint to get OTP for testing (remove in production)
router.get('/get-otp/:email', async (req, res) => {
    try {
        const otpRecord = await OTP.findOne({ email: req.params.email });
        if (otpRecord) {
            res.json({ otp: otpRecord.otp, email: req.params.email });
        } else {
            res.status(404).json({ message: 'No OTP found for this email' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
