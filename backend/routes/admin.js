const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// All routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// ─────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────
// GET /api/admin/stats
router.get('/stats', async (req, res) => {
    try {
        const [
            totalUsers, totalJobs, totalApplications, totalSaved,
            jobSeekers, employers, admins,
            acceptedApps, rejectedApps, pendingApps,
            recentUsers, recentJobs,
        ] = await Promise.all([
            User.countDocuments(),
            Job.countDocuments(),
            Application.countDocuments(),
            SavedJob.countDocuments(),
            User.countDocuments({ role: 'job-seeker' }),
            User.countDocuments({ role: 'employer' }),
            User.countDocuments({ role: 'admin' }),
            Application.countDocuments({ status: 'accepted' }),
            Application.countDocuments({ status: 'rejected' }),
            Application.countDocuments({ status: 'applied' }),
            User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt isBanned'),
            Job.find().sort({ createdAt: -1 }).limit(5).select('title company location status createdAt'),
        ]);

        // Signups per day for last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const dailySignups = await User.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);

        res.json({
            totals: { users: totalUsers, jobs: totalJobs, applications: totalApplications, saved: totalSaved },
            users: { jobSeekers, employers, admins, banned: await User.countDocuments({ isBanned: true }) },
            applications: { accepted: acceptedApps, rejected: rejectedApps, pending: pendingApps },
            recent: { users: recentUsers, jobs: recentJobs },
            dailySignups,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────
// GET /api/admin/users?role=&search=&page=&limit=
router.get('/users', async (req, res) => {
    try {
        const { role, search, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (role && role !== 'all') filter.role = role;
        if (search) filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
        const total = await User.countDocuments(filter);
        const users = await User.find(filter)
            .select('-password -otp -otpExpiresAt')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (err) { res.status(500).send('Server Error'); }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        if (!['job-seeker', 'employer', 'admin'].includes(role))
            return res.status(400).json({ message: 'Invalid role' });
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) { res.status(500).send('Server Error'); }
});

// PUT /api/admin/users/:id/ban
router.put('/users/:id/ban', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.isBanned = !user.isBanned;
        await user.save();
        res.json({ isBanned: user.isBanned, message: user.isBanned ? 'User banned' : 'User unbanned' });
    } catch (err) { res.status(500).send('Server Error'); }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
    try {
        if (req.params.id === req.user.id)
            return res.status(400).json({ message: 'Cannot delete yourself' });
        await User.findByIdAndDelete(req.params.id);
        // Clean up their data
        await Promise.allSettled([
            Application.deleteMany({ applicant: req.params.id }),
            SavedJob.deleteMany({ user: req.params.id }),
        ]);
        res.json({ message: 'User deleted' });
    } catch (err) { res.status(500).send('Server Error'); }
});

// ─────────────────────────────────────────────
// JOBS
// ─────────────────────────────────────────────
// GET /api/admin/jobs?search=&status=&page=&limit=
router.get('/jobs', async (req, res) => {
    try {
        const { search, status, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status && status !== 'all') filter.status = status;
        if (search) filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { company: { $regex: search, $options: 'i' } },
        ];
        const total = await Job.countDocuments(filter);
        const jobs = await Job.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        res.json({ jobs, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (err) { res.status(500).send('Server Error'); }
});

// PUT /api/admin/jobs/:id/status
router.put('/jobs/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['active', 'inactive', 'closed', 'pending'].includes(status))
            return res.status(400).json({ message: 'Invalid status' });
        const job = await Job.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json(job);
    } catch (err) { res.status(500).send('Server Error'); }
});

// DELETE /api/admin/jobs/:id
router.delete('/jobs/:id', async (req, res) => {
    try {
        await Job.findByIdAndDelete(req.params.id);
        await Application.deleteMany({ job: req.params.id });
        res.json({ message: 'Job deleted' });
    } catch (err) { res.status(500).send('Server Error'); }
});

// ─────────────────────────────────────────────
// APPLICATIONS
// ─────────────────────────────────────────────
// GET /api/admin/applications?status=&page=&limit=
router.get('/applications', async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status && status !== 'all') filter.status = status;
        const total = await Application.countDocuments(filter);
        const apps = await Application.find(filter)
            .populate('applicant', 'name email')
            .populate('job', 'title company')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        res.json({ applications: apps, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (err) { res.status(500).send('Server Error'); }
});

// ─────────────────────────────────────────────
// PLATFORM ACTIONS
// ─────────────────────────────────────────────
// POST /api/admin/promote  { email }  — make someone admin
router.post('/promote', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: `${user.email} is now an admin`, user });
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;
