const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true, 
    unique: true 
  },
  phone: { type: String, trim: true },
  college: { type: String, trim: true, index: true },
  branch: { type: String, trim: true, index: true },
  graduationYear: { type: Number, index: true },
  cgpa: { type: Number, min: 0, max: 10, index: true },
  skills: [{ type: String, trim: true }],
  resumeUrl: { type: String },
  profileCompletion: { type: Number, default: 0, min: 0, max: 100 },
  preferredLocations: [{ type: String, trim: true }],
  preferredJobTypes: [{ type: String, trim: true }],
  bio: { type: String, trim: true, maxlength: 1000 }
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
