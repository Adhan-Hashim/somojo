// Quick script to check and fix user roles in the database
// Usage: node fixUserRole.js <email> [newRole]
// Example: node fixUserRole.js adhanhashim@gmail.com job-seeker

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const User = require('./models/User');

const email = process.argv[2];
const newRole = process.argv[3]; // optional: 'job-seeker' or 'employer'

if (!email) {
    console.log('Usage: node fixUserRole.js <email> [newRole]');
    console.log('  newRole options: job-seeker | employer');
    process.exit(1);
}

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected\n');

    const user = await User.findOne({ email });
    if (!user) {
        console.log(`No user found with email: ${email}`);
        process.exit(1);
    }

    console.log(`Found user: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Current role: ${user.role}`);

    if (newRole) {
        if (!['job-seeker', 'employer'].includes(newRole)) {
            console.log(`Invalid role. Must be 'job-seeker' or 'employer'`);
            process.exit(1);
        }
        user.role = newRole;
        await user.save();
        console.log(`  ✅ Role updated to: ${user.role}`);
    } else {
        console.log(`\nTo change role, run:`);
        console.log(`  node fixUserRole.js ${email} job-seeker`);
        console.log(`  node fixUserRole.js ${email} employer`);
    }

    await mongoose.disconnect();
    process.exit(0);
}

run().catch(console.error);
