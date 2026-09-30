const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
    },

    location: {
      type: String,
      trim: true,
      index: true,
    },

    jobType: {
      type: String,
      trim: true,
      index: true,
    },

    experience: {
      type: String,
      trim: true,
    },

    salary: {
      type: String,
      trim: true,
    },

    requiredSkills: [
      {
        type: String,
        trim: true,
      },
    ],

    eligibility: {
      minCgpa: {
        type: Number,
        min: 0,
        max: 10,
      },

      branches: [
        {
          type: String,
          trim: true,
        },
      ],

      batch: [
        {
          type: Number,
        },
      ],
    },

    applicationDeadline: {
      type: Date,
      index: true,
    },

    status: {
      type: String,
      enum: ['open', 'closed', 'draft'],
      default: 'open',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Job', jobSchema);