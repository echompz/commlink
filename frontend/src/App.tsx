import { useState } from 'react';
import { Map, Ticket, AlertTriangle, DollarSign, Cloud } from 'lucide-react';
import TechnicianMap from './components/TechnicianMap';
import TicketingSystem from './components/TicketingSystem';
import PriorityQueue from './components/PriorityQueue';
import DispatchCostMonitoring from './components/DispatchCostMonitoring';
import WeatherWidget from './components/WeatherWidget';
import './styles/global.css';

type View = 'map' | 'tickets' | 'queue' | 'costs';

function App() {
  const [activeView, setActiveView] = useState<View>('map');

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'var(--bg-secondary)'
    }}>
      {/* Header */}
      <header style={{
        background: 'var(--bg-primary)',
        borderBottom: '2px solid var(--primary-red)',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'var(--primary-red)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.25rem'
          }}>
            CL
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
              CommLink
            </h1>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Technician Operations Monitoring
            </p>
          </div>
        </div>

        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {new Date().toLocaleString('en-PH', { 
            dateStyle: 'medium', 
            timeStyle: 'short' 
          })}
        </div>
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar Navigation */}
        <nav style={{
          width: '250px',
          background: 'var(--bg-primary)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem 0'
        }}>
          <button
            className={`button ${activeView === 'map' ? 'button-primary' : 'button-secondary'}`}
            onClick={() => setActiveView('map')}
            style={{
              justifyContent: 'flex-start',
              margin: '0 1rem 0.5rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <Map size={18} />
            Live Technician Map
          </button>

          <button
            className={`button ${activeView === 'tickets' ? 'button-primary' : 'button-secondary'}`}
            onClick={() => setActiveView('tickets')}
            style={{
              justifyContent: 'flex-start',
              margin: '0 1rem 0.5rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <Ticket size={18} />
            Ticketing System
          </button>

          <button
            className={`button ${activeView === 'queue' ? 'button-primary' : 'button-secondary'}`}
            onClick={() => setActiveView('queue')}
            style={{
              justifyContent: 'flex-start',
              margin: '0 1rem 0.5rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <AlertTriangle size={18} />
            Priority Queue
          </button>

          <button
            className={`button ${activeView === 'costs' ? 'button-primary' : 'button-secondary'}`}
            onClick={() => setActiveView('costs')}
            style={{
              justifyContent: 'flex-start',
              margin: '0 1rem 0.5rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <DollarSign size={18} />
            Cost Monitoring
          </button>

          {/* Weather Widget in Sidebar */}
          <div style={{
            margin: '1.5rem 1rem 0 1rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)',
            flex: 1,
            overflow: 'auto',
            minHeight: 0
          }}>
            <WeatherWidget />
          </div>

          {/* Footer Info */}
          <div style={{
            padding: '1rem',
            fontSize: '0.7rem',
            color: 'var(--text-tertiary)',
            textAlign: 'center',
            borderTop: '1px solid var(--border-color)',
            lineHeight: '1.4',
            flexShrink: 0
          }}>
            <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
              <Cloud size={14} />
              <span>Weather-Enhanced ETA</span>
            </div>
            <div style={{ fontSize: '0.65rem' }}>
              v1.0.0 • Microservices
            </div>
          </div>
        </nav>

        {/* Main View Area */}
        <main style={{ flex: 1, overflow: 'hidden' }}>
          {activeView === 'map' && <TechnicianMap />}
          {activeView === 'tickets' && <TicketingSystem />}
          {activeView === 'queue' && <PriorityQueue />}
          {activeView === 'costs' && <DispatchCostMonitoring />}
        </main>
      </div>
    </div>
  );
}

export default App;

// Made with Bob
