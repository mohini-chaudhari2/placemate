const mongoose = require('mongoose');

const recruiterProfileSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true, 
    unique: true 
  },
  companyName: { 
    type: String, 
    required: [true, 'Company name is required'], 
    trim: true, 
    index: true 
  },
  companyDescription: { type: String },
  website: { type: String, trim: true },
  industry: { type: String, trim: true, index: true },
  location: { type: String, trim: true },
  logo: { type: String },
  verified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('RecruiterProfile', recruiterProfileSchema);
