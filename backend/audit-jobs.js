const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const Job = require('./models/Job');
const User = require('./models/User');

const auditJobs = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const jobs = await Job.find().populate('postedBy');
        console.log(`Found ${jobs.length} jobs.`);

        jobs.forEach(job => {
            console.log(`\nJob Title: ${job.title}`);
            console.log(`Company: ${job.company}`);
            if (job.postedBy) {
                console.log(`Posted By: ${job.postedBy.name} (${job.postedBy.email})`);
                console.log(`Role: ${job.postedBy.role}`);
            } else {
                console.log("Posted By: UNKNOWN (Missing reference)");
            }
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

auditJobs();
