<p align="center">
  <h1 align="center">🌍 BhramanAI</h1>
  <p align="center">
    <strong>AI-Powered Travel Itinerary Planner — built with LangGraph, MCP Servers, and OpenAI</strong>
  </p>
  <p align="center">
    <a href="#-features">Features</a> •
    <a href="#-architecture">Architecture</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-project-structure">Project Structure</a> •
    <a href="#-api-reference">API Reference</a>
  </p>
</p>

---

BhramanAI is a full-stack, AI-first travel planner that generates **personalized, day-by-day itineraries** in real time. Users chat with an AI concierge that extracts trip requirements, then a multi-agent LangGraph pipeline autonomously researches flights, hotels, activities, food, weather, and logistics — synthesizing everything into a structured, saveable itinerary.

The system uses **6 custom MCP (Model Context Protocol) servers** as specialized tool backends, enabling each AI agent to access real-world data from Google Flights, Geoapify, Open-Meteo, OpenRouteService, and more.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Chat Onboarding** | Conversational interface that extracts trip preferences (destination, dates, budget, travel style) via structured output |
| ✈️ **Smart Flight Search** | Autonomously resolves IATA codes, finds nearest airports, and retries with alternatives |
| 🏨 **Hotel Discovery** | Searches hotels near the destination using Geoapify Places API |
| 🎢 **Activity Research** | Finds top tourist attractions, museums, parks, and sights — deduplicated and validated |
| 🍱 **Food Recommendations** | Discovers restaurants and cafes near the selected hotel using geo-coordinates |
| 🌤️ **Weather Forecasts** | Fetches multi-day weather forecasts via Open-Meteo for packing and planning |
| 🚗 **Logistics Calculation** | Calculates driving distances, travel times, and timezone info via OpenRouteService |
| 💱 **Currency Conversion** | Live exchange rates for budget planning across currencies |
| 📝 **Itinerary Generation** | GPT-4o synthesizes all data into an immersive, day-by-day itinerary |
| 💾 **Database Persistence** | Itineraries are auto-saved to MongoDB via a LangGraph tool call |
| 📡 **Real-Time SSE Streaming** | Server-Sent Events push node-by-node progress updates to the frontend |
| 🔐 **Google OAuth** | Secure authentication with Google, including Calendar scope for future integrations |
| 🏨 **Recommendation Engine** | Hotel & activity recommendations page with fallback data when APIs are unavailable |

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          FRONTEND                                │
│                 React 19 + Vite + TailwindCSS                    │
│                                                                  │
│   Chat UI ──→ POST /api/v1/chat ──→ chatGraph (onboarding)      │
│   Trip UI ──→ POST /api/v1/trips ──→ travelGraph (generation)   │
│   SSE     ←── GET  /api/v1/trips/:id/stream ←── live progress   │
└───────────────────────────┬──────────────────────────────────────┘
                            │ HTTP / SSE
┌───────────────────────────▼──────────────────────────────────────┐
│                    BACKEND (Express 5 + TypeScript)               │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              LangGraph Orchestration Layer                  │  │
│  │                                                             │  │
│  │  travelGraph:                                               │  │
│  │    researcher → plannerGraph (sub) → logistics → itinerary  │  │
│  │                                                             │  │
│  │  plannerGraph (sub-graph):                                  │  │
│  │    flights → hotels ║ activities → food → budget            │  │
│  │             (parallel fan-out)    (fan-in)                  │  │
│  │                                                             │  │
│  │  chatGraph:                                                 │  │
│  │    onboarding (structured output via Zod)                   │  │
│  └──────────────────────────┬─────────────────────────────────┘  │
│                             │                                    │
│  ┌──────────────────────────▼─────────────────────────────────┐  │
│  │                 MCP Tool Bridge                             │  │
│  │    DynamicStructuredTool → ToolRegistry → ServerRegistry    │  │
│  └──────────────────────────┬─────────────────────────────────┘  │
│                             │ stdio                              │
│  ┌──────────────────────────▼─────────────────────────────────┐  │
│  │               6 MCP Servers (child processes)               │  │
│  │                                                             │  │
│  │  flights-mcp    → SerpAPI (Google Flights)                  │  │
│  │  hotels-mcp     → Geoapify Places API                      │  │
│  │  activity-mcp   → Geoapify Places API                      │  │
│  │  weather-mcp    → Open-Meteo (free, no key needed)          │  │
│  │  distance-mcp   → OpenRouteService + TimezoneDB             │  │
│  │  currency-mcp   → ExchangeRate-API                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                     Data Layer                              │  │
│  │  MongoDB Atlas (Mongoose ODM)                               │  │
│  │  ├── Users (Google OAuth profiles + tokens)                 │  │
│  │  ├── Trips (metadata, status, destination)                  │  │
│  │  └── Itineraries (day-by-day activities, saved by AI)       │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### LangGraph Pipeline — Node-by-Node Flow

```
 User Request
      │
      ▼
┌─────────────┐
│  researcher  │  Creates baseline research notes from tripContext
└──────┬──────┘
       │
       ▼
┌───────────────────────────────────────────────────────┐
│                  planner (SUB-GRAPH)                   │
│                                                       │
│  ┌──────────┐                                         │
│  │ flights  │  Resolves IATA codes, calls SerpAPI     │
│  └─────┬────┘                                         │
│     ┌──┴──┐         ← Parallel fan-out               │
│     │     │                                           │
│     ▼     ▼                                           │
│  ┌──────┐ ┌────────────┐                              │
│  │hotels│ │ activities  │  Both hit Geoapify in       │
│  └──┬───┘ └─────┬──────┘  parallel                   │
│     │           │                                     │
│     └─────┬─────┘         ← Fan-in join              │
│           ▼                                           │
│     ┌──────────┐                                      │
│     │   food   │  Finds restaurants near hotel coords │
│     └────┬─────┘                                      │
│          ▼                                            │
│     ┌──────────┐                                      │
│     │  budget  │  Sums all estimated costs            │
│     └────┬─────┘                                      │
│          ▼                                            │
│         END                                           │
└───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│  logistics   │  Driving distances + timezone via OpenRouteService
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  itinerary   │  GPT-4o synthesizes everything → saves to MongoDB
└──────┬───────┘
       │
       ▼
      END
```

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI framework |
| TypeScript | 5.9 | Type safety |
| Vite | 8.x | Build tool and dev server |
| TailwindCSS | 3.4 | Utility-first CSS |
| React Router DOM | 7.x | Client-side routing |
| Framer Motion | 12.x | Animations and transitions |
| Lucide React | 1.7 | Icon library |
| Axios | 1.14 | HTTP client |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Express | 5.x | HTTP server framework |
| TypeScript | 5.9 | Type safety |
| LangGraph | 1.2.x | Multi-agent orchestration |
| LangChain | 1.2.x | LLM framework + tool abstraction |
| OpenAI (via LangChain) | — | GPT-4o & GPT-4o-mini for all agents |
| Tavily Search | 1.2 | Web search tool for destination discovery |
| MCP SDK | 1.27 | Model Context Protocol server/client |
| Mongoose | 9.x | MongoDB ODM |
| Passport.js | 0.7 | Authentication (Google OAuth 2.0) |
| Zod | 4.x | Schema validation (structured output + tool schemas) |
| connect-mongo | 6.x | Session store |

### MCP Servers (6 Microservices)

| Server | External API | Tools Exposed |
|--------|-------------|---------------|
| `flights-mcp` | [SerpAPI](https://serpapi.com/) (Google Flights engine) | `search_flights` |
| `hotels-mcp` | [Geoapify](https://www.geoapify.com/) Places API | `search_hotels`, `get_nearby_food`, `get_hotel_details`, `check_hotel_availability` |
| `activity-mcp` | [Geoapify](https://www.geoapify.com/) Places API | `search_activities` |
| `weather-mcp` | [Open-Meteo](https://open-meteo.com/) (free, no key) | `get_weather_forecast` |
| `distance-time-mcp` | [OpenRouteService](https://openrouteservice.org/) + TimezoneDB | `calculate_routing_distance_and_time`, `get_time_and_timezone` |
| `currency-mcp` | [ExchangeRate-API](https://www.exchangerate-api.com/) | `convert_currency` |

### Database

| Technology | Purpose |
|------------|---------|
| MongoDB Atlas | Cloud-hosted database |
| Collections | `users`, `trips`, `itineraries` |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB Atlas** account (or local MongoDB)
- API keys for the external services (see below)

### 1. Clone the Repository

```bash
git clone https://github.com/Rahul10182/BhramanAI.git
cd BhramanAI
```

### 2. Install Dependencies

```bash
# Root dependencies
npm install

# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install

# MCP server dependencies (each is a separate package)
cd ../mcp-servers
for dir in activity-mcp currency-mcp distance-time-mcp flights-mcp hotels-mcp weather-mcp; do
  cd "$dir" && npm install && cd ..
done
```

### 3. Configure Environment Variables

Create a `.env` file in `backend/`:

```env
# OpenAI
OPENAI_API_KEY=sk-proj-your-key-here

# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/bhramanai

# Tavily (for web search / destination discovery)
TAVILY_API_KEY=tvly-your-key-here

# Server
PORT=3000
FRONTEND_URL=http://localhost:5173

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Session
SESSION_SECRET=your-session-secret
```

Create `.env` files in each MCP server directory:

```env
# mcp-servers/flights-mcp/.env
SERPAPI_KEY=your-serpapi-key

# mcp-servers/hotels-mcp/.env
GEOAPIFY_API_KEY=your-geoapify-key

# mcp-servers/activity-mcp/.env
GEOAPIFY_API_KEY=your-geoapify-key

# mcp-servers/distance-time-mcp/.env
ORS_API_KEY=your-openrouteservice-key

# mcp-servers/currency-mcp/.env
EXCHANGERATE_API_KEY=your-exchangerate-key

# mcp-servers/weather-mcp/.env
# No key needed — Open-Meteo is free!
```

### 4. Build MCP Servers

```bash
cd mcp-servers
for dir in activity-mcp currency-mcp distance-time-mcp flights-mcp hotels-mcp weather-mcp; do
  cd "$dir" && npm run build && cd ..
done
```

### 5. Run the Application

```bash
# Terminal 1: Start backend (auto-boots all MCP servers via stdio)
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

The backend will:
1. Initialize all 6 MCP servers as child processes
2. Connect to MongoDB Atlas
3. Start Express on `http://localhost:3000`

The frontend will start on `http://localhost:5173`.

---

## 📁 Project Structure

```
BhramanAI/
├── frontend/                          # React + Vite frontend
│   ├── src/
│   │   ├── apis/                      # API client modules
│   │   │   ├── authApi.ts             # Google OAuth, login/logout, session
│   │   │   ├── chatApi.ts             # Chat onboarding API calls
│   │   │   └── tripApi.ts             # Trip CRUD + SSE streaming
│   │   ├── components/
│   │   │   ├── chat/                  # Chat UI components
│   │   │   ├── common/                # Navbar, shared components
│   │   │   ├── itinerary/             # Itinerary display components
│   │   │   └── trip/                  # Trip card & list components
│   │   ├── pages/
│   │   │   ├── Home/                  # Landing page
│   │   │   ├── Planner/               # Trip planner form
│   │   │   ├── Trip/                  # Trip list + detail pages
│   │   │   ├── Booking/               # Booking management
│   │   │   ├── Profile/               # User profile
│   │   │   ├── Register/              # Login, Signup, OAuth callback
│   │   │   ├── Recommendations/       # Hotel & activity recommendations
│   │   │   └── test/                  # ChatBot test page
│   │   ├── types/
│   │   │   └── chat.types.ts          # TypeScript interfaces for chat
│   │   ├── App.tsx                    # Root component with routing
│   │   └── main.tsx                   # Vite entry point
│   └── package.json
│
├── backend/                           # Express + LangGraph backend
│   ├── src/
│   │   ├── langgraph/                 # 🧠 AI Orchestration Core
│   │   │   ├── graph/
│   │   │   │   ├── travel.graph.ts    # Master graph (researcher → planner → logistics → itinerary)
│   │   │   │   ├── planner.graph.ts   # Sub-graph (flights → hotels ║ activities → food → budget)
│   │   │   │   ├── research.graph.ts  # Research sub-graph (destination → weather)
│   │   │   │   └── chat.graph.ts      # Onboarding graph (chat → extract trip details)
│   │   │   ├── state/
│   │   │   │   ├── travel.state.ts    # TravelStateAnnotation (master state)
│   │   │   │   └── planner.state.ts   # PlannerStateAnnotation (sub-graph state)
│   │   │   ├── nodes/
│   │   │   │   ├── onboarding.node.ts # Extracts trip details from chat via structured output
│   │   │   │   ├── researcher.node.ts # Creates baseline research notes
│   │   │   │   ├── destination.node.ts# Discovers destination via Tavily web search
│   │   │   │   ├── flights.node.ts    # Flight search with IATA resolution
│   │   │   │   ├── hotels.node.ts     # Hotel search via Geoapify MCP
│   │   │   │   ├── activities.node.ts # Activity search + deduplication
│   │   │   │   ├── food.node.ts       # Food search near hotel coordinates
│   │   │   │   ├── weather.node.ts    # Weather forecast lookup
│   │   │   │   ├── distance-time.node.ts # Routing + timezone calculations
│   │   │   │   ├── budget.node.ts     # Cost aggregation
│   │   │   │   ├── itinerary.node.ts  # Final synthesis + DB save
│   │   │   │   └── planner.node.ts    # Planner architect (orchestrates tools)
│   │   │   ├── agents/
│   │   │   │   ├── personalization.agent.ts  # Zod structured output for chat (gpt-4o-mini)
│   │   │   │   ├── destination.agent.ts      # ReAct agent with Tavily search
│   │   │   │   ├── flight.agent.ts           # gpt-4o-mini with bound flight tools
│   │   │   │   ├── hotel.agent.ts            # ReAct agent with hotel MCP tools
│   │   │   │   ├── activity.agent.ts         # ReAct agent with activity MCP tools
│   │   │   │   ├── food.agent.ts             # ReAct agent with food MCP tools
│   │   │   │   ├── weather.agent.ts          # gpt-4o-mini with bound weather tools
│   │   │   │   ├── distance-time.agent.ts    # gpt-4o-mini with bound routing tools
│   │   │   │   ├── planner.agent.ts          # gpt-4o-mini with search + currency tools
│   │   │   │   └── itinerary.agent.ts        # gpt-4o (upgraded) with itinerary save tool
│   │   │   ├── tools/
│   │   │   │   ├── search.tool.ts            # Tavily web search (maxResults: 3)
│   │   │   │   ├── flight.tools.ts           # search_flights (SerpAPI via MCP)
│   │   │   │   ├── hotel.tool.ts             # search_hotels, get_details, check_availability
│   │   │   │   ├── activity.tool.ts          # search_activities (Geoapify via MCP)
│   │   │   │   ├── food.tool.ts              # get_nearby_food (Geoapify via MCP)
│   │   │   │   ├── weather.tool.ts           # get_weather_forecast (Open-Meteo via MCP)
│   │   │   │   ├── distance-time.tool.ts     # routing + timezone (OpenRouteService via MCP)
│   │   │   │   ├── currency.tool.ts          # convert_currency (ExchangeRate via MCP)
│   │   │   │   └── itinerary.tool.ts         # save_final_itinerary (persists to MongoDB)
│   │   │   └── utils/
│   │   │       └── tool-executor.ts          # Reusable tool execution loop
│   │   ├── mcp/
│   │   │   ├── client/                # MCP client connection logic
│   │   │   └── registry/
│   │   │       ├── server.registry.ts # Boots and manages all MCP server processes
│   │   │       └── tool.registry.ts   # Central registry for all MCP-exposed tools
│   │   ├── services/
│   │   │   ├── trip.service.ts        # Orchestrates travelGraph execution with SSE streaming
│   │   │   ├── itinerary.service.ts   # Saves structured itinerary days to MongoDB
│   │   │   ├── recommendation.service.ts # Fetches hotel/activity recs with fallbacks
│   │   │   ├── sse.service.ts         # Server-Sent Events manager
│   │   │   └── google-calendar.service.ts # Google Calendar integration
│   │   ├── api/
│   │   │   ├── routes/                # Express route definitions
│   │   │   ├── controllers/           # Route handlers
│   │   │   └── middlewares/           # Auth middleware
│   │   ├── database/
│   │   │   ├── models/                # Mongoose schemas (User, Trip, Itinerary)
│   │   │   └── repositories/          # Data access layer
│   │   ├── config/
│   │   │   ├── mcp.config.ts          # MCP initialization (boots all 6 servers)
│   │   │   ├── mongodb.config.ts      # MongoDB connection
│   │   │   └── passport.config.ts     # Google OAuth strategy
│   │   ├── app.ts                     # Express app setup (CORS, sessions, routes)
│   │   └── server.ts                  # Boot sequence (MCP → MongoDB → Express)
│   └── package.json
│
└── mcp-servers/                       # 6 independent MCP microservices
    ├── flights-mcp/
    │   └── src/
    │       ├── server.ts              # MCP server entry (stdio transport)
    │       ├── providers/serpapi.provider.ts  # SerpAPI Google Flights integration
    │       └── tools/searchFlights.tool.ts
    ├── hotels-mcp/
    │   └── src/
    │       ├── server.ts
    │       ├── providers/geoapify.provider.ts # Geocoding + Places API
    │       └── tools/ (searchHotels, searchFood, hotelDetails, checkAvailability)
    ├── activity-mcp/
    │   └── src/
    │       ├── server.ts
    │       ├── providers/geoapify.provider.ts
    │       └── tools/searchActivities.tool.ts
    ├── weather-mcp/
    │   └── src/
    │       ├── server.ts
    │       ├── providers/openmeteo.provider.ts  # Free weather API (no key needed)
    │       └── tools/forecast.tool.ts
    ├── distance-time-mcp/
    │   └── src/
    │       ├── server.ts
    │       └── tools/ (routing.tool.ts, timezone.tool.ts)
    └── currency-mcp/
        └── src/
            ├── server.ts
            ├── providers/forex.provider.ts  # ExchangeRate-API
            └── tools/convertCurrency.tool.ts
```

---

## 🧠 How It Works — Detailed Flow

### Phase 1: Chat Onboarding

1. User opens the **Chat UI** and starts describing their trip
2. Each message is sent to `POST /api/v1/chat`
3. The **chatGraph** runs the `onboardingNode` which uses the `personalizationAgent`
4. The agent uses `gpt-4o-mini` with **Zod structured output** to extract:
   - Source city, destination, dates, budget, traveler count, travel style
5. If any field is missing, the AI asks a follow-up question
6. Once `isComplete: true`, the frontend triggers trip generation

### Phase 2: Trip Generation

1. Frontend calls `POST /api/v1/trips` with the extracted trip details
2. `TripService.generateAITrip()` constructs the initial state and invokes `travelGraph.stream()`
3. **SSE streaming** pushes real-time progress events to the frontend as each node completes

### Phase 3: Multi-Agent Execution

The `travelGraph` executes nodes in this order:

| Step | Node | Agent | Model | What Happens |
|------|------|-------|-------|-------------|
| 1 | `researcher` | — | — | Creates baseline research notes from tripContext |
| 2 | `flights` | `flightLLM` | gpt-4o-mini | Resolves IATA codes → calls `search_flights` MCP → retries with nearby airports |
| 3a | `hotels` | `hotelAgent` (ReAct) | gpt-4o-mini | Calls `search_hotels` MCP → returns top 3 hotels as JSON |
| 3b | `activities` | `activityAgent` (ReAct) | gpt-4o-mini | Calls `search_activities` MCP → returns top 5 unique attractions |
| 4 | `food` | `foodAgent` (ReAct) | gpt-4o-mini | Uses hotel lat/lon → calls `get_nearby_food` MCP → returns top 5 restaurants |
| 5 | `budget` | — | — | Sums flights + hotels × days + activities + food costs |
| 6 | `logistics` | `distanceTimeLLM` | gpt-4o-mini | Calls routing + timezone MCP tools |
| 7 | `itinerary` | `itineraryLLM` | **gpt-4o** | Synthesizes ALL data into a day-by-day itinerary → calls `save_final_itinerary` tool → persists to MongoDB |

### Phase 4: Result Delivery

1. SSE sends a `complete` event to the frontend
2. User navigates to the **Trip Detail** page to view their generated itinerary
3. Itinerary data is fetched from MongoDB and rendered with activity cards, weather info, and cost breakdowns

---

## 🔌 MCP Server Details

Each MCP server runs as a **child process** communicating with the backend via **stdio transport** using the [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk).

### Why MCP?

- **Decoupled tool servers**: Each external API integration is isolated in its own process
- **Protocol standardization**: Tools follow a consistent interface regardless of the backing API
- **Independent scaling**: Each server can be developed, tested, and deployed independently
- **Hot-swappable**: Switching from Geoapify to Google Places just means changing the provider inside the MCP server — no LangGraph changes needed

### Tool Summary

| Tool Name | MCP Server | Input | Output |
|-----------|-----------|-------|--------|
| `search_flights` | flights-mcp | `origin_iata`, `destination_iata`, `departure_date` | Flight options with prices, airlines, durations |
| `search_hotels` | hotels-mcp | `city`, `checkIn?`, `checkOut?`, `guests?` | Hotel list with name, address, lat/lon, images |
| `get_hotel_details` | hotels-mcp | `hotelId` | Detailed hotel info (phone, website, categories) |
| `check_hotel_availability` | hotels-mcp | `hotelId`, `checkIn`, `checkOut` | Availability + room options + pricing |
| `get_nearby_food` | hotels-mcp | `lat`, `lon` | Restaurants/cafes within 2km radius |
| `search_activities` | activity-mcp | `city` | Tourist attractions, museums, parks |
| `get_weather_forecast` | weather-mcp | `location`, `start_date`, `days?` | Daily temps (high/low), precipitation |
| `calculate_routing_distance_and_time` | distance-time-mcp | `source`, `destination` | Driving distance (km) + estimated time |
| `get_time_and_timezone` | distance-time-mcp | `placeName` | Local time, timezone name, UTC offset |
| `convert_currency` | currency-mcp | `amount`, `from`, `to` | Exchange rate + converted amount |

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/google` | Initiate Google OAuth login |
| GET | `/api/auth/google/callback` | OAuth callback handler |
| GET | `/api/auth/session` | Check current session |
| POST | `/api/auth/logout` | Logout and destroy session |

### Trips

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/trips` | Create a new trip + trigger AI generation |
| GET | `/api/v1/trips` | List all trips for authenticated user |
| GET | `/api/v1/trips/:id` | Get trip details |
| GET | `/api/v1/trips/:id/stream` | SSE endpoint for real-time generation progress |

### Itineraries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/itineraries/:tripId` | Get all itinerary days for a trip |

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/chat` | Send a message to the AI onboarding concierge |

### Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/recommendations/:tripId` | Get hotel & activity recommendations |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |

---

## 🧪 Testing

### MCP Integration Test

Verifies all 6 MCP servers boot and register their tools:

```bash
cd backend
npx tsx src/test-mcp.ts
```

Expected output: `✅ Found 10 total tools registered across all servers`

### Full Graph End-to-End Test

Runs the entire `travelGraph` with a sample trip to Goa:

```bash
cd backend
npx tsx src/test_arch.ts
```

This test:
- Connects to all MCP servers
- Connects to MongoDB
- Streams the graph node-by-node
- Logs tool calls and their results
- Generates and saves a full 7-day itinerary

### Standalone Agent Test

Tests the distance-time agent in isolation:

```bash
cd backend
npx tsx src/agent.ts
```

---

## ⚙️ Key Design Decisions

### Why LangGraph over LangChain Agents?

- **Deterministic flow control**: LangGraph gives us explicit `addEdge()` wiring vs LangChain's autonomous agent loops
- **Parallel execution**: Native support for fan-out/fan-in patterns (hotels ║ activities)
- **Sub-graphs**: The planner pipeline is encapsulated as a reusable sub-graph with its own state annotation
- **Streaming**: Built-in support for streaming node-by-node updates via `graph.stream()`
- **State management**: Typed state annotations with custom reducers (merge, append, replace)

### Why MCP over Direct API Calls?

- **Separation of concerns**: LLM agents don't know about HTTP endpoints, API keys, or response formats
- **Protocol standardization**: All tools follow the same MCP interface regardless of backing API
- **Testability**: MCP servers can be tested independently of the LangGraph pipeline
- **Future-proofing**: Easily swap providers (e.g., Geoapify → Google Places) without touching agent code

### Model Selection Strategy

| Task | Model | Temperature | Rationale |
|------|-------|-------------|-----------|
| Factual retrieval (flights, routing) | gpt-4o-mini | 0 | Deterministic, cheap ($0.15/1M tokens) |
| Data extraction (hotels, activities) | gpt-4o-mini | 0 | Structured JSON output |
| Chat onboarding | gpt-4o-mini | 0.3 | Slightly creative but still structured |
| Itinerary writing | **gpt-4o** | 0.6 | High-quality creative long-form writing |

### Hallucination Prevention

- All data-fetching agents use **real MCP tools** — never free-form generation
- `temperature: 0` for all factual agents
- **Zod schema enforcement** for structured outputs
- **Post-processing**: deduplication, name validation, count limits in every node
- Explicit prompt rules: *"IF THE TOOL FAILS, RETURN `[]`. DO NOT RETRY."*

---

## 🔑 API Keys Required

| Service | Free Tier | Get Key |
|---------|-----------|---------|
| OpenAI | Pay-as-you-go | [platform.openai.com](https://platform.openai.com/) |
| Tavily | 1,000 free searches/month | [tavily.com](https://tavily.com/) |
| Geoapify | 3,000 free requests/day | [geoapify.com](https://www.geoapify.com/) |
| SerpAPI | 100 free searches/month | [serpapi.com](https://serpapi.com/) |
| OpenRouteService | 2,000 free requests/day | [openrouteservice.org](https://openrouteservice.org/) |
| ExchangeRate-API | 1,500 free requests/month | [exchangerate-api.com](https://www.exchangerate-api.com/) |
| Open-Meteo | **Free** (no key needed) | [open-meteo.com](https://open-meteo.com/) |
| Google OAuth | Free | [console.cloud.google.com](https://console.cloud.google.com/) |
| MongoDB Atlas | Free tier (512 MB) | [mongodb.com/atlas](https://www.mongodb.com/atlas) |

---

## 📜 Scripts Reference

### Backend

```bash
npm run dev      # Start with hot-reload (tsx watch)
npm run build    # Compile TypeScript
npm start        # Run compiled JS (production)
```

### Frontend

```bash
npm run dev      # Vite dev server (port 5173)
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint check
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ using LangGraph, MCP, and OpenAI
</p>
