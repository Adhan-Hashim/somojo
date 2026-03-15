const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const API_URL = 'http://localhost:5000/api';

async function testApply() {
    try {
        console.log("1. Connecting to DB to create test user...");
        await mongoose.connect(process.env.MONGO_URI);
        const { db } = mongoose.connection;

        // Find or create a test user
        let user = await db.collection('users').findOne({ email: 'test_repro@example.com' });
        if (!user) {
            console.log("Creating test user...");
            await db.collection('users').insertOne({
                name: 'Test Repro',
                email: 'test_repro@example.com',
                password: 'password123', // Not hashed but authMiddleware might just check ID
                role: 'jobseeker',
                createdAt: new Date()
            });
            user = await db.collection('users').findOne({ email: 'test_repro@example.com' });
        }

        // Generate a fake JWT for this user ID
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ user: { id: user._id.toString() } }, process.env.JWT_SECRET);
        console.log("Generated Token for ID:", user._id);

        // Find the head chef job ID
        const job = await db.collection('jobs').findOne({ title: /head chef/i });
        if (!job) {
            console.error("Job 'head chef' not found in DB!");
            return;
        }
        console.log("Found Job ID:", job._id);

        console.log("2. Sending POST request to /api/applications/:jobId");
        try {
            const res = await axios.post(`${API_URL}/applications/${job._id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("SUCCESS:", res.status, res.data);
        } catch (err) {
            console.log("FAILED WITH STATUS:", err.response?.status);
            console.log("RESPONSE DATA:", JSON.stringify(err.response?.data, null, 2));
        }

    } catch (err) {
        console.error("TEST SCRIPT ERROR:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

testApply();
