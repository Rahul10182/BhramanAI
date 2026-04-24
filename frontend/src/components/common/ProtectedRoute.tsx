import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { authApi } from '../../apis/authApi';
import UnauthorizedPage from '../../pages/Error/UnauthorizedPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      // Quick check from localStorage first
      if (authApi.isAuthenticated()) {
        // Verify with backend
        const result = await authApi.getCurrentUser();
        setIsAuthenticated(result.success);
      } else {
        setIsAuthenticated(false);
      }
      setIsChecking(false);
    };
    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FDFCFB] via-white to-[#D6C7B1]/10 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#4A5D4B] to-[#8BA889] opacity-20 animate-ping" />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#4A5D4B] to-[#8BA889] flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
          </div>
          <p className="text-[#2D2D2D]/60 font-medium">Verifying access...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Show the Unauthorized page with the path the user was trying to access
    return <UnauthorizedPage />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
