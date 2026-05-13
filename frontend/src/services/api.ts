import axios from 'axios';
import type { Technician, Ticket, DispatchCost, WeatherData, CostSummary } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Technician API
export const technicianApi = {
  getAll: () => api.get<Technician[]>('/technicians'),
  getById: (id: string) => api.get<Technician>(`/technicians/${id}`),
  updateStatus: (id: string, status: string) => 
    api.patch(`/technicians/${id}/status`, { status }),
  updateLocation: (id: string, location: { lat: number; lng: number; address?: string }) =>
    api.patch(`/technicians/${id}/location`, { location }),
  assignTask: (id: string, taskId: string, eta: number) =>
    api.patch(`/technicians/${id}/assign`, { taskId, eta }),
  getAvailable: () => api.get<Technician[]>('/technicians/status/available'),
};

// Ticket API
export const ticketApi = {
  getAll: (params?: { priority?: string; status?: string }) => 
    api.get<Ticket[]>('/tickets', { params }),
  getById: (id: string) => api.get<Ticket>(`/tickets/${id}`),
  create: (ticket: Partial<Ticket>) => api.post<Ticket>('/tickets', ticket),
  assign: (id: string, technicianId: string) =>
    api.patch(`/tickets/${id}/assign`, { technicianId }),
  updateStatus: (id: string, status: string) =>
    api.patch(`/tickets/${id}/status`, { status }),
  accept: (id: string) => api.patch(`/tickets/${id}/accept`),
  reject: (id: string, reason: string) =>
    api.patch(`/tickets/${id}/reject`, { reason }),
  getPriorityQueue: () => api.get<Ticket[]>('/tickets/queue/priority'),
};

// Dispatch Cost API
export const dispatchApi = {
  getAll: (params?: { technicianId?: string; startDate?: string; endDate?: string }) =>
    api.get<DispatchCost[]>('/dispatch/costs', { params }),
  getById: (id: string) => api.get<DispatchCost>(`/dispatch/costs/${id}`),
  create: (cost: Partial<DispatchCost>) => api.post<DispatchCost>('/dispatch/costs', cost),
  getSummary: (params?: { technicianId?: string; startDate?: string; endDate?: string }) =>
    api.get<CostSummary>('/dispatch/costs/summary/total', { params }),
  getRepeatVisits: () => api.get('/dispatch/costs/analysis/repeat-visits'),
  getByTechnician: () => api.get('/dispatch/costs/analysis/by-technician'),
  getDailyTrends: () => api.get('/dispatch/costs/analysis/daily-trends'),
};

// Weather API
export const weatherApi = {
  getByLocation: (lat: number, lng: number) =>
    api.get<WeatherData>('/weather', { params: { lat, lng } }),
  getAll: () => api.get<WeatherData[]>('/weather/all'),
  calculateETA: (data: {
    technicianLocation: { lat: number; lng: number };
    ticketLocation: { lat: number; lng: number };
    baseETA: number;
    technicianId?: string;
    ticketId?: string;
  }) => api.post('/weather/calculate-eta', data),
  getForecast: (lat: number, lng: number) =>
    api.get('/weather/forecast', { params: { lat, lng } }),
};

export default api;

// Made with Bob
