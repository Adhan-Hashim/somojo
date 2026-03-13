const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const emailService = require('./services/emailService');

const testEmail = async () => {
    console.log("Starting Email Service Test...");
    console.log("Checking ENV variables:");
    console.log("SMTP_HOST:", process.env.SMTP_HOST);
    console.log("SMTP_USER:", process.env.SMTP_USER);
    console.log("SMTP_PASS:", process.env.SMTP_PASS ? "****" : "MISSING");

    try {
        const testJob = {
            title: "Software Engineer",
            company: "Somojo Test Co",
            location: "Remote"
        };

        console.log("\nAttempting to send test confirmation email...");
        await emailService.sendApplicationConfirmation(
            process.env.SMTP_USER, // Send to yourself for testing
            "Test User",
            testJob
        );
        console.log("Test finished.");
    } catch (error) {
        console.error("Test failed with error:", error);
    }
    process.exit(0);
};

testEmail();
