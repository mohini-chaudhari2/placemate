const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');


// ========================================
// ADMIN DASHBOARD
// ========================================

const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalRecruiters,
      totalAdmins,
      totalJobs,
      openJobs,
      totalApplications,
      appliedApplications,
      shortlistedApplications,
      interviewApplications,
      selectedApplications,
      rejectedApplications,

      // Application analytics
      applicationStatusAnalytics,
      topAppliedJobs,
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({
        role: 'student',
      }),

      User.countDocuments({
        role: 'recruiter',
      }),

      User.countDocuments({
        role: 'admin',
      }),

      Job.countDocuments(),

      Job.countDocuments({
        status: 'open',
      }),

      Application.countDocuments(),

      Application.countDocuments({
        status: 'Applied',
      }),

      Application.countDocuments({
        status: 'Shortlisted',
      }),

      Application.countDocuments({
        status: 'Interview',
      }),

      Application.countDocuments({
        status: 'Selected',
      }),

      Application.countDocuments({
        status: 'Rejected',
      }),

      // ========================================
      // APPLICATION STATUS ANALYTICS
      // ========================================

      Application.aggregate([
        {
          $group: {
            _id: '$status',
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]),

      // ========================================
      // TOP APPLIED JOBS
      // ========================================

      Application.aggregate([
        {
          $group: {
            _id: '$jobId',
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
        {
          $limit: 5,
        },
      ]),
    ]);


    // ========================================
    // RECENT USERS
    // ========================================

    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(8);


    // ========================================
    // RECENT JOBS
    // ========================================

    const recentJobs = await Job.find()
      .populate('recruiterId', 'name email')
      .sort({ createdAt: -1 })
      .limit(8);


    // ========================================
    // RECENT APPLICATIONS
    // ========================================

    const recentApplications = await Application.find()
      .populate('studentId', 'name email')
      .populate(
        'jobId',
        'title companyName location jobType'
      )
      .populate('recruiterId', 'name email')
      .sort({ createdAt: -1 })
      .limit(8);


    // ========================================
    // TOP APPLIED JOB DETAILS
    // ========================================

    const topAppliedJobIds = topAppliedJobs.map(
      (item) => item._id
    );

    let topAppliedJobDetails = [];

    if (topAppliedJobIds.length > 0) {
      const jobs = await Job.find({
        _id: {
          $in: topAppliedJobIds,
        },
      }).select(
        'title companyName location jobType status'
      );

      topAppliedJobDetails = topAppliedJobs.map(
        (item) => {
          const job = jobs.find(
            (jobItem) =>
              jobItem._id.toString() ===
              item._id?.toString()
          );

          return {
            jobId: item._id,
            applicationCount: item.count,
            job: job || null,
          };
        }
      );
    }


    // ========================================
    // RESPONSE
    // ========================================

    res.json({
      stats: {
        totalUsers,
        totalStudents,
        totalRecruiters,
        totalAdmins,

        totalJobs,
        openJobs,

        totalApplications,

        appliedApplications,
        shortlistedApplications,
        interviewApplications,
        selectedApplications,
        rejectedApplications,
      },

      analytics: {
        applicationStatusAnalytics,
        topAppliedJobs: topAppliedJobDetails,
      },

      recentUsers,
      recentJobs,
      recentApplications,
    });

  } catch (error) {
    console.error(
      'Get admin dashboard error:',
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


// ========================================
// ADMIN USERS
// ========================================

const getAdminUsers = async (req, res) => {
  try {
    const {
      search = '',
      role = '',
    } = req.query;

    const filter = {};

    if (
      role &&
      ['student', 'recruiter', 'admin'].includes(role)
    ) {
      filter.role = role;
    }

    if (search.trim()) {
      filter.$or = [
        {
          name: {
            $regex: search.trim(),
            $options: 'i',
          },
        },
        {
          email: {
            $regex: search.trim(),
            $options: 'i',
          },
        },
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      count: users.length,
      users,
    });

  } catch (error) {
    console.error(
      'Get admin users error:',
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


// ========================================
// ADMIN USER DETAILS
// ========================================

const getAdminUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    let profile = null;


    // Student profile
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({
        userId: user._id,
      });
    }


    // Recruiter profile
    if (user.role === 'recruiter') {
      profile = await RecruiterProfile.findOne({
        userId: user._id,
      });
    }


    res.json({
      ...user.toObject(),
      profile,
    });

  } catch (error) {
    console.error(
      'Get admin user error:',
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


// ========================================
// ADMIN JOBS
// ========================================

const getAdminJobs = async (req, res) => {
  try {
    const {
      search = '',
      status = '',
    } = req.query;

    const filter = {};

    if (
      status &&
      ['open', 'closed', 'draft'].includes(status)
    ) {
      filter.status = status;
    }

    if (search.trim()) {
      filter.$or = [
        {
          title: {
            $regex: search.trim(),
            $options: 'i',
          },
        },
        {
          companyName: {
            $regex: search.trim(),
            $options: 'i',
          },
        },
        {
          location: {
            $regex: search.trim(),
            $options: 'i',
          },
        },
      ];
    }

    const jobs = await Job.find(filter)
      .populate('recruiterId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      count: jobs.length,
      jobs,
    });

  } catch (error) {
    console.error(
      'Get admin jobs error:',
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


// ========================================
// ADMIN JOB DETAILS
// ========================================

const getAdminJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('recruiterId', 'name email');

    if (!job) {
      return res.status(404).json({
        message: 'Job not found',
      });
    }

    res.json(job);

  } catch (error) {
    console.error(
      'Get admin job error:',
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


// ========================================
// EXPORTS
// ========================================

module.exports = {
  getAdminDashboard,
  getAdminUsers,
  getAdminUserById,
  getAdminJobs,
  getAdminJobById,
};