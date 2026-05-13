import { useEffect, useState } from 'react';
import { Clock, MapPin, Phone, User, AlertCircle } from 'lucide-react';
import type { Ticket, Technician, TicketPriority, TicketStatus } from '../types';
import { ticketApi, technicianApi } from '../services/api';

const priorityLabels: Record<TicketPriority, string> = {
  critical_outage: 'Critical Outage',
  high_priority: 'High Priority',
  maintenance: 'Maintenance',
  routine_inspect: 'Routine Inspect',
};

const statusLabels: Record<TicketStatus, string> = {
  pending: 'Pending',
  assigned: 'Assigned',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  completed: 'Completed',
  rejected: 'Rejected',
};

export default function TicketingSystem() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [ticketsRes, techniciansRes] = await Promise.all([
        ticketApi.getAll(),
        technicianApi.getAll(),
      ]);
      setTickets(ticketsRes.data);
      setTechnicians(techniciansRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleAssignTicket = async (ticketId: string, technicianId: string) => {
    console.log('🎯 Assigning ticket:', ticketId, 'to technician:', technicianId);
    try {
      const response = await ticketApi.assign(ticketId, technicianId);
      console.log('✅ Assignment successful:', response.data);
      await fetchData();
      setShowAssignModal(false);
      setSelectedTicket(null);
    } catch (error) {
      console.error('❌ Error assigning ticket:', error);
      alert('Failed to assign ticket. Check console for details.');
    }
  };

  const handleAcceptTicket = async (ticketId: string) => {
    try {
      await ticketApi.accept(ticketId);
      await fetchData();
    } catch (error) {
      console.error('Error accepting ticket:', error);
    }
  };

  const handleRejectTicket = async (ticketId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      try {
        await ticketApi.reject(ticketId, reason);
        await fetchData();
      } catch (error) {
        console.error('Error rejecting ticket:', error);
      }
    }
  };

  const handleCompleteTicket = async (ticketId: string, newStatus: TicketStatus = 'completed') => {
    console.log('✅ Updating ticket status:', ticketId, 'to:', newStatus);
    try {
      const response = await ticketApi.updateStatus(ticketId, newStatus);
      console.log('✅ Status update successful:', response.data);
      await fetchData();
    } catch (error) {
      console.error('❌ Error updating ticket status:', error);
      alert('Failed to update ticket status. Check console for details.');
    }
  };

  const handleStartProgress = async (ticketId: string) => {
    console.log('🚀 Starting work on ticket:', ticketId);
    try {
      const response = await ticketApi.updateStatus(ticketId, 'in_progress');
      console.log('✅ Start work successful:', response.data);
      await fetchData();
    } catch (error) {
      console.error('❌ Error starting progress:', error);
      alert('Failed to start work. Check console for details.');
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

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading tickets...</div>;
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        padding: '1.5rem', 
        background: 'var(--bg-primary)', 
        borderBottom: '1px solid var(--border-color)' 
      }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Ticketing System</h2>
        <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Manage and assign service tickets to technicians
        </p>
      </div>

      {/* Tickets Grid */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto', 
        padding: '1.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1rem',
        alignContent: 'start'
      }}>
        {tickets.map((ticket) => {
          const assignedTech = technicians.find(t => t.id === ticket.assignedTechnicianId);
          
          return (
            <div key={ticket.id} className="card" style={{ height: 'fit-content' }}>
              {/* Priority Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <span className={`badge ${getPriorityBadgeClass(ticket.priority)}`}>
                  {priorityLabels[ticket.priority]}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  {ticket.id}
                </span>
              </div>

              {/* Title */}
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem' }}>
                {ticket.title}
              </h3>

              {/* Description */}
              <p style={{ 
                margin: '0 0 1rem 0', 
                fontSize: '0.875rem', 
                color: 'var(--text-secondary)',
                lineHeight: '1.5'
              }}>
                {ticket.description}
              </p>

              {/* Customer Info */}
              <div style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <User size={14} />
                  <span>{ticket.customerName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Phone size={14} />
                  <span>{ticket.customerPhone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={14} />
                  <span>{ticket.location.address}</span>
                </div>
              </div>

              {/* Assigned Technician */}
              {assignedTech && (
                <div style={{ 
                  padding: '0.75rem', 
                  background: 'var(--bg-secondary)', 
                  marginBottom: '1rem',
                  fontSize: '0.875rem'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                    Assigned to: {assignedTech.name}
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    Status: {statusLabels[ticket.status]}
                  </div>
                  {assignedTech.eta && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', color: 'var(--primary-red)' }}>
                      <Clock size={14} />
                      <span>ETA: {assignedTech.eta} minutes</span>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {ticket.status === 'pending' && (
                  <button
                    className="button button-primary"
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setShowAssignModal(true);
                    }}
                    style={{ flex: 1 }}
                  >
                    Assign Technician
                  </button>
                )}
                
                {ticket.status === 'assigned' && (
                  <>
                    <button
                      className="button button-primary"
                      onClick={() => handleAcceptTicket(ticket.id)}
                      style={{ flex: 1 }}
                    >
                      Accept
                    </button>
                    <button
                      className="button button-secondary"
                      onClick={() => handleRejectTicket(ticket.id)}
                      style={{ flex: 1 }}
                    >
                      Reject
                    </button>
                  </>
                )}

                {ticket.status === 'accepted' && (
                  <button
                    className="button button-primary"
                    onClick={() => handleStartProgress(ticket.id)}
                    style={{ flex: 1 }}
                  >
                    Start Work
                  </button>
                )}

                {ticket.status === 'in_progress' && (
                  <button
                    className="button button-primary"
                    onClick={() => handleCompleteTicket(ticket.id)}
                    style={{ flex: 1 }}
                  >
                    Mark as Complete
                  </button>
                )}

                {ticket.status === 'completed' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                    <div style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: '#d1fae5',
                      color: '#065f46',
                      textAlign: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}>
                      ✓ {statusLabels[ticket.status]}
                    </div>
                    <select
                      className="input"
                      onChange={(e) => {
                        if (e.target.value && e.target.value !== ticket.status) {
                          handleCompleteTicket(ticket.id, e.target.value as TicketStatus);
                        }
                      }}
                      defaultValue=""
                      style={{ fontSize: '0.875rem', padding: '0.5rem' }}
                    >
                      <option value="">Change Status...</option>
                      <option value="pending">Pending</option>
                      <option value="assigned">Assigned</option>
                      <option value="accepted">Accepted</option>
                      <option value="in_progress">In Progress</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                )}

                {ticket.status === 'rejected' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                    <div style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: '#fee2e2',
                      color: '#991b1b',
                      textAlign: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}>
                      ✗ {statusLabels[ticket.status]}
                    </div>
                    <button
                      className="button button-primary"
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setShowAssignModal(true);
                      }}
                      style={{ width: '100%' }}
                    >
                      Re-assign Technician
                    </button>
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div style={{ 
                marginTop: '1rem', 
                paddingTop: '1rem', 
                borderTop: '1px solid var(--border-color)',
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)'
              }}>
                Created: {new Date(ticket.createdAt).toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedTicket && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ 
            width: '90%', 
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Assign Technician</h3>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Select a technician for: <strong>{selectedTicket.title}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {technicians
                .filter(t => t.status === 'available')
                .map(tech => (
                  <button
                    key={tech.id}
                    className="button button-secondary"
                    onClick={() => handleAssignTicket(selectedTicket.id, tech.id)}
                    style={{ 
                      textAlign: 'left',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}
                  >
                    {tech.avatar && (
                      <img 
                        src={tech.avatar} 
                        alt={tech.name}
                        style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{tech.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {tech.location.address}
                      </div>
                      <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        {tech.skills.join(', ')}
                      </div>
                    </div>
                    <span className="badge badge-available">Available</span>
                  </button>
                ))}
              
              {technicians.filter(t => t.status === 'available').length === 0 && (
                <div style={{ 
                  padding: '2rem', 
                  textAlign: 'center',
                  color: 'var(--text-secondary)'
                }}>
                  <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
                  <p>No available technicians at the moment</p>
                </div>
              )}
            </div>

            <button
              className="button button-secondary"
              onClick={() => {
                setShowAssignModal(false);
                setSelectedTicket(null);
              }}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Made with Bob
