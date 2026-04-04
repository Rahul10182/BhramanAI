export const getTimezoneDef = {
    name: "get_time_and_timezone",
    description: "Get the current time, timezone, and UTC offset for a specific place name.",
    inputSchema: {
        type: "object",
        properties: {
            placeName: { type: "string", description: "City or location name (e.g., 'Tokyo', 'New York')" }
        },
        required: ["placeName"]
    }
};

export async function getTimezoneHandler(args: any) {
    const { placeName } = args;

    try {
        // 1. Get the timezone string using Open-Meteo's geocoding API
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(placeName)}&count=1`;
        const geoResponse = await fetch(geoUrl);
        
        if (!geoResponse.ok) {
            throw new Error(`Open-Meteo API failed with status: ${geoResponse.status}`);
        }
        
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0 || !geoData.results[0].timezone) {
            throw new Error(`Could not determine the timezone for: ${placeName}`);
        }

        const timezoneString = geoData.results[0].timezone; // e.g., "Asia/Tokyo"
        const resolvedName = `${geoData.results[0].name}, ${geoData.results[0].country}`;

        // 2. NEW: Calculate the time locally using Native JavaScript!
        // This removes the dependency on the flaky WorldTimeAPI server.
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezoneString,
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'longOffset' // Gets the UTC offset like GMT+09:00
        });

        const localTime = formatter.format(new Date());

        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    location: resolvedName,
                    timezone: timezoneString,
                    currentTime: localTime
                }, null, 2)
            }]
        };
    } catch (error: any) {
        throw new Error(`Timezone lookup failed: ${error.message}`);
    }
}