import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, DollarSign, MapPin, Loader2, Sparkles, Users, Heart, ChevronRight, CheckCircle, Plane, Hotel, Train, ArrowRight, Coffee, Mountain, Building, Utensils, Camera, Music } from 'lucide-react';

const PlannerPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    destination: '', startDate: '', endDate: '', budget: 2500, travelers: 2, interests: [] as string[]
  });

  const interestsList = [
    { name: 'Adventure', icon: Mountain }, { name: 'Culture', icon: Building }, { name: 'Food', icon: Utensils },
    { name: 'Nature', icon: Coffee }, { name: 'Shopping', icon: Heart }, { name: 'Nightlife', icon: Music }, { name: 'Photography', icon: Camera }
  ];

  const popularDestinations = [
    { name: 'Bali, Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600', vibe: 'Tropical' },
    { name: 'Paris, France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600', vibe: 'Romantic' },
    { name: 'Tokyo, Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600', vibe: 'Futuristic' },
    { name: 'Switzerland', image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=600', vibe: 'Alpine' }
  ];

  const steps = [
    { number: 1, title: 'Destination', icon: MapPin, desc: 'Where to?' },
    { number: 2, title: 'Dates', icon: Calendar, desc: 'When?' },
    { number: 3, title: 'Budget', icon: DollarSign, desc: 'Plan spend' },
    { number: 4, title: 'Interests', icon: Heart, desc: 'Your style' }
  ];

  const handleNext = () => {
    if (step === 1 && !formData.destination) return;
    if (step === 2 && (!formData.startDate || !formData.endDate)) return;
    setStep(step + 1);
  };

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); alert('✨ Your personalized itinerary is ready!'); }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#8BA889]/10 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[#8BA889]" />
            <span className="text-sm font-medium text-[#4A5D4B]">AI-Powered Planning</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif mb-4">
            Design Your <span className="text-[#8BA889]">Journey</span>
          </h1>
          <p className="text-lg text-[#2D2D2D]/60">Let AI craft a personalized itinerary just for you</p>
        </motion.div>

        {/* Steps Indicator */}
        <div className="flex justify-between max-w-3xl mx-auto mb-12">
          {steps.map((s, idx) => (
            <div key={idx} className="flex-1 text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto transition-all ${step > s.number ? 'bg-[#8BA889] text-white' : step === s.number ? 'bg-[#4A5D4B] text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}>
                {step > s.number ? <CheckCircle className="w-5 h-5" /> : s.number}
              </div>
              <p className="text-xs text-[#2D2D2D]/50 mt-2">{s.desc}</p>
              <p className="text-sm font-semibold text-[#4A5D4B]">{s.title}</p>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-xl border border-[#D6C7B1]/20 overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Step 1: Destination */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#8BA889] rounded-xl flex items-center justify-center"><MapPin className="w-6 h-6 text-white" /></div>
                  <div><h2 className="text-2xl font-bold">Where's your next adventure?</h2><p className="text-[#2D2D2D]/60">Choose a destination</p></div>
                </div>
                <input type="text" placeholder="Search for a city, country..." value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#8BA889] outline-none mb-6" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {popularDestinations.map((dest, idx) => (
                    <div key={idx} onClick={() => setFormData({ ...formData, destination: dest.name })} className="relative rounded-xl overflow-hidden h-28 cursor-pointer group">
                      <img src={dest.image} className="w-full h-full object-cover group-hover:scale-110 transition" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 left-2 text-white"><p className="text-sm font-semibold">{dest.name}</p><p className="text-xs">{dest.vibe}</p></div>
                    </div>
                  ))}
                </div>
                <button onClick={handleNext} className="w-full py-4 bg-[#8BA889] text-white rounded-xl font-semibold hover:bg-[#4A5D4B] transition flex items-center justify-center gap-2">Continue <ArrowRight size={18} /></button>
              </motion.div>
            )}

            {/* Step 2: Dates */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#8BA889] rounded-xl flex items-center justify-center"><Calendar className="w-6 h-6 text-white" /></div>
                  <div><h2 className="text-2xl font-bold">When are you traveling?</h2><p className="text-[#2D2D2D]/60">Select your dates</p></div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="p-4 border-2 border-gray-200 rounded-xl focus:border-[#8BA889] outline-none" />
                  <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="p-4 border-2 border-gray-200 rounded-xl focus:border-[#8BA889] outline-none" />
                </div>
                <div className="flex gap-4"><button onClick={() => setStep(1)} className="flex-1 py-4 border-2 border-[#8BA889] text-[#4A5D4B] rounded-xl font-semibold hover:bg-[#8BA889]/10 transition">Back</button><button onClick={handleNext} className="flex-1 py-4 bg-[#8BA889] text-white rounded-xl font-semibold hover:bg-[#4A5D4B] transition">Continue</button></div>
              </motion.div>
            )}

            {/* Step 3: Budget */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#8BA889] rounded-xl flex items-center justify-center"><DollarSign className="w-6 h-6 text-white" /></div>
                  <div><h2 className="text-2xl font-bold">Plan Your Budget</h2><p className="text-[#2D2D2D]/60">Set your budget and group size</p></div>
                </div>
                <div className="mb-6">
                  <label className="block mb-3">Total Budget: <span className="font-bold text-[#8BA889]">${formData.budget}</span></label>
                  <input type="range" min="500" max="10000" step="100" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })} className="w-full" />
                  <div className="flex justify-between text-sm mt-2"><span>$500</span><span>$5,000+</span></div>
                </div>
                <div className="mb-8">
                  <label className="block mb-3">Travelers</label>
                  <div className="flex gap-3">{ [1,2,3,4,5].map(num => (<button key={num} onClick={() => setFormData({ ...formData, travelers: num })} className={`w-12 h-12 rounded-xl border-2 transition ${formData.travelers === num ? 'border-[#8BA889] bg-[#8BA889]/10 text-[#4A5D4B]' : 'border-gray-200'}`}>{num}</button>)) }</div>
                </div>
                <div className="flex gap-4"><button onClick={() => setStep(2)} className="flex-1 py-4 border-2 border-[#8BA889] text-[#4A5D4B] rounded-xl font-semibold">Back</button><button onClick={handleNext} className="flex-1 py-4 bg-[#8BA889] text-white rounded-xl font-semibold">Continue</button></div>
              </motion.div>
            )}

            {/* Step 4: Interests */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#8BA889] rounded-xl flex items-center justify-center"><Heart className="w-6 h-6 text-white" /></div>
                  <div><h2 className="text-2xl font-bold">What do you love?</h2><p className="text-[#2D2D2D]/60">Select your interests</p></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                  {interestsList.map((interest) => (
                    <button key={interest.name} onClick={() => setFormData({ ...formData, interests: formData.interests.includes(interest.name) ? formData.interests.filter(i => i !== interest.name) : [...formData.interests, interest.name] })}
                      className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${formData.interests.includes(interest.name) ? 'border-[#8BA889] bg-[#8BA889]/10 text-[#4A5D4B]' : 'border-gray-200'}`}>
                      <interest.icon className="w-6 h-6" /><span className="text-sm">{interest.name}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(3)} className="flex-1 py-4 border-2 border-[#8BA889] text-[#4A5D4B] rounded-xl font-semibold">Back</button>
                  <button onClick={handleGenerate} disabled={loading} className="flex-1 py-4 bg-[#8BA889] text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                    {loading ? <><Loader2 className="animate-spin" /> Generating...</> : <><Sparkles size={18} /> Generate Itinerary</>}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {[ { icon: Plane, title: 'Smart Flight Booking', desc: 'Best prices' }, { icon: Hotel, title: 'Curated Stays', desc: 'Handpicked' }, { icon: Train, title: 'Local Transport', desc: 'Seamless' } ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 text-center border border-[#D6C7B1]/20 shadow-sm">
              <item.icon className="w-10 h-10 text-[#8BA889] mx-auto mb-3" />
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-[#2D2D2D]/50">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; background: #E5E7EB; height: 6px; border-radius: 5px; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; background: #8BA889; border-radius: 50%; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default PlannerPage;