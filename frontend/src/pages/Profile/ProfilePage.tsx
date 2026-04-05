import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Calendar, Edit2, Camera, Heart, Award, 
  Globe, Compass, Star, TrendingUp, Settings, Bell, Lock, LogOut, 
  ChevronRight, CheckCircle, Coffee, Plane, Hotel, Ticket, Users, 
  MessageCircle, Sparkles, Share2
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  
  const profileData = {
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 98765 43210',
    location: 'Mumbai, India',
    bio: 'Passionate traveler exploring the world. Love photography, food, and cultural experiences.',
    joinDate: 'January 2024',
    travelStyle: ['Adventure', 'Culture', 'Food', 'Nature'],
    languages: ['English', 'Hindi', 'French']
  };

  const stats = [
    { label: 'Countries', value: 15, icon: Globe, color: 'from-purple-500 to-pink-500' },
    { label: 'Trips', value: 24, icon: Compass, color: 'from-blue-500 to-cyan-500' },
    { label: 'Days', value: 187, icon: Calendar, color: 'from-orange-500 to-red-500' },
    { label: 'Photos', value: 892, icon: Camera, color: 'from-green-500 to-emerald-500' },
  ];

  const recentTrips = [
    { destination: 'Bali, Indonesia', date: 'May 2024', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400', rating: 5 },
    { destination: 'Paris, France', date: 'March 2024', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400', rating: 5 },
    { destination: 'Tokyo, Japan', date: 'December 2023', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400', rating: 5 },
  ];

  const achievements = [
    { title: 'Globe Trotter', description: 'Visited 3 continents', icon: Globe, progress: 60 },
    { title: 'Culture Enthusiast', description: 'Visited 50+ museums', icon: Award, progress: 80 },
    { title: 'Food Explorer', description: 'Tried 100+ local dishes', icon: Coffee, progress: 75 },
  ];

  const tabs = ['overview', 'achievements', 'settings'];
  const badges = [
    { name: 'Early Explorer', icon: Compass, color: 'from-purple-500 to-pink-500' },
    { name: 'Photo Master', icon: Camera, color: 'from-blue-500 to-cyan-500' },
    { name: 'Food Critic', icon: Coffee, color: 'from-orange-500 to-red-500' },
    { name: 'Social Butterfly', icon: Users, color: 'from-green-500 to-emerald-500' },
  ];

  const settingsItems = [
    { icon: Bell, label: 'Notifications', desc: 'Manage preferences' },
    { icon: Lock, label: 'Privacy', desc: 'Control settings' },
    { icon: Globe, label: 'Language', desc: 'Change preference' },
    { icon: LogOut, label: 'Log Out', desc: 'Sign out' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFCFB] via-white to-[#D6C7B1]/10 py-12">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 left-10 w-72 h-72 bg-[#8BA889]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#D6C7B1]/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} 
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-[#D6C7B1]/20 mb-8">
          
          {/* Cover Image */}
          <div className="relative h-48 bg-gradient-to-r from-[#4A5D4B] to-[#8BA889]">
            <button className="absolute bottom-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl text-sm font-medium flex items-center gap-2">
              <Camera size={16} /> Change Cover
            </button>
          </div>

          {/* Profile Info */}
          <div className="relative px-8 pb-8">
            <div className="flex flex-col md:flex-row items-center gap-6 -mt-20 mb-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-br from-[#4A5D4B] to-[#8BA889] flex items-center justify-center shadow-xl">
                  <User className="w-16 h-16 text-white" />
                </div>
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <Camera className="w-4 h-4 text-[#4A5D4B]" />
                </button>
              </div>
              
              <div className="text-center md:text-left flex-1">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <h1 className="text-3xl font-bold text-[#2D2D2D]">{profileData.name}</h1>
                  <button onClick={() => setIsEditing(true)} className="p-2 rounded-lg hover:bg-gray-100">
                    <Edit2 className="w-4 h-4 text-[#8BA889]" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-4 mt-2 justify-center md:justify-start">
                  <div className="flex items-center gap-1 text-sm text-[#2D2D2D]/60">
                    <MapPin size={16} /> {profileData.location}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-[#2D2D2D]/60">
                    <Calendar size={16} /> Member since {profileData.joinDate}
                  </div>
                </div>
                <p className="mt-3 text-[#2D2D2D]/70 max-w-2xl">{profileData.bio}</p>
              </div>
              
              <button className="px-6 py-2.5 bg-gradient-to-r from-[#4A5D4B] to-[#8BA889] text-white rounded-xl font-medium shadow-lg flex items-center gap-2">
                <Share2 size={16} /> Share Profile
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-[#D6C7B1]/20">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xl font-bold text-[#2D2D2D]">{stat.value}</p>
                  <p className="text-xs text-[#2D2D2D]/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl capitalize transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-gradient-to-r from-[#4A5D4B] to-[#8BA889] text-white shadow-lg' 
                : 'bg-white text-[#2D2D2D]/70 hover:bg-gray-50'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              {/* Personal Info */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#D6C7B1]/20">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><User size={20} className="text-[#8BA889]" /> Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3 p-4 bg-[#8BA889]/5 rounded-xl">
                    <Mail className="text-[#8BA889]" size={20} />
                    <div><p className="text-xs text-[#2D2D2D]/60">Email</p><p className="font-medium">{profileData.email}</p></div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-[#8BA889]/5 rounded-xl">
                    <Phone className="text-[#8BA889]" size={20} />
                    <div><p className="text-xs text-[#2D2D2D]/60">Phone</p><p className="font-medium">{profileData.phone}</p></div>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="text-sm font-medium">Travel Style:</span>
                  {profileData.travelStyle.map((style, idx) => (
                    <span key={idx} className="px-3 py-1 bg-[#8BA889]/10 rounded-full text-sm text-[#4A5D4B]">{style}</span>
                  ))}
                </div>
              </div>

              {/* Recent Trips */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#D6C7B1]/20">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2"><Heart size={20} className="text-[#8BA889]" /> Recent Adventures</h3>
                  <button className="text-[#8BA889] text-sm flex items-center gap-1">View All <ChevronRight size={16} /></button>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  {recentTrips.map((trip, idx) => (
                    <div key={idx} className="group cursor-pointer">
                      <div className="relative rounded-xl overflow-hidden h-48 mb-3">
                        <img src={trip.image} alt={trip.destination} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-3 left-3 text-white">
                          <p className="font-semibold">{trip.destination}</p>
                          <p className="text-xs opacity-90">{trip.date}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">{[...Array(trip.rating)].map((_, i) => (<Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />))}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <motion.div key="achievements" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#D6C7B1]/20">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Award size={20} className="text-[#8BA889]" /> Travel Achievements</h3>
                <div className="space-y-6">
                  {achievements.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center gap-2"><item.icon size={20} className="text-[#8BA889]" /><span className="font-medium">{item.title}</span></div>
                        <span className="text-sm text-[#2D2D2D]/60">{item.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#4A5D4B] to-[#8BA889] rounded-full transition-all duration-1000" style={{ width: `${item.progress}%` }} />
                      </div>
                      <p className="text-xs text-[#2D2D2D]/60 mt-1">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#D6C7B1]/20">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Sparkles size={20} className="text-[#8BA889]" /> Travel Badges</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {badges.map((badge, idx) => (
                    <div key={idx} className="text-center p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl">
                      <div className={`w-12 h-12 bg-gradient-to-br ${badge.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                        <badge.icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-sm font-medium">{badge.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#D6C7B1]/20">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings size={20} className="text-[#8BA889]" /> Account Settings</h3>
                <div className="space-y-4">
                  {settingsItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#8BA889]/10 rounded-xl flex items-center justify-center"><item.icon size={20} className="text-[#8BA889]" /></div>
                        <div><p className="font-medium">{item.label}</p><p className="text-sm text-[#2D2D2D]/60">{item.desc}</p></div>
                      </div>
                      <ChevronRight size={20} className="text-[#2D2D2D]/40" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#D6C7B1]/20">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Share2 size={20} className="text-[#8BA889]" /> Connected Accounts</h3>
                <div className="space-y-3">
                  {['Instagram', 'Twitter', 'Facebook'].map((social, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                      <div className="flex items-center gap-3"><div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">{social[0]}</div><span className="font-medium">{social}</span></div>
                      <button className="px-4 py-2 text-sm bg-[#8BA889]/10 text-[#4A5D4B] rounded-lg hover:bg-[#8BA889]/20">Connect</button>
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsEditing(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200"><h2 className="text-2xl font-bold">Edit Profile</h2></div>
              <div className="p-6 space-y-4">
                {['Name', 'Email', 'Phone'].map((field, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-medium mb-2">{field}</label>
                    <input type={field === 'Email' ? 'email' : 'text'} defaultValue={profileData[field.toLowerCase() as keyof typeof profileData] as string} 
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#8BA889] focus:outline-none" />
                  </div>
                ))}
                <div><label className="block text-sm font-medium mb-2">Bio</label><textarea rows={4} defaultValue={profileData.bio} className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#8BA889] focus:outline-none" /></div>
              </div>
              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <button onClick={() => setIsEditing(false)} className="px-6 py-2 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                <button onClick={() => setIsEditing(false)} className="px-6 py-2 bg-gradient-to-r from-[#4A5D4B] to-[#8BA889] text-white rounded-xl hover:shadow-lg">Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;