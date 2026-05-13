import { useEffect, useState } from 'react';
import { AlertTriangle, Clock, MapPin } from 'lucide-react';
import type { Ticket, TicketPriority } from '../types';
import { ticketApi } from '../services/api';

const priorityLabels: Record<TicketPriority, string> = {
  critical_outage: 'Critical Outage',
  high_priority: 'High Priority',
  maintenance: 'Maintenance',
  routine_inspect: 'Routine Inspect',
};

const priorityIcons: Record<TicketPriority, number> = {
  critical_outage: 1,
  high_priority: 2,
  maintenance: 3,
  routine_inspect: 4,
};

export default function PriorityQueue() {
  const [queue, setQueue] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 15000); // Refresh every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      const response = await ticketApi.getPriorityQueue();
      setQueue(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching priority queue:', error);
      setLoading(false);
    }
  };

  const getPriorityBadgeClass = (priority: TicketPriority): string => {
    switch (priority) {
      case 'critical_outage':
        return 'badge-critical';
      case 'high_priority':
        return 'badge-high';
      case 'maintenance':
        return 'badge-maintenance';
      case 'routine_inspect':
        return 'badge-routine';
      default:
        return '';
    }
  };

  const getTimeAgo = (date: Date | string): string => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    }
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading priority queue...</div>;
  }

  const criticalCount = queue.filter(t => t.priority === 'critical_outage').length;
  const highCount = queue.filter(t => t.priority === 'high_priority').length;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        padding: '1.5rem', 
        background: 'var(--bg-primary)', 
        borderBottom: '1px solid var(--border-color)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <AlertTriangle size={24} color="var(--primary-red)" />
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Incident Priority Queue</h2>
        </div>
        <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {queue.length} pending tickets • {criticalCount} critical • {highCount} high priority
        </p>
      </div>

      {/* Queue List */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {queue.length === 0 ? (
          <div style={{ 
            padding: '3rem', 
            textAlign: 'center',
            color: 'var(--text-secondary)'
          }}>
            <AlertTriangle size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>No pending tickets in queue</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {queue.map((ticket, index) => (
              <div 
                key={ticket.id}
                style={{
                  padding: '1.5rem',
                  borderBottom: '1px solid var(--border-color)',
                  background: index % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                  transition: 'background 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = index % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)';
                }}
              >
                {/* Queue Position & Priority */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: ticket.priority === 'critical_outage' ? 'var(--primary-red)' : 'var(--bg-tertiary)',
                    color: ticket.priority === 'critical_outage' ? 'white' : 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '1.25rem'
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className={`badge ${getPriorityBadgeClass(ticket.priority)}`}>
                        {priorityLabels[ticket.priority]}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {ticket.id}
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                      {ticket.title}
                    </h3>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
                      <Clock size={12} />
                      {getTimeAgo(ticket.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p style={{ 
                  margin: '0 0 0.75rem 0', 
                  fontSize: '0.875rem', 
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5',
                  paddingLeft: '56px'
                }}>
                  {ticket.description}
                </p>

                {/* Details */}
                <div style={{ 
                  display: 'flex', 
                  gap: '1.5rem', 
                  fontSize: '0.875rem',
                  paddingLeft: '56px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={14} />
                    <span>{ticket.location.address}</span>
                  </div>
                  <div>
                    <strong>Customer:</strong> {ticket.customerName}
                  </div>
                  {ticket.estimatedDuration && (
                    <div>
                      <strong>Est. Duration:</strong> {ticket.estimatedDuration} min
                    </div>
                  )}
                  <div>
                    <strong>Status:</strong> {ticket.status}
                  </div>
                </div>

                {/* Critical Alert */}
                {ticket.priority === 'critical_outage' && (
                  <div style={{
                    marginTop: '0.75rem',
                    marginLeft: '56px',
                    padding: '0.5rem 0.75rem',
                    background: 'var(--primary-red-light)',
                    color: 'var(--primary-red)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <AlertTriangle size={14} />
                    REQUIRES IMMEDIATE ATTENTION
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div style={{
        padding: '1rem 1.5rem',
        background: 'var(--bg-primary)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        gap: '2rem',
        fontSize: '0.875rem'
      }}>
        <div>
          <span style={{ color: 'var(--text-secondary)' }}>Total Queue: </span>
          <strong>{queue.length}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)' }}>Critical: </span>
          <strong style={{ color: 'var(--primary-red)' }}>{criticalCount}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)' }}>High Priority: </span>
          <strong style={{ color: '#f59e0b' }}>{highCount}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)' }}>Avg Wait Time: </span>
          <strong>
            {queue.length > 0 
              ? Math.round(queue.reduce((sum, t) => {
                  const diffMs = new Date().getTime() - new Date(t.createdAt).getTime();
                  return sum + diffMs / 60000;
                }, 0) / queue.length)
              : 0
            } min
          </strong>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
