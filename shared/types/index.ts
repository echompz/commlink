// Shared TypeScript types for all services

export enum TechnicianStatus {
  AVAILABLE = 'available',
  ON_REPAIR = 'on_repair',
  OFFLINE = 'offline'
}

export enum TicketPriority {
  CRITICAL_OUTAGE = 'critical_outage',
  HIGH_PRIORITY = 'high_priority',
  MAINTENANCE = 'maintenance',
  ROUTINE_INSPECT = 'routine_inspect'
}

export enum TicketStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected'
}

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
  eta?: number; // minutes
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
  createdAt: Date;
  updatedAt: Date;
  estimatedDuration?: number; // minutes
  actualDuration?: number; // minutes
}

export interface DispatchCost {
  id: string;
  technicianId: string;
  ticketId: string;
  fuelCost: number;
  travelDistance: number; // km
  travelTime: number; // minutes
  overtimeCost: number;
  repairCost: number;
  isRepeatVisit: boolean;
  date: Date;
}

export interface WeatherData {
  location: Location;
  temperature: number;
  condition: string;
  windSpeed: number;
  precipitation: number;
  visibility: number;
  timestamp: Date;
}

export interface ETACalculation {
  technicianId: string;
  ticketId: string;
  baseETA: number; // minutes
  weatherDelay: number; // minutes
  trafficDelay: number; // minutes
  totalETA: number; // minutes
}

// Made with Bob
