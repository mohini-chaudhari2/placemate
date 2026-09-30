const express = require('express');

const {
  getAdminDashboard,
  getAdminUsers,
  getAdminUserById,
  getAdminJobs,
  getAdminJobById,
} = require('../controllers/adminController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getAdminDashboard);

router.get('/users', getAdminUsers);

router.get('/users/:id', getAdminUserById);

router.get('/jobs', getAdminJobs);
router.get('/jobs/:id', getAdminJobById);

module.exports = router;