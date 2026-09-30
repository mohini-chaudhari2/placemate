require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const Job = require('../models/Job');

const studentsData = [
  { name: 'Aarav Sharma', email: 'student01@placemate.com', phone: '9876500001', college: 'VJTI Mumbai', degree: 'B.Tech', branch: 'Computer Science', graduationYear: 2027, cgpa: 8.7, skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Git'], location: 'Mumbai, Maharashtra' },
  { name: 'Ananya Patil', email: 'student02@placemate.com', phone: '9876500002', college: 'College of Engineering Pune', degree: 'B.Tech', branch: 'Information Technology', graduationYear: 2027, cgpa: 9.1, skills: ['Java', 'Spring Boot', 'SQL', 'React', 'Git'], location: 'Pune, Maharashtra' },
  { name: 'Rohan Deshmukh', email: 'student03@placemate.com', phone: '9876500003', college: 'VIT Pune', degree: 'B.Tech', branch: 'Computer Science', graduationYear: 2026, cgpa: 8.4, skills: ['Python', 'Django', 'PostgreSQL', 'REST API', 'Docker'], location: 'Pune, Maharashtra' },
  { name: 'Isha Kulkarni', email: 'student04@placemate.com', phone: '9876500004', college: 'MIT World Peace University', degree: 'B.Tech', branch: 'Artificial Intelligence', graduationYear: 2027, cgpa: 9.0, skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Data Analysis'], location: 'Pune, Maharashtra' },
  { name: 'Vihaan Joshi', email: 'student05@placemate.com', phone: '9876500005', college: 'NIT Nagpur', degree: 'B.Tech', branch: 'Electronics and Telecommunication', graduationYear: 2026, cgpa: 8.2, skills: ['C++', 'Python', 'Embedded Systems', 'IoT', 'Git'], location: 'Nagpur, Maharashtra' },
  { name: 'Meera Singh', email: 'student06@placemate.com', phone: '9876500006', college: 'IIIT Hyderabad', degree: 'B.Tech', branch: 'Computer Science', graduationYear: 2027, cgpa: 9.3, skills: ['C++', 'Algorithms', 'Python', 'React', 'System Design'], location: 'Hyderabad, Telangana' },
  { name: 'Aditya Verma', email: 'student07@placemate.com', phone: '9876500007', college: 'Manipal Institute of Technology', degree: 'B.Tech', branch: 'Information Technology', graduationYear: 2026, cgpa: 8.6, skills: ['Java', 'AWS', 'Docker', 'Kubernetes', 'Spring Boot'], location: 'Bengaluru, Karnataka' },
  { name: 'Sneha More', email: 'student08@placemate.com', phone: '9876500008', college: 'COEP Technological University', degree: 'B.Tech', branch: 'Electronics', graduationYear: 2027, cgpa: 8.8, skills: ['Python', 'MATLAB', 'Embedded C', 'IoT', 'C++'], location: 'Pune, Maharashtra' },
  { name: 'Karan Mehta', email: 'student09@placemate.com', phone: '9876500009', college: 'SRM Institute of Science and Technology', degree: 'B.Tech', branch: 'Computer Science', graduationYear: 2026, cgpa: 8.5, skills: ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript'], location: 'Chennai, Tamil Nadu' },
  { name: 'Pooja Nair', email: 'student10@placemate.com', phone: '9876500010', college: 'Amrita Vishwa Vidyapeetham', degree: 'B.Tech', branch: 'Data Science', graduationYear: 2027, cgpa: 9.2, skills: ['Python', 'Pandas', 'SQL', 'Machine Learning', 'Power BI'], location: 'Bengaluru, Karnataka' }
];

const recruitersData = [
  { name: 'Rahul Kapoor', email: 'recruiter01@placemate.com', companyName: 'TechNova Solutions', phone: '9876510001', location: 'Bengaluru, Karnataka' },
  { name: 'Neha Shah', email: 'recruiter02@placemate.com', companyName: 'FinEdge Technologies', phone: '9876510002', location: 'Mumbai, Maharashtra' },
  { name: 'Arjun Malhotra', email: 'recruiter03@placemate.com', companyName: 'CloudSphere India', phone: '9876510003', location: 'Pune, Maharashtra' },
  { name: 'Kavya Reddy', email: 'recruiter04@placemate.com', companyName: 'DataBridge Analytics', phone: '9876510004', location: 'Hyderabad, Telangana' },
  { name: 'Siddharth Rao', email: 'recruiter05@placemate.com', companyName: 'Innovent Labs', phone: '9876510005', location: 'Bengaluru, Karnataka' },
  { name: 'Priya Menon', email: 'recruiter06@placemate.com', companyName: 'GreenByte Technologies', phone: '9876510006', location: 'Chennai, Tamil Nadu' },
  { name: 'Amit Bansal', email: 'recruiter07@placemate.com', companyName: 'NextGen Software', phone: '9876510007', location: 'Noida, Uttar Pradesh' },
  { name: 'Riya Desai', email: 'recruiter08@placemate.com', companyName: 'PixelStack Systems', phone: '9876510008', location: 'Pune, Maharashtra' },
  { name: 'Nikhil Gupta', email: 'recruiter09@placemate.com', companyName: 'SecureNet Technologies', phone: '9876510009', location: 'Gurugram, Haryana' },
  { name: 'Tanvi Iyer', email: 'recruiter10@placemate.com', companyName: 'AIWorks India', phone: '9876510010', location: 'Bengaluru, Karnataka' }
];

const jobsData = [
  { companyName: 'TechNova Solutions', title: 'Software Engineer', location: 'Bengaluru', jobType: 'Full Time', experience: '0-2 years', salary: '₹8-12 LPA', requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB'], minCgpa: 7.5, branches: ['Computer Science', 'Information Technology'] },
  { companyName: 'TechNova Solutions', title: 'Frontend Developer', location: 'Bengaluru', jobType: 'Full Time', experience: '0-1 years', salary: '₹6-10 LPA', requiredSkills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'], minCgpa: 7.0 },
  { companyName: 'FinEdge Technologies', title: 'Java Backend Developer', location: 'Mumbai', jobType: 'Full Time', experience: '0-2 years', salary: '₹7-11 LPA', requiredSkills: ['Java', 'Spring Boot', 'SQL', 'REST API'], minCgpa: 7.5 },
  { companyName: 'FinEdge Technologies', title: 'Full Stack Developer', location: 'Mumbai', jobType: 'Full Time', experience: '0-2 years', salary: '₹8-13 LPA', requiredSkills: ['React', 'Node.js', 'JavaScript', 'PostgreSQL'], minCgpa: 7.5 },
  { companyName: 'CloudSphere India', title: 'Cloud Engineer', location: 'Pune', jobType: 'Full Time', experience: '0-2 years', salary: '₹8-14 LPA', requiredSkills: ['AWS', 'Docker', 'Linux', 'Kubernetes'], minCgpa: 7.5 },
  { companyName: 'CloudSphere India', title: 'DevOps Engineer', location: 'Pune', jobType: 'Full Time', experience: '1-3 years', salary: '₹9-15 LPA', requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'], minCgpa: 7.5 },
  { companyName: 'DataBridge Analytics', title: 'Data Analyst', location: 'Hyderabad', jobType: 'Full Time', experience: '0-2 years', salary: '₹6-10 LPA', requiredSkills: ['Python', 'SQL', 'Pandas', 'Power BI'], minCgpa: 7.0 },
  { companyName: 'DataBridge Analytics', title: 'Machine Learning Engineer', location: 'Hyderabad', jobType: 'Full Time', experience: '0-2 years', salary: '₹8-14 LPA', requiredSkills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'], minCgpa: 7.5 },
  { companyName: 'Innovent Labs', title: 'Backend Engineer', location: 'Bengaluru', jobType: 'Full Time', experience: '0-2 years', salary: '₹7-12 LPA', requiredSkills: ['Python', 'Django', 'PostgreSQL', 'REST API'], minCgpa: 7.0 },
  { companyName: 'Innovent Labs', title: 'Software Development Engineer', location: 'Bengaluru', jobType: 'Full Time', experience: '0-2 years', salary: '₹8-13 LPA', requiredSkills: ['C++', 'Algorithms', 'Data Structures', 'Git'], minCgpa: 7.5 },
  { companyName: 'GreenByte Technologies', title: 'IoT Engineer', location: 'Chennai', jobType: 'Full Time', experience: '0-2 years', salary: '₹6-10 LPA', requiredSkills: ['C++', 'Embedded C', 'IoT', 'Python'], minCgpa: 7.0 },
  { companyName: 'GreenByte Technologies', title: 'Embedded Software Engineer', location: 'Chennai', jobType: 'Full Time', experience: '0-2 years', salary: '₹6-11 LPA', requiredSkills: ['Embedded C', 'C++', 'Microcontrollers', 'IoT'], minCgpa: 7.0 },
  { companyName: 'NextGen Software', title: 'React Developer', location: 'Noida', jobType: 'Full Time', experience: '0-2 years', salary: '₹7-11 LPA', requiredSkills: ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS'], minCgpa: 7.0 },
  { companyName: 'NextGen Software', title: 'Node.js Developer', location: 'Noida', jobType: 'Full Time', experience: '0-2 years', salary: '₹7-12 LPA', requiredSkills: ['Node.js', 'Express', 'MongoDB', 'REST API'], minCgpa: 7.0 },
  { companyName: 'PixelStack Systems', title: 'UI Engineer', location: 'Pune', jobType: 'Full Time', experience: '0-2 years', salary: '₹6-10 LPA', requiredSkills: ['React', 'JavaScript', 'CSS', 'Figma'], minCgpa: 7.0 },
  { companyName: 'PixelStack Systems', title: 'Full Stack Engineer', location: 'Pune', jobType: 'Full Time', experience: '0-2 years', salary: '₹8-13 LPA', requiredSkills: ['React', 'Node.js', 'Express', 'MongoDB'], minCgpa: 7.5 },
  { companyName: 'SecureNet Technologies', title: 'Cyber Security Analyst', location: 'Gurugram', jobType: 'Full Time', experience: '0-2 years', salary: '₹7-12 LPA', requiredSkills: ['Cyber Security', 'Linux', 'Networking', 'Python'], minCgpa: 7.5 },
  { companyName: 'SecureNet Technologies', title: 'Security Engineer', location: 'Gurugram', jobType: 'Full Time', experience: '1-3 years', salary: '₹9-15 LPA', requiredSkills: ['Network Security', 'Linux', 'Python', 'Cloud Security'], minCgpa: 7.5 },
  { companyName: 'AIWorks India', title: 'AI Engineer', location: 'Bengaluru', jobType: 'Full Time', experience: '0-2 years', salary: '₹9-16 LPA', requiredSkills: ['Python', 'Machine Learning', 'TensorFlow', 'Deep Learning'], minCgpa: 8.0 },
  { companyName: 'AIWorks India', title: 'Data Science Associate', location: 'Bengaluru', jobType: 'Full Time', experience: '0-2 years', salary: '₹7-13 LPA', requiredSkills: ['Python', 'Pandas', 'SQL', 'Machine Learning', 'Statistics'], minCgpa: 7.5 }
];

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    let studentsCreated = 0;
    let recruitersCreated = 0;
    let jobsCreated = 0;
    let skipped = 0;

    const studentSalt = await bcrypt.genSalt(10);
    const studentHashedPassword = await bcrypt.hash('Student@123', studentSalt);

    for (const student of studentsData) {
      const exists = await User.findOne({ email: student.email });
      if (!exists) {
        const user = await User.create({
          name: student.name,
          email: student.email,
          password: studentHashedPassword,
          role: 'student'
        });
        await StudentProfile.create({
          userId: user._id,
          phone: student.phone,
          college: student.college,
          branch: student.branch,
          graduationYear: student.graduationYear,
          cgpa: student.cgpa,
          skills: student.skills,
          preferredLocations: [student.location.split(',')[0]]
        });
        studentsCreated++;
      } else {
        skipped++;
      }
    }

    const recruiterSalt = await bcrypt.genSalt(10);
    const recruiterHashedPassword = await bcrypt.hash('Recruiter@123', recruiterSalt);

    const recruiterIdsMap = {};

    for (const recruiter of recruitersData) {
      let user = await User.findOne({ email: recruiter.email });
      if (!user) {
        user = await User.create({
          name: recruiter.name,
          email: recruiter.email,
          password: recruiterHashedPassword,
          role: 'recruiter'
        });
        await RecruiterProfile.create({
          userId: user._id,
          companyName: recruiter.companyName,
          location: recruiter.location,
          verified: true
        });
        recruitersCreated++;
      } else {
        skipped++;
      }
      recruiterIdsMap[recruiter.companyName] = user._id;
    }

    for (const job of jobsData) {
      const existingJob = await Job.findOne({ title: job.title, companyName: job.companyName });
      if (!existingJob) {
        await Job.create({
          recruiterId: recruiterIdsMap[job.companyName],
          companyName: job.companyName,
          title: job.title,
          description: `This is a great opportunity to work as a ${job.title} at ${job.companyName}.`,
          location: job.location,
          jobType: job.jobType,
          experience: job.experience,
          salary: job.salary,
          requiredSkills: job.requiredSkills,
          eligibility: {
            minCgpa: job.minCgpa,
            branches: job.branches || []
          },
          status: 'open',
          applicationDeadline: new Date(new Date().setMonth(new Date().getMonth() + 1))
        });
        jobsCreated++;
      } else {
        skipped++;
      }
    }

    console.log(`
========================================
PLACEMATE DEMO DATA
========================================
Students created: ${studentsCreated}
Recruiters created: ${recruitersCreated}
Jobs created: ${jobsCreated}
Duplicates skipped: ${skipped}

Student login:
student01@placemate.com
Password: Student@123

Recruiter login:
recruiter01@placemate.com
Password: Recruiter@123
========================================
`);
    
    console.log('All Student Emails:');
    studentsData.forEach(s => console.log(s.email));
    console.log('\nAll Recruiter Emails:');
    recruitersData.forEach(r => console.log(r.email));

    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seedData();
