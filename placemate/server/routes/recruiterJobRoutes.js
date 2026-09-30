const express = require('express');

const {
  createJob,
  getRecruiterJobs,
  getRecruiterJobById,
  updateRecruiterJob,
  deleteRecruiterJob,
} = require('../controllers/recruiterJobController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Authentication required
router.use(protect);

// Recruiter role required
router.use(authorize('recruiter'));

// Create a new job
router.post('/', createJob);

// Get jobs created by the logged-in recruiter
router.get('/', getRecruiterJobs);

// Get one recruiter's job
router.get('/:id', getRecruiterJobById);

// Update a recruiter's job
router.put('/:id', updateRecruiterJob);

// Delete a recruiter's job
router.delete('/:id', deleteRecruiterJob);

module.exports = router;