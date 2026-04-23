import './App.css'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/common/Navbar'
import HomePage from './pages/Home/HomePage'
import PlannerPage from './pages/Planner/PlannerPage'
import TripPage from './pages/Trip/TripPage'
import BookingPage from './pages/Booking/BookingPage'
import ProfilePage from './pages/Profile/ProfilePage'
import LoginPage from './pages/Register/LoginPage'
import SignupPage from './pages/Register/SignupPage'
import AuthSuccess from './pages/Register/AuthSuccess'
import ChatBot from './pages/test/ChatBot'
import RecommendationPage from './pages/Recommendations/RecommendationPage'

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/chat');

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/planner" element={<PlannerPage />} />
        <Route path="/trips" element={<TripPage />} />
        <Route path="/bookings" element={<BookingPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/chat" element={<ChatBot />} />
        <Route path="/chat/:chatId" element={<ChatBot />} />
        <Route path="/recommendations/:tripId" element={<RecommendationPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App