require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Notification = require('../models/Notification');
const SavedJob = require('../models/SavedJob');
const { canonicalizeSkills } = require('../controllers/skillController');

const studentsData = [
  {
    name: 'Yash Thakur',
    email: 'yasthakur01@gmail.com',
    password: 'Yash@123',
    phone: '+91 98765 41021',
    college: 'IIT Indore',
    branch: 'Computer Science and Engineering',
    graduationYear: 2027,
    cgpa: 8.9,
    skills: ['Java', 'Spring Boot', 'SQL', 'Git', 'REST API'],
    preferredLocations: ['Bengaluru', 'Pune', 'Hyderabad'],
    preferredJobTypes: ['Full Time', 'Internship'],
    bio: 'Computer Science student passionate about backend development and scalable web applications. Interested in Java, Spring Boot and database-driven applications.',
  },
  {
    name: 'Simran Kaur',
    email: 'simrankaur02@gmail.com',
    password: 'Simran@123',
    phone: '+91 98765 41022',
    college: 'Thapar Institute of Engineering and Technology',
    branch: 'Computer Science and Engineering',
    graduationYear: 2027,
    cgpa: 9.1,
    skills: ['Python', 'Django', 'React', 'PostgreSQL', 'REST API'],
    preferredLocations: ['Chandigarh', 'Delhi', 'Bengaluru'],
    preferredJobTypes: ['Full Time', 'Internship'],
    bio: 'Full-stack development enthusiast with a strong interest in Python and modern web technologies. Enjoys building responsive applications and working with databases.',
  },
  {
    name: 'Dev Patel',
    email: 'devpatel03@gmail.com',
    password: 'Dev@123',
    phone: '+91 98765 41023',
    college: 'Nirma University',
    branch: 'Information Technology',
    graduationYear: 2026,
    cgpa: 8.3,
    skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'Express.js'],
    preferredLocations: ['Ahmedabad', 'Pune', 'Bengaluru'],
    preferredJobTypes: ['Full Time', 'Contract'],
    bio: 'IT graduate focused on full-stack JavaScript development. Experienced in creating web applications using React, Node.js, Express and MongoDB.',
  },
  {
    name: 'Riya Sharma',
    email: 'riyasharma04@gmail.com',
    password: 'Riya@123',
    phone: '+91 98765 41024',
    college: 'BITS Pilani',
    branch: 'Computer Science and Engineering',
    graduationYear: 2027,
    cgpa: 9.4,
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Pandas'],
    preferredLocations: ['Hyderabad', 'Bengaluru', 'Pune'],
    preferredJobTypes: ['Full Time', 'Internship'],
    bio: 'Computer Science student interested in artificial intelligence and machine learning. Passionate about building data-driven solutions using Python and modern ML frameworks.',
  },
  {
    name: 'Omkar Jadhav',
    email: 'omkarjadhav05@gmail.com',
    password: 'Omkar@123',
    phone: '+91 98765 41025',
    college: 'PCCOE Pune',
    branch: 'Electronics and Telecommunication Engineering',
    graduationYear: 2026,
    cgpa: 8.1,
    skills: ['C++', 'Embedded C', 'IoT', 'Arduino', 'Microcontrollers'],
    preferredLocations: ['Pune', 'Mumbai', 'Bengaluru'],
    preferredJobTypes: ['Full Time', 'Internship'],
    bio: 'Electronics and telecommunication graduate interested in embedded systems and IoT. Enjoys developing hardware-software solutions using C++ and microcontrollers.',
  },
  {
    name: 'Nandini Rao',
    email: 'nandini.rao06@gmail.com',
    password: 'Nandini@123',
    phone: '+91 98765 41026',
    college: 'IIIT Bangalore',
    branch: 'Computer Science and Engineering',
    graduationYear: 2027,
    cgpa: 9.0,
    skills: ['C++', 'Data Structures', 'Algorithms', 'Python', 'System Design'],
    preferredLocations: ['Bengaluru', 'Hyderabad', 'Pune'],
    preferredJobTypes: ['Full Time', 'Internship'],
    bio: 'Computer Science student with a strong foundation in algorithms and problem solving. Interested in software engineering, scalable systems and system design.',
  },
  {
    name: 'Harsh Vora',
    email: 'harshvora07@gmail.com',
    password: 'Harsh@123',
    phone: '+91 98765 41027',
    college: 'DAIICT',
    branch: 'Information Technology',
    graduationYear: 2026,
    cgpa: 8.7,
    skills: ['Java', 'AWS', 'Docker', 'Kubernetes', 'Spring Boot'],
    preferredLocations: ['Bengaluru', 'Pune', 'Hyderabad'],
    preferredJobTypes: ['Full Time'],
    bio: 'IT graduate interested in cloud computing and backend engineering. Familiar with Java, Spring Boot and containerized application deployment.',
  },
  {
    name: 'Aditi Joshi',
    email: 'aditijoshi08@gmail.com',
    password: 'Aditi@123',
    phone: '+91 98765 41028',
    college: 'VJTI Mumbai',
    branch: 'Electronics Engineering',
    graduationYear: 2027,
    cgpa: 8.6,
    skills: ['Python', 'MATLAB', 'Embedded C', 'IoT', 'Electronics'],
    preferredLocations: ['Mumbai', 'Pune', 'Bengaluru'],
    preferredJobTypes: ['Full Time', 'Internship'],
    bio: 'Electronics student interested in embedded technology and IoT applications. Enjoys combining programming with electronics to build practical solutions.',
  },
  {
    name: 'Siddhant Jain',
    email: 'siddhantjain09@gmail.com',
    password: 'Siddhant@123',
    phone: '+91 98765 41029',
    college: 'Manipal Institute of Technology',
    branch: 'Computer Science and Engineering',
    graduationYear: 2026,
    cgpa: 8.8,
    skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Express.js'],
    preferredLocations: ['Bengaluru', 'Pune', 'Hyderabad'],
    preferredJobTypes: ['Full Time', 'Contract'],
    bio: 'Full-stack developer focused on modern JavaScript and TypeScript applications. Interested in building scalable and user-friendly web platforms.',
  },
  {
    name: 'Kavya Nair',
    email: 'kavyanair10@gmail.com',
    password: 'Kavya@123',
    phone: '+91 98765 41030',
    college: 'Christ University',
    branch: 'Data Science',
    graduationYear: 2027,
    cgpa: 9.2,
    skills: ['Python', 'Pandas', 'SQL', 'Power BI', 'Data Analysis'],
    preferredLocations: ['Bengaluru', 'Hyderabad', 'Pune'],
    preferredJobTypes: ['Full Time', 'Internship'],
    bio: 'Data Science student passionate about data analysis and visualization. Interested in turning complex datasets into useful business insights.',
  },
];

const recruitersData = [
  {
    name: 'Vikram Mehta',
    email: 'vikrammehta01@gmail.com',
    password: 'Vikram@123',
    companyName: 'CodeCraft Technologies',
    location: 'Bengaluru',
    position: 'HR Manager',
    jobs: [
      {
        title: 'Software Engineer',
        description: 'We are looking for a Software Engineer to join our backend team.',
        jobType: 'Full Time',
        experience: 'Fresher',
        salary: '₹8-12 LPA',
        requiredSkills: ['Java', 'Spring Boot', 'SQL', 'REST API'],
        eligibility: { minCgpa: 8.0, branches: ['Computer Science and Engineering', 'Information Technology'], batch: [2026, 2027] },
      },
      {
        title: 'Frontend Developer',
        description: 'Looking for a creative frontend developer to build responsive UI.',
        jobType: 'Full Time',
        experience: 'Fresher',
        salary: '₹7-10 LPA',
        requiredSkills: ['React', 'JavaScript', 'HTML', 'CSS'],
        eligibility: { minCgpa: 7.5, branches: [], batch: [2026, 2027] },
      }
    ]
  },
  {
    name: 'Shreya Kapoor',
    email: 'shreyakapoor02@gmail.com',
    password: 'Shreya@123',
    companyName: 'Finova Systems',
    location: 'Mumbai',
    position: 'Talent Acquisition',
    jobs: [
      {
        title: 'Java Backend Developer',
        description: 'Join our fintech backend team and scale financial solutions.',
        jobType: 'Full Time',
        experience: '1-2 Years',
        salary: '₹12-16 LPA',
        requiredSkills: ['Java', 'Spring Boot', 'SQL', 'Microservices'],
        eligibility: { minCgpa: 8.5, branches: ['Computer Science and Engineering'], batch: [2026] },
      },
      {
        title: 'Full Stack Developer',
        description: 'Build end to end solutions using Python and React.',
        jobType: 'Full Time',
        experience: 'Fresher',
        salary: '₹10-14 LPA',
        requiredSkills: ['Python', 'Django', 'React', 'PostgreSQL'],
        eligibility: { minCgpa: 8.0, branches: ['Computer Science and Engineering'], batch: [2027] },
      }
    ]
  },
  {
    name: 'Manish Agarwal',
    email: 'manishagarwal03@gmail.com',
    password: 'Manish@123',
    companyName: 'TechOrbit Solutions',
    location: 'Pune',
    position: 'Technical Recruiter',
    jobs: [
      {
        title: 'Cloud Engineer',
        description: 'Design and deploy scalable cloud infrastructure.',
        jobType: 'Full Time',
        experience: 'Fresher',
        salary: '₹10-15 LPA',
        requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'Linux'],
        eligibility: { minCgpa: 8.0, branches: ['Information Technology', 'Computer Science and Engineering'], batch: [2026] },
      },
      {
        title: 'DevOps Engineer',
        description: 'Looking for a DevOps engineer to manage CI/CD pipelines.',
        jobType: 'Full Time',
        experience: '1-2 Years',
        salary: '₹14-18 LPA',
        requiredSkills: ['AWS', 'CI/CD', 'Git', 'Docker'],
        eligibility: { minCgpa: 7.0, branches: [], batch: [2026] },
      }
    ]
  },
  {
    name: 'Priti Shah',
    email: 'pritishah04@gmail.com',
    password: 'Priti@123',
    companyName: 'InsightData Labs',
    location: 'Hyderabad',
    position: 'HR Manager',
    jobs: [
      {
        title: 'Data Analyst',
        description: 'Analyze complex datasets and generate business insights.',
        jobType: 'Internship',
        experience: 'Fresher',
        salary: '₹30,000/month',
        requiredSkills: ['Python', 'Pandas', 'SQL', 'Data Analysis'],
        eligibility: { minCgpa: 8.0, branches: ['Data Science', 'Computer Science and Engineering'], batch: [2027] },
      },
      {
        title: 'Machine Learning Engineer',
        description: 'Build predictive models and scalable ML infrastructure.',
        jobType: 'Full Time',
        experience: 'Fresher',
        salary: '₹12-20 LPA',
        requiredSkills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
        eligibility: { minCgpa: 8.5, branches: ['Computer Science and Engineering', 'Artificial Intelligence'], batch: [2027] },
      }
    ]
  },
  {
    name: 'Rajiv Menon',
    email: 'rajivmenon05@gmail.com',
    password: 'Rajiv@123',
    companyName: 'AppVertex Technologies',
    location: 'Bengaluru',
    position: 'Talent Acquisition',
    jobs: [
      {
        title: 'Backend Engineer',
        description: 'Build robust and scalable APIs using Node.js.',
        jobType: 'Full Time',
        experience: 'Fresher',
        salary: '₹10-14 LPA',
        requiredSkills: ['Node.js', 'Express.js', 'MongoDB', 'REST API'],
        eligibility: { minCgpa: 7.5, branches: ['Information Technology', 'Computer Science and Engineering'], batch: [2026, 2027] },
      },
      {
        title: 'Software Development Engineer',
        description: 'Core SDE role involving Data Structures and System Design.',
        jobType: 'Full Time',
        experience: 'Fresher',
        salary: '₹15-22 LPA',
        requiredSkills: ['C++', 'Data Structures', 'Algorithms', 'System Design'],
        eligibility: { minCgpa: 8.5, branches: ['Computer Science and Engineering'], batch: [2026, 2027] },
      }
    ]
  },
  {
    name: 'Divya Iyer',
    email: 'divyaiyer06@gmail.com',
    password: 'Divya@123',
    companyName: 'RoboNext India',
    location: 'Chennai',
    position: 'HR Manager',
    jobs: [
      {
        title: 'IoT Engineer',
        description: 'Develop connected devices and IoT platforms.',
        jobType: 'Full Time',
        experience: 'Fresher',
        salary: '₹7-11 LPA',
        requiredSkills: ['IoT', 'Embedded C', 'C++', 'Arduino'],
        eligibility: { minCgpa: 7.5, branches: ['Electronics and Telecommunication Engineering', 'Electronics Engineering'], batch: [2026, 2027] },
      },
      {
        title: 'Embedded Software Engineer',
        description: 'Write firmware for next-generation microcontrollers.',
        jobType: 'Full Time',
        experience: 'Fresher',
        salary: '₹8-12 LPA',
        requiredSkills: ['Embedded C', 'C++', 'Microcontrollers', 'Electronics'],
        eligibility: { minCgpa: 8.0, branches: ['Electronics and Telecommunication Engineering', 'Electronics Engineering'], batch: [2026, 2027] },
      }
    ]
  },
  {
    name: 'Saurabh Gupta',
    email: 'saurabhgupta07@gmail.com',
    password: 'Saurabh@123',
    companyName: 'SoftGrid Solutions',
    location: 'Noida',
    position: 'Technical Recruiter',
    jobs: [
      {
        title: 'React Developer',
        description: 'Seeking a specialized React developer for modern web apps.',
        jobType: 'Full Time',
        experience: '1-2 Years',
        salary: '₹10-15 LPA',
        requiredSkills: ['React', 'JavaScript', 'TypeScript', 'Redux'],
        eligibility: { minCgpa: 7.0, branches: [], batch: [2026] },
      },
      {
        title: 'Node.js Developer',
        description: 'Seeking a specialized Node.js developer for scalable backends.',
        jobType: 'Full Time',
        experience: 'Fresher',
        salary: '₹8-12 LPA',
        requiredSkills: ['Node.js', 'Express.js', 'MongoDB', 'JavaScript'],
        eligibility: { minCgpa: 7.5, branches: ['Information Technology', 'Computer Science and Engineering'], batch: [2026, 2027] },
      }
    ]
  },
  {
    name: 'Anjali Deshmukh',
    email: 'anjalideshmukh08@gmail.com',
    password: 'Anjali@123',
    companyName: 'WebNova Technologies',
    location: 'Pune',
    position: 'HR Manager',
    jobs: [
      {
        title: 'UI Engineer',
        description: 'Design and build intuitive user interfaces.',
        jobType: 'Contract',
        experience: '0-1 Years',
        salary: '₹5-8 LPA',
        requiredSkills: ['React', 'HTML', 'CSS', 'JavaScript'],
        eligibility: { minCgpa: 0, branches: [], batch: [2026, 2027] },
      },
      {
        title: 'Full Stack Engineer',
        description: 'Develop full stack applications using React and Node.js.',
        jobType: 'Full Time',
        experience: 'Fresher',
        salary: '₹9-14 LPA',
        requiredSkills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
        eligibility: { minCgpa: 8.0, branches: ['Computer Science and Engineering', 'Information Technology'], batch: [2026] },
      }
    ]
  },
  {
    name: 'Deepak Sethi',
    email: 'deepaksethi09@gmail.com',
    password: 'Deepak@123',
    companyName: 'CyberShield India',
    location: 'Gurugram',
    position: 'Talent Acquisition',
    jobs: [
      {
        title: 'Cyber Security Analyst',
        description: 'Analyze network security and protect infrastructure.',
        jobType: 'Full Time',
        experience: 'Fresher',
        salary: '₹10-16 LPA',
        requiredSkills: ['Python', 'Networking', 'Linux', 'Security'],
        eligibility: { minCgpa: 8.0, branches: ['Information Technology', 'Computer Science and Engineering'], batch: [2026, 2027] },
      },
      {
        title: 'Security Engineer',
        description: 'Build secure systems and perform vulnerability assessments.',
        jobType: 'Full Time',
        experience: '1-2 Years',
        salary: '₹14-20 LPA',
        requiredSkills: ['C++', 'Python', 'Cryptography', 'Linux'],
        eligibility: { minCgpa: 8.5, branches: ['Computer Science and Engineering'], batch: [2026] },
      }
    ]
  },
  {
    name: 'Monica Fernandes',
    email: 'monicafernandes10@gmail.com',
    password: 'Monica@123',
    companyName: 'NeuralWorks AI',
    location: 'Bengaluru',
    position: 'Technical Recruiter',
    jobs: [
      {
        title: 'AI Engineer',
        description: 'Develop state of the art AI models and LLMs.',
        jobType: 'Full Time',
        experience: 'Fresher',
        salary: '₹16-24 LPA',
        requiredSkills: ['Python', 'TensorFlow', 'Machine Learning', 'Deep Learning'],
        eligibility: { minCgpa: 9.0, branches: ['Computer Science and Engineering', 'Data Science', 'Artificial Intelligence'], batch: [2027] },
      },
      {
        title: 'Data Science Associate',
        description: 'Analyze data and build predictive models.',
        jobType: 'Full Time',
        experience: 'Fresher',
        salary: '₹10-15 LPA',
        requiredSkills: ['Python', 'Pandas', 'SQL', 'Machine Learning', 'Statistics'],
        eligibility: { minCgpa: 8.5, branches: ['Data Science', 'Computer Science and Engineering'], batch: [2027] },
      }
    ]
  }
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

const runSeed = async () => {
  await connectDB();
  console.log('--- STARTING DEMO DATA SEED ---');
  
  // 1. Create/Update Students
  const createdStudents = [];
  for (const s of studentsData) {
    let user = await User.findOne({ email: s.email });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(s.password, salt);
      user = await User.create({
        name: s.name,
        email: s.email,
        password: hashedPassword,
        role: 'student',
      });
    } else {
      user.name = s.name;
      await user.save();
    }
    
    let profile = await StudentProfile.findOne({ userId: user._id });
    const cSkills = await canonicalizeSkills(s.skills);
    
    if (!profile) {
      profile = await StudentProfile.create({
        userId: user._id,
        phone: s.phone,
        college: s.college,
        branch: s.branch,
        graduationYear: s.graduationYear,
        cgpa: s.cgpa,
        skills: cSkills,
        preferredLocations: s.preferredLocations,
        preferredJobTypes: s.preferredJobTypes,
        bio: s.bio,
        profileCompletion: 100
      });
    } else {
      profile.phone = s.phone;
      profile.college = s.college;
      profile.branch = s.branch;
      profile.graduationYear = s.graduationYear;
      profile.cgpa = s.cgpa;
      profile.skills = cSkills;
      profile.preferredLocations = s.preferredLocations;
      profile.preferredJobTypes = s.preferredJobTypes;
      profile.bio = s.bio;
      profile.profileCompletion = 100;
      await profile.save();
    }
    
    createdStudents.push({ user, profile });
  }
  console.log(`Upserted ${createdStudents.length} Students.`);

  // 2. Create/Update Recruiters and Jobs
  const createdRecruiters = [];
  const createdJobs = [];
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

  for (const r of recruitersData) {
    let user = await User.findOne({ email: r.email });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(r.password, salt);
      user = await User.create({
        name: r.name,
        email: r.email,
        password: hashedPassword,
        role: 'recruiter',
      });
    } else {
      user.name = r.name;
      await user.save();
    }
    
    let recruiterProfile = await RecruiterProfile.findOne({ userId: user._id });
    if (!recruiterProfile) {
      recruiterProfile = await RecruiterProfile.create({
        userId: user._id,
        companyName: r.companyName,
        location: r.location
      });
    } else {
      recruiterProfile.companyName = r.companyName;
      recruiterProfile.location = r.location;
      await recruiterProfile.save();
    }
    
    createdRecruiters.push({ user, recruiterProfile });
    
    // Jobs
    for (const j of r.jobs) {
      let job = await Job.findOne({ recruiterId: user._id, title: j.title });
      const cSkills = await canonicalizeSkills(j.requiredSkills);
      if (!job) {
        job = await Job.create({
          recruiterId: user._id,
          companyName: r.companyName,
          title: j.title,
          description: j.description,
          location: r.location,
          jobType: j.jobType,
          experience: j.experience,
          salary: j.salary,
          requiredSkills: cSkills,
          eligibility: j.eligibility,
          applicationDeadline: oneMonthFromNow,
          status: 'open',
        });
      } else {
        job.requiredSkills = cSkills;
        job.description = j.description;
        job.eligibility = j.eligibility;
        await job.save();
      }
      createdJobs.push(job);
    }
  }
  console.log(`Upserted ${createdRecruiters.length} Recruiters and ${createdJobs.length} Jobs.`);

  // Clear previous applications, interviews, notifications, and saved jobs for these users to prevent duplicates during testing
  const allStudentIds = createdStudents.map(s => s.user._id);
  const allJobIds = createdJobs.map(j => j._id);
  await Application.deleteMany({ studentId: { $in: allStudentIds } });
  await Interview.deleteMany({ candidateId: { $in: allStudentIds } });
  await Notification.deleteMany({ userId: { $in: [...allStudentIds, ...createdRecruiters.map(r => r.user._id)] } });
  await SavedJob.deleteMany({ studentId: { $in: allStudentIds } });

  console.log(`Cleared previous applications, interviews, notifications, and saved jobs for these users.`);

  // 3. Applications
  // We need exactly 5 applications per job. Total 100 applications.
  // Distributed realistically based on skills.
  const appStatuses = ['Applied', 'Applied', 'Applied', 'Applied', 'Applied', 'Applied', 'Applied', 'Shortlisted', 'Shortlisted', 'Shortlisted', 'Shortlisted', 'Interview', 'Interview', 'Interview', 'Selected', 'Selected', 'Rejected', 'Rejected', 'Rejected', 'Rejected'];
  let totalApps = 0;
  
  const createdApplications = [];

  for (const job of createdJobs) {
    // Score students for this job
    const scoredStudents = createdStudents.map(s => {
      const studentSkillsLower = s.profile.skills.map(skill => String(skill).toLowerCase());
      let score = 0;
      job.requiredSkills.forEach(rs => {
        if (studentSkillsLower.includes(String(rs).toLowerCase())) score += 10;
      });
      // Branch check
      if (job.eligibility.branches.length > 0 && job.eligibility.branches.includes(s.profile.branch)) score += 5;
      // CGPA
      if (job.eligibility.minCgpa && s.profile.cgpa >= job.eligibility.minCgpa) score += 5;
      
      // Randomize slightly for varied distribution
      score += Math.random() * 5;
      return { student: s, score };
    });
    
    // Sort by score descending and take top 5
    scoredStudents.sort((a, b) => b.score - a.score);
    const top5 = scoredStudents.slice(0, 5);
    
    for (const item of top5) {
      // Pick a random status ensuring overall distribution approx matches
      const statusIdx = Math.floor(Math.random() * appStatuses.length);
      const status = appStatuses[statusIdx];
      
      const app = await Application.create({
        studentId: item.student.user._id,
        jobId: job._id,
        recruiterId: job.recruiterId,
        status: status,
      });
      
      createdApplications.push({ app, student: item.student, job });
      totalApps++;
      
      // If status involves recruiter action, notify student
      if (status !== 'Applied') {
        let msg = '';
        if (status === 'Shortlisted') msg = `Your application for ${job.title} at ${job.companyName} has been shortlisted!`;
        else if (status === 'Interview') msg = `You have been selected for an interview for ${job.title} at ${job.companyName}.`;
        else if (status === 'Selected') msg = `Congratulations! You have been selected for ${job.title} at ${job.companyName}.`;
        else if (status === 'Rejected') msg = `Update on your application for ${job.title} at ${job.companyName}.`;
        
        await Notification.create({
          userId: item.student.user._id,
          title: `Application ${status}`,
          message: msg,
          type: 'application',
          relatedId: app._id,
          read: false
        });
      } else {
        // notify recruiter
        await Notification.create({
          userId: job.recruiterId,
          title: `New Application`,
          message: `${item.student.user.name} applied for ${job.title}`,
          type: 'application',
          relatedId: app._id,
          read: false
        });
      }
    }
  }
  console.log(`Created ${totalApps} applications (exactly 5 per job).`);

  // 4. Interviews
  let interviewCount = 0;
  for (const item of createdApplications) {
    if (item.app.status === 'Interview' || item.app.status === 'Selected') {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + Math.floor(Math.random() * 10) + 1);
      
      const isOnline = Math.random() > 0.5;
      
      const interview = await Interview.create({
        recruiterId: item.job.recruiterId,
        studentId: item.student.user._id,
        jobId: item.job._id,
        applicationId: item.app._id,
        status: item.app.status === 'Selected' ? 'Completed' : 'Scheduled',
        scheduledDate: scheduledDate,
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        interviewerName: 'Tech Lead',
        interviewerEmail: 'techlead@' + item.job.companyName.toLowerCase().replace(/\s/g, '') + '.com',
        interviewType: isOnline ? 'online' : 'offline',
        meetingLink: isOnline ? 'https://meet.google.com/abc-defg-hij' : undefined,
        location: !isOnline ? item.job.location + ' Office' : undefined,
        instructions: 'Please be prepared to discuss your projects.',
        createdBy: item.job.recruiterId,
      });
      interviewCount++;
      
      // Notify student of interview
      if (item.app.status === 'Interview') {
        await Notification.create({
          userId: item.student.user._id,
          title: `Interview Scheduled`,
          message: `An interview has been scheduled for ${item.job.title} at ${item.job.companyName}.`,
          type: 'interview',
          relatedId: interview._id,
          read: false
        });
      }
    }
  }
  console.log(`Created ${interviewCount} interviews.`);

  // 5. Saved Jobs
  let savedCount = 0;
  for (const s of createdStudents) {
    // Save 2 random jobs per student
    const randJobs = [...createdJobs].sort(() => 0.5 - Math.random()).slice(0, 2);
    for (const rj of randJobs) {
      await SavedJob.create({
        studentId: s.user._id,
        jobId: rj._id
      });
      savedCount++;
    }
  }
  console.log(`Created ${savedCount} saved jobs.`);
  
  // Verification
  console.log('\n--- VERIFICATION ---');
  const numStudents = await User.countDocuments({ role: 'student', email: { $in: studentsData.map(s => s.email) } });
  const numRecruiters = await User.countDocuments({ role: 'recruiter', email: { $in: recruitersData.map(r => r.email) } });
  const numJobs = await Job.countDocuments({ _id: { $in: allJobIds } });
  const numApps = await Application.countDocuments({ jobId: { $in: allJobIds } });
  const numInts = await Interview.countDocuments({ jobId: { $in: allJobIds } });
  const numNotifs = await Notification.countDocuments({ userId: { $in: [...allStudentIds, ...createdRecruiters.map(r => r.user._id)] } });
  
  const statusCounts = await Application.aggregate([
    { $match: { jobId: { $in: allJobIds } } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  console.log(`Students: ${numStudents}`);
  console.log(`Recruiters: ${numRecruiters}`);
  console.log(`Jobs: ${numJobs}`);
  console.log(`Applications: ${numApps}`);
  console.log(`Interviews: ${numInts}`);
  console.log(`Notifications: ${numNotifs}`);
  console.log(`Saved Jobs: ${savedCount}`);
  
  console.log('\nStatus Distribution:');
  statusCounts.forEach(s => console.log(`${s._id}: ${s.count}`));
  
  console.log('\nJOB | RECRUITER | APPLICATION COUNT');
  for (const job of createdJobs) {
    const count = await Application.countDocuments({ jobId: job._id });
    console.log(`${job.title.padEnd(25)} | ${job.companyName.padEnd(25)} | ${count}`);
  }

  process.exit(0);
};

runSeed();
