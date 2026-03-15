export async function getCoordinates(placeName) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(placeName)}&count=1&format=json`;
    const response = await fetch(url);
    if (!response.ok)
        throw new Error(`Geocoding failed: ${response.status}`);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
        const location = data.results[0];
        return { lat: location.latitude, lon: location.longitude, name: location.name };
    }
    return null;
}
export async function getWeatherData(lat, lon, startDateStr, numDays) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (numDays - 1));
    const endDateStr = endDate.toISOString().split('T')[0];
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&start_date=${startDateStr}&end_date=${endDateStr}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok)
        throw new Error(`Weather API failed: ${response.status}`);
    return await response.json();
}
