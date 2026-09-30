const Application = require('../models/Application');


// ========================================
// ADMIN APPLICATIONS
// ========================================

const getAdminApplications = async (req, res) => {
  try {
    const {
      search = '',
      status = '',
    } = req.query;

    const filter = {};

    if (
      status &&
      [
        'Applied',
        'Shortlisted',
        'Interview',
        'Selected',
        'Rejected',
      ].includes(status)
    ) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate(
        'studentId',
        'name email'
      )
      .populate(
        'jobId',
        'title companyName location jobType'
      )
      .populate(
        'recruiterId',
        'name email'
      )
      .sort({ createdAt: -1 });

    let filteredApplications = applications;

    if (search.trim()) {
      const searchTerm = search.trim().toLowerCase();

      filteredApplications =
        applications.filter((application) => {
          const studentName =
            application.studentId?.name?.toLowerCase() || '';

          const studentEmail =
            application.studentId?.email?.toLowerCase() || '';

          const jobTitle =
            application.jobId?.title?.toLowerCase() || '';

          const companyName =
            application.jobId?.companyName?.toLowerCase() || '';

          const recruiterName =
            application.recruiterId?.name?.toLowerCase() || '';

          return (
            studentName.includes(searchTerm) ||
            studentEmail.includes(searchTerm) ||
            jobTitle.includes(searchTerm) ||
            companyName.includes(searchTerm) ||
            recruiterName.includes(searchTerm)
          );
        });
    }

    res.json({
      count: filteredApplications.length,
      applications: filteredApplications,
    });
  } catch (error) {
    console.error(
      'Get admin applications error:',
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


// ========================================
// ADMIN APPLICATION DETAILS
// ========================================

const getAdminApplicationById = async (req, res) => {
  try {
    const application =
      await Application.findById(req.params.id)
        .populate(
          'studentId',
          'name email'
        )
        .populate(
          'jobId',
          'title companyName description location jobType experience salary requiredSkills eligibility applicationDeadline status'
        )
        .populate(
          'recruiterId',
          'name email'
        );

    if (!application) {
      return res.status(404).json({
        message: 'Application not found',
      });
    }

    res.json(application);
  } catch (error) {
    console.error(
      'Get admin application error:',
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = {
  getAdminApplications,
  getAdminApplicationById,
};