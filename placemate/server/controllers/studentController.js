const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const { canonicalizeSkills } = require('./skillController');

/* =========================================================
   SKILL MATCHING NORMALIZATION
========================================================= */

const normalizeSkillKey = (skill) => {
  if (!skill) return '';
  return String(skill)
    .trim()
    .toLowerCase()
    .replace(/[\.\-_]/g, '')
    .replace(/\s+/g, '');
};

const areSkillsEqual = (s1, s2) => {
  if (!s1 || !s2) return false;
  const k1 = normalizeSkillKey(s1);
  const k2 = normalizeSkillKey(s2);
  if (k1 === k2) return true;
  if ((k1 === 'react' || k1 === 'reactjs') && (k2 === 'react' || k2 === 'reactjs')) return true;
  if ((k1 === 'node' || k1 === 'nodejs') && (k2 === 'node' || k2 === 'nodejs')) return true;
  if ((k1 === 'cpp' || k1 === 'c++') && (k2 === 'cpp' || k2 === 'c++')) return true;
  if ((k1 === 'csharp' || k1 === 'c#') && (k2 === 'csharp' || k2 === 'c#')) return true;
  return false;
};


/* =========================================================
   PROFILE COMPLETION CALCULATOR
========================================================= */

const calculateProfileCompletion = (profile) => {
  const fields = [
    profile.phone,
    profile.college,
    profile.branch,
    profile.graduationYear,
    profile.cgpa,
    Array.isArray(profile.skills) &&
      profile.skills.length > 0,
    profile.resumeUrl,
    Array.isArray(profile.preferredLocations) &&
      profile.preferredLocations.length > 0,
    Array.isArray(profile.preferredJobTypes) &&
      profile.preferredJobTypes.length > 0,
    profile.bio,
  ];

  const completedFields = fields.filter((field) => {
    if (typeof field === 'boolean') {
      return field;
    }

    return (
      field !== undefined &&
      field !== null &&
      String(field).trim() !== ''
    );
  }).length;

  return Math.round(
    (completedFields / fields.length) * 100
  );
};

/* =========================================================
   STUDENT DASHBOARD
========================================================= */

const getStudentDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      'name email role'
    );

    if (!user) {
      return res.status(404).json({
        message: 'Student user not found',
      });
    }

    let profile = await StudentProfile.findOne({
      userId: req.user.id,
    });

    if (!profile) {
      profile = await StudentProfile.create({
        userId: req.user.id,
      });
    }

    // Automatically calculate profile completion
    const profileCompletion =
      calculateProfileCompletion(profile);

    // Keep stored profile completion synchronized
    if (profile.profileCompletion !== profileCompletion) {
      profile.profileCompletion = profileCompletion;
      await profile.save();
    }

    const applications = await Application.find({
      studentId: req.user.id,
    })
      .populate('jobId')
      .sort({ createdAt: -1 });

    const notifications = await Notification.find({
      userId: req.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    const applicationCount = applications.length;

    const shortlistedCount = applications.filter(
      (application) =>
        application.status === 'Shortlisted'
    ).length;

    const interviewCount = applications.filter(
      (application) =>
        application.status === 'Interview'
    ).length;

    const selectedCount = applications.filter(
      (application) =>
        application.status === 'Selected'
    ).length;

    res.json({
      user,
      profile,

      statistics: {
        profileCompletion,
        skillsCount: Array.isArray(profile.skills)
          ? profile.skills.length
          : 0,
        applicationCount,
        shortlistedCount,
        interviewCount,
        selectedCount,
      },

      recentApplications: applications.slice(0, 5),

      notifications,
    });
  } catch (error) {
    console.error(
      'Get student dashboard error:',
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

/* =========================================================
   STUDENT PROFILE
========================================================= */

const getStudentProfile = async (req, res) => {
  try {
    let profile = await StudentProfile.findOne({
      userId: req.user.id,
    });

    if (!profile) {
      profile = await StudentProfile.create({
        userId: req.user.id,
      });
    }

    // Automatically calculate completion
    const profileCompletion =
      calculateProfileCompletion(profile);

    if (profile.profileCompletion !== profileCompletion) {
      profile.profileCompletion = profileCompletion;
      await profile.save();
    }

    res.json(profile);
  } catch (error) {
    console.error(
      'Get student profile error:',
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

const updateStudentProfile = async (req, res) => {
  try {
    let profile = await StudentProfile.findOne({
      userId: req.user.id,
    });

    if (!profile) {
      profile = new StudentProfile({
        userId: req.user.id,
      });
    }

    const {
      fullName,
      email,
      phone,
      college,
      branch,
      graduationYear,
      cgpa,
      skills,
      resumeUrl,
      preferredLocations,
      preferredJobTypes,
      bio,
    } = req.body;

    let userUpdated = false;
    const user = await User.findById(req.user.id);
    if (user && fullName && fullName.trim() !== '' && user.name !== fullName.trim()) {
      user.name = fullName.trim();
      userUpdated = true;
    }
    // Note: We don't update email here as it's the login identifier and usually requires verification.
    
    if (userUpdated) {
      await user.save();
    }

    if (phone !== undefined) {
      profile.phone = phone;
    }

    if (college !== undefined) {
      profile.college = college;
    }

    if (branch !== undefined) {
      profile.branch = branch;
    }

    if (graduationYear !== undefined) {
      profile.graduationYear = graduationYear;
    }

    if (cgpa !== undefined) {
      profile.cgpa = cgpa;
    }

    if (skills !== undefined) {
      profile.skills = await canonicalizeSkills(skills);
    }

    if (resumeUrl !== undefined) {
      profile.resumeUrl = resumeUrl;
    }

    if (preferredLocations !== undefined) {
      profile.preferredLocations =
        preferredLocations;
    }

    if (preferredJobTypes !== undefined) {
      profile.preferredJobTypes =
        preferredJobTypes;
    }

    if (bio !== undefined) {
      profile.bio = bio;
    }

    /*
      Do NOT trust profileCompletion from frontend.

      Calculate it from the actual saved profile
      fields instead.
    */
    profile.profileCompletion =
      calculateProfileCompletion(profile);

    await profile.save();

    res.json({
      message: 'Student profile updated successfully',
      profile,
    });
  } catch (error) {
    console.error(
      'Update student profile error:',
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

/* =========================================================
   STUDENT SKILLS (DEDICATED)
========================================================= */

const getStudentSkills = async (req, res) => {
  try {
    let profile = await StudentProfile.findOne({
      userId: req.user.id,
    });

    if (!profile) {
      profile = await StudentProfile.create({
        userId: req.user.id,
      });
    }

    res.json({
      count: Array.isArray(profile.skills) ? profile.skills.length : 0,
      skills: profile.skills || [],
      profileCompletion: profile.profileCompletion || 0,
    });
  } catch (error) {
    console.error('Get student skills error:', error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateStudentSkills = async (req, res) => {
  try {
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        message: 'Skills must be an array of skill names',
      });
    }

    let profile = await StudentProfile.findOne({
      userId: req.user.id,
    });

    if (!profile) {
      profile = new StudentProfile({
        userId: req.user.id,
      });
    }

    // Canonicalize against official skill library
    const canonicalSkills = await canonicalizeSkills(skills);

    profile.skills = canonicalSkills;
    profile.profileCompletion = calculateProfileCompletion(profile);

    await profile.save();

    res.json({
      message: 'Skills updated successfully',
      skills: profile.skills,
      profileCompletion: profile.profileCompletion,
    });
  } catch (error) {
    console.error('Update student skills error:', error);
    res.status(500).json({
      message: error.message,
    });
  }
};

/* =========================================================
   SMART JOB RECOMMENDATIONS
========================================================= */

const getRecommendedJobs = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({
      userId: req.user.id,
    });

    if (!profile) {
      return res.json({
        count: 0,
        recommendations: [],
      });
    }

    const jobs = await Job.find({
      status: 'open',
    }).sort({
      createdAt: -1,
    });

    const studentSkills = Array.isArray(profile.skills)
      ? profile.skills
          .map((skill) => String(skill).split(','))
          .flat()
          .map((skill) => skill.trim().toLowerCase())
          .filter(Boolean)
      : [];

    const preferredLocations = Array.isArray(
      profile.preferredLocations
    )
      ? profile.preferredLocations.map((location) =>
          String(location).trim().toLowerCase()
        )
      : [];

    const preferredJobTypes = Array.isArray(
      profile.preferredJobTypes
    )
      ? profile.preferredJobTypes.map((jobType) =>
          String(jobType).trim().toLowerCase()
        )
      : [];

    const studentBranch = String(
      profile.branch || ''
    )
      .trim()
      .toLowerCase();

    const studentCgpa = Number(profile.cgpa || 0);

    const studentGraduationYear = Number(
      profile.graduationYear || 0
    );

    const recommendations = jobs
      .map((job) => {
        let score = 0;

        const reasons = [];
        const matchingSkills = [];
        const missingSkills = [];

        const jobSkills = Array.isArray(job.requiredSkills)
          ? job.requiredSkills
              .map((skill) => String(skill).split(','))
              .flat()
              .map((skill) => skill.trim().toLowerCase())
              .filter(Boolean)
          : [];

        jobSkills.forEach((requiredSkill) => {
          const matched = studentSkills.some((s) => areSkillsEqual(s, requiredSkill));
          if (matched) {
            matchingSkills.push(requiredSkill);
            score += 10;
          } else {
            missingSkills.push(requiredSkill);
          }
        });

        if (matchingSkills.length > 0) {
          reasons.push(
            `${matchingSkills.length} skill${
              matchingSkills.length > 1 ? 's' : ''
            } matched`
          );
        }

        const jobLocation = String(
          job.location || ''
        )
          .trim()
          .toLowerCase();

        if (
          jobLocation &&
          preferredLocations.some(
            (location) =>
              jobLocation.includes(location) ||
              location.includes(jobLocation)
          )
        ) {
          score += 15;
          reasons.push('Preferred location');
        }

        const jobType = String(
          job.jobType || ''
        )
          .trim()
          .toLowerCase();

        if (
          jobType &&
          preferredJobTypes.includes(jobType)
        ) {
          score += 10;
          reasons.push('Preferred job type');
        }

        const minimumCgpa = Number(
          job.eligibility?.minCgpa || 0
        );

        if (
          minimumCgpa === 0 ||
          studentCgpa >= minimumCgpa
        ) {
          score += 10;
          reasons.push('CGPA eligible');
        } else {
          score -= 30;
        }

        const eligibleBranches = Array.isArray(
          job.eligibility?.branches
        )
          ? job.eligibility.branches.map((branch) =>
              String(branch).trim().toLowerCase()
            )
          : [];

        if (
          eligibleBranches.length === 0 ||
          eligibleBranches.includes('all') ||
          eligibleBranches.includes(studentBranch)
        ) {
          score += 10;
          reasons.push('Branch eligible');
        } else {
          score -= 30;
        }

        const eligibleBatch = Number(
          job.eligibility?.batch || 0
        );

        if (
          eligibleBatch === 0 ||
          studentGraduationYear === 0 ||
          studentGraduationYear === eligibleBatch
        ) {
          score += 5;
        }

        const maxPossibleScore =
          jobSkills.length * 10 +
          15 +
          10 +
          10 +
          10 +
          5;

        let matchPercentage =
          maxPossibleScore > 0
            ? Math.round(
                (score / maxPossibleScore) * 100
              )
            : 0;

        matchPercentage = Math.max(
          0,
          Math.min(100, matchPercentage)
        );

        return {
          job,
          matchPercentage,
          matchingSkills,
          missingSkills,
          reasons,
        };
      })
      .filter(
        (recommendation) =>
          recommendation.matchPercentage >= 30
      )
      .sort(
        (a, b) =>
          b.matchPercentage -
          a.matchPercentage
      )
      .slice(0, 10);

    res.json({
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    console.error(
      'Get recommended jobs error:',
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getStudentDashboard,
  getStudentProfile,
  updateStudentProfile,
  getStudentSkills,
  updateStudentSkills,
  getRecommendedJobs,
};