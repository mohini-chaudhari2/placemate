const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema(
    {
        studentId: {
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
    },
    {
        timestamps: true,
    }
);

// A student can save a particular job only once.
savedJobSchema.index(
    {
        studentId: 1,
        jobId: 1,
    },
    {
        unique: true,
    }
);

module.exports = mongoose.model(
    'SavedJob',
    savedJobSchema
);