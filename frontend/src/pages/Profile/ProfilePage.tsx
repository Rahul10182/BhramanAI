import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Calendar, Edit2, Camera,
  Globe, Settings, Bell, Lock, LogOut,
  ChevronRight, Share2, X
} from 'lucide-react';
import { authApi } from '../../apis/authApi';
import type { User as UserType } from '../../apis/authApi';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [formData, setFormData] = useState({
    name: '', phone: '', location: '', bio: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => { loadUser(); }, []);

  const loadUser = async () => {
    setIsLoading(true);
    let result = await authApi.getFullProfile();
    if (!result.success) result = await authApi.getCurrentUser();
    if (result.success && result.user) setUser(result.user);
    else setUser(null);
    setIsLoading(false);
  };

  const openEditModal = () => {
    if (user) {
      setFormData({
        name: user.name || '', phone: user.phone || '',
        location: user.location || '', bio: user.bio || '',
      });
      setAvatarPreview(null);
      setSaveError('');
    }
    setIsEditing(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 800 * 1024) { setSaveError('Image must be under 800KB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true); setSaveError('');
    const payload: any = { ...formData };
    if (avatarPreview) payload.avatar = avatarPreview;
    const result = await authApi.updateProfile(payload);
    if (result.success && result.user) { setUser(result.user); setIsEditing(false); }
    else setSaveError(result.error || 'Failed to save');
    setIsSaving(false);
  };

  const handleLogout = async () => { await authApi.logout(); navigate('/'); };

  const getJoinDate = () => {
    if (!user?.createdAt) return 'Recently';
    return new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const tabs = ['overview', 'settings'];
  const settingsItems = [
    { icon: Bell, label: 'Notifications', desc: 'Manage preferences' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#8BA889]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCFB] p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-[#D6C7B1]/20">
          <div className="w-20 h-20 bg-[#8BA889]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-[#4A5D4B]" />
          </div>
          <h2 className="text-2xl font-bold text-[#2D2D2D] mb-4">Authentication Required</h2>
          <p className="text-[#2D2D2D]/70 mb-8">Please sign in to view and manage your profile.</p>
          <div className="flex flex-col gap-4">
            <button onClick={() => navigate('/login')} className="w-full py-3 bg-gradient-to-r from-[#4A5D4B] to-[#8BA889] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all">Sign In</button>
            <button onClick={() => navigate('/signup')} className="w-full py-3 border-2 border-[#8BA889] text-[#4A5D4B] rounded-xl font-medium hover:bg-[#8BA889]/5 transition-all">Create an Account</button>
          </div>
        </motion.div>
      </div>
    );
  }

  const displayName = user.name || user.email.split('@')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFCFB] via-white to-[#D6C7B1]/10 py-12">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8BA889]/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D6C7B1]/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-[#D6C7B1]/30 mb-8">
          <div className="relative h-56 bg-gradient-to-r from-[#4A5D4B] to-[#8BA889] overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-60" />
          </div>

          <div className="relative px-8 pb-8">
            <div className="flex flex-col md:flex-row items-center gap-8 -mt-20 mb-6">
              <div className="relative group">
                <div className="w-36 h-36 rounded-full border-4 border-white bg-gradient-to-br from-[#4A5D4B] to-[#8BA889] flex items-center justify-center shadow-2xl overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-white" />
                  )}
                </div>
              </div>

              <div className="text-center md:text-left flex-1 pt-8 md:pt-0">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <h1 className="text-4xl font-bold text-[#2D2D2D] tracking-tight">{displayName}</h1>
                  <button onClick={openEditModal} className="p-2 rounded-full hover:bg-black/10 transition-colors">
                    <Edit2 className="w-5 h-5 text-black" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-3 mt-3 justify-center md:justify-start">
                  {user.location && (
                    <div className="flex items-center gap-1.5 text-sm font-medium px-3 py-1 bg-white/60 rounded-full shadow-sm text-[#2D2D2D]/70 border border-[#D6C7B1]/30">
                      <MapPin size={14} className="text-[#8BA889]" /> {user.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-sm font-medium px-3 py-1 bg-white/60 rounded-full shadow-sm text-[#2D2D2D]/70 border border-[#D6C7B1]/30">
                    <Calendar size={14} className="text-[#8BA889]" /> Joined {getJoinDate()}
                  </div>
                </div>
                {user.bio && <p className="mt-4 text-[#2D2D2D]/70 max-w-2xl text-lg leading-relaxed">{user.bio}</p>}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-8 py-3.5 rounded-2xl capitalize transition-all duration-300 font-medium text-lg ${
                activeTab === tab
                  ? 'bg-[#2D2D2D] text-white shadow-xl scale-105'
                  : 'bg-white/80 backdrop-blur-sm text-[#2D2D2D]/70 hover:bg-white border border-[#D6C7B1]/20 shadow-sm'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid md:grid-cols-2 gap-8">
              {/* Personal Details */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-[#D6C7B1]/30">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#2D2D2D]">
                  <User size={22} className="text-[#8BA889]" /> Personal Details
                </h3>
                <div className="space-y-4">
                  {[
                    { icon: Mail, label: 'Email', value: user.email },
                    { icon: Phone, label: 'Phone', value: user.phone || 'Not set' },
                    { icon: MapPin, label: 'Location', value: user.location || 'Not set' },
                    { icon: Globe, label: 'Provider', value: user.provider === 'google' ? 'Google Account' : 'Email & Password' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#8BA889]/10 to-transparent rounded-2xl">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <item.icon className="text-[#8BA889]" size={18} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wider mb-0.5">{item.label}</p>
                        <p className="font-medium text-[#2D2D2D] truncate">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bio & Travel Style */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-[#D6C7B1]/30">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#2D2D2D]">
                  <Edit2 size={22} className="text-[#8BA889]" /> About Me
                </h3>
                <div className="p-5 bg-[#8BA889]/5 rounded-2xl mb-6 min-h-[100px]">
                  <p className="text-[#2D2D2D]/80 leading-relaxed">{user.bio || 'No bio yet. Click "Edit Profile" to add one!'}</p>
                </div>

                {user.travelStyle && user.travelStyle.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-[#2D2D2D]/70 uppercase tracking-wider mb-3">Travel Style</h4>
                    <div className="flex flex-wrap gap-2">
                      {user.travelStyle.map((s, i) => (
                        <span key={i} className="px-4 py-1.5 bg-white border border-[#8BA889]/30 rounded-full text-sm font-medium text-[#4A5D4B] shadow-sm">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {user.languages && user.languages.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-[#2D2D2D]/70 uppercase tracking-wider mb-3">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {user.languages.map((l, i) => (
                        <span key={i} className="px-4 py-1.5 bg-white border border-[#D6C7B1]/30 rounded-full text-sm font-medium text-[#2D2D2D]/70 shadow-sm">{l}</span>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={openEditModal} className="mt-6 w-full py-3 border-2 border-dashed border-[#8BA889]/40 text-[#4A5D4B] rounded-xl font-medium hover:bg-[#8BA889]/5 transition-all flex items-center justify-center gap-2">
                  <Edit2 size={16} /> Edit Profile
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-3xl mx-auto space-y-8">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-[#D6C7B1]/30">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-[#2D2D2D]">
                  <Settings size={24} className="text-[#8BA889]" /> Account Settings
                </h3>
                <div className="space-y-3">
                  {settingsItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-100 hover:border-[#8BA889]/30 hover:shadow-md rounded-2xl cursor-pointer transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#8BA889]/10 group-hover:bg-[#8BA889]/20 rounded-xl flex items-center justify-center transition-colors">
                          <item.icon size={22} className="text-[#4A5D4B]" />
                        </div>
                        <div>
                          <p className="font-bold text-[#2D2D2D] text-lg">{item.label}</p>
                          <p className="text-sm text-[#2D2D2D]/60">{item.desc}</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-[#2D2D2D]/40 group-hover:text-[#4A5D4B]" />
                    </div>
                  ))}
                  <div onClick={handleLogout} className="flex items-center justify-between p-4 bg-red-50/50 border border-red-100 hover:border-red-200 hover:shadow-md rounded-2xl cursor-pointer transition-all group mt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-100 group-hover:bg-red-200 rounded-xl flex items-center justify-center transition-colors">
                        <LogOut size={22} className="text-red-600" />
                      </div>
                      <div>
                        <p className="font-bold text-red-600 text-lg">Sign Out</p>
                        <p className="text-sm text-red-600/70">Log out of your account</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-[#D6C7B1]/30">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-[#2D2D2D]">
                  <Share2 size={24} className="text-[#8BA889]" /> Connected Accounts
                </h3>
                <div className="space-y-4">
                  {['Google'].map((social, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center font-bold text-xl text-[#2D2D2D]">{social[0]}</div>
                        <div>
                          <span className="font-bold text-[#2D2D2D] block">{social}</span>
                          <span className="text-sm text-gray-500">{social === 'Google' && user.provider === 'google' ? 'Connected' : 'Not connected'}</span>
                        </div>
                      </div>
                      <button className="px-5 py-2 text-sm font-bold bg-gray-50 text-[#2D2D2D] rounded-xl hover:bg-gray-100 transition-colors">
                        {social === 'Google' && user.provider === 'google' ? 'Connected' : 'Connect'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsEditing(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-8 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-3xl">
                <h2 className="text-3xl font-bold text-[#2D2D2D]">Edit Profile</h2>
                <button onClick={() => setIsEditing(false)} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center gap-6 mb-4">
                  <div onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-[#4A5D4B] to-[#8BA889] flex items-center justify-center text-white overflow-hidden shadow-lg relative group cursor-pointer flex-shrink-0">
                    {(avatarPreview || user?.avatar) ? (
                      <img src={avatarPreview || user?.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={24} />
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  <div>
                    <h3 className="font-bold text-lg text-[#2D2D2D]">Profile Picture</h3>
                    <p className="text-sm text-gray-500 mb-3">Click the photo to change. Max 800KB.</p>
                    <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Upload New</button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#2D2D2D] mb-2">Full Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#8BA889] focus:ring-2 focus:ring-[#8BA889]/20 focus:bg-white transition-all outline-none font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2D2D2D] mb-2">Email Address</label>
                    <input type="email" value={user?.email || ''} readOnly
                      className="w-full p-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 outline-none font-medium cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2D2D2D] mb-2">Phone Number</label>
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#8BA889] focus:ring-2 focus:ring-[#8BA889]/20 focus:bg-white transition-all outline-none font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2D2D2D] mb-2">Location</label>
                    <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="City, Country"
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#8BA889] focus:ring-2 focus:ring-[#8BA889]/20 focus:bg-white transition-all outline-none font-medium" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2D2D2D] mb-2">Short Bio</label>
                  <textarea rows={4} value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#8BA889] focus:ring-2 focus:ring-[#8BA889]/20 focus:bg-white transition-all outline-none font-medium resize-none" />
                </div>
                {saveError && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">{saveError}</div>}
              </div>
              <div className="p-8 border-t border-gray-100 bg-gray-50 rounded-b-3xl flex gap-4 justify-end">
                <button onClick={() => setIsEditing(false)} disabled={isSaving} className="px-8 py-3.5 bg-white border border-gray-200 text-[#2D2D2D] font-bold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50">Cancel</button>
                <button onClick={handleSave} disabled={isSaving} className="px-8 py-3.5 bg-gradient-to-r from-[#4A5D4B] to-[#8BA889] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2">
                  {isSaving ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>) : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;