import { TripModel } from '../database/models/trip.model.js';
import { serverRegistry } from '../mcp/registry/server.registry.js';

export interface HotelRecommendation {
  id: string;
  name: string;
  price: number;
  rating: number;
  image: string;
  location: string;
  amenities: string[];
  description: string;
}

export interface ActivityRecommendation {
  id: string;
  name: string;
  description: string;
  duration: string;
  image: string;
  category: string;
  price: number;
}

export class RecommendationService {

  /**
   * Fetches hotel & activity recommendations for a trip by calling the MCP servers.
   */
  public static async getRecommendations(tripId: string) {
    // 1. Get trip details from DB
    const trip = await TripModel.findById(tripId);
    if (!trip) {
      throw new Error('Trip not found');
    }

    const destination = trip.destination;
    console.log(`\n🔍 [RecommendationService] Fetching recommendations for: ${destination}`);

    // 2. Call both MCP servers in parallel
    const [hotelsRaw, activitiesRaw] = await Promise.allSettled([
      serverRegistry.hotels.searchHotels(destination),
      serverRegistry.activities.searchActivities(destination),
    ]);

    // 3. Parse hotel results
    const hotels = this.parseHotels(hotelsRaw, destination);

    // 4. Parse activity results
    const activities = this.parseActivities(activitiesRaw, destination);

    console.log(`✅ [RecommendationService] Found ${hotels.length} hotels, ${activities.length} activities`);

    return {
      trip: {
        id: trip._id,
        destination: trip.destination,
        startDate: trip.start_date,
        endDate: trip.endDate,
        budget: trip.budget,
        travelers: trip.travelers,
        travelStyle: trip.travelStyle,
      },
      hotels,
      activities,
    };
  }

  private static parseHotels(result: PromiseSettledResult<any>, destination: string): HotelRecommendation[] {
    if (result.status === 'rejected') {
      console.warn('[RecommendationService] Hotel MCP failed:', result.reason);
      return this.getFallbackHotels(destination);
    }

    try {
      const content = result.value?.content;
      console.log('[RecommendationService] Raw hotel content:', JSON.stringify(content)?.substring(0, 500));

      if (!content || !Array.isArray(content) || content.length === 0) {
        console.warn('[RecommendationService] No hotel content, using fallbacks');
        return this.getFallbackHotels(destination);
      }

      // MCP returns content as array of { type: 'text', text: '...' }
      const text = content.map((c: any) => c.text || '').join('\n');
      console.log('[RecommendationService] Hotel text (first 300 chars):', text.substring(0, 300));

      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(text);
        let hotelArray: any[] = [];

        if (Array.isArray(parsed)) {
          hotelArray = parsed;
        } else if (parsed && typeof parsed === 'object') {
          // Handle nested formats: { hotels: [...] }, { results: [...] }, { data: [...] }
          hotelArray = parsed.hotels || parsed.results || parsed.data || [];
          if (!Array.isArray(hotelArray)) hotelArray = [];
        }

        if (hotelArray.length > 0) {
          return hotelArray.map((h: any, i: number) => ({
            id: h.id || `hotel-${i}`,
            name: h.name || h.hotel_name || `Hotel ${i + 1}`,
            price: Number(h.price || h.price_per_night || h.rate || 0),
            rating: Number(h.rating || h.stars || 4),
            image: h.image || h.photo || this.getHotelImage(i),
            location: h.location || h.address || destination,
            amenities: h.amenities || h.facilities || ['WiFi', 'AC', 'Breakfast'],
            description: h.description || h.overview || '',
          }));
        }
      } catch {
        // Not JSON — parse text line by line
      }

      // Fallback: parse text-based response
      const textParsed = this.parseTextHotels(text, destination);
      if (textParsed.length > 0) return textParsed;

      // Final fallback
      return this.getFallbackHotels(destination);
    } catch (err) {
      console.warn('[RecommendationService] Error parsing hotels:', err);
      return this.getFallbackHotels(destination);
    }
  }

  private static parseActivities(result: PromiseSettledResult<any>, destination: string): ActivityRecommendation[] {
    if (result.status === 'rejected') {
      console.warn('[RecommendationService] Activity MCP failed:', result.reason);
      return this.getFallbackActivities(destination);
    }

    try {
      const content = result.value?.content;
      if (!content || !Array.isArray(content) || content.length === 0) {
        return this.getFallbackActivities(destination);
      }

      const text = content.map((c: any) => c.text || '').join('\n');

      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          return parsed.map((a: any, i: number) => ({
            id: a.id || `activity-${i}`,
            name: a.name || a.title || `Activity ${i + 1}`,
            description: a.description || a.overview || '',
            duration: a.duration || a.time || '2-3 hours',
            image: a.image || a.photo || this.getActivityImage(i),
            category: a.category || a.type || 'Sightseeing',
            price: Number(a.price || a.cost || 0),
          }));
        }
      } catch {
        // Not JSON
      }

      return this.parseTextActivities(text, destination);
    } catch (err) {
      console.warn('[RecommendationService] Error parsing activities:', err);
      return this.getFallbackActivities(destination);
    }
  }

  // --- Text parsers for non-JSON MCP responses ---

  private static parseTextHotels(text: string, destination: string): HotelRecommendation[] {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const hotels: HotelRecommendation[] = [];
    let current: Partial<HotelRecommendation> = {};

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes('name:') || lower.includes('hotel:')) {
        if (current.name) {
          hotels.push(this.finalizeHotel(current, hotels.length, destination));
          current = {};
        }
        current.name = line.split(':').slice(1).join(':').trim();
      } else if (lower.includes('price:') || lower.includes('rate:')) {
        current.price = parseInt(line.replace(/[^0-9]/g, '')) || 0;
      } else if (lower.includes('rating:') || lower.includes('stars:')) {
        current.rating = parseFloat(line.replace(/[^0-9.]/g, '')) || 4;
      } else if (lower.includes('location:') || lower.includes('address:')) {
        current.location = line.split(':').slice(1).join(':').trim();
      }
    }
    if (current.name) {
      hotels.push(this.finalizeHotel(current, hotels.length, destination));
    }

    return hotels.length > 0 ? hotels : this.getFallbackHotels(destination);
  }

  private static parseTextActivities(text: string, destination: string): ActivityRecommendation[] {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const activities: ActivityRecommendation[] = [];
    let current: Partial<ActivityRecommendation> = {};

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes('name:') || lower.includes('activity:') || lower.includes('title:')) {
        if (current.name) {
          activities.push(this.finalizeActivity(current, activities.length, destination));
          current = {};
        }
        current.name = line.split(':').slice(1).join(':').trim();
      } else if (lower.includes('description:') || lower.includes('overview:')) {
        current.description = line.split(':').slice(1).join(':').trim();
      } else if (lower.includes('duration:') || lower.includes('time:')) {
        current.duration = line.split(':').slice(1).join(':').trim();
      } else if (lower.includes('category:') || lower.includes('type:')) {
        current.category = line.split(':').slice(1).join(':').trim();
      }
    }
    if (current.name) {
      activities.push(this.finalizeActivity(current, activities.length, destination));
    }

    return activities.length > 0 ? activities : this.getFallbackActivities(destination);
  }

  private static finalizeHotel(h: Partial<HotelRecommendation>, idx: number, dest: string): HotelRecommendation {
    return {
      id: `hotel-${idx}`,
      name: h.name || `Hotel ${idx + 1}`,
      price: h.price || 0,
      rating: h.rating || 4,
      image: this.getHotelImage(idx),
      location: h.location || dest,
      amenities: h.amenities || ['WiFi', 'AC', 'Breakfast'],
      description: h.description || '',
    };
  }

  private static finalizeActivity(a: Partial<ActivityRecommendation>, idx: number, dest: string): ActivityRecommendation {
    return {
      id: `activity-${idx}`,
      name: a.name || `Activity ${idx + 1}`,
      description: a.description || `Popular attraction in ${dest}`,
      duration: a.duration || '2-3 hours',
      image: this.getActivityImage(idx),
      category: a.category || 'Sightseeing',
      price: a.price || 0,
    };
  }

  // --- Fallbacks with destination-aware placeholder images ---

  private static getHotelImage(idx: number): string {
    const images = [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80',
    ];
    return images[idx % images.length] ?? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80';
  }

  private static getActivityImage(idx: number): string {
    const images = [
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=80',
    ];
    return images[idx % images.length] ?? 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&q=80';
  }

  private static getFallbackHotels(destination: string): HotelRecommendation[] {
    return [
      { id: 'fb-h-1', name: `Grand ${destination} Resort`, price: 8500, rating: 4.5, image: this.getHotelImage(0), location: `Central ${destination}`, amenities: ['WiFi', 'Pool', 'Spa', 'Breakfast'], description: `Premium resort in the heart of ${destination}` },
      { id: 'fb-h-2', name: `${destination} Heritage Hotel`, price: 5500, rating: 4.2, image: this.getHotelImage(1), location: `Old Town, ${destination}`, amenities: ['WiFi', 'Restaurant', 'AC'], description: `Classic heritage stay with local charm` },
      { id: 'fb-h-3', name: `${destination} Budget Inn`, price: 2500, rating: 3.8, image: this.getHotelImage(2), location: `Near Station, ${destination}`, amenities: ['WiFi', 'AC', 'Parking'], description: `Affordable comfort near transport hub` },
    ];
  }

  private static getFallbackActivities(destination: string): ActivityRecommendation[] {
    return [
      { id: 'fb-a-1', name: `${destination} City Walking Tour`, description: `Explore the top landmarks of ${destination} with a guided walk.`, duration: '3 hours', image: this.getActivityImage(0), category: 'Sightseeing', price: 1200 },
      { id: 'fb-a-2', name: `Local Food Tasting Experience`, description: `Sample authentic ${destination} cuisine at hidden gems.`, duration: '2 hours', image: this.getActivityImage(1), category: 'Food', price: 800 },
      { id: 'fb-a-3', name: `Sunset Viewpoint Visit`, description: `Catch the best sunset panorama in ${destination}.`, duration: '1.5 hours', image: this.getActivityImage(2), category: 'Nature', price: 500 },
    ];
  }
}
