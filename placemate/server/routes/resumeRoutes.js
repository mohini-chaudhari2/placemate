const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { protect } = require('../middleware/authMiddleware');

const {
    getMyResume,
    uploadResume,
    deleteResume,
} = require('../controllers/resumeController');

const router = express.Router();

const studentOnly = (req, res, next) => {
    if (req.user?.role !== 'student') {
        return res.status(403).json({
            message: 'Student access required',
        });
    }

    next();
};

/*
|--------------------------------------------------------------------------
| Resume upload directory
|--------------------------------------------------------------------------
*/

const uploadDirectory = path.join(
    __dirname,
    '..',
    'uploads',
    'resumes'
);

// Make absolutely sure the directory exists BEFORE multer receives a file.
fs.mkdirSync(uploadDirectory, {
    recursive: true,
});

/*
|--------------------------------------------------------------------------
| Multer storage
|--------------------------------------------------------------------------
*/

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Also verify it exists at upload time.
        fs.mkdirSync(uploadDirectory, {
            recursive: true,
        });

        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();

        const randomPart = Math.random()
            .toString(16)
            .slice(2);

        const filename =
            `resume-${req.user.id}-${Date.now()}-${randomPart}${extension}`;

        cb(null, filename);
    },
});

/*
|--------------------------------------------------------------------------
| File validation
|--------------------------------------------------------------------------
*/

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const allowedExtensions = [
        '.pdf',
        '.doc',
        '.docx',
    ];

    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    const validMimeType =
        allowedMimeTypes.includes(file.mimetype);

    const validExtension =
        allowedExtensions.includes(extension);

    if (!validMimeType || !validExtension) {
        return cb(
            new Error(
                'Only PDF, DOC and DOCX resume files are allowed.'
            )
        );
    }

    cb(null, true);
};

/*
|--------------------------------------------------------------------------
| Multer
|--------------------------------------------------------------------------
*/

const upload = multer({
    storage,
    fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

router.use(protect);
router.use(studentOnly);

router.get('/', getMyResume);

router.post(
    '/',
    upload.single('resume'),
    uploadResume
);

router.delete(
    '/',
    deleteResume
);

/*
|--------------------------------------------------------------------------
| Multer / upload error handler
|--------------------------------------------------------------------------
*/

router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'Resume must be smaller than 5 MB.',
            });
        }

        return res.status(400).json({
            message: err.message || 'Resume upload failed.',
        });
    }

    if (err) {
        return res.status(400).json({
            message:
                err.message ||
                'Unable to upload your resume.',
        });
    }

    next();
});

module.exports = router;