const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Notification = require('../models/Notification');

const INTERVIEW_STATUSES = [
    'Scheduled',
    'Rescheduled',
    'Cancelled',
    'Completed',
];

const isValidTime = (time) => {
    if (!/^\d{2}:\d{2}$/.test(time)) {
        return false;
    }

    const [hours, minutes] = time.split(':').map(Number);

    return (
        hours >= 0 &&
        hours <= 23 &&
        minutes >= 0 &&
        minutes <= 59
    );
};

const createInterview = async (req, res) => {
    try {
        const {
            applicationId,
            interviewType,
            scheduledDate,
            startTime,
            endTime,
            meetingLink,
            location,
            interviewerName,
            interviewerEmail,
            instructions,
        } = req.body;

        if (
            !applicationId ||
            !interviewType ||
            !scheduledDate ||
            !startTime ||
            !endTime ||
            !interviewerName
        ) {
            return res.status(400).json({
                message: 'Please provide all required interview details',
            });
        }

        if (!['online', 'offline'].includes(interviewType)) {
            return res.status(400).json({
                message: 'Interview type must be online or offline',
            });
        }

        if (!isValidTime(startTime) || !isValidTime(endTime)) {
            return res.status(400).json({
                message: 'Please provide valid start and end times',
            });
        }

        if (startTime >= endTime) {
            return res.status(400).json({
                message: 'End time must be after start time',
            });
        }

        if (interviewType === 'online' && !meetingLink?.trim()) {
            return res.status(400).json({
                message: 'Meeting link is required for online interviews',
            });
        }

        if (interviewType === 'offline' && !location?.trim()) {
            return res.status(400).json({
                message: 'Location is required for offline interviews',
            });
        }

        const application = await Application.findOne({
            _id: applicationId,
            recruiterId: req.user.id,
        })
            .populate('studentId', 'name email')
            .populate('jobId', 'title companyName');

        if (!application) {
            return res.status(404).json({
                message: 'Application not found',
            });
        }

        if (
            !['Shortlisted', 'Interview'].includes(
                application.status
            )
        ) {
            return res.status(400).json({
                message:
                    'Candidate must be shortlisted before scheduling an interview',
            });
        }

        const existingInterview = await Interview.findOne({
            applicationId,
            status: {
                $in: ['Scheduled', 'Rescheduled'],
            },
        });

        if (existingInterview) {
            return res.status(409).json({
                message:
                    'An active interview already exists for this application',
            });
        }

        const interview = await Interview.create({
            applicationId: application._id,
            studentId: application.studentId._id,
            recruiterId: req.user.id,
            jobId: application.jobId._id,
            interviewType,
            scheduledDate,
            startTime,
            endTime,
            meetingLink:
                interviewType === 'online'
                    ? meetingLink.trim()
                    : '',
            location:
                interviewType === 'offline'
                    ? location.trim()
                    : '',
            interviewerName: interviewerName.trim(),
            interviewerEmail: interviewerEmail?.trim() || '',
            instructions: instructions?.trim() || '',
            status: 'Scheduled',
            createdBy: req.user.id,
        });

        if (application.status !== 'Interview') {
            application.status = 'Interview';
            await application.save();
        }

        await Notification.create({
            userId: application.studentId._id,
            title: 'Interview Scheduled',
            message: `An interview has been scheduled for ${application.jobId.title} at ${startTime}.`,
            type: 'interview',
        });

        const populatedInterview =
            await Interview.findById(interview._id)
                .populate('studentId', 'name email')
                .populate('recruiterId', 'name email')
                .populate('jobId', 'title companyName');

        return res.status(201).json({
            message: 'Interview scheduled successfully',
            interview: populatedInterview,
        });
    } catch (error) {
        console.error(
            'Create interview error:',
            error
        );

        return res.status(500).json({
            message: 'Server error while scheduling interview',
        });
    }
};

const getRecruiterInterviews = async (req, res) => {
    try {
        const {
            status,
            applicationId,
            date,
        } = req.query;

        const query = {
            recruiterId: req.user.id,
        };

        if (
            status &&
            INTERVIEW_STATUSES.includes(status)
        ) {
            query.status = status;
        }

        if (applicationId) {
            query.applicationId = applicationId;
        }

        if (date) {
            const start = new Date(`${date}T00:00:00`);
            const end = new Date(`${date}T23:59:59.999`);

            query.scheduledDate = {
                $gte: start,
                $lte: end,
            };
        }

        const interviews = await Interview.find(query)
            .populate('studentId', 'name email')
            .populate('jobId', 'title companyName')
            .sort({
                scheduledDate: 1,
                startTime: 1,
            });

        return res.json({
            count: interviews.length,
            interviews,
        });
    } catch (error) {
        console.error(
            'Get recruiter interviews error:',
            error
        );

        return res.status(500).json({
            message:
                'Server error while fetching recruiter interviews',
        });
    }
};

const getStudentInterviews = async (req, res) => {
    try {
        const {
            status,
        } = req.query;

        const query = {
            studentId: req.user.id,
        };

        if (
            status &&
            INTERVIEW_STATUSES.includes(status)
        ) {
            query.status = status;
        }

        const interviews = await Interview.find(query)
            .populate('recruiterId', 'name email')
            .populate('jobId', 'title companyName')
            .sort({
                scheduledDate: 1,
                startTime: 1,
            });

        return res.json({
            count: interviews.length,
            interviews,
        });
    } catch (error) {
        console.error(
            'Get student interviews error:',
            error
        );

        return res.status(500).json({
            message:
                'Server error while fetching student interviews',
        });
    }
};

const getInterviewById = async (req, res) => {
    try {
        const interview = await Interview.findById(
            req.params.id
        )
            .populate('studentId', 'name email')
            .populate('recruiterId', 'name email')
            .populate('jobId', 'title companyName')
            .populate('applicationId');

        if (!interview) {
            return res.status(404).json({
                message: 'Interview not found',
            });
        }

        const userId = req.user.id.toString();

        const isRecruiter =
            interview.recruiterId._id.toString() === userId;

        const isStudent =
            interview.studentId._id.toString() === userId;

        if (!isRecruiter && !isStudent) {
            return res.status(403).json({
                message:
                    'You are not authorized to view this interview',
            });
        }

        return res.json({
            interview,
        });
    } catch (error) {
        console.error(
            'Get interview error:',
            error
        );

        return res.status(500).json({
            message:
                'Server error while fetching interview',
        });
    }
};

const updateInterview = async (req, res) => {
    try {
        const interview = await Interview.findOne({
            _id: req.params.id,
            recruiterId: req.user.id,
        });

        if (!interview) {
            return res.status(404).json({
                message: 'Interview not found',
            });
        }

        const {
            interviewType,
            scheduledDate,
            startTime,
            endTime,
            meetingLink,
            location,
            interviewerName,
            interviewerEmail,
            instructions,
            status,
            cancellationReason,
        } = req.body;

        if (
            interviewType &&
            !['online', 'offline'].includes(interviewType)
        ) {
            return res.status(400).json({
                message: 'Invalid interview type',
            });
        }

        const nextType =
            interviewType || interview.interviewType;

        const nextStart =
            startTime || interview.startTime;

        const nextEnd =
            endTime || interview.endTime;

        if (!isValidTime(nextStart) || !isValidTime(nextEnd)) {
            return res.status(400).json({
                message: 'Please provide valid interview times',
            });
        }

        if (nextStart >= nextEnd) {
            return res.status(400).json({
                message: 'End time must be after start time',
            });
        }

        if (
            nextType === 'online' &&
            !(
                meetingLink?.trim() ||
                interview.meetingLink
            )
        ) {
            return res.status(400).json({
                message:
                    'Meeting link is required for online interviews',
            });
        }

        if (
            nextType === 'offline' &&
            !(
                location?.trim() ||
                interview.location
            )
        ) {
            return res.status(400).json({
                message:
                    'Location is required for offline interviews',
            });
        }

        const wasScheduled =
            interview.status === 'Scheduled' ||
            interview.status === 'Rescheduled';

        if (interviewType) {
            interview.interviewType = interviewType;
        }

        if (scheduledDate) {
            interview.scheduledDate = scheduledDate;
        }

        if (startTime) {
            interview.startTime = startTime;
        }

        if (endTime) {
            interview.endTime = endTime;
        }

        if (interviewType === 'online') {
            interview.meetingLink =
                meetingLink?.trim() || '';
            interview.location = '';
        } else if (interviewType === 'offline') {
            interview.location =
                location?.trim() || '';
            interview.meetingLink = '';
        } else if (nextType === 'online') {
            if (meetingLink !== undefined) {
                interview.meetingLink =
                    meetingLink.trim();
            }
            interview.location = '';
        } else {
            if (location !== undefined) {
                interview.location =
                    location.trim();
            }
            interview.meetingLink = '';
        }

        if (interviewerName !== undefined) {
            interview.interviewerName =
                interviewerName.trim();
        }

        if (interviewerEmail !== undefined) {
            interview.interviewerEmail =
                interviewerEmail.trim();
        }

        if (instructions !== undefined) {
            interview.instructions =
                instructions.trim();
        }

        if (status) {
            if (!INTERVIEW_STATUSES.includes(status)) {
                return res.status(400).json({
                    message: 'Invalid interview status',
                });
            }

            interview.status = status;
        } else if (wasScheduled) {
            interview.status = 'Rescheduled';
        }

        if (cancellationReason !== undefined) {
            interview.cancellationReason =
                cancellationReason.trim();
        }

        await interview.save();

        let notificationTitle =
            'Interview Updated';

        let notificationMessage =
            'Your interview details have been updated.';

        if (interview.status === 'Rescheduled') {
            notificationTitle =
                'Interview Rescheduled';

            notificationMessage =
                'Your interview has been rescheduled. Please check the updated details.';
        }

        if (interview.status === 'Cancelled') {
            notificationTitle =
                'Interview Cancelled';

            notificationMessage =
                'Your scheduled interview has been cancelled.';
                
            if (interview.cancellationReason) {
                notificationMessage += ` Reason: ${interview.cancellationReason}`;
            }
        }

        await Notification.create({
            userId: interview.studentId,
            title: notificationTitle,
            message: notificationMessage,
            type: 'interview',
        });

        const updatedInterview =
            await Interview.findById(interview._id)
                .populate('studentId', 'name email')
                .populate('recruiterId', 'name email')
                .populate('jobId', 'title companyName');

        return res.json({
            message:
                'Interview updated successfully',
            interview: updatedInterview,
        });
    } catch (error) {
        console.error(
            'Update interview error:',
            error
        );

        return res.status(500).json({
            message:
                'Server error while updating interview',
        });
    }
};

module.exports = {
    createInterview,
    getRecruiterInterviews,
    getStudentInterviews,
    getInterviewById,
    updateInterview,
};