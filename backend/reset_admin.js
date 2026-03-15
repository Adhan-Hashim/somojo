const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const ADMIN_EMAIL = 'showmorejobs@gmail.com';
const TEMP_PASSWORD = 'admin123';

async function resetAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        let user = await User.findOne({ email: ADMIN_EMAIL });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(TEMP_PASSWORD, salt);

        if (user) {
            console.log("User exists, resetting password and role...");
            user.password = hashedPassword;
            user.role = 'admin';
            await user.save();
        } else {
            console.log("User does not exist, creating new admin...");
            user = new User({
                name: 'Somojo Admin',
                email: ADMIN_EMAIL,
                password: hashedPassword,
                role: 'admin',
                isEmailVerified: true
            });
            await user.save();
        }

        console.log(`SUCCESS: Admin account ${ADMIN_EMAIL} is ready.`);
        console.log(`Temporary Password: ${TEMP_PASSWORD}`);
        mongoose.connection.close();
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

resetAdmin();
