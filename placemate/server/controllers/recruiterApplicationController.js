const Application = require('../models/Application');
const Job = require('../models/Job');
const StudentProfile = require('../models/StudentProfile');
const Notification = require('../models/Notification');

const ALLOWED_STATUSES = [
  'Applied',
  'Shortlisted',
  'Interview',
  'Selected',
  'Rejected',
];

/*
  Application workflow:

  Applied
    ├── Shortlisted
    └── Rejected

  Shortlisted
    ├── Interview
    └── Rejected

  Interview
    ├── Selected
    └── Rejected

  Selected / Rejected
    └── Final status — no further changes
*/
const STATUS_TRANSITIONS = {
  Applied: ['Shortlisted', 'Rejected'],
  Shortlisted: ['Interview', 'Rejected'],
  Interview: ['Selected', 'Rejected'],
  Selected: [],
  Rejected: [],
};


/* =========================================================
   GET RECRUITER APPLICATIONS
   ========================================================= */

const getRecruiterApplications = async (req, res) => {
  try {
    const {
      status,
      jobId,
      search,
    } = req.query;

    const query = {
      recruiterId: req.user.id,
    };

    if (status && ALLOWED_STATUSES.includes(status)) {
      query.status = status;
    }

    if (jobId) {
      query.jobId = jobId;
    }

    const applications = await Application.find(query)
      .populate('jobId')
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });

    let filteredApplications = applications;

    /*
      Search candidate name/email/company/job title
      after population so existing frontend behavior
      remains compatible.
    */
    if (search && search.trim()) {
      const searchTerm = search.trim().toLowerCase();

      filteredApplications = applications.filter((application) => {
        const candidateName =
          application.studentId?.name?.toLowerCase() || '';

        const candidateEmail =
          application.studentId?.email?.toLowerCase() || '';

        const jobTitle =
          application.jobId?.title?.toLowerCase() || '';

        const companyName =
          application.jobId?.companyName?.toLowerCase() || '';

        return (
          candidateName.includes(searchTerm) ||
          candidateEmail.includes(searchTerm) ||
          jobTitle.includes(searchTerm) ||
          companyName.includes(searchTerm)
        );
      });
    }

    res.json({
      count: filteredApplications.length,
      applications: filteredApplications,
    });
  } catch (error) {
    console.error('Get recruiter applications error:', error);

    res.status(500).json({
      message: error.message,
    });
  }
};


/* =========================================================
   GET CANDIDATE PROFILE
   ========================================================= */

const getCandidateProfile = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      recruiterId: req.user.id,
    }).populate('jobId');

    if (!application) {
      return res.status(404).json({
        message: 'Application not found',
      });
    }

    const studentProfile = await StudentProfile.findOne({
      userId: application.studentId,
    }).populate('userId', 'name email');

    if (!studentProfile) {
      return res.status(404).json({
        message: 'Student profile not found',
      });
    }

    res.json({
      application: {
        _id: application._id,
        status: application.status,
        appliedAt: application.appliedAt,
        recruiterNote: application.recruiterNote,
        job: application.jobId,
      },

      candidate: {
        userId: studentProfile.userId?._id,
        name: studentProfile.userId?.name || '',
        email: studentProfile.userId?.email || '',
        phone: studentProfile.phone || '',
        college: studentProfile.college || '',
        branch: studentProfile.branch || '',
        graduationYear: studentProfile.graduationYear || '',
        cgpa: studentProfile.cgpa ?? null,
        skills: studentProfile.skills || [],
        resumeUrl: studentProfile.resumeUrl || '',
        profileCompletion: studentProfile.profileCompletion || 0,

        preferredLocations:
          studentProfile.preferredLocations || [],

        preferredJobTypes:
          studentProfile.preferredJobTypes || [],

        bio: studentProfile.bio || '',
      },
    });
  } catch (error) {
    console.error('Get candidate profile error:', error);

    res.status(500).json({
      message: error.message,
    });
  }
};


/* =========================================================
   GET AVAILABLE NEXT STATUSES
   ========================================================= */

const getApplicationStatusOptions = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      recruiterId: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        message: 'Application not found',
      });
    }

    const nextStatuses =
      STATUS_TRANSITIONS[application.status] || [];

    res.json({
      currentStatus: application.status,
      availableStatuses: nextStatuses,
      isFinal:
        nextStatuses.length === 0,
    });
  } catch (error) {
    console.error(
      'Get application status options error:',
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


/* =========================================================
   UPDATE APPLICATION STATUS
   ========================================================= */

const updateApplicationStatus = async (req, res) => {
  try {
    const {
      status,
      recruiterNote,
    } = req.body;

    if (!status) {
      return res.status(400).json({
        message: 'Application status is required',
      });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message: 'Invalid application status',
        allowedStatuses: ALLOWED_STATUSES,
      });
    }

    const application = await Application.findOne({
      _id: req.params.id,
      recruiterId: req.user.id,
    }).populate('jobId');

    if (!application) {
      return res.status(404).json({
        message: 'Application not found',
      });
    }

    const currentStatus = application.status;

    /*
      Do not create unnecessary updates/notifications
      when the recruiter selects the current status.
    */
    if (currentStatus === status) {
      if (recruiterNote !== undefined) {
        application.recruiterNote = recruiterNote;
        await application.save();
      }

      const unchangedApplication =
        await Application.findById(application._id)
          .populate('jobId')
          .populate('studentId', 'name email');

      return res.json({
        message: 'Application details updated',
        statusChanged: false,
        application: unchangedApplication,
      });
    }

    const allowedNextStatuses =
      STATUS_TRANSITIONS[currentStatus] || [];

    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        message:
          `Cannot change application status from ` +
          `"${currentStatus}" to "${status}".`,
        currentStatus,
        availableStatuses: allowedNextStatuses,
      });
    }

    application.status = status;

    if (recruiterNote !== undefined) {
      application.recruiterNote = recruiterNote;
    }

    await application.save();

    /*
      Notify the student only when the status actually changes.
    */
    await Notification.create({
      userId: application.studentId,
      title: 'Application Status Updated',
      message:
        `Your application for ${application.jobId.title} ` +
        `at ${application.jobId.companyName} ` +
        `has moved from ${currentStatus} to ${status}.`,
      type: 'application',
    });

    const updatedApplication =
      await Application.findById(application._id)
        .populate('jobId')
        .populate('studentId', 'name email');

    res.json({
      message: 'Application status updated successfully',
      statusChanged: true,
      previousStatus: currentStatus,
      currentStatus: status,
      application: updatedApplication,
    });
  } catch (error) {
    console.error(
      'Update application status error:',
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


/* =========================================================
   EXPORTS
   ========================================================= */

module.exports = {
  getRecruiterApplications,
  getCandidateProfile,
  getApplicationStatusOptions,
  updateApplicationStatus,
};