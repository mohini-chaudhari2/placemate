
const express = require('express');

const {
  applyForJob,
  getStudentApplications,
  getApplicationById,
} = require('../controllers/applicationController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// All application routes require authentication
router.use(protect);

// Only students can use these routes
router.use(authorize('student'));

// Apply for a job
router.post('/', applyForJob);

// Get all applications of the logged-in student
router.get('/', getStudentApplications);

// Get one application
router.get('/:id', getApplicationById);

module.exports = router;