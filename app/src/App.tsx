import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from './components/ui/Toaster'

// Auth pages
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ForgotPassword from './pages/auth/ForgotPassword'

// App pages
import Dashboard from './pages/Dashboard'
import Clubs from './pages/clubs/Clubs'
import CreateClub from './pages/clubs/CreateClub'
import ClubDetail from './pages/clubs/ClubDetail'
import Meetings from './pages/meetings/Meetings'
import CreateMeeting from './pages/meetings/CreateMeeting'
import MeetingDetail from './pages/meetings/MeetingDetail'
import Learning from './pages/learning/Learning'
import ProjectCollaboration from './pages/projects/ProjectCollaboration'
import Profile from './pages/Profile'
import Onboarding from './pages/onboarding/Onboarding'

// Layout
import AppLayout from './layouts/AppLayout'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Auth routes */}
          <Route path="/auth">
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* App routes - protected */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clubs">
              <Route index element={<Clubs />} />
              <Route path="create" element={<CreateClub />} />
              <Route path=":clubId" element={<ClubDetail />} />
            </Route>
            <Route path="meetings">
              <Route index element={<Meetings />} />
              <Route path="create" element={<CreateMeeting />} />
              <Route path=":id" element={<MeetingDetail />} />
            </Route>
            <Route path="learning" element={<Learning />} />
            <Route path="projects" element={<ProjectCollaboration />} />
            <Route path="profile" element={<Profile />} />
            <Route path="onboarding/*" element={<Onboarding />} />
          </Route>
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  )
}

export default App