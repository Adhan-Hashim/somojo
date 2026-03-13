require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const fs = require('fs');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({ email: /kdevapriya/i });
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
    console.log('Saved to users.json');
    process.exit();
}

check().catch(console.error);
