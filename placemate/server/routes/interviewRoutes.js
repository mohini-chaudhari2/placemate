const express = require('express');

const {
    createInterview,
    getRecruiterInterviews,
    getStudentInterviews,
    getInterviewById,
    updateInterview,
} = require('../controllers/interviewController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Recruiter Interview Routes
|--------------------------------------------------------------------------
*/

router.post(
    '/',
    protect,
    authorize('recruiter'),
    createInterview
);

router.get(
    '/recruiter',
    protect,
    authorize('recruiter'),
    getRecruiterInterviews
);

/*
|--------------------------------------------------------------------------
| Student Interview Routes
|--------------------------------------------------------------------------
*/

router.get(
    '/student',
    protect,
    authorize('student'),
    getStudentInterviews
);

/*
|--------------------------------------------------------------------------
| Shared Interview Routes
|--------------------------------------------------------------------------
*/

router.get(
    '/:id',
    protect,
    getInterviewById
);

router.put(
    '/:id',
    protect,
    authorize('recruiter'),
    updateInterview
);

module.exports = router;