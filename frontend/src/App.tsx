import React from 'react';
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import ProtectedRoute from './components/common/ProtectedRoute'
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
import NotFoundPage from './pages/NotFound/NotFoundPage'
import ServerErrorPage from './pages/Error/ServerErrorPage'

// ── React Error Boundary (catches runtime JS errors) ──
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <ServerErrorPage />;
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-[#FDFCFB] flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/auth/success" element={<AuthSuccess />} />

              {/* Protected routes */}
              <Route path="/planner" element={<ProtectedRoute><PlannerPage /></ProtectedRoute>} />
              <Route path="/trips" element={<ProtectedRoute><TripPage /></ProtectedRoute>} />
              <Route path="/bookings" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/recommendations/:tripId" element={<ProtectedRoute><RecommendationPage /></ProtectedRoute>} />
              <Route path="/test/chat" element={<ChatBot />} />

              {/* Error routes */}
              <Route path="/error/500" element={<ServerErrorPage />} />

              {/* 404 Catch-All — must be last */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App