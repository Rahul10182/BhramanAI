// components/chat/constants.ts
import { Compass, Plane, DollarSign, MapPin, Hotel, Utensils, Camera, Car, TreePalm, ShoppingBag, Mountain } from 'lucide-react';

export const QUICK_PROMPTS = [
    { text: "Plan a trip to Goa", icon: Compass, gradient: "from-orange-500 to-red-500" },
    { text: "5 days in Paris for 2", icon: Plane, gradient: "from-blue-500 to-indigo-500" },
    { text: "Budget trip to Jaipur", icon: DollarSign, gradient: "from-emerald-500 to-teal-500" },
    { text: "Weekend getaway to Manali", icon: MapPin, gradient: "from-purple-500 to-pink-500" },
];

export const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string; gradient: string; label: string }> = {
    flight: { icon: Plane, color: '#3b82f6', gradient: 'from-blue-500 to-blue-600', label: 'Flight' },
    hotel: { icon: Hotel, color: '#8b5cf6', gradient: 'from-violet-500 to-purple-600', label: 'Stay' },
    food: { icon: Utensils, color: '#f59e0b', gradient: 'from-amber-500 to-orange-600', label: 'Dining' },
    attraction: { icon: Camera, color: '#ec4899', gradient: 'from-pink-500 to-rose-600', label: 'Sightseeing' },
    transport: { icon: Car, color: '#06b6d4', gradient: 'from-cyan-500 to-sky-600', label: 'Transport' },
    leisure: { icon: TreePalm, color: '#10b981', gradient: 'from-emerald-500 to-green-600', label: 'Relax' },
    shopping: { icon: ShoppingBag, color: '#f97316', gradient: 'from-orange-500 to-amber-600', label: 'Shopping' },
    other: { icon: Mountain, color: '#64748b', gradient: 'from-slate-500 to-slate-600', label: 'Activity' },
};