const mongoose = require('mongoose');

const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');

const saveJob = async (req, res) => {
    try {
        const { jobId } = req.body;

        if (!jobId) {
            return res.status(400).json({
                message: 'Job ID is required',
            });
        }

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                message: 'Invalid job ID',
            });
        }

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                message: 'Job not found',
            });
        }

        const existingSavedJob =
            await SavedJob.findOne({
                studentId: req.user.id,
                jobId,
            });

        if (existingSavedJob) {
            return res.status(409).json({
                message: 'Job is already saved',
                saved: true,
                savedJob: existingSavedJob,
            });
        }

        const savedJob = await SavedJob.create({
            studentId: req.user.id,
            jobId,
        });

        const populatedSavedJob =
            await SavedJob.findById(
                savedJob._id
            ).populate('jobId');

        res.status(201).json({
            message: 'Job saved successfully',
            saved: true,
            savedJob: populatedSavedJob,
        });
    } catch (error) {
        console.error('Save job error:', error);

        res.status(500).json({
            message: error.message,
        });
    }
};

const unsaveJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                message: 'Invalid job ID',
            });
        }

        const savedJob =
            await SavedJob.findOneAndDelete({
                studentId: req.user.id,
                jobId,
            });

        if (!savedJob) {
            return res.status(404).json({
                message: 'Saved job not found',
            });
        }

        res.json({
            message: 'Job removed from saved jobs',
            saved: false,
        });
    } catch (error) {
        console.error(
            'Unsave job error:',
            error
        );

        res.status(500).json({
            message: error.message,
        });
    }
};

const getSavedJobs = async (req, res) => {
    try {
        const savedJobs =
            await SavedJob.find({
                studentId: req.user.id,
            })
                .populate('jobId')
                .sort({
                    createdAt: -1,
                });

        const validSavedJobs =
            savedJobs.filter(
                (savedJob) => savedJob.jobId
            );

        res.json({
            count: validSavedJobs.length,
            savedJobs: validSavedJobs,
        });
    } catch (error) {
        console.error(
            'Get saved jobs error:',
            error
        );

        res.status(500).json({
            message: error.message,
        });
    }
};

const checkSavedJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                message: 'Invalid job ID',
            });
        }

        const savedJob =
            await SavedJob.findOne({
                studentId: req.user.id,
                jobId,
            });

        res.json({
            saved: Boolean(savedJob),
        });
    } catch (error) {
        console.error(
            'Check saved job error:',
            error
        );

        res.status(500).json({
            message: error.message,
        });
    }
};

const getSavedJobIds = async (req, res) => {
    try {
        const savedJobs =
            await SavedJob.find({
                studentId: req.user.id,
            }).select('jobId');

        res.json({
            jobIds: savedJobs.map(
                (savedJob) =>
                    savedJob.jobId.toString()
            ),
        });
    } catch (error) {
        console.error(
            'Get saved job IDs error:',
            error
        );

        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    saveJob,
    unsaveJob,
    getSavedJobs,
    checkSavedJob,
    getSavedJobIds,
};