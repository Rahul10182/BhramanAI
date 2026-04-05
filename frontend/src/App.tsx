import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/common/Navbar'
import HomePage from './pages/Home/HomePage'
import PlannerPage from './pages/Planner/PlannerPage'
import TripPage from './pages/Trip/TripPage'
import BookingPage from './pages/Booking/BookingPage'
import ProfilePage from './pages/Profile/ProfilePage'
import LoginPage from './pages/Register/LoginPage'
import SignupPage from './pages/Register/SignupPage'
import AuthSuccess from './pages/Register/AuthSuccess'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#FDFCFB]">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/trips" element={<TripPage />} />
          <Route path="/bookings" element={<BookingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth/success" element={<AuthSuccess />} />

        </Routes>
      </div>
    </Router>
  )
}

export default App