require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const { updateStudentProfile } = require('../controllers/studentController');

const testProfileUpdate = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected for profile testing...');

  const student = await User.findOne({ email: 'yasthakur01@gmail.com' });
  if (!student) {
    console.error('Yash not found!');
    process.exit(1);
  }

  // Create mock req and res
  const req = {
    user: { id: student._id },
    body: {
      fullName: 'Yash Thakur (Updated)',
      email: 'yasthakur01@gmail.com', // even if provided it shouldn't modify anything
      phone: '+91 12345 67890',
      college: 'IIT Indore',
      branch: 'B.Tech CSE',
      graduationYear: 2027,
      cgpa: 9.9,
      skills: ['Java', 'Spring Boot', 'SQL', 'Git', 'REST API', 'TestSkill'],
      resumeUrl: 'https://yash-resume.com',
      preferredLocations: ['Bengaluru', 'Pune', 'Hyderabad', 'TestCity'],
      preferredJobTypes: ['Full Time', 'Internship', 'TestType'],
      bio: 'Computer Science student passionate about backend development and scalable web applications. Interested in Java, Spring Boot and database-driven applications.'
    }
  };

  let responseData = null;
  const res = {
    json: (data) => { responseData = data; },
    status: () => res
  };

  await updateStudentProfile(req, res);

  console.log('Update Response:', responseData.message);

  // Verify in DB
  const updatedUser = await User.findById(student._id);
  const updatedProfile = await StudentProfile.findOne({ userId: student._id });

  console.log('--- DB Verification ---');
  console.log(`User Name: ${updatedUser.name}`);
  console.log(`User Email: ${updatedUser.email}`);
  console.log(`Profile Phone: ${updatedProfile.phone}`);
  console.log(`Profile CGPA: ${updatedProfile.cgpa}`);
  console.log(`Profile Skills: ${updatedProfile.skills.join(', ')}`);
  console.log(`Profile Locations: ${updatedProfile.preferredLocations.join(', ')}`);
  console.log(`Profile Bio: ${updatedProfile.bio}`);
  
  process.exit(0);
};

testProfileUpdate();
