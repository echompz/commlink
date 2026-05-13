import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DispatchCost } from '../../../shared/types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// Dummy data
let dispatchCosts: DispatchCost[] = [
  {
    id: 'cost-001',
    technicianId: 'tech-003',
    ticketId: 'ticket-001',
    fuelCost: 450.50,
    travelDistance: 12.5,
    travelTime: 35,
    overtimeCost: 0,
    repairCost: 2500.00,
    isRepeatVisit: false,
    date: new Date('2026-05-12T08:30:00')
  },
  {
    id: 'cost-002',
    technicianId: 'tech-006',
    ticketId: 'ticket-002',
    fuelCost: 380.00,
    travelDistance: 10.2,
    travelTime: 28,
    overtimeCost: 1200.00,
    repairCost: 5800.00,
    isRepeatVisit: true,
    date: new Date('2026-05-12T07:00:00')
  },
  {
    id: 'cost-003',
    technicianId: 'tech-002',
    ticketId: 'ticket-003',
    fuelCost: 220.00,
    travelDistance: 6.8,
    travelTime: 18,
    overtimeCost: 0,
    repairCost: 0,
    isRepeatVisit: false,
    date: new Date('2026-05-12T09:00:00')
  },
  {
    id: 'cost-004',
    technicianId: 'tech-001',
    ticketId: 'ticket-007',
    fuelCost: 520.00,
    travelDistance: 15.3,
    travelTime: 42,
    overtimeCost: 800.00,
    repairCost: 3200.00,
    isRepeatVisit: false,
    date: new Date('2026-05-11T14:30:00')
  },
  {
    id: 'cost-005',
    technicianId: 'tech-004',
    ticketId: 'ticket-008',
    fuelCost: 310.00,
    travelDistance: 8.7,
    travelTime: 22,
    overtimeCost: 0,
    repairCost: 1500.00,
    isRepeatVisit: true,
    date: new Date('2026-05-11T10:15:00')
  }
];

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'dispatch-service' });
});

// Get all dispatch costs
app.get('/costs', (req: Request, res: Response) => {
  const { technicianId, startDate, endDate } = req.query;
  let filtered = dispatchCosts;
  
  if (technicianId) {
    filtered = filtered.filter(c => c.technicianId === technicianId);
  }
  
  if (startDate) {
    filtered = filtered.filter(c => new Date(c.date) >= new Date(startDate as string));
  }
  
  if (endDate) {
    filtered = filtered.filter(c => new Date(c.date) <= new Date(endDate as string));
  }
  
  res.json(filtered);
});

// Get cost by ID
app.get('/costs/:id', (req: Request, res: Response) => {
  const cost = dispatchCosts.find(c => c.id === req.params.id);
  if (!cost) {
    return res.status(404).json({ error: 'Cost record not found' });
  }
  res.json(cost);
});

// Create new cost record
app.post('/costs', (req: Request, res: Response) => {
  const newCost: DispatchCost = {
    id: `cost-${String(dispatchCosts.length + 1).padStart(3, '0')}`,
    ...req.body,
    date: new Date()
  };
  dispatchCosts.push(newCost);
  res.status(201).json(newCost);
});

// Get cost summary
app.get('/costs/summary/total', (req: Request, res: Response) => {
  const { startDate, endDate, technicianId } = req.query;
  let filtered = dispatchCosts;
  
  if (technicianId) {
    filtered = filtered.filter(c => c.technicianId === technicianId);
  }
  
  if (startDate) {
    filtered = filtered.filter(c => new Date(c.date) >= new Date(startDate as string));
  }
  
  if (endDate) {
    filtered = filtered.filter(c => new Date(c.date) <= new Date(endDate as string));
  }
  
  const summary = {
    totalFuelCost: filtered.reduce((sum, c) => sum + c.fuelCost, 0),
    totalOvertimeCost: filtered.reduce((sum, c) => sum + c.overtimeCost, 0),
    totalRepairCost: filtered.reduce((sum, c) => sum + c.repairCost, 0),
    totalTravelDistance: filtered.reduce((sum, c) => sum + c.travelDistance, 0),
    totalTravelTime: filtered.reduce((sum, c) => sum + c.travelTime, 0),
    repeatVisits: filtered.filter(c => c.isRepeatVisit).length,
    totalCost: filtered.reduce((sum, c) => 
      sum + c.fuelCost + c.overtimeCost + c.repairCost, 0
    ),
    recordCount: filtered.length
  };
  
  res.json(summary);
});

// Get repeat visits
app.get('/costs/analysis/repeat-visits', (req: Request, res: Response) => {
  const repeatVisits = dispatchCosts.filter(c => c.isRepeatVisit);
  const groupedByTicket = repeatVisits.reduce((acc, cost) => {
    if (!acc[cost.ticketId]) {
      acc[cost.ticketId] = [];
    }
    acc[cost.ticketId].push(cost);
    return acc;
  }, {} as Record<string, DispatchCost[]>);
  
  res.json({
    totalRepeatVisits: repeatVisits.length,
    repeatVisitsByTicket: groupedByTicket,
    totalRepeatCost: repeatVisits.reduce((sum, c) => 
      sum + c.fuelCost + c.overtimeCost + c.repairCost, 0
    )
  });
});

// Get technician cost breakdown
app.get('/costs/analysis/by-technician', (req: Request, res: Response) => {
  const technicianCosts = dispatchCosts.reduce((acc, cost) => {
    if (!acc[cost.technicianId]) {
      acc[cost.technicianId] = {
        technicianId: cost.technicianId,
        totalFuelCost: 0,
        totalOvertimeCost: 0,
        totalRepairCost: 0,
        totalDistance: 0,
        totalTime: 0,
        jobCount: 0,
        repeatVisits: 0
      };
    }
    
    acc[cost.technicianId].totalFuelCost += cost.fuelCost;
    acc[cost.technicianId].totalOvertimeCost += cost.overtimeCost;
    acc[cost.technicianId].totalRepairCost += cost.repairCost;
    acc[cost.technicianId].totalDistance += cost.travelDistance;
    acc[cost.technicianId].totalTime += cost.travelTime;
    acc[cost.technicianId].jobCount += 1;
    if (cost.isRepeatVisit) {
      acc[cost.technicianId].repeatVisits += 1;
    }
    
    return acc;
  }, {} as Record<string, any>);
  
  res.json(Object.values(technicianCosts));
});

// Get daily cost trends
app.get('/costs/analysis/daily-trends', (req: Request, res: Response) => {
  const dailyCosts = dispatchCosts.reduce((acc, cost) => {
    const dateKey = cost.date.toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: dateKey,
        totalCost: 0,
        fuelCost: 0,
        overtimeCost: 0,
        repairCost: 0,
        jobCount: 0
      };
    }
    
    acc[dateKey].totalCost += cost.fuelCost + cost.overtimeCost + cost.repairCost;
    acc[dateKey].fuelCost += cost.fuelCost;
    acc[dateKey].overtimeCost += cost.overtimeCost;
    acc[dateKey].repairCost += cost.repairCost;
    acc[dateKey].jobCount += 1;
    
    return acc;
  }, {} as Record<string, any>);
  
  res.json(Object.values(dailyCosts).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ));
});

app.listen(PORT, () => {
  console.log(`💰 Dispatch Service running on port ${PORT}`);
});

// Made with Bob
