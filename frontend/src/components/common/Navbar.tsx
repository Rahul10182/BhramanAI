import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  Menu, 
  X, 
  User, 
  LogIn, 
  Sparkles,
  Globe,
  Calendar,
  MapPin,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../../apis/authApi';
import type { User as UserType } from '../../apis/authApi';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch user on mount and when location changes
  useEffect(() => {
    loadUser();
  }, [location.pathname]);

  const loadUser = async () => {
    const result = await authApi.getCurrentUser();
    if (result.success && result.user) {
      setUser(result.user);
    } else {
      setUser(null);
    }
  };

  const handleLogout = async () => {
    const result = await authApi.logout();
    if (result.success) {
      setUser(null);
      navigate('/');
    }
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: Compass },
    { path: '/planner', label: 'Planner', icon: Calendar },
    { path: '/trips', label: 'My Trips', icon: MapPin },
    { path: '/bookings', label: 'Bookings', icon: Globe },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  // Get display name from user object
  const getDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-[#D6C7B1]/20' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="group relative">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#8BA889] to-[#D6C7B1] rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative w-10 h-10 bg-gradient-to-br from-[#4A5D4B] to-[#8BA889] rounded-full flex items-center justify-center">
                    <Compass className="w-5 h-5 text-white" />
                  </div>
                </div>
                <span className="text-2xl font-serif font-bold bg-gradient-to-r from-[#4A5D4B] to-[#8BA889] bg-clip-text text-transparent">
                  BhramanAI
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link key={link.path} to={link.path}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                        isActive 
                          ? 'text-[#4A5D4B] bg-[#8BA889]/10' 
                          : 'text-[#2D2D2D]/70 hover:text-[#4A5D4B] hover:bg-[#8BA889]/5'
                      }`}
                    >
                      <link.icon className="w-4 h-4" />
                      <span className="font-medium">{link.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 border-b-2 border-[#8BA889] rounded-xl"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Auth Section - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                // Logged In User
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#8BA889]/10 transition-all"
                  >
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name || 'User'} 
                        className="w-8 h-8 rounded-full object-cover border-2 border-[#8BA889]"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4A5D4B] to-[#8BA889] flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-[#2D2D2D]">
                      {getDisplayName()}
                    </span>
                    <ChevronDown size={16} className="text-[#2D2D2D]/50" />
                  </motion.button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#D6C7B1]/20 overflow-hidden z-50"
                      >
                        <div className="border-t border-[#D6C7B1]/20" />
                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            handleLogout();
                          }}
                          className="w-full px-4 py-3 hover:bg-red-50 transition-all flex items-center gap-3 text-red-600"
                        >
                          <LogOut size={16} />
                          <span className="text-sm">Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // Logged Out User
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/login')}
                    className="px-5 py-2.5 rounded-xl text-[#4A5D4B] hover:bg-[#8BA889]/10 transition-all flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/signup')}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#4A5D4B] to-[#8BA889] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Get Started
                  </motion.button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-[#8BA889]/10 transition-all"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/95 backdrop-blur-xl border-b border-[#D6C7B1]/20"
            >
              <div className="px-4 py-6 space-y-3">
                {navLinks.map((link) => (
                  <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)}>
                    <motion.div
                      whileHover={{ x: 10 }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        location.pathname === link.path
                          ? 'bg-[#8BA889]/10 text-[#4A5D4B]'
                          : 'text-[#2D2D2D]/70 hover:bg-[#8BA889]/5'
                      }`}
                    >
                      <link.icon className="w-5 h-5" />
                      <span className="font-medium">{link.label}</span>
                    </motion.div>
                  </Link>
                ))}
                
                <div className="pt-4 space-y-3">
                  {user ? (
                    // Mobile Logged In User
                    <>
                      <div className="flex items-center gap-3 px-4 py-3 bg-[#8BA889]/10 rounded-xl">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name || 'User'} className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4A5D4B] to-[#8BA889] flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-[#2D2D2D]">{getDisplayName()}</p>
                          <p className="text-xs text-[#2D2D2D]/50">{user.email}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setIsOpen(false);
                          handleLogout();
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-red-500 text-red-500 font-medium hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </>
                  ) : (
                    // Mobile Logged Out User
                    <>
                      <button 
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/login');
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-[#8BA889] text-[#4A5D4B] font-medium hover:bg-[#8BA889]/5 transition-all flex items-center justify-center gap-2"
                      >
                        <LogIn className="w-4 h-4" />
                        Sign In
                      </button>
                      <button 
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/signup');
                        }}
                        className="w-full px-4 py-3 bg-gradient-to-r from-[#4A5D4B] to-[#8BA889] text-white rounded-xl font-medium shadow-lg flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Get Started
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      {/* Spacer for fixed navbar */}
      <div className="h-20" />
    </>
  );
};

export default Navbar;