const express = require('express');

const {
  getStudentDashboard,
  getStudentProfile,
  updateStudentProfile,
  getStudentSkills,
  updateStudentSkills,
  getRecommendedJobs,
} = require('../controllers/studentController');

const {
  protect,
} = require('../middleware/authMiddleware');

const {
  authorize,
} = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('student'));

router.get('/dashboard', getStudentDashboard);

router.get('/profile', getStudentProfile);

router.put('/profile', updateStudentProfile);

router.get('/skills', getStudentSkills);

router.put('/skills', updateStudentSkills);

router.get('/recommendations', getRecommendedJobs);

module.exports = router;