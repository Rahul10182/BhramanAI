import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hotel, MapPin, Star, Clock, Tag, CheckCircle2,
  RefreshCw, ArrowLeft, Wallet, Users, Calendar,
  Sparkles, AlertCircle, Building2, Compass, ArrowRightLeft, X
} from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../../apis/authApi';
import { tripApi } from '../../apis/tripApi';
import { Loader2, Plus } from 'lucide-react';

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

interface SwapModeInfo {
  isActive: boolean;
  dayId: string;
  dayNumber: number;
  activityIndex: number;
  originalActivity: any;
}

const RecommendationPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const addToDayId = (location.state as any)?.addToDayId || null;
  const addToDayNumber = (location.state as any)?.addToDayNumber || null;
  const swapMode = (location.state as any)?.swapMode || null;
  const [isSwapMode, setIsSwapMode] = useState<SwapModeInfo | null>(swapMode);

  const [hotels, setHotels] = useState<HotelData[]>([]);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [trip, setTrip] = useState<TripInfo | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [timeConflictError, setTimeConflictError] = useState<string | null>(null);

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

  const parseTimeToMinutes = (timeStr: string): number => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return -1;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3]?.toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const formatMinutesToTime = (minutes: number): string => {
    // Ensure minutes is within valid range
    minutes = Math.max(480, Math.min(1320, minutes)); // Clamp between 8 AM and 10 PM
    const hours24 = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const hours12 = hours24 % 12 || 12;
    const ampm = hours24 >= 12 ? 'PM' : 'AM';
    return `${hours12}:${mins.toString().padStart(2, '0')} ${ampm}`;
  };

  // NEW IMPROVED ALGORITHM - Will always find a slot or show clear reason
  const findOptimalTimeSlot = (
    existingActivities: any[],
    newDurationMinutes: number,
    preferredTimeMinutes?: number
  ): { startTime: number; activitiesToShift: Map<number, number> } => {
    
    if (!existingActivities.length) {
      const defaultStart = preferredTimeMinutes || 10 * 60;
      return { startTime: Math.max(480, Math.min(1320 - newDurationMinutes, defaultStart)), activitiesToShift: new Map() };
    }

    const buffer = 30;
    const dayStart = 8 * 60; // 8:00 AM
    const dayEnd = 22 * 60; // 10:00 PM
    
    // Parse all activities
    const parsedActivities = existingActivities.map((act, idx) => ({
      index: idx,
      start: parseTimeToMinutes(act.time),
      end: parseTimeToMinutes(act.time) + (act.durationMinutes || 60),
      originalStart: parseTimeToMinutes(act.time),
      originalEnd: parseTimeToMinutes(act.time) + (act.durationMinutes || 60)
    })).sort((a, b) => a.start - b.start);
    
    // Try various strategies
    
    // Strategy 1: Try preferred time
    if (preferredTimeMinutes) {
      const result = tryInsertAtTime(parsedActivities, preferredTimeMinutes, newDurationMinutes, buffer, dayStart, dayEnd);
      if (result.success) return result;
    }
    
    // Strategy 2: Try inserting between activities
    for (let i = 0; i <= parsedActivities.length; i++) {
      let proposedStart;
      if (i === 0) {
        proposedStart = dayStart;
      } else {
        proposedStart = parsedActivities[i-1].end + buffer;
      }
      
      // Check if it fits before next activity or at end
      const nextStart = i < parsedActivities.length ? parsedActivities[i].start - buffer : dayEnd;
      
      if (proposedStart <= nextStart && proposedStart + newDurationMinutes <= dayEnd) {
        // Try to fit at proposedStart
        const result = tryInsertAtTime(parsedActivities, proposedStart, newDurationMinutes, buffer, dayStart, dayEnd);
        if (result.success) return result;
      }
    }
    
    // Strategy 3: Try compressing existing activities (reduce buffers to 15 min)
    const compressedBuffer = 15;
    for (let i = 0; i <= parsedActivities.length; i++) {
      let proposedStart;
      if (i === 0) {
        proposedStart = dayStart;
      } else {
        proposedStart = parsedActivities[i-1].end + compressedBuffer;
      }
      
      const nextStart = i < parsedActivities.length ? parsedActivities[i].start - compressedBuffer : dayEnd;
      
      if (proposedStart + newDurationMinutes <= nextStart && proposedStart + newDurationMinutes <= dayEnd) {
        // Shift all later activities to use compressed buffer
        const activitiesToShift = new Map<number, number>();
        let cumulativeShift = 0;
        
        for (let j = i; j < parsedActivities.length; j++) {
          const newStart = proposedStart + newDurationMinutes + compressedBuffer + cumulativeShift;
          if (newStart + (parsedActivities[j].durationMinutes || 60) > dayEnd) {
            break;
          }
          activitiesToShift.set(parsedActivities[j].index, newStart);
          cumulativeShift += (parsedActivities[j].durationMinutes || 60) + compressedBuffer;
        }
        
        if (activitiesToShift.size === parsedActivities.length - i) {
          return { startTime: proposedStart, activitiesToShift };
        }
      }
    }
    
    // Strategy 4: Put at end of day
    const lastActivity = parsedActivities[parsedActivities.length - 1];
    const endTime = lastActivity.end + buffer;
    if (endTime + newDurationMinutes <= dayEnd) {
      return { startTime: endTime, activitiesToShift: new Map() };
    }
    
    // Strategy 5: Force insert by compressing everything (minimum 10 min buffers)
    const minBuffer = 10;
    let currentTime = dayStart;
    const activitiesToShift = new Map<number, number>();
    let allFit = true;
    
    for (let i = 0; i < parsedActivities.length; i++) {
      if (currentTime + (parsedActivities[i].durationMinutes || 60) > dayEnd) {
        allFit = false;
        break;
      }
      
      if (parsedActivities[i].originalStart !== currentTime) {
        activitiesToShift.set(parsedActivities[i].index, currentTime);
      }
      
      currentTime += (parsedActivities[i].durationMinutes || 60) + minBuffer;
    }
    
    // Try to insert new activity after shifting
    if (allFit) {
      for (let i = 0; i <= parsedActivities.length; i++) {
        let insertTime = dayStart;
        for (let j = 0; j < i; j++) {
          insertTime += (parsedActivities[j].durationMinutes || 60) + minBuffer;
        }
        
        if (insertTime + newDurationMinutes <= dayEnd) {
          // Shift all activities after i
          const shiftMap = new Map<number, number>();
          let shiftAmount = newDurationMinutes + minBuffer;
          
          for (let j = i; j < parsedActivities.length; j++) {
            const newStart = insertTime + (j === i ? newDurationMinutes + minBuffer : shiftAmount);
            shiftMap.set(parsedActivities[j].index, newStart);
            shiftAmount += (parsedActivities[j].durationMinutes || 60) + minBuffer;
          }
          
          return { startTime: insertTime, activitiesToShift: shiftMap };
        }
      }
    }
    
    // Final resort: Show error
    return { startTime: -1, activitiesToShift: new Map() };
  };

  const tryInsertAtTime = (
    activities: any[],
    proposedStart: number,
    duration: number,
    buffer: number,
    dayStart: number,
    dayEnd: number
  ): { success: boolean; startTime: number; activitiesToShift: Map<number, number> } => {
    
    const proposedEnd = proposedStart + duration;
    
    // Check boundary
    if (proposedStart < dayStart || proposedEnd > dayEnd) {
      return { success: false, startTime: -1, activitiesToShift: new Map() };
    }
    
    // Check conflicts and calculate shifts
    const activitiesToShift = new Map<number, number>();
    let needsShift = false;
    let currentTime = proposedEnd + buffer;
    
    for (const activity of activities) {
      if (activity.start >= proposedStart && activity.start < proposedEnd) {
        return { success: false, startTime: -1, activitiesToShift: new Map() }; // Direct conflict
      }
      
      if (activity.start >= proposedEnd) {
        if (currentTime > activity.start) {
          needsShift = true;
          if (currentTime + (activity.durationMinutes || 60) > dayEnd) {
            return { success: false, startTime: -1, activitiesToShift: new Map() };
          }
          if (activity.originalStart !== currentTime) {
            activitiesToShift.set(activity.index, currentTime);
          }
          currentTime += (activity.durationMinutes || 60) + buffer;
        } else {
          if (needsShift) {
            if (currentTime + (activity.durationMinutes || 60) > dayEnd) {
              return { success: false, startTime: -1, activitiesToShift: new Map() };
            }
            if (activity.originalStart !== currentTime) {
              activitiesToShift.set(activity.index, currentTime);
            }
          }
          currentTime = activity.end + buffer;
        }
      }
    }
    
    return { success: true, startTime: proposedStart, activitiesToShift };
  };

  // Apply shifts to activities
  const applyShifts = (activities: any[], shifts: Map<number, number>): any[] => {
    const updated = [...activities];
    for (const [index, newTime] of shifts.entries()) {
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          time: formatMinutesToTime(newTime)
        };
      }
    }
    return updated;
  };

  const handleConfirmSelections = async () => {
    if (!tripId) return;
    setIsConfirming(true);
    setTimeConflictError(null);
    
    try {
      const itinerary = await tripApi.getItinerary(tripId);

      if (isSwapMode) {
        // SWAP MODE
        const targetDay = itinerary.find((d: any) => d._id === isSwapMode.dayId);
        if (!targetDay) {
          setError('Target day not found');
          setIsConfirming(false);
          return;
        }

        let currentActivities = [...targetDay.activities];
        let newActivity = null;

        if (selectedHotel) {
          const hotel = hotels.find(h => h.id === selectedHotel);
          if (hotel) {
            const duration = 720; // 12 hours for hotel
            const otherActivities = currentActivities.filter((_, idx) => idx !== isSwapMode.activityIndex);
            const originalTime = parseTimeToMinutes(currentActivities[isSwapMode.activityIndex]?.time);
            
            const { startTime, activitiesToShift } = findOptimalTimeSlot(
              otherActivities,
              duration,
              originalTime
            );
            
            if (startTime === -1) {
              setTimeConflictError('This day is too packed. Please try a different day or remove some activities first.');
              setIsConfirming(false);
              return;
            }
            
            let updatedActivities = [...currentActivities];
            if (activitiesToShift.size > 0) {
              updatedActivities = applyShifts(updatedActivities, activitiesToShift);
            }
            
            newActivity = {
              time: formatMinutesToTime(startTime),
              title: `Stay at ${hotel.name}`,
              description: hotel.description,
              location: hotel.location || trip?.destination || '',
              category: 'hotel',
              estimatedCost: hotel.price,
              aiGenerated: false,
              durationMinutes: duration,
            };
            
            updatedActivities[isSwapMode.activityIndex] = newActivity;
            currentActivities = updatedActivities;
          }
        } else if (selectedActivities.size > 0) {
          const selectedAct = activities.find(a => selectedActivities.has(a.id));
          if (selectedAct) {
            const duration = selectedAct.duration ? parseInt(selectedAct.duration) || 60 : 60;
            const otherActivities = currentActivities.filter((_, idx) => idx !== isSwapMode.activityIndex);
            const originalTime = parseTimeToMinutes(currentActivities[isSwapMode.activityIndex]?.time);
            
            const { startTime, activitiesToShift } = findOptimalTimeSlot(
              otherActivities,
              duration,
              originalTime
            );
            
            if (startTime === -1) {
              setTimeConflictError(`This day is too packed. Please try a different activity or remove some activities first.`);
              setIsConfirming(false);
              return;
            }
            
            let updatedActivities = [...currentActivities];
            if (activitiesToShift.size > 0) {
              updatedActivities = applyShifts(updatedActivities, activitiesToShift);
            }
            
            newActivity = {
              time: formatMinutesToTime(startTime),
              title: selectedAct.name,
              description: selectedAct.description,
              location: trip?.destination || '',
              category: selectedAct.category || 'attraction',
              estimatedCost: selectedAct.price || 0,
              aiGenerated: false,
              durationMinutes: duration,
            };
            
            updatedActivities[isSwapMode.activityIndex] = newActivity;
            currentActivities = updatedActivities;
          }
        }

        if (!newActivity) {
          setError('Please select a hotel or activity to swap with');
          setIsConfirming(false);
          return;
        }

        // Sort and save
        currentActivities.sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
        const actualDailySpent = currentActivities.reduce((s: number, a: any) => s + (Number(a.estimatedCost) || 0), 0);
        
        await tripApi.updateItineraryDay(isSwapMode.dayId, {
          activities: currentActivities,
          dailyBudget: actualDailySpent,
        });
        
        navigate(`/trip/${tripId}`);
      } else {
        // ADD MODE
        let targetDay: any = null;
        if (addToDayId) {
          targetDay = itinerary.find((d: any) => d._id === addToDayId);
        }
        if (!targetDay && itinerary.length > 0) {
          targetDay = itinerary[0];
        }
        if (!targetDay) {
          setError('No itinerary day found to add activities to.');
          setIsConfirming(false);
          return;
        }

        let currentActivities = [...targetDay.activities];
        const allNewActivities: any[] = [];
        let globalShifts = new Map<number, number>();

        // Add hotel if selected
        if (selectedHotel) {
          const hotel = hotels.find(h => h.id === selectedHotel);
          if (hotel) {
            const duration = 720;
            const { startTime, activitiesToShift } = findOptimalTimeSlot(currentActivities, duration);
            
            if (startTime === -1) {
              setTimeConflictError('This day is too full for a hotel stay. Try a different day or remove some activities.');
              setIsConfirming(false);
              return;
            }
            
            // Merge shifts
            for (const [idx, newTime] of activitiesToShift) {
              globalShifts.set(idx, newTime);
            }
            
            allNewActivities.push({
              time: formatMinutesToTime(startTime),
              title: `Check-in at ${hotel.name}`,
              description: hotel.description,
              location: hotel.location || trip?.destination || '',
              category: 'hotel',
              estimatedCost: hotel.price,
              aiGenerated: false,
              durationMinutes: duration,
            });
            
            // Add temporary placeholder for scheduling next activities
            currentActivities.push({
              time: formatMinutesToTime(startTime),
              durationMinutes: duration
            });
          }
        }

        // Add selected activities
        const selActs = activities.filter(a => selectedActivities.has(a.id));
        for (const act of selActs) {
          const duration = act.duration ? parseInt(act.duration) || 60 : 60;
          const { startTime, activitiesToShift } = findOptimalTimeSlot(currentActivities, duration);
          
          if (startTime === -1) {
            setTimeConflictError(`Cannot add "${act.name}". Try selecting fewer activities or a different combination.`);
            setIsConfirming(false);
            return;
          }
          
          for (const [idx, newTime] of activitiesToShift) {
            globalShifts.set(idx, newTime);
          }
          
          allNewActivities.push({
            time: formatMinutesToTime(startTime),
            title: act.name,
            description: act.description,
            location: trip?.destination || '',
            category: act.category || 'attraction',
            estimatedCost: act.price || 0,
            aiGenerated: false,
            durationMinutes: duration,
          });
          
          currentActivities.push({
            time: formatMinutesToTime(startTime),
            durationMinutes: duration
          });
        }

        // Apply all shifts
        let finalActivities = [...targetDay.activities];
        if (globalShifts.size > 0) {
          finalActivities = applyShifts(finalActivities, globalShifts);
        }
        
        // Add new activities
        finalActivities.push(...allNewActivities);
        
        // Sort chronologically
        finalActivities.sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
        
        // Calculate budget
        const actualDailySpent = finalActivities.reduce((s: number, a: any) => s + (Number(a.estimatedCost) || 0), 0);
        
        const dayId = targetDay._id || targetDay.id;
        await tripApi.updateItineraryDay(dayId, {
          activities: finalActivities,
          dailyBudget: actualDailySpent,
        });

        navigate(`/trip/${tripId}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add/swap activities.');
    } finally {
      setIsConfirming(false);
    }
  };

  const toggleActivity = (id: string) => {
    if (isSwapMode && selectedActivities.size > 0 && !selectedActivities.has(id)) {
      setSelectedActivities(new Set([id]));
    } else {
      setSelectedActivities(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }
  };

  const handleHotelSelect = (id: string) => {
    setSelectedHotel(id);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

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
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#8BA889]/8 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D6C7B1]/15 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#2D2D2D]/60 hover:text-[#2D2D2D] mb-4 transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Trip
          </button>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-[#D6C7B1]/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#4A5D4B] to-[#8BA889] rounded-xl flex items-center justify-center shadow-md">
                    {isSwapMode ? <ArrowRightLeft className="w-5 h-5 text-white" /> : <Sparkles className="w-5 h-5 text-white" />}
                  </div>
                  <h1 className="text-3xl font-bold text-[#2D2D2D] tracking-tight">
                    {isSwapMode ? 'Swap Activity' : `Recommendations for ${trip?.destination || 'Your Trip'}`}
                  </h1>
                </div>
                {isSwapMode && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 rounded-xl border border-blue-200">
                    <ArrowRightLeft size={16} className="text-blue-600" />
                    <p className="text-sm text-blue-700">
                      Swapping: <span className="font-semibold">{isSwapMode.originalActivity?.title}</span> on Day {isSwapMode.dayNumber}
                    </p>
                    <button 
                      onClick={() => setIsSwapMode(null)}
                      className="ml-2 p-1 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <X size={14} className="text-blue-600" />
                    </button>
                  </div>
                )}
                {trip && !isSwapMode && (
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

        <AnimatePresence>
          {timeConflictError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3"
            >
              <AlertCircle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-yellow-800 mb-1">Schedule is Full</p>
                <p className="text-sm text-yellow-700">{timeConflictError}</p>
              </div>
              <button onClick={() => setTimeConflictError(null)} className="text-yellow-500 hover:text-yellow-700">
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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
                  onClick={() => handleHotelSelect(hotel.id)}
                  className={`bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${selectedHotel === hotel.id ? 'border-[#4A5D4B] shadow-lg shadow-[#4A5D4B]/10' : 'border-transparent'
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
                          onClick={(e) => { e.stopPropagation(); handleHotelSelect(hotel.id); }}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedHotel === hotel.id
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
                <p className="text-sm text-[#2D2D2D]/60">
                  {activities.length} experiences available
                  {isSwapMode && <span className="text-blue-600 ml-2">(Select one to swap)</span>}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {activities.map((activity, idx) => {
                const isSelected = selectedActivities.has(activity.id);
                return (
                  <motion.div key={activity.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                    onClick={() => toggleActivity(activity.id)}
                    className={`bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isSelected ? 'border-[#4A5D4B] shadow-lg shadow-[#4A5D4B]/10' : 'border-transparent'
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
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${isSelected
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

        <AnimatePresence>
          {(selectedHotel || selectedActivities.size > 0) && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#D6C7B1]/30 px-6 py-4 flex items-center gap-6 max-w-2xl w-[calc(100%-2rem)]">
              <div className="flex-1">
                <p className="text-sm font-bold text-[#2D2D2D]">
                  {isSwapMode ? (
                    `Swapping activity on Day ${isSwapMode.dayNumber}`
                  ) : (
                    addToDayNumber ? `Adding to Day ${addToDayNumber}` : 'General Addition'
                  )}
                  {' · '}
                  {selectedHotel ? '1 hotel' : 'No hotel'} 
                  {' · '}
                  {selectedActivities.size} activit{selectedActivities.size === 1 ? 'y' : 'ies'} selected
                </p>
                <p className="text-xs text-[#2D2D2D]/50">
                  Activities will be automatically scheduled with smart time management
                </p>
              </div>
              <button
                onClick={handleConfirmSelections}
                disabled={isConfirming}
                className="px-6 py-3 bg-gradient-to-r from-[#4A5D4B] to-[#8BA889] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isConfirming ? <Loader2 size={18} className="animate-spin" /> : (isSwapMode ? <ArrowRightLeft size={18} /> : <Plus size={18} />)}
                {isSwapMode ? 'Confirm Swap' : 'Confirm Selections'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RecommendationPage;