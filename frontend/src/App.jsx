import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage.jsx';
import LoginPage from './pages/LoginPage/LoginPage.jsx';
import StudentDashboard from './pages/StudentDashboard/StudentDashboard.jsx';
import StudentProfile from './pages/StudentProfile/StudentProfile.jsx';
import FindInternships from './pages/FindInternships/FindInternships.jsx';
import WeeklyReports from './pages/WeeklyReports/WeeklyReports.jsx';
import ProfessorDashboard from './pages/ProfessorDashboard/ProfessorDashboard.jsx';
import CompanyDashboard from './pages/CompanyDashboard/CompanyDashboard.jsx';
import CompanyJobListings from './pages/CompanyJobListings/CompanyJobListings.jsx';
import CompanyApplicants from './pages/CompanyApplicants/CompanyApplicants.jsx';
import CompanyPostJob from './pages/CompanyPostJob/CompanyPostJob.jsx';
import CompanyProfile from './pages/CompanyProfile/CompanyProfile.jsx';
import NotFound from './pages/NotFound/NotFound.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/internships" element={<FindInternships />} />
        <Route path="/student/reports" element={<WeeklyReports />} />
        <Route path="/professor/dashboard" element={<ProfessorDashboard />} />
        <Route path="/company/dashboard" element={<CompanyDashboard />} />
        <Route path="/company/jobs" element={<CompanyJobListings />} />
        <Route path="/company/applicants" element={<CompanyApplicants />} />
        <Route path="/company/post-job" element={<CompanyPostJob />} />
        <Route path="/company/profile" element={<CompanyProfile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
