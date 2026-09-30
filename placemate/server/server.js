const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
const mongoose = require('mongoose');
// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);
// Routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const jobRoutes = require('./routes/jobRoutes');
const recruiterJobRoutes = require('./routes/recruiterJobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const recruiterApplicationRoutes = require('./routes/recruiterApplicationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminApplicationRoutes = require('./routes/adminApplicationRoutes');
const skillRoutes = require('./routes/skillRoutes');
const savedJobRoutes = require('./routes/savedJobRoutes');

const interviewRoutes = require('./routes/interviewRoutes');

const resumeRoutes = require('./routes/resumeRoutes');
// Authentication routes
app.use('/api/auth', authRoutes);

// Skills library routes
app.use('/api/skills', skillRoutes);
app.use('/api/saved-jobs', savedJobRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/resume', resumeRoutes);
// Student routes
app.use('/api/student', studentRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/recruiter/jobs', recruiterJobRoutes);
app.use('/api/applications', applicationRoutes);
app.use(
  '/api/recruiter/applications',
  recruiterApplicationRoutes
);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/applications', adminApplicationRoutes);

// Base Route
app.get('/', (req, res) => {
  res.json({
    message: 'PlaceMate Backend is Running!'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    server: 'running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Port configuration
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});