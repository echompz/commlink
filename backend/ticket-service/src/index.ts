import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Ticket, TicketPriority, TicketStatus } from '../../../shared/types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Dummy data
let tickets: Ticket[] = [
  {
    id: 'ticket-001',
    title: 'Critical Network Outage - BGC Area',
    description: 'Complete network outage affecting 50+ business clients in Bonifacio Global City',
    priority: TicketPriority.CRITICAL_OUTAGE,
    status: TicketStatus.IN_PROGRESS,
    location: { lat: 14.5547, lng: 121.0467, address: 'BGC, Taguig City' },
    customerId: 'cust-001',
    customerName: 'TechCorp Philippines',
    customerPhone: '+63 917 111 2222',
    assignedTechnicianId: 'tech-003',
    createdAt: new Date('2026-05-12T08:30:00'),
    updatedAt: new Date('2026-05-12T09:15:00'),
    estimatedDuration: 120
  },
  {
    id: 'ticket-002',
    title: 'Fiber Cable Damage - Ortigas',
    description: 'Fiber optic cable damaged due to construction work, affecting residential area',
    priority: TicketPriority.HIGH_PRIORITY,
    status: TicketStatus.IN_PROGRESS,
    location: { lat: 14.5836, lng: 121.0610, address: 'Ortigas Center, Pasig City' },
    customerId: 'cust-002',
    customerName: 'Ortigas Residences HOA',
    customerPhone: '+63 917 222 3333',
    assignedTechnicianId: 'tech-006',
    createdAt: new Date('2026-05-12T07:00:00'),
    updatedAt: new Date('2026-05-12T08:45:00'),
    estimatedDuration: 180
  },
  {
    id: 'ticket-003',
    title: 'Router Configuration Issue',
    description: 'Customer unable to connect to WiFi, router needs reconfiguration',
    priority: TicketPriority.MAINTENANCE,
    status: TicketStatus.IN_PROGRESS,
    location: { lat: 14.6091, lng: 121.0223, address: 'Capitol Commons, Pasig City' },
    customerId: 'cust-003',
    customerName: 'Maria dela Cruz',
    customerPhone: '+63 917 333 4444',
    assignedTechnicianId: 'tech-002',
    createdAt: new Date('2026-05-12T09:00:00'),
    updatedAt: new Date('2026-05-12T09:30:00'),
    estimatedDuration: 60
  },
  {
    id: 'ticket-004',
    title: 'Scheduled Network Maintenance',
    description: 'Routine maintenance and inspection of network equipment',
    priority: TicketPriority.ROUTINE_INSPECT,
    status: TicketStatus.PENDING,
    location: { lat: 14.6507, lng: 121.0494, address: 'Quezon City' },
    customerId: 'cust-004',
    customerName: 'QC Business Park',
    customerPhone: '+63 917 444 5555',
    createdAt: new Date('2026-05-12T10:00:00'),
    updatedAt: new Date('2026-05-12T10:00:00'),
    estimatedDuration: 90
  },
  {
    id: 'ticket-005',
    title: 'Slow Internet Speed Complaint',
    description: 'Customer reporting significantly reduced internet speeds',
    priority: TicketPriority.HIGH_PRIORITY,
    status: TicketStatus.PENDING,
    location: { lat: 14.5995, lng: 120.9842, address: 'Makati CBD' },
    customerId: 'cust-005',
    customerName: 'Global Finance Inc.',
    customerPhone: '+63 917 555 6666',
    createdAt: new Date('2026-05-12T10:15:00'),
    updatedAt: new Date('2026-05-12T10:15:00'),
    estimatedDuration: 90
  },
  {
    id: 'ticket-006',
    title: 'New Installation Request',
    description: 'New fiber optic installation for residential customer',
    priority: TicketPriority.MAINTENANCE,
    status: TicketStatus.PENDING,
    location: { lat: 14.5378, lng: 121.0199, address: 'San Juan City' },
    customerId: 'cust-006',
    customerName: 'Roberto Santos',
    customerPhone: '+63 917 666 7777',
    createdAt: new Date('2026-05-12T10:30:00'),
    updatedAt: new Date('2026-05-12T10:30:00'),
    estimatedDuration: 120
  }
];

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'ticket-service' });
});

// Get all tickets
app.get('/tickets', (req: Request, res: Response) => {
  const { priority, status } = req.query;
  let filtered = tickets;
  
  if (priority) {
    filtered = filtered.filter(t => t.priority === priority);
  }
  if (status) {
    filtered = filtered.filter(t => t.status === status);
  }
  
  // Sort by priority and creation date
  filtered.sort((a, b) => {
    const priorityOrder = {
      [TicketPriority.CRITICAL_OUTAGE]: 0,
      [TicketPriority.HIGH_PRIORITY]: 1,
      [TicketPriority.MAINTENANCE]: 2,
      [TicketPriority.ROUTINE_INSPECT]: 3
    };
    
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  res.json(filtered);
});

// Get ticket by ID
app.get('/tickets/:id', (req: Request, res: Response) => {
  const ticket = tickets.find(t => t.id === req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  res.json(ticket);
});

// Create new ticket
app.post('/tickets', (req: Request, res: Response) => {
  const newTicket: Ticket = {
    id: `ticket-${String(tickets.length + 1).padStart(3, '0')}`,
    ...req.body,
    status: TicketStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  tickets.push(newTicket);
  res.status(201).json(newTicket);
});

// Assign ticket to technician
app.patch('/tickets/:id/assign', (req: Request, res: Response) => {
  const { technicianId } = req.body;
  const ticketIndex = tickets.findIndex(t => t.id === req.params.id);
  
  if (ticketIndex === -1) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  
  tickets[ticketIndex].assignedTechnicianId = technicianId;
  tickets[ticketIndex].status = TicketStatus.ASSIGNED;
  tickets[ticketIndex].updatedAt = new Date();
  res.json(tickets[ticketIndex]);
});

// Update ticket status
app.patch('/tickets/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const ticketIndex = tickets.findIndex(t => t.id === req.params.id);
  
  if (ticketIndex === -1) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  
  tickets[ticketIndex].status = status;
  tickets[ticketIndex].updatedAt = new Date();
  res.json(tickets[ticketIndex]);
});

// Accept ticket (by technician)
app.patch('/tickets/:id/accept', (req: Request, res: Response) => {
  const ticketIndex = tickets.findIndex(t => t.id === req.params.id);
  
  if (ticketIndex === -1) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  
  tickets[ticketIndex].status = TicketStatus.ACCEPTED;
  tickets[ticketIndex].updatedAt = new Date();
  res.json(tickets[ticketIndex]);
});

// Reject ticket (by technician)
app.patch('/tickets/:id/reject', (req: Request, res: Response) => {
  const { reason } = req.body;
  const ticketIndex = tickets.findIndex(t => t.id === req.params.id);
  
  if (ticketIndex === -1) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  
  tickets[ticketIndex].status = TicketStatus.REJECTED;
  tickets[ticketIndex].assignedTechnicianId = undefined;
  tickets[ticketIndex].updatedAt = new Date();
  res.json({ ...tickets[ticketIndex], rejectionReason: reason });
});

// Get priority queue
app.get('/tickets/queue/priority', (req: Request, res: Response) => {
  const queue = tickets
    .filter(t => t.status === TicketStatus.PENDING || t.status === TicketStatus.ASSIGNED)
    .sort((a, b) => {
      const priorityOrder = {
        [TicketPriority.CRITICAL_OUTAGE]: 0,
        [TicketPriority.HIGH_PRIORITY]: 1,
        [TicketPriority.MAINTENANCE]: 2,
        [TicketPriority.ROUTINE_INSPECT]: 3
      };
      
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  
  res.json(queue);
});

app.listen(PORT, () => {
  console.log(`🎫 Ticket Service running on port ${PORT}`);
});

// Made with Bob
