require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('./models/Job');
const StudentProfile = require('./models/StudentProfile');
const { getStudentDashboard } = require('./controllers/studentController');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  try {
    const job = await Job.findOne();
    const profile = await StudentProfile.findOne({ skills: { $in: ['React'] } });
    console.log('Job skills:', job.requiredSkills);
    console.log('Profile skills:', profile.skills);
    
    const normalizeSkillKey = (skill) => {
      if (!skill) return '';
      return String(skill).trim().toLowerCase().replace(/[\.\-_]/g, '').replace(/\s+/g, '');
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
    
    const calculateSkillMatch = (studentSkills = [], requiredSkills = []) => {
      const validRequiredSkills = (requiredSkills || []).filter(Boolean);
      if (validRequiredSkills.length === 0) {
        return { percentage: 100, matchedSkills: [], missingSkills: [] };
      }
      const matchedSkills = [];
      const missingSkills = [];
      validRequiredSkills.forEach((reqSkill) => {
        const isMatched = (studentSkills || []).some((skill) => areSkillsEqual(skill, reqSkill));
        if (isMatched) {
          matchedSkills.push(reqSkill);
        } else {
          missingSkills.push(reqSkill);
        }
      });
      const percentage = Math.round((matchedSkills.length / validRequiredSkills.length) * 100);
      return { percentage, matchedSkills, missingSkills };
    };
    
    console.log(calculateSkillMatch(profile.skills, job.requiredSkills));
  } finally {
    process.exit(0);
  }
});
