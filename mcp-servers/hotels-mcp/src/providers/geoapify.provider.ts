import * as dotenv from 'dotenv'
dotenv.config()

const API_KEY = process.env.GEOAPIFY_API_KEY;

export class GeoapifyProvider {
  async getCoordinates(city: string): Promise<{ lat: number; lon: number } | null> {
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city)}&apiKey=${API_KEY}`;
    const response = await fetch(url);
    
    // Check if the API request was actually successful
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Geocoding API failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      throw new Error(`City not found: ${city}`);
    }

    const coords = data.features[0].geometry.coordinates;
    return { lat: coords[1], lon: coords[0] };
  }

  async searchHotels(city: string) {
    const coords = await this.getCoordinates(city);
    if (!coords) return [];

    const { lat, lon } = coords;
    const url = `https://api.geoapify.com/v2/places?categories=accommodation.hotel&filter=circle:${lon},${lat},5000&limit=10&apiKey=${API_KEY}`;
    
    const response = await fetch(url);
    
    // Check if the API request was actually successful
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Places API failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    return (data.features || []).map((place: any) => {
      const prop = place.properties;
      return {
        name: prop.name || "Unknown Hotel",
        address: prop.formatted || "No address provided",
        lat: prop.lat,
        lon: prop.lon,
        image: `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${prop.lon},${prop.lat}&zoom=15&apiKey=${API_KEY}`
      };
    });
  }

  estimatePrice(categories: string): string {
    const cat = String(categories);
    if (cat.includes("fast_food")) return "₹150 - ₹300";
    if (cat.includes("cafe")) return "₹200 - ₹400";
    return "₹300 - ₹700";
  }

  async getFoodNearHotel(lat: number, lon: number) {
    const url = `https://api.geoapify.com/v2/places?categories=catering.restaurant,catering.cafe,catering.fast_food&filter=circle:${lon},${lat},2000&limit=5&apiKey=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Places API failed (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();

    return (data.features || []).map((place: any) => {
      const prop = place.properties;
      return {
        name: prop.name || "Unknown Eatery",
        address: prop.formatted || "No address provided",
        type: prop.categories ? prop.categories.join(", ") : "restaurant",
        price: this.estimatePrice(prop.categories)
      };
    });
  }
}