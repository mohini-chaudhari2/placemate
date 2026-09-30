const express = require('express');

const {
    saveJob,
    unsaveJob,
    getSavedJobs,
    checkSavedJob,
    getSavedJobIds,
} = require('../controllers/savedJobController');

const {
    protect,
} = require('../middleware/authMiddleware');

const {
    authorize,
} = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('student'));

// Get all saved jobs
router.get('/', getSavedJobs);

// Get only saved job IDs
router.get('/ids', getSavedJobIds);

// Check whether one job is saved
router.get('/:jobId/check', checkSavedJob);

// Save a job
router.post('/', saveJob);

// Remove a saved job
router.delete('/:jobId', unsaveJob);

module.exports = router;