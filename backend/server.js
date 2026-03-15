const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.log('MongoDB connection error: ', err));

// Routes
app.get('/', (req, res) => {
    res.send('Somojo Backend API is running...');
});

// Custom Logging Middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Mounted API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/saved-jobs', require('./routes/savedJobs'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/interview', require('./routes/interview'));
app.use('/api/admin', require('./routes/admin'));

// Global Error Handler
app.use((err, req, res, next) => {
    const errorPrefix = `[GLOBAL ERROR] ${new Date().toISOString()}`;
    console.error(`${errorPrefix}:`, err);

    // Log to file for persistence
    try {
        const fs = require('fs');
        const logMsg = `${errorPrefix}\nMethod: ${req.method}\nURL: ${req.url}\nError: ${err.message}\nStack: ${err.stack}\n\n`;
        fs.appendFileSync(path.join(__dirname, 'critical-errors.log'), logMsg);
    } catch (e) { }

    res.status(500).json({
        message: `A critical server error occurred: ${err.message}`,
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

