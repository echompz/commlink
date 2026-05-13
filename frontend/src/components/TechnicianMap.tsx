import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Technician, TechnicianStatus } from '../types';
import { technicianApi } from '../services/api';

// Fix for default marker icons in React-Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const getStatusColor = (status: TechnicianStatus): string => {
  switch (status) {
    case 'available':
      return '#10b981';
    case 'on_repair':
      return '#f59e0b';
    case 'offline':
      return '#6b7280';
    default:
      return '#6b7280';
  }
};

const getStatusLabel = (status: TechnicianStatus): string => {
  switch (status) {
    case 'available':
      return 'Available';
    case 'on_repair':
      return 'On Repair';
    case 'offline':
      return 'Offline';
    default:
      return status;
  }
};

export default function TechnicianMap() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchTechnicians();
    const interval = setInterval(fetchTechnicians, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchTechnicians = async () => {
    try {
      const response = await technicianApi.getAll();
      setTechnicians(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching technicians:', error);
      setLoading(false);
    }
  };

  const filteredTechnicians = selectedStatus === 'all' 
    ? technicians 
    : technicians.filter(t => t.status === selectedStatus);

  const statusCounts = {
    all: technicians.length,
    available: technicians.filter(t => t.status === 'available').length,
    on_repair: technicians.filter(t => t.status === 'on_repair').length,
    offline: technicians.filter(t => t.status === 'offline').length,
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Status Filter */}
      <div style={{ 
        padding: '1rem', 
        background: 'var(--bg-primary)', 
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
        <button
          className={`button ${selectedStatus === 'all' ? 'button-primary' : 'button-secondary'}`}
          onClick={() => setSelectedStatus('all')}
        >
          All ({statusCounts.all})
        </button>
        <button
          className={`button ${selectedStatus === 'available' ? 'button-primary' : 'button-secondary'}`}
          onClick={() => setSelectedStatus('available')}
        >
          Available ({statusCounts.available})
        </button>
        <button
          className={`button ${selectedStatus === 'on_repair' ? 'button-primary' : 'button-secondary'}`}
          onClick={() => setSelectedStatus('on_repair')}
        >
          On Repair ({statusCounts.on_repair})
        </button>
        <button
          className={`button ${selectedStatus === 'offline' ? 'button-primary' : 'button-secondary'}`}
          onClick={() => setSelectedStatus('offline')}
        >
          Offline ({statusCounts.offline})
        </button>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer
          center={[14.5995, 121.0000]}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {filteredTechnicians.map((tech) => (
            <div key={tech.id}>
              <Circle
                center={[tech.location.lat, tech.location.lng]}
                radius={500}
                pathOptions={{
                  color: getStatusColor(tech.status),
                  fillColor: getStatusColor(tech.status),
                  fillOpacity: 0.2,
                  weight: 2,
                }}
              />
              <Marker position={[tech.location.lat, tech.location.lng]}>
                <Popup>
                  <div style={{ minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {tech.avatar && (
                        <img 
                          src={tech.avatar} 
                          alt={tech.name}
                          style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                        />
                      )}
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>{tech.name}</h3>
                        <span 
                          className={`badge badge-${tech.status}`}
                          style={{ fontSize: '0.7rem' }}
                        >
                          {getStatusLabel(tech.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <p style={{ margin: '0.25rem 0' }}>
                        <strong>Location:</strong> {tech.location.address}
                      </p>
                      <p style={{ margin: '0.25rem 0' }}>
                        <strong>Phone:</strong> {tech.phoneNumber}
                      </p>
                      {tech.assignedTaskId && (
                        <p style={{ margin: '0.25rem 0' }}>
                          <strong>Task:</strong> {tech.assignedTaskId}
                        </p>
                      )}
                      {tech.eta && (
                        <p style={{ margin: '0.25rem 0', color: 'var(--primary-red)' }}>
                          <strong>ETA:</strong> {tech.eta} minutes
                        </p>
                      )}
                      <p style={{ margin: '0.5rem 0 0.25rem 0' }}>
                        <strong>Skills:</strong>
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {tech.skills.map((skill, idx) => (
                          <span 
                            key={idx}
                            style={{
                              fontSize: '0.7rem',
                              padding: '0.125rem 0.5rem',
                              background: 'var(--bg-tertiary)',
                              color: 'var(--text-secondary)'
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </div>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

// Made with Bob
