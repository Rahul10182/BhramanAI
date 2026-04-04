export async function getCoordinates(placeName: string) {
  // Trim the input just in case there are invisible spaces
  const cleanName = placeName.trim();
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanName)}&count=1&format=json`;
  
  // 🛑 DEBUG LOG 1
  console.error(`\n[DEBUG Geocoding URL] -> ${url}`);
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Geocoding failed: ${response.status}`);
  
  const data = await response.json() as any;
  if (data.results && data.results.length > 0) {
    const location = data.results[0];
    return { lat: location.latitude, lon: location.longitude, name: location.name };
  }
  return null;
}

export async function getWeatherData(lat: number, lon: number, start_dateStr: string, numDays: number) {
  const start_date = new Date(start_dateStr);
  const safestart_dateStr = start_date.toISOString().split('T')[0];

  const endDate = new Date(start_date);
  endDate.setDate(endDate.getDate() + (numDays - 1));
  const safeEndDateStr = endDate.toISOString().split('T')[0];

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&start_date=${safestart_dateStr}&end_date=${safeEndDateStr}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

  // 🛑 DEBUG LOG 2
  console.error(`\n[DEBUG Weather URL] -> ${url}`);

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Weather API failed: ${response.status}`);
  
  return await response.json() as any;
}