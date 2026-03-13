const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

// Helper to generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();


// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    const { name, email, password, role, contact, location } = req.body;

    try {
        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate an OTP and store it in OTP collection
        const otpCode = generateOTP();

        await OTP.findOneAndDelete({ email }); // Remove any existing OTP for this email
        await OTP.create({
            email,
            otp: otpCode
        });

        // Send the OTP via email
        try {
            await emailService.sendOTPEmail(email, otpCode, name);
        } catch (emailErr) {
            console.error("Failed to send OTP email:", emailErr);
            // For development/testing, log the OTP to console as fallback
            console.log(`\n=== OTP FALLBACK ===`);
            console.log(`Email: ${email}`);
            console.log(`OTP Code: ${otpCode}`);
            console.log(`===================\n`);
            return res.status(500).json({ message: 'Failed to send OTP email. Check server logs for the OTP code.', error: emailErr.message });
        }

        // Return a response signaling the frontend to switch to the OTP screen
        res.status(200).json({
            message: 'OTP sent to your email. Please verify to complete registration.',
            email: email,
            requiresOTP: true
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error', error: err.message, stack: err.stack });
    }
};



// @desc    Verify Email OTP to complete registration
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
    const { name, email, password, role, contact, location, otp } = req.body;

    try {
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const otpRecord = await OTP.findOne({ email });
        if (!otpRecord || otpRecord.otp !== otp) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Success! Create the user now
        let user = new User({
            name,
            email,
            password,
            role,
            contact,
            location,
            isEmailVerified: true
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Auto-create initial Profile document
        const Profile = require('../models/Profile');
        let profile = new Profile({
            user: user.id,
            contact: contact || '',
            location: location || ''
        });
        await profile.save();

        // Cleanup OTP
        await OTP.deleteOne({ email });

        // Now we log them in and return the JWT
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    message: "Email successfully verified",
                    token,
                    user: { id: user.id, name: user.name, email: user.email, role: user.role, contact: user.contact, location: user.location }
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// @desc    Resend Email OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
    const { email, name } = req.body;

    try {
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists and is verified. You can log in.' });
        }

        // Generate a new OTP
        const otpCode = generateOTP();

        await OTP.findOneAndDelete({ email });
        await OTP.create({ email, otp: otpCode });

        // Send the OTP via email
        try {
            await emailService.sendOTPEmail(email, otpCode, name || 'User');
        } catch (emailErr) {
            console.error("Failed to send OTP email during resend:", emailErr);
            // For development/testing, log the OTP to console as fallback
            console.log(`\n=== OTP RESEND FALLBACK ===`);
            console.log(`Email: ${email}`);
            console.log(`OTP Code: ${otpCode}`);
            console.log(`=========================\n`);
            return res.status(500).json({ message: 'Failed to send OTP email. Check server logs for the OTP code.', error: emailErr.message });
        }

        res.json({ message: 'A new OTP has been sent to your email address.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check for user
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }


        // Return JWT
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error', error: err.message, stack: err.stack });
    }
};

// @desc    Get logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
