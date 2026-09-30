const express = require('express');

const {
  getAdminApplications,
  getAdminApplicationById,
} = require('../controllers/adminApplicationController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/', getAdminApplications);
router.get('/:id', getAdminApplicationById);

module.exports = router;