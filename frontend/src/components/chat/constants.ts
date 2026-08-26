// components/chat/constants.ts
import { Compass, Plane, DollarSign, MapPin, Hotel, Utensils, Camera, Car, TreePalm, ShoppingBag, Mountain } from 'lucide-react';

export const QUICK_PROMPTS = [
    { text: "Plan a trip to Goa", icon: Compass, gradient: "from-[#4A5D4B] to-[#8BA889]" },
    { text: "5 days in Paris for 2", icon: Plane, gradient: "from-[#8BA889] to-[#6B9B8A]" },
    { text: "Budget trip to Jaipur", icon: DollarSign, gradient: "from-[#D6C7B1] to-[#C4A882]" },
    { text: "Weekend getaway to Manali", icon: MapPin, gradient: "from-[#4A5D4B] to-[#6B7B6C]" },
];

export const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string; gradient: string; label: string }> = {
    flight: { icon: Plane, color: '#4A5D4B', gradient: 'from-[#4A5D4B] to-[#6B7B6C]', label: 'Flight' },
    hotel: { icon: Hotel, color: '#8BA889', gradient: 'from-[#8BA889] to-[#6B9B8A]', label: 'Stay' },
    food: { icon: Utensils, color: '#C4A882', gradient: 'from-[#D6C7B1] to-[#C4A882]', label: 'Dining' },
    attraction: { icon: Camera, color: '#8BA889', gradient: 'from-[#4A5D4B] to-[#8BA889]', label: 'Sightseeing' },
    transport: { icon: Car, color: '#6B9B8A', gradient: 'from-[#6B9B8A] to-[#8BA889]', label: 'Transport' },
    leisure: { icon: TreePalm, color: '#4A5D4B', gradient: 'from-[#8BA889] to-[#4A5D4B]', label: 'Relax' },
    shopping: { icon: ShoppingBag, color: '#C4A882', gradient: 'from-[#C4A882] to-[#D6C7B1]', label: 'Shopping' },
    other: { icon: Mountain, color: '#6B7B6C', gradient: 'from-[#6B7B6C] to-[#4A5D4B]', label: 'Activity' },
};