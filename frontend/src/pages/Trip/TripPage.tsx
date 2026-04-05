import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  MoreVertical, 
  Plane,
  Hotel,
  Coffee,
  Camera,
  Star,
  Heart,
  Share2,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award,
  Compass
} from 'lucide-react';

const TripPage: React.FC = () => {
  const [selectedTrip, setSelectedTrip] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const trips = [
    {
      id: 1,
      destination: "Bali, Indonesia",
      dates: "May 15 - May 22, 2024",
      days: 7,
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
      status: "Upcoming",
      companions: 2,
      rating: 4.9,
      budget: "$1,200",
      activities: 12,
      highlights: ["Ubud Monkey Forest", "Tanah Lot Temple", "Rice Terraces"],
      weather: "Sunny, 28°C",
      booked: ["Flight", "Hotel", "Tours"]
    },
    {
      id: 2,
      destination: "Paris, France",
      dates: "June 10 - June 18, 2024",
      days: 8,
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
      status: "Planning",
      companions: 1,
      rating: 4.8,
      budget: "$2,500",
      activities: 15,
      highlights: ["Eiffel Tower", "Louvre Museum", "Seine Cruise"],
      weather: "Mild, 22°C",
      booked: ["Flight", "Hotel"]
    },
    {
      id: 3,
      destination: "Tokyo, Japan",
      dates: "July 5 - July 15, 2024",
      days: 10,
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
      status: "Upcoming",
      companions: 3,
      rating: 4.9,
      budget: "$3,200",
      activities: 20,
      highlights: ["Shibuya Crossing", "Mount Fuji", "Senso-ji Temple"],
      weather: "Warm, 30°C",
      booked: ["Flight", "Hotel", "Train Pass", "Tours"]
    },
    {
      id: 4,
      destination: "Switzerland",
      dates: "August 20 - August 28, 2024",
      days: 8,
      image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800",
      status: "Completed",
      companions: 2,
      rating: 5.0,
      budget: "$3,500",
      activities: 14,
      highlights: ["Jungfraujoch", "Lake Geneva", "Interlaken"],
      weather: "Cool, 18°C",
      booked: ["Flight", "Hotel", "Train Pass"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Upcoming': return 'bg-emerald-500';
      case 'Planning': return 'bg-amber-500';
      case 'Completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFCFB] via-white to-[#D6C7B1]/10 py-12">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 left-10 w-64 h-64 bg-[#8BA889]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#D6C7B1]/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#8BA889]/10 rounded-full mb-4">
                <Compass className="w-4 h-4 text-[#8BA889]" />
                <span className="text-sm font-medium text-[#4A5D4B]">Your Journey Collection</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-serif mb-2 bg-gradient-to-r from-[#4A5D4B] to-[#8BA889] bg-clip-text text-transparent">
                My Adventures
              </h1>
              <p className="text-lg text-[#2D2D2D]/60">
                {trips.length} amazing journeys planned and counting
              </p>
            </div>
            
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-gradient-to-r from-[#4A5D4B] to-[#8BA889] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Plan New Trip
              </button>
              <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-[#D6C7B1]/20">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    viewMode === 'grid' ? 'bg-[#8BA889] text-white' : 'text-[#2D2D2D]/60'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    viewMode === 'list' ? 'bg-[#8BA889] text-white' : 'text-[#2D2D2D]/60'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { label: 'Total Trips', value: trips.length, icon: Compass, color: 'from-purple-500 to-pink-500' },
            { label: 'Countries Visited', value: 4, icon: MapPin, color: 'from-blue-500 to-cyan-500' },
            { label: 'Days Traveled', value: 33, icon: Calendar, color: 'from-orange-500 to-red-500' },
            { label: 'Memories', value: 245, icon: Camera, color: 'from-green-500 to-emerald-500' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-[#D6C7B1]/20 text-center"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#2D2D2D]">{stat.value}</p>
              <p className="text-sm text-[#2D2D2D]/60">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Trips Grid/List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={viewMode === 'grid' 
            ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
          }
        >
          {trips.map((trip) => (
            <motion.div
              key={trip.id}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="group cursor-pointer"
              onClick={() => setSelectedTrip(selectedTrip === trip.id ? null : trip.id)}
            >
              <div className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#D6C7B1]/20 ${
                viewMode === 'list' ? 'flex' : ''
              }`}>
                {/* Image */}
                <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'h-56'}`}>
                  <img 
                    src={trip.image} 
                    alt={trip.destination} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(trip.status)}`}>
                    {trip.status}
                  </div>
                  <button className="absolute top-4 left-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all">
                    <Heart className="w-4 h-4 text-[#4A5D4B]" />
                  </button>
                </div>

                {/* Content */}
                <div className={`p-6 flex-1 ${viewMode === 'list' ? 'flex flex-col justify-between' : ''}`}>
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-[#2D2D2D] mb-1">{trip.destination}</h3>
                        <div className="flex items-center gap-2 text-sm text-[#2D2D2D]/60">
                          <Calendar className="w-4 h-4" />
                          <span>{trip.dates}</span>
                          <span>•</span>
                          <Clock className="w-4 h-4" />
                          <span>{trip.days} days</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold">{trip.rating}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {trip.highlights.slice(0, 3).map((highlight, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-[#8BA889]/10 rounded-full text-[#4A5D4B]">
                          {highlight}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-[#8BA889]" />
                        <span>{trip.companions} Travelers</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="w-4 h-4 text-[#8BA889]" />
                        <span>{trip.budget} Budget</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {['✈️', '🏨', '🎫'].slice(0, trip.booked.length).map((icon, idx) => (
                            <div key={idx} className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs shadow-sm">
                              {icon}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-[#2D2D2D]/60">{trip.booked.length} bookings</span>
                      </div>
                      <button className="text-[#8BA889] hover:text-[#4A5D4B] transition-colors flex items-center gap-1 text-sm font-medium">
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {selectedTrip === trip.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 bg-gradient-to-r from-[#8BA889]/5 to-[#D6C7B1]/5 rounded-2xl p-6 border border-[#D6C7B1]/20"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#8BA889]" />
                          Itinerary Highlights
                        </h4>
                        <ul className="space-y-2">
                          {trip.highlights.map((highlight, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-[#8BA889] rounded-full" />
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-[#8BA889]" />
                          Weather Forecast
                        </h4>
                        <p className="text-sm text-[#2D2D2D]/70">{trip.weather}</p>
                        <div className="mt-4 flex gap-2">
                          <button className="flex-1 px-4 py-2 bg-[#8BA889] text-white rounded-lg text-sm font-medium hover:bg-[#4A5D4B] transition-all">
                            Share Itinerary
                          </button>
                          <button className="px-4 py-2 border border-[#8BA889] text-[#4A5D4B] rounded-lg text-sm font-medium hover:bg-[#8BA889]/10 transition-all">
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {trips.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-[#8BA889]/10 to-[#D6C7B1]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Compass className="w-12 h-12 text-[#8BA889]" />
            </div>
            <h3 className="text-2xl font-serif mb-2">No trips yet</h3>
            <p className="text-[#2D2D2D]/60 mb-6">Start planning your first adventure with BhramanAI</p>
            <button className="btn-primary mx-auto">
              Plan Your First Trip
            </button>
          </motion.div>
        )}
      </div>

      <style>{`
        .btn-primary {
          background: linear-gradient(135deg, #4A5D4B 0%, #8BA889 100%);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(74, 93, 75, 0.3);
        }
      `}</style>
    </div>
  );
};

export default TripPage;