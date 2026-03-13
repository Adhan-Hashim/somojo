require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const Application = require('./models/Application');
const User = require('./models/User');

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    let out = 'Connected to MongoDB\n\n';

    const apps = await Application.find({})
        .populate('applicant', 'name email role _id')
        .populate('job', 'title company');

    out += `Total applications: ${apps.length}\n`;
    apps.forEach(app => {
        out += `\n--- Application ---\n`;
        out += `ID: ${app._id}\n`;
        out += `Applicant _id: ${app.applicant?._id}\n`;
        out += `Applicant .id: ${app.applicant?.id}\n`;
        out += `Applicant email: ${app.applicant?.email}\n`;
        out += `Applicant role: ${app.applicant?.role}\n`;
        out += `Job: ${app.job?.title} @ ${app.job?.company}\n`;
        out += `Status: ${app.status}\n`;
        out += `Created: ${app.createdAt}\n`;
    });

    out += '\n=== All Users ===\n';
    const users = await User.find({}).select('name email role _id');
    users.forEach(u => {
        out += `ID: ${u._id} | ${u.role} | ${u.email}\n`;
    });

    fs.writeFileSync('debug_output.txt', out);
    console.log('Written to debug_output.txt');
    await mongoose.disconnect();
}

main().catch(e => { fs.writeFileSync('debug_output.txt', e.toString()); });
