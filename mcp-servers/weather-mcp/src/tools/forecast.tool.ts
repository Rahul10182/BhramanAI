import { getCoordinates, getWeatherData } from "../providers/openmeteo.provider.js";

// 1. Define the tool schema for the MCP Server
export const forecastToolDefinition = {
  name: "get_weather_forecast",
  description: "Fetches the weather forecast for a specific location over a number of days.",
  inputSchema: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "The name of the city or place (e.g., 'Prayagraj', 'Tokyo')."
      },
      start_date: {
        type: "string",
        description: "The start date for the forecast in YYYY-MM-DD format."
      },
      days: {
        type: "number",
        description: "The number of days to fetch the forecast for (minimum 1)."
      }
    },
    required: ["location", "start_date", "days"]
  }
};

// 2. Define the execution logic
export async function executeForecastTool(args: any) {
  const { location, start_date, days } = args;

  if (days <= 0) {
    return { content: [{ type: "text", text: "Number of days must be at least 1." }] };
  }

  const coords = await getCoordinates(location);
  if (!coords) {
    return { content: [{ type: "text", text: `Could not find coordinates for '${location}'.` }] };
  }

  const weatherData = await getWeatherData(coords.lat, coords.lon, start_date, days);
  
  if (weatherData && weatherData.daily) {
    let resultText = `Weather Forecast for ${coords.name}:\n`;
    const daily = weatherData.daily;
    
    for (let i = 0; i < daily.time.length; i++) {
      resultText += `Date: ${daily.time[i]} | Max Temp: ${daily.temperature_2m_max[i]}°C | Min Temp: ${daily.temperature_2m_min[i]}°C | Precip: ${daily.precipitation_sum[i]}mm\n`;
    }
    return { content: [{ type: "text", text: resultText }] };
  }

  return { content: [{ type: "text", text: "Failed to parse weather data." }] };
}