// pages/Trip/TripDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Calendar, Users, Wallet, Sun, CloudRain, Cloud, Snowflake,
  Clock, Plane, Hotel, Utensils, Camera, Car, TreePalm, ShoppingBag, Mountain,
  ArrowRightLeft, Pencil, Trash2, Check, X, Loader2, Sparkles, ChevronRight, Plus, AlertTriangle
} from 'lucide-react';
import { tripApi } from '../../apis/tripApi';
import type { TripDetail, ItineraryDayDetail, ActivityDetail } from '../../apis/tripApi';
import ActivitySwapModal from '../../components/trip/ActivitySwapModal';

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; gradient: string; label: string }> = {
  flight: { icon: Plane, gradient: 'from-blue-500 to-blue-600', label: 'Flight' },
  hotel: { icon: Hotel, gradient: 'from-violet-500 to-purple-600', label: 'Stay' },
  food: { icon: Utensils, gradient: 'from-amber-500 to-orange-600', label: 'Dining' },
  attraction: { icon: Camera, gradient: 'from-pink-500 to-rose-600', label: 'Sightseeing' },
  transport: { icon: Car, gradient: 'from-cyan-500 to-sky-600', label: 'Transport' },
  leisure: { icon: TreePalm, gradient: 'from-emerald-500 to-green-600', label: 'Relax' },
  shopping: { icon: ShoppingBag, gradient: 'from-orange-500 to-amber-600', label: 'Shopping' },
  other: { icon: Mountain, gradient: 'from-slate-500 to-slate-600', label: 'Activity' },
};

const getWeatherIcon = (condition?: string) => {
  if (!condition) return Sun;
  const c = condition.toLowerCase();
  if (c.includes('rain') || c.includes('shower')) return CloudRain;
  if (c.includes('snow')) return Snowflake;
  if (c.includes('cloud') || c.includes('overcast')) return Cloud;
  return Sun;
};

const TripDetailPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryDayDetail[]>([]);
  const [activeDay, setActiveDay] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Swap modal state
  const [swapModal, setSwapModal] = useState<{
    isOpen: boolean; dayId: string; activityIndex: number; activity: ActivityDetail;
  }>({ isOpen: false, dayId: '', activityIndex: 0, activity: {} as ActivityDetail });

  // Inline edit state
  const [editingActivity, setEditingActivity] = useState<{ dayId: string; idx: number } | null>(null);
  const [editForm, setEditForm] = useState<Partial<ActivityDetail>>({});

  // Trip info editing
  const [editingTrip, setEditingTrip] = useState(false);
  const [tripForm, setTripForm] = useState<{
    travelers: number; budget: number; travelStyle: string; status: string;
    start_date: string; endDate: string;
  }>({
    travelers: 1, budget: 0, travelStyle: 'balanced', status: 'planning',
    start_date: '', endDate: '',
  });
  const [tripSaving, setTripSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const [overlapError, setOverlapError] = useState<string | null>(null);

  // Calculate total spent by summing actual activity costs across all days
  const totalSpent = itinerary.reduce((sum, day) => {
    const dayTotal = day.activities.reduce((daySum, activity) => 
      daySum + (Number(activity.estimatedCost) || 0), 0
    );
    return sum + dayTotal;
  }, 0);

  // Helper function to calculate daily spent from activities
  const getDailySpent = (day: ItineraryDayDetail) => {
    return day.activities.reduce((sum, activity) => sum + (Number(activity.estimatedCost) || 0), 0);
  };

  useEffect(() => {
    if (tripId) loadTripData();
  }, [tripId]);

  const loadTripData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [tripData, itineraryData] = await Promise.all([
        tripApi.getTripById(tripId!),
        tripApi.getItinerary(tripId!),
      ]);
      setTrip(tripData);
      setItinerary(itineraryData);
      if (itineraryData.length > 0) setActiveDay(itineraryData[0].dayNumber);
    } catch (err: any) {
      setError(err.message || 'Failed to load trip');
    } finally {
      setIsLoading(false);
    }
  };

  const currentDay = itinerary.find(d => d.dayNumber === activeDay);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const formatDateLong = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const handleSwapComplete = async (updatedDay: ItineraryDayDetail) => {
    // Sort chronologically and recalculate budget based on actual activities
    const sortedActivities = [...updatedDay.activities].sort((a, b) => parseTime(a.time) - parseTime(b.time));
    const actualDailySpent = sortedActivities.reduce((s, a) => s + (Number(a.estimatedCost) || 0), 0);
    
    const reorderedDay = await tripApi.updateItineraryDay(updatedDay._id, {
      activities: sortedActivities,
      dailyBudget: actualDailySpent
    });
    setItinerary(prev => prev.map(d => d._id === reorderedDay._id ? reorderedDay : d));
  };

  const handleDeleteActivity = async (dayId: string, idx: number, activities: ActivityDetail[]) => {
    try {
      const updated = await tripApi.deleteActivity(dayId, idx, activities);
      setItinerary(prev => prev.map(d => d._id === updated._id ? updated : d));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleOptimizeDay = async (dayId: string) => {
    const day = itinerary.find(d => d._id === dayId);
    if (!day) return;
    try {
      const sortedActivities = [...day.activities].sort((a, b) => parseTime(a.time) - parseTime(b.time));
      const actualDailySpent = sortedActivities.reduce((s, a) => s + (Number(a.estimatedCost) || 0), 0);
      
      const updated = await tripApi.updateItineraryDay(dayId, {
        activities: sortedActivities,
        dailyBudget: actualDailySpent
      });
      setItinerary(prev => prev.map(d => d._id === updated._id ? updated : d));
    } catch (err) {
      console.error('Optimization failed:', err);
    }
  };

  const startEdit = (dayId: string, idx: number, activity: ActivityDetail) => {
    setEditingActivity({ dayId, idx });
    setEditForm({ ...activity });
  };

  const saveEdit = async () => {
    if (!editingActivity) return;
    const day = itinerary.find(d => d._id === editingActivity.dayId);
    if (!day) return;
    setOverlapError(null);
    try {
      const updatedActivities = [...day.activities];
      updatedActivities[editingActivity.idx] = {
        ...updatedActivities[editingActivity.idx],
        ...editForm,
        aiGenerated: false,
      };

      // Auto-reorder activities chronologically before saving
      updatedActivities.sort((a, b) => parseTime(a.time) - parseTime(b.time));

      // Calculate actual spent from activities
      const actualDailySpent = updatedActivities.reduce((s, a) => s + (Number(a.estimatedCost) || 0), 0);
      
      const updated = await tripApi.updateItineraryDay(editingActivity.dayId, {
        activities: updatedActivities,
        dailyBudget: actualDailySpent,
      });
      setItinerary(prev => prev.map(d => d._id === updated._id ? updated : d));
      setEditingActivity(null);
    } catch (err: any) {
      const msg = err?.message || 'Save failed';
      if (msg.toLowerCase().includes('time conflict') || msg.toLowerCase().includes('overlap')) {
        setOverlapError(msg);
      } else {
        console.error('Save failed:', err);
      }
    }
  };

  const toInputDate = (d: string) => {
    try { return new Date(d).toISOString().split('T')[0]; } catch { return ''; }
  };

  const startEditTrip = () => {
    if (!trip) return;
    setTripForm({
      travelers: trip.travelers,
      budget: trip.budget,
      travelStyle: trip.travelStyle,
      status: trip.status,
      start_date: toInputDate(trip.start_date),
      endDate: toInputDate(trip.endDate),
    });
    setEditingTrip(true);
  };

  const saveTripEdit = async () => {
    if (!trip || !tripId) return;
    setTripSaving(true);
    try {
      // Detect if itinerary-critical fields changed → regenerate
      const datesChanged =
        toInputDate(trip.start_date) !== tripForm.start_date ||
        toInputDate(trip.endDate) !== tripForm.endDate;
      const needsRegeneration =
        datesChanged ||
        trip.travelers !== tripForm.travelers ||
        trip.budget !== tripForm.budget ||
        trip.travelStyle !== tripForm.travelStyle;

      if (needsRegeneration) {
        // Regenerate: update trip + delete old itinerary + re-run AI
        setRegenerating(true);
        const { trip: updatedTrip } = await tripApi.regenerateTrip(tripId, tripForm);
        setTrip(updatedTrip);
        setItinerary([]); // clear while AI regenerates
        setEditingTrip(false);

        // Poll until new itinerary appears (AI is running in background)
        const poll = setInterval(async () => {
          try {
            const [freshTrip, freshItinerary] = await Promise.all([
              tripApi.getTripById(tripId),
              tripApi.getItinerary(tripId),
            ]);
            setTrip(freshTrip);
            if (freshItinerary.length > 0 || freshTrip.status === 'booked' || freshTrip.status === 'failed') {
              setItinerary(freshItinerary);
              if (freshItinerary.length > 0) setActiveDay(freshItinerary[0].dayNumber);
              setRegenerating(false);
              clearInterval(poll);
            }
          } catch { /* keep polling */ }
        }, 4000);

        // Safety timeout: stop polling after 3 minutes
        setTimeout(() => { clearInterval(poll); setRegenerating(false); }, 180000);
      } else {
        // Simple update (e.g. only status changed)
        const updated = await tripApi.updateTrip(tripId, tripForm);
        setTrip(updated);
        setEditingTrip(false);
      }
    } catch (err) {
      console.error('Trip update failed:', err);
      setRegenerating(false);
    } finally {
      setTripSaving(false);
    }
  };

  const parseTime = (timeStr: string): number => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return -1;
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const ampm = match[3]?.toUpperCase();
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading your trip...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-100">
          <p className="text-red-500 mb-4">{error || 'Trip not found'}</p>
          <button onClick={() => navigate(-1)} className="px-6 py-3 bg-slate-800 text-white rounded-xl font-medium">Go Back</button>
        </div>
      </div>
    );
  }

  const WeatherIcon = currentDay?.weather ? getWeatherIcon(currentDay.weather.condition) : Sun;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/60 hover:text-white mb-6 text-sm transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
          </button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{trip.destination}</h1>
              <div className="flex flex-wrap gap-3 text-sm">
                {trip.source && (
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full"><MapPin size={14} /> From {trip.source}</span>
                )}
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full"><Calendar size={14} /> {formatDate(trip.start_date)} — {formatDate(trip.endDate)}</span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full"><Users size={14} /> {trip.travelers} traveler{trip.travelers > 1 ? 's' : ''}</span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full"><Wallet size={14} /> ₹{trip.budget.toLocaleString()} budget</span>
              </div>
            </div>
            {/* Budget summary - Fixed to show correct total spent */}
            <div className="bg-white/10 backdrop-blur rounded-2xl px-5 py-4 min-w-[200px]">
              <p className="text-white/50 text-xs font-medium mb-1">ESTIMATED SPEND</p>
              <p className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</p>
              <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${Math.min(100, (totalSpent / trip.budget) * 100)}%` }} />
              </div>
              <p className="text-xs text-white/40 mt-1">{Math.round((totalSpent / trip.budget) * 100)}% of budget</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Day Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {itinerary.map(day => (
            <button
              key={day.dayNumber}
              onClick={() => setActiveDay(day.dayNumber)}
              className={`flex flex-col items-center min-w-[80px] px-4 py-3 rounded-2xl transition-all duration-200 shrink-0 ${activeDay === day.dayNumber
                ? 'bg-slate-800 text-white shadow-lg shadow-slate-800/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
            >
              <span className="text-xs font-bold">Day {day.dayNumber}</span>
              <span className="text-[10px] opacity-70 mt-0.5">{formatDate(day.date)}</span>
            </button>
          ))}
        </div>

        {itinerary.length === 0 && (trip.status === 'planning' || regenerating) && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              {regenerating ? 'Regenerating Your Itinerary...' : 'Your AI is crafting this trip!'}
            </h3>
            <p className="text-slate-500 max-w-md text-center">
              {regenerating
                ? 'Your trip details were updated. The AI is building a brand new itinerary based on the new parameters. This usually takes 30-60 seconds.'
                : `We're researching the best hotels, flights, and activities for ${trip.destination}. This usually takes about 30-60 seconds. Refresh the page shortly.`
              }
            </p>
          </div>
        )}

        {itinerary.length === 0 && trip.status !== 'planning' && !regenerating && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No Itinerary Found</h3>
            <p className="text-slate-500">We couldn't find any activities for this trip.</p>
          </div>
        )}

        {currentDay && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main timeline — 2/3 width */}
            <div className="lg:col-span-2 space-y-4">
              {/* Weather + Day Header */}
              <motion.div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Day {currentDay.dayNumber}</h2>
                    <p className="text-sm text-slate-500">{formatDateLong(currentDay.date)}</p>
                  </div>
                  {currentDay.weather && (
                    <div className="flex items-center gap-3 bg-sky-50 px-4 py-2.5 rounded-xl">
                      <WeatherIcon size={24} className="text-sky-500" />
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{currentDay.weather.condition}</p>
                        <p className="text-xs text-slate-500">{currentDay.weather.tempHigh}°/{currentDay.weather.tempLow}° C</p>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => handleOptimizeDay(currentDay._id)}
                    className="ml-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Sparkles size={16} className="text-blue-500" /> Optimize
                  </button>
                </div>
              </motion.div>

              {/* Overlap Error Banner */}
              {overlapError && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium mb-0.5">Time Conflict Detected</p>
                    <p className="text-red-600/80">{overlapError}</p>
                  </div>
                  <button onClick={() => setOverlapError(null)} className="text-red-400 hover:text-red-600 shrink-0"><X size={16} /></button>
                </div>
              )}

              {/* Activities Timeline */}
              {currentDay.activities.map((activity, idx) => {
                const catInfo = CATEGORY_CONFIG[activity.category || 'other'] || CATEGORY_CONFIG.other;
                const IconComponent = catInfo.icon;
                const isEditing = editingActivity?.dayId === currentDay._id && editingActivity?.idx === idx;

                return (
                  <motion.div
                    key={idx}
                    className="relative"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                  >
                    <div className="flex gap-4">
                      {/* Timeline dot */}
                      <div className="flex flex-col items-center w-10 shrink-0">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${catInfo.gradient} flex items-center justify-center shadow-md`}>
                          <IconComponent size={18} className="text-white" />
                        </div>
                        {idx < currentDay.activities.length - 1 && (
                          <div className="w-[2px] flex-1 bg-slate-200 my-1" />
                        )}
                      </div>

                      {/* Card */}
                      <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all mb-2 group">
                        {isEditing ? (
                          /* Inline Edit Form */
                          <div className="space-y-3">
                            <input
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
                              value={editForm.title || ''}
                              onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                              placeholder="Title"
                            />
                            <div className="flex gap-2">
                              <input className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" value={editForm.time || ''} onChange={e => setEditForm(f => ({ ...f, time: e.target.value }))} placeholder="Time" />
                              <input className="w-28 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" type="number" value={editForm.estimatedCost || 0} onChange={e => setEditForm(f => ({ ...f, estimatedCost: Number(e.target.value) }))} placeholder="Cost" />
                            </div>
                            <textarea className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 resize-none" rows={2} value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" />
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => setEditingActivity(null)} className="px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 rounded-lg flex items-center gap-1"><X size={14} /> Cancel</button>
                              <button onClick={saveEdit} className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg flex items-center gap-1 hover:bg-blue-600"><Check size={14} /> Save</button>
                            </div>
                          </div>
                        ) : (
                          /* Display Mode */
                          <>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${catInfo.gradient} text-white`}>{catInfo.label}</span>
                                  <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={11} /> {activity.time}</span>
                                </div>
                                <h4 className="font-bold text-slate-800 mb-1">{activity.title}</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">{activity.description}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  {activity.location && (
                                    <span className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={11} /> {activity.location}</span>
                                  )}
                                  {activity.estimatedCost > 0 && (
                                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><Wallet size={11} /> ₹{activity.estimatedCost.toLocaleString()}</span>
                                  )}
                                  {!activity.aiGenerated && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-500 rounded font-medium">User edited</span>
                                  )}
                                </div>
                              </div>

                              {/* Action buttons — always visible for better UX */}
                              <div className="flex gap-1 shrink-0">
                                <button
                                  onClick={() => setSwapModal({ isOpen: true, dayId: currentDay._id, activityIndex: idx, activity })}
                                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-500 flex items-center justify-center text-slate-400 transition-colors" title="Swap"
                                ><ArrowRightLeft size={14} /></button>
                                <button
                                  onClick={() => startEdit(currentDay._id, idx, activity)}
                                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-500 flex items-center justify-center text-slate-400 transition-colors" title="Edit"
                                ><Pencil size={14} /></button>
                                <button
                                  onClick={() => handleDeleteActivity(currentDay._id, idx, currentDay.activities)}
                                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-slate-400 transition-colors" title="Remove"
                                ><Trash2 size={14} /></button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Add Activity — navigates to Recommendations */}
              <button
                onClick={() => navigate(`/recommendations/${tripId}`, {
                  state: { addToDayId: currentDay._id, addToDayNumber: currentDay.dayNumber }
                })}
                className="w-full border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-4 flex items-center justify-center gap-2 text-slate-400 hover:text-blue-500 transition-colors group"
              >
                <Plus size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Add from Recommendations</span>
              </button>
            </div>

            {/* Right sidebar — 1/3 width */}
            <div className="space-y-4">
              {/* Daily Budget Card - Fixed to show actual spent */}
              <motion.div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Wallet size={16} /> Day {currentDay.dayNumber} Budget
                </h3>
                <p className="text-3xl font-bold text-slate-800">₹{getDailySpent(currentDay).toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Planned: ₹{(currentDay.dailyBudget || 0).toLocaleString()}
                </p>
                <div className="mt-3 space-y-2">
                  {currentDay.activities.filter(a => a.estimatedCost > 0).map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 truncate mr-2">{a.title}</span>
                      <span className="font-medium text-slate-700 shrink-0">₹{a.estimatedCost.toLocaleString()}</span>
                    </div>
                  ))}
                  {currentDay.activities.filter(a => a.estimatedCost > 0).length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-2">No costs recorded yet</p>
                  )}
                </div>
              </motion.div>

              {/* Budget per Day Overview */}
              <motion.div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <h3 className="text-sm font-bold text-slate-800 mb-3">Budget by Day</h3>
                <div className="space-y-2">
                  {itinerary.map(day => {
                    const actualSpent = getDailySpent(day);
                    const avgBudgetPerDay = trip.budget / itinerary.length;
                    const pct = trip.budget > 0 ? Math.min(100, (actualSpent / avgBudgetPerDay) * 100) : 0;
                    return (
                      <div key={day.dayNumber} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 rounded-lg px-1 py-0.5 transition-colors" onClick={() => setActiveDay(day.dayNumber)}>
                        <span className={`w-12 shrink-0 font-medium ${activeDay === day.dayNumber ? 'text-blue-600' : 'text-slate-500'}`}>Day {day.dayNumber}</span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${activeDay === day.dayNumber ? 'bg-blue-500' : 'bg-slate-300'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-400 shrink-0 w-16 text-right">₹{actualSpent.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Trip Info Card — Editable */}
              <motion.div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Sparkles size={16} /> Trip Info</h3>
                  {!editingTrip ? (
                    <button onClick={startEditTrip} className="text-slate-400 hover:text-blue-500 transition-colors" title="Edit trip info">
                      <Pencil size={14} />
                    </button>
                  ) : (
                    <div className="flex gap-1">
                      <button onClick={() => setEditingTrip(false)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-slate-400 transition-colors"><X size={12} /></button>
                      <button onClick={saveTripEdit} disabled={tripSaving} className="w-7 h-7 rounded-lg bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white transition-colors disabled:opacity-50">
                        {tripSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      </button>
                    </div>
                  )}
                </div>
                {editingTrip ? (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-400 mb-0.5 block">Start Date</label>
                        <input type="date" className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" value={tripForm.start_date} onChange={e => setTripForm(f => ({ ...f, start_date: e.target.value }))} />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-0.5 block">End Date</label>
                        <input type="date" className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" value={tripForm.endDate} onChange={e => setTripForm(f => ({ ...f, endDate: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-0.5 block">Travelers</label>
                      <input type="number" min={1} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" value={tripForm.travelers} onChange={e => setTripForm(f => ({ ...f, travelers: Math.max(1, Number(e.target.value)) }))} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-0.5 block">Budget (₹)</label>
                      <input type="number" min={0} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" value={tripForm.budget} onChange={e => setTripForm(f => ({ ...f, budget: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-0.5 block">Travel Style</label>
                      <select className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white" value={tripForm.travelStyle} onChange={e => setTripForm(f => ({ ...f, travelStyle: e.target.value }))}>
                        <option value="balanced">Balanced</option>
                        <option value="luxury">Luxury</option>
                        <option value="budget">Budget</option>
                        <option value="adventure">Adventure</option>
                        <option value="cultural">Cultural</option>
                        <option value="relaxation">Relaxation</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-0.5 block">Status</label>
                      <select className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white" value={tripForm.status} onChange={e => setTripForm(f => ({ ...f, status: e.target.value }))}>
                        <option value="planning">Planning</option>
                        <option value="booked">Booked</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    {/* Regeneration warning */}
                    {(toInputDate(trip.start_date) !== tripForm.start_date ||
                      toInputDate(trip.endDate) !== tripForm.endDate ||
                      trip.travelers !== tripForm.travelers ||
                      trip.budget !== tripForm.budget ||
                      trip.travelStyle !== tripForm.travelStyle) && (
                        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                          <span>Changing these fields will <strong>regenerate the entire itinerary</strong> from scratch. Your current activities will be replaced.</span>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Destination</span><span className="font-medium text-slate-700">{trip.destination}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Start Date</span><span className="font-medium text-slate-700">{formatDate(trip.start_date)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">End Date</span><span className="font-medium text-slate-700">{formatDate(trip.endDate)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Duration</span><span className="font-medium text-slate-700">{itinerary.length} days</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Travelers</span><span className="font-medium text-slate-700">{trip.travelers}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Budget</span><span className="font-medium text-slate-700">₹{trip.budget.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Style</span><span className="font-medium text-slate-700 capitalize">{trip.travelStyle}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Status</span>
                      <span className={`font-medium capitalize px-2 py-0.5 rounded-full text-xs ${trip.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                        trip.status === 'booked' ? 'bg-blue-50 text-blue-600' :
                          trip.status === 'planning' ? 'bg-amber-50 text-amber-600' :
                            'bg-red-50 text-red-600'
                        }`}>{trip.status}</span>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* View Recommendations Link */}
              <button
                onClick={() => navigate(`/recommendations/${tripId}`)}
                className="w-full bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-2xl p-4 flex items-center justify-between hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Sparkles size={20} />
                  <span className="font-semibold text-sm">View Recommendations</span>
                </div>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Swap Modal */}
      <ActivitySwapModal
        isOpen={swapModal.isOpen}
        onClose={() => setSwapModal(s => ({ ...s, isOpen: false }))}
        dayId={swapModal.dayId}
        activityIndex={swapModal.activityIndex}
        currentActivity={swapModal.activity}
        onSwapComplete={handleSwapComplete}
      />
    </div>
  );
};

export default TripDetailPage;