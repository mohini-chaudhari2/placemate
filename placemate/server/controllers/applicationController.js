const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({
        message: 'Job ID is required',
      });
    }

    const job = await Job.findOne({
      _id: jobId,
      status: 'open',
    });

    if (!job) {
      return res.status(404).json({
        message: 'Job not found or applications are closed',
      });
    }

    const existingApplication = await Application.findOne({
      studentId: req.user.id,
      jobId: job._id,
    });

    if (existingApplication) {
      return res.status(400).json({
        message: 'You have already applied for this job',
        application: existingApplication,
      });
    }

    const application = await Application.create({
      studentId: req.user.id,
      jobId: job._id,
      recruiterId: job.recruiterId,
      status: 'Applied',
    });

    await Notification.create({
      userId: req.user.id,
      title: 'Application Submitted',
      message: `Your application for ${job.title} at ${job.companyName} has been submitted successfully.`,
      type: 'application',
    });

    await Notification.create({
      userId: job.recruiterId,
      title: 'New Job Application',
      message: `A student has applied for your ${job.title} position.`,
      type: 'application',
    });

    const populatedApplication =
      await Application.findById(application._id)
        .populate('jobId');

    res.status(201).json({
      message: 'Application submitted successfully',
      application: populatedApplication,
    });
  } catch (error) {
    console.error('Apply for job error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: 'You have already applied for this job',
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

const getStudentApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      studentId: req.user.id,
    })
      .populate('jobId')
      .sort({ createdAt: -1 });

    res.json({
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error(
      'Get student applications error:',
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      studentId: req.user.id,
    }).populate('jobId');

    if (!application) {
      return res.status(404).json({
        message: 'Application not found',
      });
    }

    res.json(application);
  } catch (error) {
    console.error(
      'Get application error:',
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  applyForJob,
  getStudentApplications,
  getApplicationById,
};