require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const TARGET_EMAIL = process.argv[2];

mongoose.connect(process.env.MONGO_URI).then(async () => {
    if (!TARGET_EMAIL) {
        // List all users
        const users = await User.find({}).select('email role name');
        users.forEach(u => console.log(`${u.role.padEnd(12)} | ${u.email} | ${u.name}`));
    } else {
        // Promote
        const user = await User.findOneAndUpdate({ email: TARGET_EMAIL }, { role: 'admin' }, { new: true });
        if (user) {
            console.log(`SUCCESS: ${user.email} is now admin`);
        } else {
            console.log('ERROR: User not found');
        }
    }
    process.exit();
});
