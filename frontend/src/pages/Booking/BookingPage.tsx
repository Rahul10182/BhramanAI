import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plane, 
  Hotel, 
  Ticket, 
  Clock, 
  MapPin, 
  Calendar,
  ChevronRight,
  Download,
  Share2,
  Phone,
  Mail,
  MessageCircle,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  CreditCard,
  Receipt,
  Users,
  Luggage,
  Wifi,
  Coffee,
  Wind,
  TrendingUp,
  ArrowRight,
  Filter,
  Search
} from 'lucide-react';

const BookingPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const bookings = [
    {
      id: 1,
      type: "flight",
      icon: Plane,
      title: "Delta Airlines DL123",
      details: "JFK (New York) → LAX (Los Angeles)",
      date: "May 15, 2024",
      time: "10:30 AM",
      status: "confirmed",
      price: "$349",
      seatNumber: "12A",
      gate: "B23",
      boardingTime: "10:00 AM",
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600",
      bookingRef: "DL-ABC123",
      duration: "6h 30m",
      airline: "Delta Airlines"
    },
    {
      id: 2,
      type: "hotel",
      icon: Hotel,
      title: "Grand Plaza Hotel",
      details: "Downtown Los Angeles, CA",
      date: "May 15 - May 22, 2024",
      time: "3:00 PM Check-in",
      status: "confirmed",
      price: "$1,200",
      roomType: "Deluxe Suite",
      bedType: "King Bed",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600",
      bookingRef: "HOT-789XYZ",
      amenities: ["Free WiFi", "Breakfast Included", "Pool", "Gym", "Spa"],
      rating: 4.8
    },
    {
      id: 3,
      type: "activity",
      icon: Ticket,
      title: "Eiffel Tower Summit Access",
      details: "Paris, France",
      date: "June 12, 2024",
      time: "2:00 PM",
      status: "pending",
      price: "$89",
      duration: "2 hours",
      meetingPoint: "Eiffel Tower Entrance",
      image: "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=600",
      bookingRef: "ACT-456DEF",
      includes: ["Skip-the-line access", "Summit elevator", "Audio guide"]
    },
    {
      id: 4,
      type: "flight",
      icon: Plane,
      title: "Emirates EK202",
      details: "DXB (Dubai) → CDG (Paris)",
      date: "June 10, 2024",
      time: "8:45 PM",
      status: "confirmed",
      price: "$1,899",
      seatNumber: "7K",
      gate: "A12",
      boardingTime: "8:15 PM",
      image: "https://images.unsplash.com/photo-1542296332-2e4473faf563?w=600",
      bookingRef: "EM-202XYZ",
      duration: "7h 15m",
      airline: "Emirates"
    },
    {
      id: 5,
      type: "hotel",
      icon: Hotel,
      title: "Shinjuku Granbell Hotel",
      details: "Tokyo, Japan",
      date: "July 5 - July 15, 2024",
      time: "2:00 PM Check-in",
      status: "confirmed",
      price: "$2,800",
      roomType: "Premium Twin",
      bedType: "Twin Beds",
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600",
      bookingRef: "HOT-TOKYO001",
      amenities: ["Free WiFi", "Japanese Breakfast", "Onsen", "Restaurant", "Bar"],
      rating: 4.9
    },
    {
      id: 6,
      type: "activity",
      icon: Ticket,
      title: "Disneyland 1-Day Pass",
      details: "Tokyo, Japan",
      date: "July 8, 2024",
      time: "9:00 AM",
      status: "cancelled",
      price: "$120",
      duration: "Full day",
      meetingPoint: "Disneyland Entrance",
      image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600",
      bookingRef: "ACT-789GHI",
      includes: ["Park access", "Fast passes", "Mobile app guide"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-emerald-500';
      case 'pending': return 'bg-amber-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeFilter !== 'all' && booking.type !== activeFilter) return false;
    if (searchTerm && !booking.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !booking.details.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const stats = [
    { label: 'Total Bookings', value: bookings.length, icon: Receipt, color: 'from-purple-500 to-pink-500' },
    { label: 'Total Spent', value: '$6,457', icon: CreditCard, color: 'from-blue-500 to-cyan-500' },
    { label: 'Upcoming Trips', value: 4, icon: Calendar, color: 'from-orange-500 to-red-500' },
    { label: 'Saved', value: '$892', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFCFB] via-white to-[#D6C7B1]/10 py-12">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#8BA889]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#D6C7B1]/10 rounded-full blur-3xl" />
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
                <Receipt className="w-4 h-4 text-[#8BA889]" />
                <span className="text-sm font-medium text-[#4A5D4B]">Your Travel Portfolio</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-serif mb-2 bg-gradient-to-r from-[#4A5D4B] to-[#8BA889] bg-clip-text text-transparent">
                My Bookings
              </h1>
              <p className="text-lg text-[#2D2D2D]/60">
                Manage all your flights, hotels, and activities in one place
              </p>
            </div>
            
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-white border-2 border-[#8BA889] text-[#4A5D4B] rounded-xl font-medium hover:bg-[#8BA889]/10 transition-all flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export All
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, idx) => (
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

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-4 shadow-lg border border-[#D6C7B1]/20 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex gap-2">
              {['all', 'flight', 'hotel', 'activity'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-xl capitalize transition-all flex items-center gap-2 ${
                    activeFilter === filter
                      ? 'bg-gradient-to-r from-[#4A5D4B] to-[#8BA889] text-white shadow-lg'
                      : 'bg-gray-100 text-[#2D2D2D]/70 hover:bg-gray-200'
                  }`}
                >
                  {filter === 'all' ? <Filter className="w-4 h-4" /> : null}
                  {filter}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/40" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-[#8BA889] focus:outline-none w-full md:w-64"
              />
            </div>
          </div>
        </motion.div>

        {/* Bookings List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {filteredBookings.map((booking) => (
            <motion.div
              key={booking.id}
              variants={itemVariants}
              className="group"
            >
              <div className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#D6C7B1]/20 ${
                selectedBooking === booking.id ? 'ring-2 ring-[#8BA889]' : ''
              }`}>
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="md:w-48 h-48 md:h-auto relative overflow-hidden">
                    <img 
                      src={booking.image} 
                      alt={booking.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <booking.icon className="w-5 h-5 text-[#8BA889]" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#8BA889]">
                            {booking.type}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-[#2D2D2D] mb-2">{booking.title}</h3>
                        <p className="text-[#2D2D2D]/60 flex items-center gap-2 mb-3">
                          <MapPin className="w-4 h-4" />
                          {booking.details}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#8BA889]" />
                            <span>{booking.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#8BA889]" />
                            <span>{booking.time}</span>
                          </div>
                          {booking.bookingRef && (
                            <div className="flex items-center gap-2">
                              <Receipt className="w-4 h-4 text-[#8BA889]" />
                              <span className="font-mono text-xs">Ref: {booking.bookingRef}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#4A5D4B]">{booking.price}</p>
                        <button
                          onClick={() => setSelectedBooking(selectedBooking === booking.id ? null : booking.id)}
                          className="mt-2 text-[#8BA889] hover:text-[#4A5D4B] transition-colors flex items-center gap-1 text-sm font-medium"
                        >
                          View Details
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {selectedBooking === booking.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-[#D6C7B1]/20 bg-gradient-to-r from-[#8BA889]/5 to-[#D6C7B1]/5"
                    >
                      <div className="p-6">
                        <div className="grid md:grid-cols-3 gap-6">
                          {/* Booking Details */}
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-[#8BA889]" />
                              Booking Details
                            </h4>
                            <div className="space-y-2 text-sm">
                              {booking.seatNumber && (
                                <div className="flex justify-between">
                                  <span className="text-[#2D2D2D]/60">Seat Number:</span>
                                  <span className="font-medium">{booking.seatNumber}</span>
                                </div>
                              )}
                              {booking.gate && (
                                <div className="flex justify-between">
                                  <span className="text-[#2D2D2D]/60">Gate:</span>
                                  <span className="font-medium">{booking.gate}</span>
                                </div>
                              )}
                              {booking.boardingTime && (
                                <div className="flex justify-between">
                                  <span className="text-[#2D2D2D]/60">Boarding Time:</span>
                                  <span className="font-medium">{booking.boardingTime}</span>
                                </div>
                              )}
                              {booking.roomType && (
                                <div className="flex justify-between">
                                  <span className="text-[#2D2D2D]/60">Room Type:</span>
                                  <span className="font-medium">{booking.roomType}</span>
                                </div>
                              )}
                              {booking.bedType && (
                                <div className="flex justify-between">
                                  <span className="text-[#2D2D2D]/60">Bed Type:</span>
                                  <span className="font-medium">{booking.bedType}</span>
                                </div>
                              )}
                              {booking.duration && (
                                <div className="flex justify-between">
                                  <span className="text-[#2D2D2D]/60">Duration:</span>
                                  <span className="font-medium">{booking.duration}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Amenities / Includes */}
                          {(booking.amenities || booking.includes) && (
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Star className="w-4 h-4 text-[#8BA889]" />
                                {booking.type === 'hotel' ? 'Amenities' : 'What\'s Included'}
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {(booking.amenities || booking.includes || []).map((item, idx) => (
                                  <span key={idx} className="text-xs px-3 py-1 bg-white rounded-full shadow-sm border border-[#D6C7B1]/20">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <MessageCircle className="w-4 h-4 text-[#8BA889]" />
                              Quick Actions
                            </h4>
                            <div className="space-y-2">
                              <button className="w-full px-4 py-2 bg-[#8BA889] text-white rounded-lg text-sm font-medium hover:bg-[#4A5D4B] transition-all flex items-center justify-center gap-2">
                                <Phone className="w-4 h-4" />
                                Contact Support
                              </button>
                              <button className="w-full px-4 py-2 border border-[#8BA889] text-[#4A5D4B] rounded-lg text-sm font-medium hover:bg-[#8BA889]/10 transition-all flex items-center justify-center gap-2">
                                <Share2 className="w-4 h-4" />
                                Share Booking
                              </button>
                              <button className="w-full px-4 py-2 border border-red-500 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 transition-all flex items-center justify-center gap-2">
                                <RefreshCw className="w-4 h-4" />
                                Request Modification
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Rating */}
                        {booking.rating && (
                          <div className="mt-4 pt-4 border-t border-[#D6C7B1]/20 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(booking.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                ))}
                              </div>
                              <span className="text-sm font-medium">{booking.rating} / 5</span>
                            </div>
                            <button className="text-sm text-[#8BA889] hover:text-[#4A5D4B] transition-colors">
                              Leave a Review
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredBookings.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-[#8BA889]/10 to-[#D6C7B1]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Receipt className="w-12 h-12 text-[#8BA889]" />
            </div>
            <h3 className="text-2xl font-serif mb-2">No bookings found</h3>
            <p className="text-[#2D2D2D]/60 mb-6">Start planning your next adventure</p>
            <button className="btn-primary mx-auto">
              Explore Destinations
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

export default BookingPage;