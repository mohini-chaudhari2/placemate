const fs = require('fs');
const path = require('path');
const Resume = require('../models/Resume');

const uploadsDir = path.join(__dirname, '..', 'uploads', 'resumes');

const ensureUploadsDirectory = () => {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
};

const getResumeFilePath = (fileUrl) => {
    if (!fileUrl) return null;

    const normalizedUrl = fileUrl.replace(/^[/\\]+/, '');
    const fileName = path.basename(normalizedUrl);

    return path.join(uploadsDir, fileName);
};

// Get current student's resume
const getMyResume = async (req, res) => {
    try {
        const resume = await Resume.findOne({
            studentId: req.user.id,
        });

        res.json({
            resume: resume || null,
        });
    } catch (error) {
        console.error('Get resume error:', error);

        res.status(500).json({
            message: 'Failed to fetch resume',
        });
    }
};

// Upload / replace student's resume
const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'Please select a resume file',
            });
        }

        ensureUploadsDirectory();

        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!allowedTypes.includes(req.file.mimetype)) {
            if (req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(400).json({
                message: 'Only PDF, DOC, and DOCX files are allowed',
            });
        }

        const maxSize = 5 * 1024 * 1024;

        if (req.file.size > maxSize) {
            if (req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(400).json({
                message: 'Resume file must be 5 MB or smaller',
            });
        }

        const existingResume = await Resume.findOne({
            studentId: req.user.id,
        });

        if (existingResume) {
            const oldFilePath = getResumeFilePath(existingResume.fileUrl);

            if (oldFilePath && fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }

            await Resume.deleteOne({
                _id: existingResume._id,
            });
        }

        const fileName = req.file.filename;
        const fileUrl = `/uploads/resumes/${fileName}`;

        const resume = await Resume.create({
            studentId: req.user.id,
            fileName,
            originalName: req.file.originalname,
            fileUrl,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            uploadedAt: new Date(),
        });

        res.status(201).json({
            message: 'Resume uploaded successfully',
            resume,
        });
    } catch (error) {
        console.error('Upload resume error:', error);

        if (req.file?.path && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupError) {
                console.error('Resume cleanup error:', cleanupError);
            }
        }

        res.status(500).json({
            message: 'Failed to upload resume',
        });
    }
};

// Delete student's resume
const deleteResume = async (req, res) => {
    try {
        const resume = await Resume.findOne({
            studentId: req.user.id,
        });

        if (!resume) {
            return res.status(404).json({
                message: 'Resume not found',
            });
        }

        const filePath = getResumeFilePath(resume.fileUrl);

        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await Resume.deleteOne({
            _id: resume._id,
        });

        res.json({
            message: 'Resume deleted successfully',
        });
    } catch (error) {
        console.error('Delete resume error:', error);

        res.status(500).json({
            message: 'Failed to delete resume',
        });
    }
};

module.exports = {
    getMyResume,
    uploadResume,
    deleteResume,
};