# Integration Guide: Real Weather Data and Maps

This guide explains how to integrate real weather data and interactive maps into the CommLink Technician Operations Monitoring system.

## Table of Contents
1. [Weather API Integration](#weather-api-integration)
2. [Maps Integration](#maps-integration)
3. [ETA Calculation Enhancement](#eta-calculation-enhancement)
4. [Production Deployment](#production-deployment)

---

## Weather API Integration

### Option 1: OpenWeatherMap API (Recommended)

**Why OpenWeatherMap?**
- Free tier available (60 calls/minute)
- Comprehensive weather data
- Global coverage
- Easy to integrate

**Setup Steps:**

1. **Get API Key**
   - Sign up at https://openweathermap.org/api
   - Subscribe to "Current Weather Data" API (free)
   - Copy your API key

2. **Update Weather Service**

Edit `backend/weather-service/src/index.ts`:

```typescript
import axios from 'axios';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Replace the dummy weather endpoint
app.get('/weather', async (req: Request, res: Response) => {
  const { lat, lng } = req.query;
  
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and longitude required' });
  }
  
  try {
    const response = await axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
      params: {
        lat,
        lon: lng,
        appid: OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });
    
    const data = response.data;
    const weather: WeatherData = {
      location: { lat: parseFloat(lat as string), lng: parseFloat(lng as string) },
      temperature: data.main.temp,
      condition: data.weather[0].main,
      windSpeed: data.wind.speed * 3.6, // Convert m/s to km/h
      precipitation: data.rain?.['1h'] || 0,
      visibility: data.visibility / 1000, // Convert m to km
      timestamp: new Date()
    };
    
    res.json(weather);
  } catch (error) {
    console.error('OpenWeatherMap API error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});
```

3. **Add Environment Variable**

Update `backend/weather-service/.env`:
```
PORT=3004
OPENWEATHER_API_KEY=your_api_key_here
```

4. **Update Docker Compose**

Add to `docker-compose.yml`:
```yaml
weather-service:
  environment:
    - PORT=3004
    - OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY}
```

### Option 2: WeatherAPI.com

**Setup:**
```typescript
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_URL = 'https://api.weatherapi.com/v1';

app.get('/weather', async (req: Request, res: Response) => {
  const { lat, lng } = req.query;
  
  try {
    const response = await axios.get(`${WEATHER_API_URL}/current.json`, {
      params: {
        key: WEATHER_API_KEY,
        q: `${lat},${lng}`
      }
    });
    
    const data = response.data.current;
    const weather: WeatherData = {
      location: { lat: parseFloat(lat as string), lng: parseFloat(lng as string) },
      temperature: data.temp_c,
      condition: data.condition.text,
      windSpeed: data.wind_kph,
      precipitation: data.precip_mm,
      visibility: data.vis_km,
      timestamp: new Date()
    };
    
    res.json(weather);
  } catch (error) {
    console.error('WeatherAPI error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});
```

---

## Maps Integration

### Current Setup: OpenStreetMap (Free)

The application currently uses OpenStreetMap tiles which are:
- ✅ Free and open-source
- ✅ No API key required
- ✅ Good for development and production
- ⚠️ Rate limits apply for heavy usage

### Option 1: Google Maps API (Premium Features)

**Why Google Maps?**
- Real-time traffic data
- Accurate ETA calculations
- Street view integration
- Better geocoding

**Setup Steps:**

1. **Get API Key**
   - Go to https://console.cloud.google.com/
   - Enable Maps JavaScript API, Geocoding API, and Directions API
   - Create API key with restrictions

2. **Install Google Maps React**
```bash
cd frontend
npm install @react-google-maps/api
```

3. **Update TechnicianMap Component**

Replace `frontend/src/components/TechnicianMap.tsx`:

```typescript
import { GoogleMap, LoadScript, Marker, Circle } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function TechnicianMap() {
  // ... existing state ...

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={{ lat: 14.5995, lng: 121.0000 }}
        zoom={12}
      >
        {filteredTechnicians.map((tech) => (
          <div key={tech.id}>
            <Circle
              center={{ lat: tech.location.lat, lng: tech.location.lng }}
              radius={500}
              options={{
                fillColor: getStatusColor(tech.status),
                fillOpacity: 0.2,
                strokeColor: getStatusColor(tech.status),
                strokeWeight: 2,
              }}
            />
            <Marker
              position={{ lat: tech.location.lat, lng: tech.location.lng }}
              title={tech.name}
            />
          </div>
        ))}
      </GoogleMap>
    </LoadScript>
  );
}
```

4. **Add Environment Variable**

Update `frontend/.env`:
```
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Option 2: Mapbox (Modern Alternative)

**Setup:**
```bash
npm install react-map-gl mapbox-gl
```

```typescript
import Map, { Marker, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function TechnicianMap() {
  return (
    <Map
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={{
        longitude: 121.0000,
        latitude: 14.5995,
        zoom: 12
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
    >
      {filteredTechnicians.map((tech) => (
        <Marker
          key={tech.id}
          longitude={tech.location.lng}
          latitude={tech.location.lat}
        />
      ))}
    </Map>
  );
}
```

---

## ETA Calculation Enhancement

### Integrate Real Traffic Data

**Using Google Maps Directions API:**

Update `backend/weather-service/src/index.ts`:

```typescript
import axios from 'axios';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

app.post('/weather/calculate-eta', async (req: Request, res: Response) => {
  const { technicianLocation, ticketLocation, technicianId, ticketId } = req.body;
  
  try {
    // Get real-time traffic data from Google Maps
    const directionsResponse = await axios.get(
      'https://maps.googleapis.com/maps/api/directions/json',
      {
        params: {
          origin: `${technicianLocation.lat},${technicianLocation.lng}`,
          destination: `${ticketLocation.lat},${ticketLocation.lng}`,
          departure_time: 'now',
          traffic_model: 'best_guess',
          key: GOOGLE_MAPS_API_KEY
        }
      }
    );
    
    const route = directionsResponse.data.routes[0];
    const leg = route.legs[0];
    
    // Get traffic-adjusted duration
    const trafficDuration = leg.duration_in_traffic.value / 60; // Convert to minutes
    const distance = leg.distance.value / 1000; // Convert to km
    
    // Get weather data
    const weatherResponse = await axios.get(
      `http://localhost:3004/weather?lat=${ticketLocation.lat}&lng=${ticketLocation.lng}`
    );
    const weather = weatherResponse.data;
    
    // Calculate weather delay
    let weatherDelay = 0;
    if (weather.precipitation > 50) weatherDelay += 15;
    else if (weather.precipitation > 20) weatherDelay += 8;
    
    if (weather.visibility < 5) weatherDelay += 10;
    else if (weather.visibility < 8) weatherDelay += 5;
    
    if (weather.windSpeed > 40) weatherDelay += 20;
    else if (weather.windSpeed > 25) weatherDelay += 10;
    
    const etaCalculation = {
      technicianId,
      ticketId,
      baseETA: trafficDuration,
      weatherDelay,
      trafficDelay: 0, // Already included in duration_in_traffic
      totalETA: Math.round(trafficDuration + weatherDelay),
      distance: Math.round(distance * 10) / 10
    };
    
    res.json({
      ...etaCalculation,
      weather: {
        condition: weather.condition,
        precipitation: weather.precipitation,
        visibility: weather.visibility,
        windSpeed: weather.windSpeed
      },
      trafficConditions: route.summary
    });
  } catch (error) {
    console.error('ETA calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate ETA' });
  }
});
```

---

## Production Deployment

### Environment Variables Checklist

**Backend Services:**
```bash
# API Gateway
PORT=3000
TECHNICIAN_SERVICE_URL=http://technician-service:3001
TICKET_SERVICE_URL=http://ticket-service:3002
DISPATCH_SERVICE_URL=http://dispatch-service:3003
WEATHER_SERVICE_URL=http://weather-service:3004

# Weather Service
PORT=3004
OPENWEATHER_API_KEY=your_key
GOOGLE_MAPS_API_KEY=your_key  # Optional, for traffic data
```

**Frontend:**
```bash
VITE_API_URL=https://your-api-domain.com/api
VITE_GOOGLE_MAPS_API_KEY=your_key  # If using Google Maps
VITE_MAPBOX_TOKEN=your_token  # If using Mapbox
```

### Rate Limiting Considerations

**OpenWeatherMap Free Tier:**
- 60 calls/minute
- 1,000,000 calls/month
- Implement caching for 5-10 minutes

**Google Maps:**
- $200 free credit monthly
- ~40,000 free map loads
- ~40,000 free geocoding requests

**Caching Strategy:**

```typescript
// Simple in-memory cache
const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

app.get('/weather', async (req: Request, res: Response) => {
  const { lat, lng } = req.query;
  const cacheKey = `${lat},${lng}`;
  
  // Check cache
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return res.json(cached.data);
  }
  
  // Fetch fresh data
  const weatherData = await fetchWeatherFromAPI(lat, lng);
  weatherCache.set(cacheKey, { data: weatherData, timestamp: Date.now() });
  
  res.json(weatherData);
});
```

### Security Best Practices

1. **API Key Protection:**
   - Never commit API keys to Git
   - Use environment variables
   - Restrict API keys by domain/IP
   - Enable billing alerts

2. **Rate Limiting:**
   - Implement request throttling
   - Use Redis for distributed rate limiting
   - Monitor API usage

3. **CORS Configuration:**
   - Restrict origins in production
   - Use proper authentication

---

## Testing Integration

### Test Weather API:
```bash
curl "http://localhost:3004/weather?lat=14.5995&lng=120.9842"
```

### Test ETA Calculation:
```bash
curl -X POST http://localhost:3004/weather/calculate-eta \
  -H "Content-Type: application/json" \
  -d '{
    "technicianLocation": {"lat": 14.5995, "lng": 120.9842},
    "ticketLocation": {"lat": 14.6091, "lng": 121.0223},
    "baseETA": 30,
    "technicianId": "tech-001",
    "ticketId": "ticket-001"
  }'
```

---

## Cost Estimation

### Monthly Costs (Approximate)

**OpenWeatherMap:**
- Free: Up to 1M calls/month
- Startup: $40/month (3M calls)

**Google Maps:**
- Free: $200 credit (~40K requests)
- Pay-as-you-go: $7 per 1000 requests

**Mapbox:**
- Free: 50K map loads/month
- Pay-as-you-go: $5 per 1000 loads

### Recommended Setup for Production:
- **Weather:** OpenWeatherMap (Free tier with caching)
- **Maps:** OpenStreetMap (Free) or Mapbox (Better UX)
- **Traffic:** Google Maps Directions API (Only when needed)

---

## Support

For issues or questions:
- OpenWeatherMap: https://openweathermap.org/faq
- Google Maps: https://developers.google.com/maps/support
- Mapbox: https://docs.mapbox.com/help/

## Next Steps

1. Choose your weather API provider
2. Get API keys
3. Update environment variables
4. Test in development
5. Implement caching
6. Deploy to production
7. Monitor API usage and costs