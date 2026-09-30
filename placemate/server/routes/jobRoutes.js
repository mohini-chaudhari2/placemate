const express = require('express');

const {
  getJobs,
  getJobById,
  getJobMatch,
  getRecommendedJobs,
} = require('../controllers/jobController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/*
 * Public job routes
 */

// Get all open jobs
router.get('/', getJobs);

// Get recommended jobs for the logged-in student
// Keep this BEFORE /:id so "recommended" is not treated as an ID.
router.get('/recommended', protect, getRecommendedJobs);

// Get a single job
router.get('/:id', getJobById);

/*
 * Protected student route
 */

// Calculate skill match for the logged-in student
router.get('/:id/match', protect, getJobMatch);

module.exports = router;