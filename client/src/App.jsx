import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CandidateNomination from './pages/CandidateNomination';
import Vote from './pages/Vote';
import Results from './pages/Results';
import ProtectedRoute from './components/ProtectedRoute';
import UserProfile from './pages/UserProfile';
import About from './pages/About';
import Contact from './pages/Contact';
import Chatbot from './components/Chatbot';

import AdminDashboard from './pages/AdminDashboard';
import AdminApplications from './pages/AdminApplications';
import AdminApplicationDetail from './pages/AdminApplicationDetail';
import AdminNews from './pages/AdminNews';
import AdminCreateElection from './pages/AdminCreateElection';
import AdminLogin from './pages/AdminLogin';
import AdminVoters from './pages/AdminVoters';
import CandidateLogin from './pages/CandidateLogin';
import VoterRegister from './pages/VoterRegister';
import NewsTicker from './components/NewsTicker';
import SyncManager from './components/SyncManager';

function App() {
  return (
    <div className="bg-gov-bg min-h-screen text-gray-800 font-inter flex flex-col">
      <div className="fixed top-0 w-full z-50">
        <Navbar />
        <NewsTicker />
      </div>
      <main className="flex-grow pt-[104px]"> {/* 64px (navbar) + 40px (ticker) approx */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/candidate/login" element={<CandidateLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />


          {/* Public Voting Routes (OTP Protected internally) */}
          <Route path="/vote/:electionId" element={<Vote />} />

          {/* Protected Routes for Candidates & Admins */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'candidate']} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/apply" element={<CandidateNomination />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/applications" element={<AdminApplications />} />
            <Route path="/admin/applications/:id" element={<AdminApplicationDetail />} />
            <Route path="/admin/news" element={<AdminNews />} />
            <Route path="/admin/create-election" element={<AdminCreateElection />} />
            <Route path="/admin/voters" element={<AdminVoters />} />
            <Route path="/results/:electionId" element={<Results />} />
          </Route>

        </Routes>
      </main>
      <Chatbot />
      <SyncManager />
    </div>
  );
}

export default App;
