import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hotel, MapPin, Star, Clock, Tag, CheckCircle2,
  RefreshCw, ArrowLeft, Wallet, Users, Calendar,
  Sparkles, AlertCircle, Building2, Compass,
  ShieldX, MapPinOff, WifiOff, ServerCrash, LogIn, Home
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

type ErrorType = 'unauthorized' | 'not_found' | 'network' | 'server' | 'generic';

const getErrorType = (status?: number, errorMsg?: string): ErrorType => {
  if (status === 401 || status === 403) return 'unauthorized';
  if (status === 404) return 'not_found';
  if (status === 0 || errorMsg?.toLowerCase().includes('network')) return 'network';
  if (status && status >= 500) return 'server';
  return 'generic';
};

// ── Error Screen Component ──
const ErrorScreen: React.FC<{
  errorType: ErrorType; errorMsg: string;
  onRetry: () => void; navigate: ReturnType<typeof useNavigate>;
}> = ({ errorType, errorMsg, onRetry, navigate }) => {
  const configs: Record<ErrorType, {
    icon: React.ElementType; title: string; desc: string;
    gradient: string; iconColor: string; bgColor: string; borderColor: string;
    primaryAction: { label: string; icon: React.ElementType; onClick: () => void };
    secondaryAction?: { label: string; icon: React.ElementType; onClick: () => void };
  }> = {
    unauthorized: {
      icon: ShieldX, title: 'Authentication Required',
      desc: 'You need to sign in to view trip recommendations. Your session may have expired.',
      gradient: 'from-amber-500 to-orange-500', iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50', borderColor: 'border-amber-100',
      primaryAction: { label: 'Sign In', icon: LogIn, onClick: () => navigate('/login', { state: { from: window.location.pathname } }) },
      secondaryAction: { label: 'Go Home', icon: Home, onClick: () => navigate('/') },
    },
    not_found: {
      icon: MapPinOff, title: 'Trip Not Found',
      desc: "This trip doesn't exist or may have been deleted. Double-check the link or browse your trips.",
      gradient: 'from-rose-500 to-pink-500', iconColor: 'text-rose-500',
      bgColor: 'bg-rose-50', borderColor: 'border-rose-100',
      primaryAction: { label: 'My Trips', icon: Compass, onClick: () => navigate('/trips') },
      secondaryAction: { label: 'Go Back', icon: ArrowLeft, onClick: () => navigate(-1) },
    },
    network: {
      icon: WifiOff, title: 'Connection Lost',
      desc: "Can't reach the server. Check your internet connection and try again.",
      gradient: 'from-slate-500 to-gray-600', iconColor: 'text-slate-500',
      bgColor: 'bg-slate-50', borderColor: 'border-slate-100',
      primaryAction: { label: 'Retry', icon: RefreshCw, onClick: onRetry },
      secondaryAction: { label: 'Go Back', icon: ArrowLeft, onClick: () => navigate(-1) },
    },
    server: {
      icon: ServerCrash, title: 'Server Error',
      desc: 'Something went wrong on our end. Our team has been notified. Please try again shortly.',
      gradient: 'from-violet-500 to-purple-600', iconColor: 'text-violet-500',
      bgColor: 'bg-violet-50', borderColor: 'border-violet-100',
      primaryAction: { label: 'Retry', icon: RefreshCw, onClick: onRetry },
      secondaryAction: { label: 'Go Back', icon: ArrowLeft, onClick: () => navigate(-1) },
    },
    generic: {
      icon: AlertCircle, title: 'Something Went Wrong',
      desc: errorMsg || 'An unexpected error occurred. Please try again.',
      gradient: 'from-red-500 to-rose-500', iconColor: 'text-red-500',
      bgColor: 'bg-red-50', borderColor: 'border-red-100',
      primaryAction: { label: 'Retry', icon: RefreshCw, onClick: onRetry },
      secondaryAction: { label: 'Go Back', icon: ArrowLeft, onClick: () => navigate(-1) },
    },
  };

  const config = configs[errorType];
  const IconComp = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFCFB] via-white to-[#D6C7B1]/10 flex items-center justify-center p-4">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-[#8BA889]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] left-[15%] w-[350px] h-[350px] bg-[#D6C7B1]/12 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`relative bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border ${config.borderColor}`}
      >
        {/* Decorative top gradient bar */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r ${config.gradient} rounded-b-full`} />

        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className={`w-20 h-20 ${config.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-${config.bgColor}/50`}
        >
          <IconComp className={`w-10 h-10 ${config.iconColor}`} />
        </motion.div>

        <h2 className="text-2xl font-bold text-[#2D2D2D] mb-3 tracking-tight">{config.title}</h2>
        <p className="text-[#2D2D2D]/55 mb-8 leading-relaxed">{config.desc}</p>

        {errorType === 'unauthorized' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="mb-6 px-4 py-3 bg-amber-50/80 border border-amber-200/50 rounded-xl"
          >
            <p className="text-xs text-amber-700/80 flex items-center justify-center gap-1.5">
              <ShieldX size={12} /> Your data is safe — sign in to continue
            </p>
          </motion.div>
        )}

        {errorType === 'not_found' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="mb-6 px-4 py-3 bg-rose-50/80 border border-rose-200/50 rounded-xl"
          >
            <p className="text-xs text-rose-600/80">Error 404 — The requested trip resource does not exist</p>
          </motion.div>
        )}

        <div className="flex gap-3 justify-center">
          {config.secondaryAction && (
            <button
              onClick={config.secondaryAction.onClick}
              className="group flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-2xl font-semibold text-[#2D2D2D]/80 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
            >
              <config.secondaryAction.icon size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              {config.secondaryAction.label}
            </button>
          )}
          <button
            onClick={config.primaryAction.onClick}
            className={`group flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${config.gradient} text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300`}
          >
            <config.primaryAction.icon size={16} />
            {config.primaryAction.label}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Main RecommendationPage ──
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
  const [errorStatus, setErrorStatus] = useState<number | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (tripId) fetchRecommendations();
  }, [tripId]);

  const fetchRecommendations = async () => {
    setIsLoading(true); setError(''); setErrorStatus(undefined);
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
      setErrorStatus(result.status);
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
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[#8BA889]/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#4A5D4B] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#4A5D4B]/50" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#2D2D2D] mb-2">Finding Best Options</h2>
          <p className="text-[#2D2D2D]/60">Searching hotels & activities for your destination...</p>
        </motion.div>
      </div>
    );
  }

  // --- Error (contextual) ---
  if (error) {
    const errorType = getErrorType(errorStatus, error);
    return <ErrorScreen errorType={errorType} errorMsg={error} onRetry={fetchRecommendations} navigate={navigate} />;
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
