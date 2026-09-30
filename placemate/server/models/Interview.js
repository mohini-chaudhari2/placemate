const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
    {
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application',
            required: true,
            index: true,
        },

        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        recruiterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job',
            required: true,
            index: true,
        },

        interviewType: {
            type: String,
            enum: ['online', 'offline'],
            required: true,
        },

        scheduledDate: {
            type: Date,
            required: true,
        },

        startTime: {
            type: String,
            required: true,
            trim: true,
        },

        endTime: {
            type: String,
            required: true,
            trim: true,
        },

        meetingLink: {
            type: String,
            trim: true,
            default: '',
        },

        location: {
            type: String,
            trim: true,
            default: '',
        },

        interviewerName: {
            type: String,
            trim: true,
            required: true,
        },

        interviewerEmail: {
            type: String,
            trim: true,
            default: '',
        },

        instructions: {
            type: String,
            trim: true,
            default: '',
        },

        status: {
            type: String,
            enum: [
                'Scheduled',
                'Rescheduled',
                'Cancelled',
                'Completed',
            ],
            default: 'Scheduled',
            index: true,
        },

        cancellationReason: {
            type: String,
            trim: true,
            default: '',
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

interviewSchema.index({
    recruiterId: 1,
    scheduledDate: 1,
});

interviewSchema.index({
    studentId: 1,
    scheduledDate: 1,
});

module.exports = mongoose.model(
    'Interview',
    interviewSchema
);