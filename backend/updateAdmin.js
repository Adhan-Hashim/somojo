const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');

const ADMIN_EMAIL = 'showmorejobs@gmail.com';

const updateAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to database...");

        // 1. Demote any current admins that are NOT the official email
        const demoted = await User.updateMany(
            { role: 'admin', email: { $ne: ADMIN_EMAIL } },
            { role: 'student' }
        );
        console.log(`Demoted ${demoted.modifiedCount} unauthorized admin accounts.`);

        // 2. Ensure official admin exists and has admin role
        let adminUser = await User.findOne({ email: ADMIN_EMAIL });
        if (!adminUser) {
            console.log(`Creating new admin user: ${ADMIN_EMAIL}`);
            // Note: Password will need to be set or user will need to register
            // For safety, we just create the record if missing, but usually admin registers first
            adminUser = new User({
                name: 'Somojo Admin',
                email: ADMIN_EMAIL,
                password: 'ChangeMe123!', // Temporary, should be changed immediately
                role: 'admin',
                isEmailVerified: true
            });
            // Hash password if creating
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            adminUser.password = await bcrypt.hash(adminUser.password, salt);
            await adminUser.save();
        } else {
            console.log(`Updating existing user ${ADMIN_EMAIL} to admin role.`);
            adminUser.role = 'admin';
            await adminUser.save();
        }

        console.log(`Admin account ${ADMIN_EMAIL} is now active.`);
        process.exit(0);
    } catch (err) {
        console.error("Error updating admin:", err);
        process.exit(1);
    }
};

updateAdmin();
