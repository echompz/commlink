import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

// Proxy routes to microservices
app.use('/api/technicians', createProxyMiddleware({
  target: process.env.TECHNICIAN_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: { '^/api/technicians': '/technicians' },
  timeout: 30000
}));

app.use('/api/tickets', createProxyMiddleware({
  target: process.env.TICKET_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: { '^/api/tickets': '/tickets' },
  timeout: 30000
}));

app.use('/api/dispatch', createProxyMiddleware({
  target: process.env.DISPATCH_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: { '^/api/dispatch': '' },
  timeout: 30000
}));

app.use('/api/weather', createProxyMiddleware({
  target: process.env.WEATHER_SERVICE_URL || 'http://localhost:3004',
  changeOrigin: true,
  pathRewrite: { '^/api/weather': '/weather' },
  timeout: 30000
}));

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📡 Proxying to microservices:`);
  console.log(`   - Technician Service: ${process.env.TECHNICIAN_SERVICE_URL || 'http://localhost:3001'}`);
  console.log(`   - Ticket Service: ${process.env.TICKET_SERVICE_URL || 'http://localhost:3002'}`);
  console.log(`   - Dispatch Service: ${process.env.DISPATCH_SERVICE_URL || 'http://localhost:3003'}`);
  console.log(`   - Weather Service: ${process.env.WEATHER_SERVICE_URL || 'http://localhost:3004'}`);
});

// Made with Bob
