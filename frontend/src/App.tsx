import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import HomePage from './pages/Home/HomePage';
import PlannerPage from './pages/Planner/PlannerPage';
import TripPage from './pages/Trip/TripPage';
import TripDetailPage from './pages/Trip/TripDetailPage';
import BookingPage from './pages/Booking/BookingPage';
import ProfilePage from './pages/Profile/ProfilePage';
import LoginPage from './pages/Register/LoginPage';
import SignupPage from './pages/Register/SignupPage';
import AuthSuccess from './pages/Register/AuthSuccess';
import ChatBot from './pages/test/ChatBot';
import RecommendationPage from './pages/Recommendations/RecommendationPage';
import NotFoundPage from './pages/NotFound/NotFoundPage';
import ServerErrorPage from './pages/Error/ServerErrorPage';

// ── React Error Boundary ──
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <ServerErrorPage />;
    }
    return this.props.children;
  }
}

// ── Main Content Component ──
function AppContent() {
  const location = useLocation();
  
  // Logic to hide Navbar/Footer on specific routes (from main branch)
  const hideLayout = location.pathname.startsWith('/chat') || location.pathname.startsWith('/trip/');

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col">
      {!hideLayout && <Navbar />}
      
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
          <Route path="/trip/:tripId" element={<ProtectedRoute><TripDetailPage /></ProtectedRoute>} />
          
          {/* Chat / Test routes */}
          <Route path="/chat" element={<ChatBot />} />
          <Route path="/chat/:chatId" element={<ChatBot />} />
          <Route path="/test/chat" element={<ChatBot />} />

          {/* Error routes */}
          <Route path="/error/500" element={<ServerErrorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {!hideLayout && <Footer />}
    </div>
  );
}

// ── Root App Component ──
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}

export default App;