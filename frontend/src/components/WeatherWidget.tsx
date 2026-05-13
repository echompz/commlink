import { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, Wind, Eye } from 'lucide-react';
import type { WeatherData } from '../types';
import { weatherApi } from '../services/api';

export default function WeatherWidget() {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchWeather = async () => {
    try {
      const response = await weatherApi.getAll();
      setWeatherData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes('rain')) return <CloudRain size={24} />;
    if (lower.includes('cloud')) return <Cloud size={24} />;
    return <Sun size={24} />;
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: '1rem' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Loading weather...</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Cloud size={18} color="var(--primary-red)" />
        <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Weather</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {weatherData.map((weather, index) => (
          <div
            key={index}
            style={{
              padding: '0.75rem',
              background: 'var(--bg-secondary)',
              borderRadius: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ color: 'var(--primary-red)' }}>
                {getWeatherIcon(weather.condition)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {weather.location.address}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {weather.condition}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {weather.temperature}°C
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.125rem', alignItems: 'flex-end' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Wind size={11} />
                  {weather.windSpeed}km/h
                </span>
                {weather.precipitation > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CloudRain size={11} />
                    {weather.precipitation}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '0.75rem',
        padding: '0.5rem',
        background: 'var(--bg-tertiary)',
        borderRadius: '4px',
        fontSize: '0.7rem',
        color: 'var(--text-secondary)',
        lineHeight: '1.3',
        textAlign: 'center'
      }}>
        💡 Weather data affects ETA calculations for technician dispatch
      </div>
    </div>
  );
}

// Made with Bob
