require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');

async function seedDemoUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding demo users...');

    const studentEmail = 'student01@placemate.demo';
    const studentPassword = 'Student@123';
    
    let studentUser = await User.findOne({ email: studentEmail });
    if (studentUser) {
      const salt = await bcrypt.genSalt(10);
      studentUser.password = await bcrypt.hash(studentPassword, salt);
      studentUser.role = 'student';
      studentUser.name = 'Aarav Sharma';
      await studentUser.save();
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(studentPassword, salt);
      studentUser = await User.create({
        name: 'Aarav Sharma',
        email: studentEmail,
        password: hashedPassword,
        role: 'student'
      });
      await StudentProfile.create({
        userId: studentUser._id,
        college: 'VJTI Mumbai',
        branch: 'CSE',
        graduationYear: 2027,
        cgpa: 8.7,
        preferredLocations: ['Mumbai'],
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Git']
      });
    }

    const recruiterEmail = 'recruiter01@placemate.demo';
    const recruiterPassword = 'Recruiter@123';
    
    let recruiterUser = await User.findOne({ email: recruiterEmail });
    if (recruiterUser) {
      const salt = await bcrypt.genSalt(10);
      recruiterUser.password = await bcrypt.hash(recruiterPassword, salt);
      recruiterUser.role = 'recruiter';
      recruiterUser.name = 'Rahul Kapoor';
      await recruiterUser.save();
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(recruiterPassword, salt);
      recruiterUser = await User.create({
        name: 'Rahul Kapoor',
        email: recruiterEmail,
        password: hashedPassword,
        role: 'recruiter'
      });
      await RecruiterProfile.create({
        userId: recruiterUser._id,
        companyName: 'TechNova Solutions',
        location: 'Bengaluru'
      });
    }

    console.log('Successfully seeded demo users.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding demo users:', error);
    process.exit(1);
  }
}

seedDemoUsers();
