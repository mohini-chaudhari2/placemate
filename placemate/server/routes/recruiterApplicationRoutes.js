const express = require('express');

const {
  getRecruiterApplications,
  getCandidateProfile,
  getApplicationStatusOptions,
  updateApplicationStatus,
} = require('../controllers/recruiterApplicationController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('recruiter'));

/*
  Get all recruiter applications.
  Supports optional:
  ?status=Shortlisted
  ?jobId=...
  ?search=...
*/
router.get('/', getRecruiterApplications);

/*
  Get available next statuses for a specific application.

  IMPORTANT:
  This must come before /:id/candidate and /:id/status
  so Express resolves the route correctly.
*/
router.get(
  '/:id/status-options',
  getApplicationStatusOptions
);

/*
  Get complete candidate profile for an application.
*/
router.get(
  '/:id/candidate',
  getCandidateProfile
);

/*
  Update application status and/or recruiter note.
*/
router.put(
  '/:id/status',
  updateApplicationStatus
);

module.exports = router;