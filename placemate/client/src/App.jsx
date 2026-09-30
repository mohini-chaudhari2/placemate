import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';

import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import StudentSkills from './pages/StudentSkills';
import Applications from './pages/Applications';
import Notifications from './pages/Notifications';

import RecruiterDashboard from './pages/RecruiterDashboard';
import CreateJob from './pages/CreateJob';
import RecruiterApplications from './pages/RecruiterApplications';
import CandidateProfile from './pages/CandidateProfile';

import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminUserDetails from './pages/AdminUserDetails';
import AdminJobs from './pages/AdminJobs';
import AdminJobDetails from './pages/AdminJobDetails';
import AdminApplications from './pages/AdminApplications';
import AdminApplicationDetails from './pages/AdminApplicationDetails';
import AdminNotifications from './pages/AdminNotifications';
import RecruiterJobDetails from './pages/RecruiterJobDetails';

import NotFound from './pages/NotFound';
import EditJob from './pages/EditJob';
import SavedJobs from './pages/SavedJobs';
import StudentInterviews from './pages/StudentInterviews';
import RecruiterInterviews from './pages/RecruiterInterviews';
import './pages/RecruiterInterviews.css';
import ResumeManager from './pages/ResumeManager';
function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ConfirmProvider>
          <AuthProvider>
            <Navbar />
          
          <Routes>
          {/* =========================
              PUBLIC ROUTES
          ========================== */}

          <Route path="/" element={<Home />} />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/about"
            element={<About />}
          />

          <Route
            path="/jobs"
            element={<Jobs />}
          />

          <Route
            path="/jobs/:id"
            element={<JobDetails />}
          />

          {/* =========================
              STUDENT ROUTES
          ========================== */}

          <Route
            path="/dashboard/student"
            element={<StudentDashboard />}
          />

          <Route
            path="/profile"
            element={<StudentProfile />}
          />

          <Route
            path="/skills"
            element={<StudentSkills />}
          />
          <Route
            path="/saved-jobs"
            element={<SavedJobs />}
          />
          <Route
            path="/interviews"
            element={<StudentInterviews />}
          />
          <Route
            path="/recruiter/interviews"
            element={<RecruiterInterviews />}
          />

          <Route
            path="/recruiter/interviews/:id"
            element={<RecruiterInterviews />}
          />
          <Route path="/resume" element={<ResumeManager />} />
          <Route
            path="/applications"
            element={<Applications />}
          />


          <Route
            path="/notifications"
            element={<Notifications />}
          />

          {/* =========================
              RECRUITER ROUTES
          ========================== */}

          <Route
            path="/dashboard/recruiter"
            element={<RecruiterDashboard />}
          />

          <Route
            path="/recruiter/jobs/new"
            element={<CreateJob />}
          />
          <Route
            path="/recruiter/jobs/:id"
            element={<RecruiterJobDetails />}
          />
          <Route
            path="/recruiter/jobs/:id/edit"
            element={<EditJob />}
          />
          <Route
            path="/recruiter/applications"
            element={<RecruiterApplications />}
          />

          <Route
            path="/recruiter/applications/:id/candidate"
            element={<CandidateProfile />}
          />

          {/* =========================
              ADMIN ROUTES
          ========================== */}

          <Route
            path="/dashboard/admin"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/users"
            element={<AdminUsers />}
          />

          <Route
            path="/admin/users/:id"
            element={<AdminUserDetails />}
          />

          <Route
            path="/admin/jobs"
            element={<AdminJobs />}
          />

          <Route
            path="/admin/jobs/:id"
            element={<AdminJobDetails />}
          />

          <Route
            path="/admin/applications"
            element={<AdminApplications />}
          />

          <Route
            path="/admin/applications/:id"
            element={<AdminApplicationDetails />}
          />

          <Route
            path="/admin/notifications"
            element={<AdminNotifications />}
          />

          {/* =========================
              404
          ========================== */}

          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>

        <Footer />
          </AuthProvider>
        </ConfirmProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;