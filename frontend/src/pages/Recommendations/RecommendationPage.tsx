import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hotel, MapPin, Star, Clock, Tag, CheckCircle2,
  RefreshCw, ArrowLeft, Wallet, Users, Calendar,
  Sparkles, AlertCircle, Building2, Compass
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { authApi } from '../../apis/authApi';

interface HotelData {
  id: string; name: string; price: number; rating: number;
  image: string; location: string; amenities: string[]; description: string;
}
interface ActivityData {
  id: string; name: string; description: string; duration: string;
  image: string; category: string; price: number;
}
interface TripInfo {
  id: string; destination: string; startDate: string; endDate: string;
  budget: number; travelers: number; travelStyle: string;
}

const RecommendationPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState<HotelData[]>([]);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [trip, setTrip] = useState<TripInfo | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (tripId) fetchRecommendations();
  }, [tripId]);

  const fetchRecommendations = async () => {
    setIsLoading(true); setError('');
    const result = await authApi.getRecommendations(tripId!);
    if (result.success && result.data) {
      setHotels(result.data.hotels || []);
      setActivities(result.data.activities || []);
      setTrip(result.data.trip || null);
      if (result.data.hotels?.length) setSelectedHotel(result.data.hotels[0].id);
      if (result.data.activities?.length) {
        setSelectedActivities(new Set(result.data.activities.slice(0, 2).map((a: ActivityData) => a.id)));
      }
    } else {
      setError(result.error || 'Failed to load recommendations');
    }
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRecommendations();
    setIsRefreshing(false);
  };

  const toggleActivity = (id: string) => {
    setSelectedActivities(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // --- Loading ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FDFCFB] via-white to-[#D6C7B1]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[#8BA889]/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#4A5D4B] animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-[#2D2D2D] mb-2">Finding Best Options</h2>
          <p className="text-[#2D2D2D]/60">Searching hotels & activities for your destination...</p>
        </div>
      </div>
    );
  }

  // --- Error ---
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FDFCFB] via-white to-[#D6C7B1]/10 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-[#2D2D2D] mb-2">Something Went Wrong</h2>
          <p className="text-[#2D2D2D]/60 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate(-1)} className="px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors">Go Back</button>
            <button onClick={fetchRecommendations} className="px-6 py-3 bg-gradient-to-r from-[#4A5D4B] to-[#8BA889] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all">Retry</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFCFB] via-white to-[#D6C7B1]/10">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#8BA889]/8 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D6C7B1]/15 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#2D2D2D]/60 hover:text-[#2D2D2D] mb-4 transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Trip
          </button>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-[#D6C7B1]/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#4A5D4B] to-[#8BA889] rounded-xl flex items-center justify-center shadow-md">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-[#2D2D2D] tracking-tight">
                    Recommendations for <span className="text-[#4A5D4B]">{trip?.destination || 'Your Trip'}</span>
                  </h1>
                </div>
                {trip && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    <span className="flex items-center gap-1.5 text-sm px-3 py-1 bg-[#8BA889]/10 rounded-full text-[#4A5D4B] font-medium">
                      <Calendar size={14} /> {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm px-3 py-1 bg-[#8BA889]/10 rounded-full text-[#4A5D4B] font-medium">
                      <Wallet size={14} /> ₹{trip.budget?.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm px-3 py-1 bg-[#8BA889]/10 rounded-full text-[#4A5D4B] font-medium">
                      <Users size={14} /> {trip.travelers} traveler{trip.travelers > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
              <button onClick={handleRefresh} disabled={isRefreshing}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#D6C7B1]/40 rounded-xl font-medium text-[#2D2D2D] hover:shadow-md transition-all disabled:opacity-50">
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Split Screen: Hotels | Activities */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* LEFT — Hotels */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#2D2D2D]">Hotels</h2>
                <p className="text-sm text-[#2D2D2D]/60">{hotels.length} options found</p>
              </div>
            </div>

            <div className="space-y-4">
              {hotels.map((hotel, idx) => (
                <motion.div key={hotel.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  onClick={() => setSelectedHotel(hotel.id)}
                  className={`bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    selectedHotel === hotel.id ? 'border-[#4A5D4B] shadow-lg shadow-[#4A5D4B]/10' : 'border-transparent'
                  }`}>
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative w-full sm:w-44 h-40 sm:h-auto flex-shrink-0">
                      <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                      {selectedHotel === hotel.id && (
                        <div className="absolute top-3 left-3 w-8 h-8 bg-[#4A5D4B] rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle2 size={16} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-[#2D2D2D] leading-tight">{hotel.name}</h3>
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg flex-shrink-0 ml-2">
                          <Star size={14} className="text-amber-500 fill-amber-500" />
                          <span className="text-sm font-bold text-amber-700">{hotel.rating}</span>
                        </div>
                      </div>
                      <p className="flex items-center gap-1 text-sm text-[#2D2D2D]/60 mb-2">
                        <MapPin size={13} /> {hotel.location}
                      </p>
                      {hotel.description && (
                        <p className="text-sm text-[#2D2D2D]/50 mb-3 line-clamp-2">{hotel.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {hotel.amenities.slice(0, 4).map((a, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 rounded-md text-[#2D2D2D]/70 font-medium">{a}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-[#4A5D4B]">₹{hotel.price.toLocaleString()}</span>
                          <span className="text-sm text-[#2D2D2D]/50 ml-1">/night</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedHotel(hotel.id); }}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            selectedHotel === hotel.id
                              ? 'bg-[#4A5D4B] text-white shadow-md'
                              : 'bg-gray-100 text-[#2D2D2D] hover:bg-[#8BA889]/20'
                          }`}>
                          {selectedHotel === hotel.id ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {hotels.length === 0 && (
                <div className="text-center py-12 text-[#2D2D2D]/50">
                  <Building2 size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No hotel recommendations available.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* RIGHT — Activities */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center shadow-md">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#2D2D2D]">Activities</h2>
                <p className="text-sm text-[#2D2D2D]/60">{activities.length} experiences available</p>
              </div>
            </div>

            <div className="space-y-4">
              {activities.map((activity, idx) => {
                const isSelected = selectedActivities.has(activity.id);
                return (
                  <motion.div key={activity.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                    onClick={() => toggleActivity(activity.id)}
                    className={`bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                      isSelected ? 'border-[#4A5D4B] shadow-lg shadow-[#4A5D4B]/10' : 'border-transparent'
                    }`}>
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative w-full sm:w-44 h-40 sm:h-auto flex-shrink-0">
                        <img src={activity.image} alt={activity.name} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute top-3 left-3 w-8 h-8 bg-[#4A5D4B] rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle2 size={16} className="text-white" />
                          </div>
                        )}
                        <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs font-bold">
                          {activity.category}
                        </div>
                      </div>
                      <div className="flex-1 p-5">
                        <h3 className="text-lg font-bold text-[#2D2D2D] mb-1">{activity.name}</h3>
                        <p className="text-sm text-[#2D2D2D]/60 mb-3 line-clamp-2">{activity.description}</p>
                        <div className="flex items-center gap-4 mb-3">
                          <span className="flex items-center gap-1 text-sm text-[#2D2D2D]/60">
                            <Clock size={14} className="text-[#8BA889]" /> {activity.duration}
                          </span>
                          {activity.price > 0 && (
                            <span className="flex items-center gap-1 text-sm text-[#2D2D2D]/60">
                              <Tag size={14} className="text-[#8BA889]" /> ₹{activity.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleActivity(activity.id); }}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            isSelected
                              ? 'bg-[#4A5D4B] text-white shadow-md'
                              : 'bg-gray-100 text-[#2D2D2D] hover:bg-[#8BA889]/20'
                          }`}>
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {activities.length === 0 && (
                <div className="text-center py-12 text-[#2D2D2D]/50">
                  <Compass size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No activity recommendations available.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Bottom Summary Bar */}
        <AnimatePresence>
          {(selectedHotel || selectedActivities.size > 0) && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#D6C7B1]/30 px-6 py-4 flex items-center gap-6 max-w-2xl w-[calc(100%-2rem)]">
              <div className="flex-1">
                <p className="text-sm font-bold text-[#2D2D2D]">
                  {selectedHotel ? '1 hotel' : 'No hotel'} · {selectedActivities.size} activit{selectedActivities.size === 1 ? 'y' : 'ies'} selected
                </p>
                <p className="text-xs text-[#2D2D2D]/50">Review your selections before confirming</p>
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-[#4A5D4B] to-[#8BA889] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                Confirm Selections
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RecommendationPage;
