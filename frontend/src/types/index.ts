// Frontend types (mirrors backend shared types)

export type TechnicianStatus = 'available' | 'on_repair' | 'offline';

export type TicketPriority = 'critical_outage' | 'high_priority' | 'maintenance' | 'routine_inspect';

export type TicketStatus = 'pending' | 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'rejected';

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Technician {
  id: string;
  name: string;
  status: TechnicianStatus;
  location: Location;
  assignedTaskId?: string;
  eta?: number;
  skills: string[];
  phoneNumber: string;
  avatar?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  location: Location;
  customerId: string;
  customerName: string;
  customerPhone: string;
  assignedTechnicianId?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  estimatedDuration?: number;
  actualDuration?: number;
}

export interface DispatchCost {
  id: string;
  technicianId: string;
  ticketId: string;
  fuelCost: number;
  travelDistance: number;
  travelTime: number;
  overtimeCost: number;
  repairCost: number;
  isRepeatVisit: boolean;
  date: Date | string;
}

export interface WeatherData {
  location: Location;
  temperature: number;
  condition: string;
  windSpeed: number;
  precipitation: number;
  visibility: number;
  timestamp: Date | string;
}

export interface CostSummary {
  totalFuelCost: number;
  totalOvertimeCost: number;
  totalRepairCost: number;
  totalTravelDistance: number;
  totalTravelTime: number;
  repeatVisits: number;
  totalCost: number;
  recordCount: number;
}

// Made with Bob
