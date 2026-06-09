import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CandidateDashboard from './pages/CandidateDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import ResumeUpload from './pages/ResumeUpload';
import JobListings from './pages/JobListings';
import CreateJob from './pages/CreateJob';
import CandidateRankings from './pages/CandidateRankings';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-overlay"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'candidate' ? '/candidate/dashboard' : '/recruiter/dashboard'} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={user.role === 'candidate' ? '/candidate/dashboard' : '/recruiter/dashboard'} /> : <Register />} />
      <Route path="/forgot-password" element={user ? <Navigate to={user.role === 'candidate' ? '/candidate/dashboard' : '/recruiter/dashboard'} /> : <ForgotPassword />} />
      <Route path="/reset-password" element={user ? <Navigate to={user.role === 'candidate' ? '/candidate/dashboard' : '/recruiter/dashboard'} /> : <ResetPassword />} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Candidate Routes */}
      <Route path="/candidate/dashboard" element={<ProtectedRoute role="candidate"><CandidateDashboard /></ProtectedRoute>} />
      <Route path="/candidate/resume" element={<ProtectedRoute role="candidate"><ResumeUpload /></ProtectedRoute>} />
      <Route path="/jobs" element={<ProtectedRoute><JobListings /></ProtectedRoute>} />

      {/* Recruiter Routes */}
      <Route path="/recruiter/dashboard" element={<ProtectedRoute role="recruiter"><RecruiterDashboard /></ProtectedRoute>} />
      <Route path="/recruiter/jobs/create" element={<ProtectedRoute role="recruiter"><CreateJob /></ProtectedRoute>} />
      <Route path="/recruiter/jobs/edit/:id" element={<ProtectedRoute role="recruiter"><CreateJob /></ProtectedRoute>} />
      <Route path="/recruiter/matches/:jobId" element={<ProtectedRoute role="recruiter"><CandidateRankings /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="app-main">
          <AppRoutes />
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}
