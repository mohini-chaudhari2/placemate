const Job = require('../models/Job');
const StudentProfile = require('../models/StudentProfile');

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

  if (
    (k1 === 'react' || k1 === 'reactjs') &&
    (k2 === 'react' || k2 === 'reactjs')
  ) {
    return true;
  }

  if (
    (k1 === 'node' || k1 === 'nodejs') &&
    (k2 === 'node' || k2 === 'nodejs')
  ) {
    return true;
  }

  if (
    (k1 === 'cpp' || k1 === 'c++') &&
    (k2 === 'cpp' || k2 === 'c++')
  ) {
    return true;
  }

  if (
    (k1 === 'csharp' || k1 === 'c#') &&
    (k2 === 'csharp' || k2 === 'c#')
  ) {
    return true;
  }

  return false;
};

const calculateSkillMatch = (
  studentSkills = [],
  requiredSkills = []
) => {
  const flattenSkills = (skillsArray) => {
    return (skillsArray || [])
      .map(s => String(s).split(','))
      .flat()
      .map(s => s.trim())
      .filter(Boolean);
  };

  const validStudentSkills = flattenSkills(studentSkills);
  const validRequiredSkills = flattenSkills(requiredSkills);

  if (validRequiredSkills.length === 0) {
    return {
      percentage: 100,
      matchedSkills: [],
      missingSkills: [],
    };
  }

  const matchedSkills = [];
  const missingSkills = [];

  validRequiredSkills.forEach((reqSkill) => {
    const isMatched = validStudentSkills.some((skill) =>
      areSkillsEqual(skill, reqSkill)
    );

    if (isMatched) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  const percentage = Math.round(
    (matchedSkills.length /
      validRequiredSkills.length) *
    100
  );

  return {
    percentage,
    matchedSkills,
    missingSkills,
  };
};

/*
 * Escape user input before putting it
 * inside a MongoDB regular expression.
 */
const escapeRegex = (value) => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );
};

/*
 * GET /api/jobs
 *
 * Public job listing.
 *
 * Supported query parameters:
 *
 * search
 * location
 * jobType
 * experience
 * skills
 * salary
 * sort
 * page
 * limit
 *
 * Examples:
 *
 * /api/jobs?search=react
 *
 * /api/jobs?location=Pune
 *
 * /api/jobs?skills=React,Node.js
 *
 * /api/jobs?salary=5
 *
 * /api/jobs?sort=oldest
 *
 * /api/jobs?page=2&limit=12
 */
const getJobs = async (req, res) => {
  try {
    const {
      search,
      location,
      jobType,
      experience,
      skills,
      salary,
      sort = 'newest',
    } = req.query;

    let page = parseInt(
      req.query.page,
      10
    );

    let limit = parseInt(
      req.query.limit,
      10
    );

    if (
      Number.isNaN(page) ||
      page < 1
    ) {
      page = 1;
    }

    if (
      Number.isNaN(limit) ||
      limit < 1
    ) {
      limit = 12;
    }

    // Maximum number of jobs returned per request.
    if (limit > 50) {
      limit = 50;
    }

    /*
     * Only open jobs are publicly visible.
     */
    const filter = {
      status: 'open',
    };

    /*
     * SEARCH
     *
     * Searches:
     * - title
     * - company
     * - description
     * - required skills
     */
    if (
      search &&
      search.trim()
    ) {
      const searchTerm =
        escapeRegex(
          search.trim()
        );

      filter.$or = [
        {
          title: {
            $regex: searchTerm,
            $options: 'i',
          },
        },
        {
          companyName: {
            $regex: searchTerm,
            $options: 'i',
          },
        },
        {
          description: {
            $regex: searchTerm,
            $options: 'i',
          },
        },
        {
          requiredSkills: {
            $regex: searchTerm,
            $options: 'i',
          },
        },
      ];
    }

    /*
     * LOCATION
     */
    if (
      location &&
      location.trim()
    ) {
      filter.location = {
        $regex: escapeRegex(
          location.trim()
        ),
        $options: 'i',
      };
    }

    /*
     * JOB TYPE
     */
    if (
      jobType &&
      jobType.trim()
    ) {
      filter.jobType = {
        $regex: escapeRegex(
          jobType.trim()
        ),
        $options: 'i',
      };
    }

    /*
     * EXPERIENCE
     */
    if (
      experience &&
      experience.trim()
    ) {
      filter.experience = {
        $regex: escapeRegex(
          experience.trim()
        ),
        $options: 'i',
      };
    }

    /*
     * SKILLS
     *
     * Supports:
     *
     * ?skills=React
     *
     * ?skills=React,Node.js
     *
     * The job matches if it contains
     * at least one requested skill.
     */
    if (skills) {
      const requestedSkills =
        String(skills)
          .split(',')
          .map((skill) =>
            skill.trim()
          )
          .filter(Boolean);

      if (
        requestedSkills.length > 0
      ) {
        filter.requiredSkills = {
          $in: requestedSkills.map(
            (skill) =>
              new RegExp(
                escapeRegex(skill),
                'i'
              )
          ),
        };
      }
    }

    /*
     * SALARY
     *
     * Salary is stored as a String
     * in the current Job schema.
     *
     * Therefore we support safe text
     * filtering for now.
     *
     * Example:
     *
     * ?salary=5
     *
     * can match:
     * "5 LPA"
     * "5-7 LPA"
     * "₹5,00,000"
     */
    if (
      salary &&
      salary.trim()
    ) {
      filter.salary = {
        $regex: escapeRegex(
          salary.trim()
        ),
        $options: 'i',
      };
    }

    /*
     * SORTING
     */
    let sortOption = {
      createdAt: -1,
    };

    switch (sort) {
      case 'oldest':
        sortOption = {
          createdAt: 1,
        };
        break;

      case 'title':
        sortOption = {
          title: 1,
        };
        break;

      case 'company':
        sortOption = {
          companyName: 1,
        };
        break;

      case 'deadline':
        sortOption = {
          applicationDeadline: 1,
        };
        break;

      case 'newest':
      default:
        sortOption = {
          createdAt: -1,
        };
        break;
    }

    /*
     * TOTAL MATCHING JOBS
     */
    const totalJobs =
      await Job.countDocuments(
        filter
      );

    const totalPages =
      totalJobs === 0
        ? 0
        : Math.ceil(
          totalJobs / limit
        );

    /*
     * PAGINATION
     */
    const skip =
      (page - 1) * limit;

    const jobs =
      await Job.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean();

    res.json({
      count: jobs.length,
      totalJobs,
      page,
      limit,
      totalPages,

      hasNextPage:
        page < totalPages,

      hasPreviousPage:
        page > 1 &&
        totalPages > 0,

      filters: {
        search:
          search || '',
        location:
          location || '',
        jobType:
          jobType || '',
        experience:
          experience || '',
        skills:
          skills || '',
        salary:
          salary || '',
        sort,
      },

      jobs,
    });
  } catch (error) {
    console.error(
      'Get jobs error:',
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

/*
 * GET /api/jobs/:id
 *
 * Get a single public job.
 */
const getJobById = async (
  req,
  res
) => {
  try {
    const job =
      await Job.findOne({
        _id: req.params.id,
        status: 'open',
      }).lean();

    if (!job) {
      return res.status(404).json({
        message: 'Job not found',
      });
    }

    res.json(job);
  } catch (error) {
    console.error(
      'Get job by ID error:',
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

/*
 * GET /api/jobs/:id/match
 *
 * Protected student endpoint.
 */
const getJobMatch = async (
  req,
  res
) => {
  try {
    const job =
      await Job.findOne({
        _id: req.params.id,
        status: 'open',
      }).lean();

    if (!job) {
      return res.status(404).json({
        message: 'Job not found',
      });
    }

    const profile =
      await StudentProfile.findOne({
        userId: req.user.id,
      }).lean();

    if (!profile) {
      return res.status(404).json({
        message:
          'Student profile not found',
      });
    }

    const match =
      calculateSkillMatch(
        profile.skills || [],
        job.requiredSkills || []
      );

    res.json({
      jobId: job._id,
      jobTitle: job.title,

      studentSkills:
        profile.skills || [],

      requiredSkills:
        job.requiredSkills || [],

      matchPercentage:
        match.percentage,

      matchedSkills:
        match.matchedSkills,

      missingSkills:
        match.missingSkills,
    });
  } catch (error) {
    console.error(
      'Get job match error:',
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

/*
 * GET /api/jobs/recommended
 *
 * Protected student endpoint.
 *
 * Returns open jobs sorted by
 * skill-match percentage.
 */
const getRecommendedJobs = async (
  req,
  res
) => {
  try {
    const profile =
      await StudentProfile.findOne({
        userId: req.user.id,
      }).lean();

    if (!profile) {
      return res.status(404).json({
        message:
          'Student profile not found',
      });
    }

    const jobs =
      await Job.find({
        status: 'open',
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    const recommendedJobs =
      jobs
        .map((job) => {
          const match =
            calculateSkillMatch(
              profile.skills || [],
              job.requiredSkills || []
            );

          return {
            ...job,

            matchPercentage:
              match.percentage,

            matchedSkills:
              match.matchedSkills,

            missingSkills:
              match.missingSkills,
          };
        })
        .sort((a, b) => {
          if (
            b.matchPercentage !==
            a.matchPercentage
          ) {
            return (
              b.matchPercentage -
              a.matchPercentage
            );
          }

          return (
            new Date(b.createdAt) -
            new Date(a.createdAt)
          );
        });

    res.json({
      count:
        recommendedJobs.length,

      jobs:
        recommendedJobs,
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
  getJobs,
  getJobById,
  getJobMatch,
  getRecommendedJobs,
};