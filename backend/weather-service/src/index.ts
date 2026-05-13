import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { WeatherData, ETACalculation, Location } from '../../../shared/types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

// Dummy weather data for Metro Manila areas
const dummyWeatherData: WeatherData[] = [
  {
    location: { lat: 14.5995, lng: 120.9842, address: 'Makati City' },
    temperature: 32,
    condition: 'Partly Cloudy',
    windSpeed: 15,
    precipitation: 0,
    visibility: 10,
    timestamp: new Date()
  },
  {
    location: { lat: 14.6091, lng: 121.0223, address: 'Pasig City' },
    temperature: 31,
    condition: 'Sunny',
    windSpeed: 12,
    precipitation: 0,
    visibility: 10,
    timestamp: new Date()
  },
  {
    location: { lat: 14.5764, lng: 121.0851, address: 'Taguig City' },
    temperature: 33,
    condition: 'Light Rain',
    windSpeed: 18,
    precipitation: 20,
    visibility: 8,
    timestamp: new Date()
  },
  {
    location: { lat: 14.6507, lng: 121.0494, address: 'Quezon City' },
    temperature: 30,
    condition: 'Cloudy',
    windSpeed: 10,
    precipitation: 0,
    visibility: 9,
    timestamp: new Date()
  }
];

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper function to get nearest weather data
function getNearestWeather(location: Location): WeatherData {
  let nearest = dummyWeatherData[0];
  let minDistance = calculateDistance(
    location.lat, location.lng,
    nearest.location.lat, nearest.location.lng
  );

  for (const weather of dummyWeatherData) {
    const distance = calculateDistance(
      location.lat, location.lng,
      weather.location.lat, weather.location.lng
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest = weather;
    }
  }

  return nearest;
}

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'weather-service' });
});

// Get weather by location
app.get('/weather', (req: Request, res: Response) => {
  const { lat, lng } = req.query;
  
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and longitude required' });
  }
  
  const location: Location = {
    lat: parseFloat(lat as string),
    lng: parseFloat(lng as string)
  };
  
  const weather = getNearestWeather(location);
  res.json(weather);
});

// Get all weather data
app.get('/weather/all', (req: Request, res: Response) => {
  res.json(dummyWeatherData);
});

// Calculate ETA with weather impact
app.post('/weather/calculate-eta', (req: Request, res: Response) => {
  const { technicianLocation, ticketLocation, baseETA, technicianId, ticketId } = req.body;
  
  if (!technicianLocation || !ticketLocation || !baseETA) {
    return res.status(400).json({ 
      error: 'technicianLocation, ticketLocation, and baseETA required' 
    });
  }
  
  const weather = getNearestWeather(ticketLocation);
  
  // Calculate weather delay based on conditions
  let weatherDelay = 0;
  
  // Rain impact
  if (weather.precipitation > 50) {
    weatherDelay += 15; // Heavy rain adds 15 minutes
  } else if (weather.precipitation > 20) {
    weatherDelay += 8; // Light rain adds 8 minutes
  }
  
  // Visibility impact
  if (weather.visibility < 5) {
    weatherDelay += 10; // Poor visibility adds 10 minutes
  } else if (weather.visibility < 8) {
    weatherDelay += 5; // Reduced visibility adds 5 minutes
  }
  
  // Wind impact (for high-altitude work)
  if (weather.windSpeed > 40) {
    weatherDelay += 20; // Strong winds add 20 minutes
  } else if (weather.windSpeed > 25) {
    weatherDelay += 10; // Moderate winds add 10 minutes
  }
  
  // Traffic delay estimation (dummy - would use real traffic API)
  const distance = calculateDistance(
    technicianLocation.lat, technicianLocation.lng,
    ticketLocation.lat, ticketLocation.lng
  );
  
  let trafficDelay = 0;
  const currentHour = new Date().getHours();
  
  // Rush hour traffic
  if ((currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19)) {
    trafficDelay = Math.floor(distance * 3); // 3 minutes per km during rush hour
  } else {
    trafficDelay = Math.floor(distance * 1.5); // 1.5 minutes per km normal traffic
  }
  
  const etaCalculation: ETACalculation = {
    technicianId: technicianId || 'unknown',
    ticketId: ticketId || 'unknown',
    baseETA,
    weatherDelay,
    trafficDelay,
    totalETA: baseETA + weatherDelay + trafficDelay
  };
  
  res.json({
    ...etaCalculation,
    weather: {
      condition: weather.condition,
      precipitation: weather.precipitation,
      visibility: weather.visibility,
      windSpeed: weather.windSpeed
    },
    distance: Math.round(distance * 10) / 10
  });
});

// Get weather forecast (dummy data)
app.get('/weather/forecast', (req: Request, res: Response) => {
  const { lat, lng } = req.query;
  
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and longitude required' });
  }
  
  // Generate dummy 5-day forecast
  const forecast = Array.from({ length: 5 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    return {
      date: date.toISOString().split('T')[0],
      temperature: 28 + Math.floor(Math.random() * 8),
      condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
      precipitation: Math.floor(Math.random() * 60),
      windSpeed: 10 + Math.floor(Math.random() * 20)
    };
  });
  
  res.json(forecast);
});

app.listen(PORT, () => {
  console.log(`🌤️  Weather Service running on port ${PORT}`);
  console.log(`📍 Serving weather data for Metro Manila area`);
});

// Made with Bob
