const Job = require('../models/Job');
const { canonicalizeSkills } = require('./skillController');

const createJob = async (req, res) => {
  try {
    const {
      companyName,
      title,
      description,
      location,
      jobType,
      experience,
      salary,
      requiredSkills,
      eligibility,
      applicationDeadline,
      status,
    } = req.body;

    if (!companyName || !title || !description) {
      return res.status(400).json({
        message:
          'Company name, job title and description are required',
      });
    }

    const cleanedSkills = await canonicalizeSkills(requiredSkills);

    const job = await Job.create({
      recruiterId: req.user.id,
      companyName: companyName.trim(),
      title: title.trim(),
      description: description.trim(),
      location: location?.trim() || '',
      jobType: jobType?.trim() || '',
      experience: experience?.trim() || '',
      salary: salary?.trim() || '',
      requiredSkills: cleanedSkills,
      eligibility: {
        minCgpa:
          eligibility?.minCgpa !== undefined &&
          eligibility?.minCgpa !== ''
            ? Number(eligibility.minCgpa)
            : undefined,

        branches: Array.isArray(eligibility?.branches)
          ? eligibility.branches
              .map((branch) => branch.trim())
              .filter(Boolean)
          : [],

        batch: Array.isArray(eligibility?.batch)
          ? eligibility.batch
              .map((year) => Number(year))
              .filter(Boolean)
          : [],
      },
      applicationDeadline: applicationDeadline
        ? new Date(applicationDeadline)
        : undefined,
      status: ['open', 'closed', 'draft'].includes(status)
        ? status
        : 'open',
    });

    res.status(201).json({
      message: 'Job created successfully',
      job,
    });
  } catch (error) {
    console.error('Create job error:', error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      recruiterId: req.user.id,
    }).sort({
      createdAt: -1,
    });

    res.json({
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error('Get recruiter jobs error:', error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const getRecruiterJobById = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      recruiterId: req.user.id,
    });

    if (!job) {
      return res.status(404).json({
        message: 'Job not found',
      });
    }

    res.json(job);
  } catch (error) {
    console.error('Get recruiter job error:', error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const updateRecruiterJob = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      recruiterId: req.user.id,
    });

    if (!job) {
      return res.status(404).json({
        message: 'Job not found',
      });
    }

    const allowedFields = [
      'companyName',
      'title',
      'description',
      'location',
      'jobType',
      'experience',
      'salary',
      'requiredSkills',
      'eligibility',
      'applicationDeadline',
      'status',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    if (Array.isArray(req.body.requiredSkills)) {
      job.requiredSkills = await canonicalizeSkills(req.body.requiredSkills);
    }

    if (req.body.applicationDeadline) {
      job.applicationDeadline = new Date(
        req.body.applicationDeadline
      );
    }

    await job.save();

    res.json({
      message: 'Job updated successfully',
      job,
    });
  } catch (error) {
    console.error('Update recruiter job error:', error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteRecruiterJob = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      recruiterId: req.user.id,
    });

    if (!job) {
      return res.status(404).json({
        message: 'Job not found',
      });
    }

    await job.deleteOne();

    res.json({
      message: 'Job deleted successfully',
    });
  } catch (error) {
    console.error('Delete recruiter job error:', error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createJob,
  getRecruiterJobs,
  getRecruiterJobById,
  updateRecruiterJob,
  deleteRecruiterJob,
};