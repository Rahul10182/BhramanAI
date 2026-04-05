import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, Sparkles, ArrowRight, Globe, Compass, Star, 
  Zap, Clock, Calendar, Users, Sun, Cloud, Utensils, Hotel, 
  Camera, Mountain, Coffee, Wine, Bike, Loader2, Send, MessageSquare,
  CheckCircle, TrendingUp, Shield, Heart, Phone, Mail
, Menu, X, User, LogIn, ChevronDown, Play, Award, Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);
  const [activeDay, setActiveDay] = useState(1);
  const [itinerary, setItinerary] = useState<any>(null);

  const generateDummyItinerary = () => {
    setIsLoading(true);
    setTimeout(() => {
      setItinerary({
        destination: prompt.includes('Goa') ? 'Goa, India' : 
                     prompt.includes('Paris') ? 'Paris, France' : 
                     prompt.includes('Tokyo') ? 'Tokyo, Japan' : 'Bali, Indonesia',
        duration: '5 Days, 4 Nights',
        budget: '$899',
        weather: 'Sunny, 28°C',
        bestTime: 'November - February',
        totalActivities: 12,
        totalBookings: 8,
        days: [
          {
            day: 1,
            title: 'Arrival & Local Exploration',
            date: 'Monday, May 15',
            activities: [
              { time: '10:00 AM', title: 'Arrival & Check-in', description: 'Check into your hotel and freshen up', type: 'hotel', icon: Hotel, duration: '2 hrs', price: 'Included' },
              { time: '1:00 PM', title: 'Welcome Lunch', description: 'Traditional local cuisine at a famous restaurant', type: 'food', icon: Utensils, duration: '1.5 hrs', price: '$25' },
              { time: '3:00 PM', title: 'City Orientation Tour', description: 'Explore the main attractions with local guide', type: 'activity', icon: Camera, duration: '3 hrs', price: '$45' },
              { time: '7:00 PM', title: 'Sunset Dinner Cruise', description: 'Enjoy dinner with spectacular views', type: 'food', icon: Coffee, duration: '2 hrs', price: '$60' }
            ]
          },
          {
            day: 2,
            title: 'Cultural Immersion',
            date: 'Tuesday, May 16',
            activities: [
              { time: '8:00 AM', title: 'Breakfast at Local Cafe', description: 'Start your day with authentic flavors', type: 'food', icon: Coffee, duration: '1 hr', price: '$15' },
              { time: '10:00 AM', title: 'Historical Tour', description: 'Visit ancient temples and monuments', type: 'activity', icon: Mountain, duration: '3 hrs', price: '$35' },
              { time: '1:00 PM', title: 'Cooking Class', description: 'Learn to make local dishes', type: 'food', icon: Utensils, duration: '2.5 hrs', price: '$50' },
              { time: '6:00 PM', title: 'Cultural Show', description: 'Traditional dance and music performance', type: 'activity', icon: Users, duration: '2 hrs', price: '$40' }
            ]
          },
          {
            day: 3,
            title: 'Adventure & Nature',
            date: 'Wednesday, May 17',
            activities: [
              { time: '7:00 AM', title: 'Morning Trek', description: 'Guided nature walk through scenic trails', type: 'activity', icon: Mountain, duration: '4 hrs', price: '$55' },
              { time: '12:00 PM', title: 'Picnic Lunch', description: 'Scenic spot with local delicacies', type: 'food', icon: Utensils, duration: '1.5 hrs', price: '$20' },
              { time: '2:00 PM', title: 'Water Sports', description: 'Kayaking, snorkeling or surfing', type: 'activity', icon: Bike, duration: '3 hrs', price: '$75' },
              { time: '8:00 PM', title: 'Beach Dinner', description: 'Candlelight dinner by the shore', type: 'food', icon: Wine, duration: '2 hrs', price: '$80' }
            ]
          },
          {
            day: 4,
            title: 'Shopping & Relaxation',
            date: 'Thursday, May 18',
            activities: [
              { time: '9:00 AM', title: 'Spa Session', description: 'Traditional massage and wellness', type: 'activity', icon: Sparkles, duration: '2 hrs', price: '$90' },
              { time: '12:00 PM', title: 'Local Market Tour', description: 'Shop for souvenirs and handicrafts', type: 'activity', icon: Camera, duration: '2 hrs', price: 'Free' },
              { time: '3:00 PM', title: 'Street Food Crawl', description: 'Try famous local street food', type: 'food', icon: Utensils, duration: '2 hrs', price: '$30' },
              { time: '7:00 PM', title: 'Farewell Dinner', description: 'Gourmet dining experience', type: 'food', icon: Wine, duration: '2 hrs', price: '$100' }
            ]
          },
          {
            day: 5,
            title: 'Departure',
            date: 'Friday, May 19',
            activities: [
              { time: '8:00 AM', title: 'Breakfast', description: 'Final local breakfast', type: 'food', icon: Coffee, duration: '1 hr', price: '$15' },
              { time: '10:00 AM', title: 'Last Minute Shopping', description: 'Grab last souvenirs', type: 'activity', icon: Camera, duration: '1.5 hrs', price: 'Free' },
              { time: '12:00 PM', title: 'Check-out & Departure', description: 'Transfer to airport', type: 'hotel', icon: Hotel, duration: '1 hr', price: 'Included' }
            ]
          }
        ],
        hotels: [
          { name: 'Grand Heritage Hotel', rating: 4.8, price: '$120/night', amenities: ['Pool', 'Spa', 'Restaurant', 'Free WiFi'], image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' },
          { name: 'Sunset Resort', rating: 4.6, price: '$95/night', amenities: ['Beach Access', 'Bar', 'Gym', 'Pool'], image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400' }
        ],
        restaurants: [
          { name: 'Spice Garden', cuisine: 'Local', rating: 4.7, priceRange: '$$', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' },
          { name: 'The Rooftop', cuisine: 'International', rating: 4.9, priceRange: '$$$', image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400' }
        ]
      });
      setShowItinerary(true);
      setIsLoading(false);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      generateDummyItinerary();
    }
  };

  const examplePrompts = [
    "I want a 5-day romantic trip to Paris",
    "Plan a 7-day adventure in Bali",
    "3-day cultural tour of Jaipur",
    "Weekend getaway to Goa"
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FDFCFB] via-white to-[#D6C7B1]/20" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#8BA889]/10 rounded-full shadow-sm mb-6">
              <Sparkles className="w-4 h-4 text-[#8BA889]" />
              <span className="text-sm font-semibold text-[#4A5D4B]">AI-Powered Trip Planner</span>
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} 
            className="text-5xl md:text-7xl lg:text-8xl font-serif mb-6 leading-tight text-[#2D2D2D]">
            Describe Your Dream
            <span className="text-[#8BA889] block"> Trip & Let AI Plan</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-xl text-[#2D2D2D]/60 max-w-2xl mx-auto mb-10">
            Just tell us what you want - destination, days, budget, interests. Our AI creates a complete day-by-day itinerary instantly.
          </motion.p>

          {/* AI Prompt Input */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#8BA889] to-[#D6C7B1] rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition duration-500" />
                <div className="relative flex items-center bg-white rounded-2xl shadow-2xl p-2">
                  <MessageSquare className="w-5 h-5 text-[#8BA889] ml-4" />
                  <input 
                    type="text" 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g., Plan a 5-day romantic trip to Paris with a budget of $2000..." 
                    className="flex-1 px-4 py-4 outline-none text-[#2D2D2D] placeholder:text-[#2D2D2D]/40 bg-transparent"
                  />
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-3 bg-[#8BA889] text-white rounded-xl font-semibold hover:bg-[#4A5D4B] transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    {isLoading ? 'Planning...' : 'Plan My Trip'}
                  </button>
                </div>
              </div>
            </form>

            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {examplePrompts.map((example, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(example)}
                  className="px-4 py-2 bg-white rounded-full text-sm text-[#2D2D2D]/70 hover:bg-[#8BA889]/10 hover:text-[#4A5D4B] transition-all border border-[#D6C7B1]/30"
                >
                  {example}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex flex-wrap justify-center gap-8 mt-16">
            {[
              { value: '10K+', label: 'Trips Planned', icon: Calendar },
              { value: '200+', label: 'Destinations', icon: Globe },
              { value: '98%', label: 'Happy Travelers', icon: Users },
              { value: '24/7', label: 'AI Support', icon: Zap },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-[#4A5D4B]">{stat.value}</div>
                <div className="text-sm text-[#2D2D2D]/50 flex items-center gap-1 justify-center"><stat.icon size={14} /> {stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Itinerary Display */}
      <AnimatePresence>
        {showItinerary && itinerary && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="py-20 px-6 bg-white"
          >
            <div className="max-w-7xl mx-auto">
              {/* Trip Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#8BA889]/10 rounded-full mb-4">
                  <Sparkles className="w-4 h-4 text-[#8BA889]" />
                  <span className="text-sm font-semibold text-[#4A5D4B]">AI-Generated Itinerary</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-serif mb-4 text-[#2D2D2D]">
                  Your {itinerary.duration} Adventure to{' '}
                  <span className="text-[#8BA889]">{itinerary.destination}</span>
                </h2>
                <div className="flex flex-wrap justify-center gap-6 mt-6">
                  <div className="flex items-center gap-2 text-[#2D2D2D]/60"><Calendar size={18} className="text-[#8BA889]" />{itinerary.duration}</div>
                  <div className="flex items-center gap-2 text-[#2D2D2D]/60"><Users size={18} className="text-[#8BA889]" />{itinerary.budget}</div>
                  <div className="flex items-center gap-2 text-[#2D2D2D]/60"><Sun size={18} className="text-[#8BA889]" />{itinerary.weather}</div>
                  <div className="flex items-center gap-2 text-[#2D2D2D]/60"><Award size={18} className="text-[#8BA889]" />{itinerary.totalActivities} Activities</div>
                </div>
              </div>

              {/* Day Navigation */}
              <div className="flex overflow-x-auto gap-2 mb-8 pb-2">
                {itinerary.days.map((day: any) => (
                  <button
                    key={day.day}
                    onClick={() => setActiveDay(day.day)}
                    className={`px-6 py-3 rounded-xl whitespace-nowrap transition-all ${
                      activeDay === day.day
                        ? 'bg-[#8BA889] text-white shadow-lg'
                        : 'bg-[#FDFCFB] text-[#2D2D2D]/70 hover:bg-[#8BA889]/10 border border-[#D6C7B1]/30'
                    }`}
                  >
                    Day {day.day}: {day.title}
                  </button>
                ))}
              </div>

              {/* Active Day Itinerary */}
              {itinerary.days.filter((day: any) => day.day === activeDay).map((day: any) => (
                <div key={day.day} className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-[#8BA889]/20 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-[#8BA889]" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#2D2D2D]">{day.title}</h3>
                      <p className="text-[#2D2D2D]/50">{day.date}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {day.activities.map((activity: any, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group bg-[#FDFCFB] border border-[#D6C7B1]/30 rounded-2xl p-5 hover:shadow-lg transition-all"
                      >
                        <div className="flex flex-wrap gap-4 items-start">
                          <div className="w-14 h-14 bg-[#8BA889]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                            <activity.icon className="w-7 h-7 text-[#8BA889]" />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <span className="text-sm font-semibold text-[#8BA889] bg-[#8BA889]/10 px-3 py-1 rounded-full">{activity.time}</span>
                              <h4 className="text-lg font-bold text-[#2D2D2D]">{activity.title}</h4>
                            </div>
                            <p className="text-[#2D2D2D]/60 text-sm mb-3">{activity.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className="flex items-center gap-1 text-[#2D2D2D]/50"><Clock size={14} />{activity.duration}</div>
                              <div className="flex items-center gap-1 text-[#2D2D2D]/50"><Users size={14} />{activity.price}</div>
                            </div>
                          </div>
                          <button className="px-5 py-2 bg-[#8BA889] text-white rounded-xl text-sm font-medium hover:bg-[#4A5D4B] transition-all">
                            Book Now
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Hotels & Restaurants */}
              <div className="grid md:grid-cols-2 gap-8 mt-12">
                <div className="bg-[#FDFCFB] rounded-2xl p-6 border border-[#D6C7B1]/30">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#2D2D2D]"><Hotel className="text-[#8BA889]" /> Recommended Hotels</h3>
                  <div className="space-y-4">
                    {itinerary.hotels.map((hotel: any, idx: number) => (
                      <div key={idx} className="flex gap-4 p-4 bg-white rounded-xl border border-[#D6C7B1]/20">
                        <img src={hotel.image} className="w-20 h-20 rounded-xl object-cover" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#2D2D2D]">{hotel.name}</h4>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < Math.floor(hotel.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />)}
                            <span className="text-xs text-[#2D2D2D]/50 ml-1">{hotel.rating}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {hotel.amenities.slice(0, 3).map((amenity: string, i: number) => (
                              <span key={i} className="text-xs px-2 py-1 bg-[#8BA889]/10 rounded-full text-[#4A5D4B]">{amenity}</span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#8BA889]">{hotel.price}</p>
                          <button className="text-sm text-[#8BA889] hover:underline mt-1">Select</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#FDFCFB] rounded-2xl p-6 border border-[#D6C7B1]/30">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#2D2D2D]"><Utensils className="text-[#8BA889]" /> Must-Try Restaurants</h3>
                  <div className="space-y-4">
                    {itinerary.restaurants.map((rest: any, idx: number) => (
                      <div key={idx} className="flex gap-4 p-4 bg-white rounded-xl border border-[#D6C7B1]/20">
                        <img src={rest.image} className="w-20 h-20 rounded-xl object-cover" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#2D2D2D]">{rest.name}</h4>
                          <p className="text-sm text-[#2D2D2D]/50">{rest.cuisine} • {rest.priceRange}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-[#2D2D2D]">{rest.rating}</span>
                          </div>
                        </div>
                        <button className="px-4 py-2 border border-[#8BA889] text-[#8BA889] rounded-lg text-sm font-medium hover:bg-[#8BA889] hover:text-white transition-all">
                          Book Table
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center mt-12">
                <button className="px-8 py-3 bg-[#8BA889] text-white rounded-xl font-semibold hover:bg-[#4A5D4B] transition-all flex items-center gap-2">
                  Book This Trip <ArrowRight size={18} />
                </button>
                <button className="px-8 py-3 border-2 border-[#8BA889] text-[#8BA889] rounded-xl font-semibold hover:bg-[#8BA889]/10 transition-all flex items-center gap-2">
                  Save to My Trips
                </button>
                <button className="px-8 py-3 border-2 border-[#D6C7B1]/50 text-[#2D2D2D]/70 rounded-xl font-semibold hover:border-[#8BA889] hover:text-[#8BA889] transition-all flex items-center gap-2">
                  Share Itinerary
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Features Section */}
      {!showItinerary && (
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-serif mb-3 text-[#2D2D2D]">How BhramanAI Works</h2>
              <p className="text-[#2D2D2D]/60">Three simple steps to your perfect trip</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Describe Your Trip', desc: 'Tell us destination, days, budget, and interests', icon: MessageSquare, color: 'bg-[#8BA889]/10' },
                { step: '02', title: 'AI Generates Itinerary', desc: 'Our AI creates day-by-day plan instantly', icon: Sparkles, color: 'bg-[#8BA889]/10' },
                { step: '03', title: 'Book & Travel', desc: 'Book hotels, flights, and activities seamlessly', icon: Calendar, color: 'bg-[#8BA889]/10' },
              ].map((step, i) => (
                <motion.div key={i} whileHover={{ y: -8 }} className="text-center p-8 bg-[#FDFCFB] rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-[#D6C7B1]/30">
                  <div className={`w-20 h-20 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <step.icon className="w-10 h-10 text-[#8BA889]" />
                  </div>
                  <div className="absolute -mt-16 -ml-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-[#8BA889]">
                    <span className="text-sm font-bold text-[#8BA889]">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#2D2D2D]">{step.title}</h3>
                  <p className="text-[#2D2D2D]/60">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;