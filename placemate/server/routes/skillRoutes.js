const express = require('express');
const { getSkills } = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected route: Any authenticated student, recruiter, or admin can query the skill library
router.use(protect);

router.get('/', getSkills);

module.exports = router;
