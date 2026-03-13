const axios = require('axios');

async function testReg() {
    try {
        const email = 'testuser_' + Date.now() + '@example.com';
        const password = 'password123';
        // 1. Request OTP
        const regRes = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'testprofile',
            email: email,
            password: password,
            role: 'job-seeker',
            contact: '9998887776',
            location: 'AutoCity'
        });
        console.log("Register response:", regRes.data);

        // Normally we need the OTP from the DB or email. Let's fetch it from the DB directly to test verify.
        const mongoose = require('mongoose');
        const OTP = require('./models/OTP');
        await mongoose.connect('mongodb://localhost:27017/somojo'); // Check logic from your server.js usually
        const otpDoc = await OTP.findOne({ email });
        const otp = otpDoc.otp;

        console.log("Found OTP:", otp);

        const verifyRes = await axios.post('http://localhost:5000/api/auth/verify-otp', {
            name: 'testprofile',
            email: email,
            password: password,
            role: 'job-seeker',
            contact: '9998887776',
            location: 'AutoCity',
            otp: otp
        });

        console.log("Verify response:", verifyRes.data);

        const token = verifyRes.data.token;

        // Check profile
        const profileRes = await axios.get('http://localhost:5000/api/profile/me', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Profile response:", profileRes.data);
        mongoose.connection.close();
    } catch (err) {
        console.error(err.response ? err.response.data : err);
    }
}
testReg();
