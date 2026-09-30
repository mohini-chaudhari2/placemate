const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job', 
    required: true, 
    index: true 
  },
  recruiterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  status: { 
    type: String, 
    enum: ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'], 
    default: 'Applied',
    index: true 
  },
  appliedAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  recruiterNote: { type: String }
}, { timestamps: true });

// Prevent duplicate applications from same student for same job
applicationSchema.index({ studentId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
