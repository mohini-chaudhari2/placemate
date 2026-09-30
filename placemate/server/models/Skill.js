const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    index: true 
  },
  category: { 
    type: String, 
    required: true,
    trim: true, 
    index: true 
  },
  aliases: [{ 
    type: String, 
    trim: true, 
    lowercase: true 
  }],
  active: { 
    type: Boolean, 
    default: true,
    index: true 
  },
  popularity: { 
    type: Number, 
    default: 0,
    index: true 
  },
  description: { type: String },
  learningResources: [{
    title: { type: String, trim: true },
    url: { type: String, trim: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);

