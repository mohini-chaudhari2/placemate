const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true,
        },

        fileName: {
            type: String,
            required: true,
            trim: true,
        },

        originalName: {
            type: String,
            required: true,
            trim: true,
        },

        fileUrl: {
            type: String,
            required: true,
            trim: true,
        },

        fileType: {
            type: String,
            required: true,
            trim: true,
        },

        fileSize: {
            type: Number,
            required: true,
            min: 0,
        },

        uploadedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Resume', resumeSchema);