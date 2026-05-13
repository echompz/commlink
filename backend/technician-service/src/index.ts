import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Technician, TechnicianStatus } from '../../../shared/types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Dummy data
let technicians: Technician[] = [
  {
    id: 'tech-001',
    name: 'John Martinez',
    status: TechnicianStatus.AVAILABLE,
    location: { lat: 14.5995, lng: 120.9842, address: 'Makati City, Metro Manila' },
    skills: ['Fiber Optic', 'Network Installation', 'Troubleshooting'],
    phoneNumber: '+63 917 123 4567',
    avatar: 'https://i.pravatar.cc/150?img=12'
  },
  {
    id: 'tech-002',
    name: 'Maria Santos',
    status: TechnicianStatus.ON_REPAIR,
    location: { lat: 14.6091, lng: 121.0223, address: 'Pasig City, Metro Manila' },
    assignedTaskId: 'ticket-003',
    eta: 25,
    skills: ['Cable Repair', 'Signal Testing', 'Equipment Installation'],
    phoneNumber: '+63 917 234 5678',
    avatar: 'https://i.pravatar.cc/150?img=5'
  },
  {
    id: 'tech-003',
    name: 'Carlos Reyes',
    status: TechnicianStatus.ON_REPAIR,
    location: { lat: 14.5764, lng: 121.0851, address: 'Taguig City, Metro Manila' },
    assignedTaskId: 'ticket-001',
    eta: 15,
    skills: ['Network Configuration', 'Router Setup', 'Fiber Splicing'],
    phoneNumber: '+63 917 345 6789',
    avatar: 'https://i.pravatar.cc/150?img=33'
  },
  {
    id: 'tech-004',
    name: 'Ana Garcia',
    status: TechnicianStatus.AVAILABLE,
    location: { lat: 14.6507, lng: 121.0494, address: 'Quezon City, Metro Manila' },
    skills: ['Wireless Setup', 'Troubleshooting', 'Customer Support'],
    phoneNumber: '+63 917 456 7890',
    avatar: 'https://i.pravatar.cc/150?img=9'
  },
  {
    id: 'tech-005',
    name: 'Roberto Cruz',
    status: TechnicianStatus.OFFLINE,
    location: { lat: 14.5547, lng: 121.0244, address: 'Mandaluyong City, Metro Manila' },
    skills: ['Cable Installation', 'Network Maintenance', 'Equipment Repair'],
    phoneNumber: '+63 917 567 8901',
    avatar: 'https://i.pravatar.cc/150?img=51'
  },
  {
    id: 'tech-006',
    name: 'Lisa Fernandez',
    status: TechnicianStatus.ON_REPAIR,
    location: { lat: 14.5378, lng: 121.0199, address: 'San Juan City, Metro Manila' },
    assignedTaskId: 'ticket-002',
    eta: 45,
    skills: ['Fiber Optic', 'Signal Optimization', 'Network Testing'],
    phoneNumber: '+63 917 678 9012',
    avatar: 'https://i.pravatar.cc/150?img=10'
  }
];

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'technician-service' });
});

// Get all technicians
app.get('/technicians', (req: Request, res: Response) => {
  res.json(technicians);
});

// Get technician by ID
app.get('/technicians/:id', (req: Request, res: Response) => {
  const technician = technicians.find(t => t.id === req.params.id);
  if (!technician) {
    return res.status(404).json({ error: 'Technician not found' });
  }
  res.json(technician);
});

// Update technician status
app.patch('/technicians/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const techIndex = technicians.findIndex(t => t.id === req.params.id);
  
  if (techIndex === -1) {
    return res.status(404).json({ error: 'Technician not found' });
  }
  
  technicians[techIndex].status = status;
  res.json(technicians[techIndex]);
});

// Update technician location
app.patch('/technicians/:id/location', (req: Request, res: Response) => {
  const { location } = req.body;
  const techIndex = technicians.findIndex(t => t.id === req.params.id);
  
  if (techIndex === -1) {
    return res.status(404).json({ error: 'Technician not found' });
  }
  
  technicians[techIndex].location = location;
  res.json(technicians[techIndex]);
});

// Assign task to technician
app.patch('/technicians/:id/assign', (req: Request, res: Response) => {
  const { taskId, eta } = req.body;
  const techIndex = technicians.findIndex(t => t.id === req.params.id);
  
  if (techIndex === -1) {
    return res.status(404).json({ error: 'Technician not found' });
  }
  
  technicians[techIndex].assignedTaskId = taskId;
  technicians[techIndex].eta = eta;
  technicians[techIndex].status = TechnicianStatus.ON_REPAIR;
  res.json(technicians[techIndex]);
});

// Get available technicians
app.get('/technicians/status/available', (req: Request, res: Response) => {
  const available = technicians.filter(t => t.status === TechnicianStatus.AVAILABLE);
  res.json(available);
});

app.listen(PORT, () => {
  console.log(`🔧 Technician Service running on port ${PORT}`);
});

// Made with Bob
