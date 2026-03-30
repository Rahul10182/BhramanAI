import * as dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEOAPIFY_API_KEY;

export class GeoapifyActivityProvider {
  async getCoordinates(city: string): Promise<{ lat: number; lon: number } | null> {
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city)}&apiKey=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error(`Geocoding failed: ${response.status}`);
    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      throw new Error(`City not found: ${city}`);
    }

    const coords = data.features[0].geometry.coordinates;
    return { lat: coords[1], lon: coords[0] };
  }

  async searchActivities(city: string) {
    const coords = await this.getCoordinates(city);
    if (!coords) return [];

    const { lat, lon } = coords;
    // Categories: tourism.sights, tourism.attraction, entertainment.museum, leisure.park
    const categories = "tourism.sights,tourism.attraction,entertainment.museum,leisure.park";
    const url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${lon},${lat},10000&limit=15&apiKey=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) throw new Error(`Places API failed: ${response.status}`);
    const data = await response.json();

    return (data.features || []).map((place: any) => {
      const prop = place.properties;
      return {
        name: prop.name || "Unknown Attraction",
        address: prop.formatted || "No address provided",
        categories: prop.categories ? prop.categories.join(", ") : "tourist attraction",
        lat: prop.lat,
        lon: prop.lon,
        website: prop.website || null
      };
    }).filter((place: any) => place.name !== "Unknown Attraction"); // Filter out nameless places
  }
}