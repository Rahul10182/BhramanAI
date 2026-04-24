import React from 'react';
import { Compass, Globe, MessageCircle, Camera, Mail, Heart, MapPin, Globe2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Footer: React.FC = () => {
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  // Don't render footer on auth/error pages
  const hideOn = ['/login', '/signup', '/auth/success'];
  if (hideOn.includes(location.pathname)) return null;

  const footerLinks = {
    explore: [
      { label: 'Plan a Trip', path: '/planner' },
      { label: 'My Trips', path: '/trips' },
      { label: 'Bookings', path: '/bookings' },
      { label: 'Profile', path: '/profile' },
    ],
    company: [
      { label: 'About Us', path: '#' },
      { label: 'Contact', path: '#' },
      { label: 'Blog', path: '#' },
      { label: 'Careers', path: '#' },
    ],
    legal: [
      { label: 'Privacy Policy', path: '#' },
      { label: 'Terms of Service', path: '#' },
      { label: 'Cookie Policy', path: '#' },
    ],
  };

  return (
    <footer className="relative bg-[#2D2D2D] text-white/80 overflow-hidden">
      {/* Top gradient line */}
      <div className="h-1 bg-gradient-to-r from-[#4A5D4B] via-[#8BA889] to-[#D6C7B1]" />

      {/* Background glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-[#4A5D4B]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[250px] bg-[#D6C7B1]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 group mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#8BA889] to-[#D6C7B1] rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative w-9 h-9 bg-gradient-to-br from-[#4A5D4B] to-[#8BA889] rounded-full flex items-center justify-center">
                  <Compass className="w-4 h-4 text-white" />
                </div>
              </div>
              <span className="text-xl font-serif font-bold bg-gradient-to-r from-[#8BA889] to-[#D6C7B1] bg-clip-text text-transparent">
                BhramanAI
              </span>
            </Link>
            <p className="text-sm text-white/45 leading-relaxed mb-5 max-w-xs">
              AI-powered travel planning that crafts your perfect journey. Discover, plan, and book — all in one place.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {[
                { icon: Globe, href: '#' },
                { icon: MessageCircle, href: '#' },
                { icon: Camera, href: '#' },
                { icon: Mail, href: '#' },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-[#8BA889]/20 hover:border-[#8BA889]/30 transition-all duration-300"
                >
                  <Icon size={16} className="text-white/50 hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin size={14} className="text-[#8BA889]" />
              Explore
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/45 hover:text-[#8BA889] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Globe size={14} className="text-[#8BA889]" />
              Company
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/45 hover:text-[#8BA889] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/45 hover:text-[#8BA889] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/35 flex items-center gap-1.5">
            © {currentYear} BhramanAI. Made with
            <Heart size={12} className="text-rose-400 fill-rose-400" />
            for travelers everywhere.
          </p>
          <p className="text-xs text-white/25">
            Powered by AI · Built with React & Node.js
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
