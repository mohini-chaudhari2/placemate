const fs = require('fs');
const path = require('path');

const dirs = [
  'src/components/common',
  'src/components/layout',
  'src/pages/public',
  'src/pages/student',
  'src/pages/recruiter',
  'src/pages/admin',
  'src/context',
  'src/assets/css'
];

dirs.forEach(dir => fs.mkdirSync(path.join(__dirname, dir), { recursive: true }));

const components = [
  { path: 'src/components/common/Button.jsx', name: 'Button' },
  { path: 'src/components/common/Input.jsx', name: 'Input' },
  { path: 'src/components/common/Modal.jsx', name: 'Modal' },
  { path: 'src/components/common/JobCard.jsx', name: 'JobCard' },
  { path: 'src/components/common/JobFilters.jsx', name: 'JobFilters' },
  { path: 'src/components/common/StatusBadge.jsx', name: 'StatusBadge' },
  { path: 'src/components/common/LoadingSpinner.jsx', name: 'LoadingSpinner' },
  { path: 'src/components/common/EmptyState.jsx', name: 'EmptyState' },
  { path: 'src/components/common/ErrorMessage.jsx', name: 'ErrorMessage' },
  { path: 'src/components/common/NotificationBell.jsx', name: 'NotificationBell' },
  { path: 'src/components/layout/Navbar.jsx', name: 'Navbar' },
  { path: 'src/components/layout/Footer.jsx', name: 'Footer' },
  { path: 'src/components/layout/ProtectedRoute.jsx', name: 'ProtectedRoute' },
  { path: 'src/components/layout/RoleRoute.jsx', name: 'RoleRoute' }
];

const pages = [
  { path: 'src/pages/public/Home.jsx', name: 'Home' },
  { path: 'src/pages/public/About.jsx', name: 'About' },
  { path: 'src/pages/public/Login.jsx', name: 'Login' },
  { path: 'src/pages/public/Register.jsx', name: 'Register' },
  { path: 'src/pages/public/Jobs.jsx', name: 'Jobs' },
  { path: 'src/pages/student/StudentDashboard.jsx', name: 'StudentDashboard' },
  { path: 'src/pages/student/StudentProfile.jsx', name: 'StudentProfile' },
  { path: 'src/pages/student/JobDetails.jsx', name: 'JobDetails' },
  { path: 'src/pages/student/MyApplications.jsx', name: 'MyApplications' },
  { path: 'src/pages/student/RecommendedJobs.jsx', name: 'RecommendedJobs' },
  { path: 'src/pages/student/SkillGap.jsx', name: 'SkillGap' },
  { path: 'src/pages/student/Notifications.jsx', name: 'Notifications' },
  { path: 'src/pages/recruiter/RecruiterDashboard.jsx', name: 'RecruiterDashboard' },
  { path: 'src/pages/recruiter/RecruiterProfile.jsx', name: 'RecruiterProfile' },
  { path: 'src/pages/recruiter/CreateJob.jsx', name: 'CreateJob' },
  { path: 'src/pages/recruiter/ManageJobs.jsx', name: 'ManageJobs' },
  { path: 'src/pages/recruiter/Applicants.jsx', name: 'Applicants' },
  { path: 'src/pages/recruiter/ApplicantDetails.jsx', name: 'ApplicantDetails' },
  { path: 'src/pages/admin/AdminDashboard.jsx', name: 'AdminDashboard' },
  { path: 'src/pages/admin/ManageUsers.jsx', name: 'ManageUsers' },
  { path: 'src/pages/admin/ManageJobs.jsx', name: 'ManageJobs' },
  { path: 'src/pages/admin/ManageCompanies.jsx', name: 'ManageCompanies' },
  { path: 'src/pages/admin/PlacementAnalytics.jsx', name: 'PlacementAnalytics' }
];

const writeComponent = (item) => {
  if (!fs.existsSync(item.path)) {
    fs.writeFileSync(item.path, `import React from 'react';\n\nconst ${item.name} = () => {\n  return (\n    <div className="container card" style={{ marginTop: '2rem' }}>\n      <h2>${item.name}</h2>\n      <p>This page/component is under construction.</p>\n    </div>\n  );\n};\n\nexport default ${item.name};\n`);
  }
};

components.forEach(writeComponent);
pages.forEach(writeComponent);

console.log('Scaffolding complete.');
