const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function reset() {
    try {
        const uri = 'mongodb://127.0.0.1:27017/somojo';
        await mongoose.connect(uri);
        console.log('MongoDB connected to', uri);

        // Define schema for finding user
        const UserSchema = new mongoose.Schema({
            email: String,
            password: String,
            role: String,
            name: String
        });
        const User = mongoose.model('UserReset', UserSchema, 'users');

        const email = 'showmorejobs@gmail.com';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin123!', salt);

        const result = await User.updateOne(
            { email },
            { 
                $set: { 
                    password: hashedPassword,
                    role: 'admin' 
                } 
            }
        );

        console.log('Update Result:', result);
        if (result.matchedCount === 0) {
            console.log('User not found. Creating new admin...');
            const admin = new User({
                name: 'System Admin',
                email,
                password: hashedPassword,
                role: 'admin'
            });
            await admin.save();
            console.log('Admin created');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error during reset:', err);
        process.exit(1);
    }
}

reset();
