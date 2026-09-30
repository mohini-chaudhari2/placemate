require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Job = require('../models/Job');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');

// Mock request and response to test the controller logic directly
const { getJobMatch } = require('../controllers/jobController');

const testMatch = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected for match testing...');

  const demoEmails = [
    'yasthakur01@gmail.com', 'simrankaur02@gmail.com', 'devpatel03@gmail.com',
    'riyasharma04@gmail.com', 'omkarjadhav05@gmail.com', 'nandini.rao06@gmail.com',
    'harshvora07@gmail.com', 'aditijoshi08@gmail.com', 'siddhantjain09@gmail.com',
    'kavyanair10@gmail.com'
  ];
  const students = await User.find({ role: 'student', email: { $in: demoEmails } }).limit(5);
  const jobs = await Job.find({ companyName: 'CodeCraft Technologies' }).limit(2);

  let matchTests = 0;
  for (const student of students) {
    const profile = await StudentProfile.findOne({ userId: student._id });
    if (!profile) continue;

    for (const job of jobs) {
      if (matchTests >= 10) break;

      // Create a mock req and res
      const req = {
        user: { id: student._id },
        params: { id: job._id.toString() }
      };

      let responseData = null;
      const res = {
        json: (data) => { responseData = data; },
        status: () => res
      };

      await getJobMatch(req, res);

      console.log(`\nTest #${matchTests + 1}`);
      console.log(`Student: ${student.name}`);
      console.log(`Job: ${job.title} at ${job.companyName}`);
      console.log(`Student Skills: ${profile.skills.join(', ')}`);
      console.log(`Job Required Skills: ${job.requiredSkills.join(', ')}`);
      console.log(`Match Percentage: ${responseData.matchPercentage}%`);
      console.log(`Missing Skills: ${responseData.missingSkills.join(', ')}`);

      matchTests++;
    }
  }

  process.exit(0);
};

testMatch();
