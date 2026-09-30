const mongoose = require('mongoose');

const placementActivitySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  activityType: { 
    type: String, 
    required: true, 
    trim: true, 
    index: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  metadata: { 
    type: mongoose.Schema.Types.Mixed 
  }
}, { timestamps: true });

module.exports = mongoose.model('PlacementActivity', placementActivitySchema);
