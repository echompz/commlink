# CommLink - Technician Operations Monitoring System

A comprehensive microservices-based web application for monitoring and managing telecommunications technician operations in real-time.

![CommLink](https://img.shields.io/badge/CommLink-Operations-dc2626)
![Microservices](https://img.shields.io/badge/Architecture-Microservices-blue)
![React](https://img.shields.io/badge/Frontend-React-61dafb)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178c6)

## 🚀 Features

### 1. Live Technician Map
- Real-time technician location tracking
- Visual status indicators (Available, Repairing, Offline)
- Interactive map with technician details
- ETA display for assigned tasks
- Filter by technician status

### 2. Ticketing System
- Create and manage service tickets
- Priority-based ticket classification
- Assign tickets to available technicians
- Accept/Reject ticket functionality
- Customer information management

### 3. Incident Priority Queue
- Automatic priority sorting
- Four priority levels:
  - 🔴 Critical Outage
  - 🟠 High Priority
  - 🔵 Maintenance
  - 🟣 Routine Inspect
- Real-time queue updates
- Average wait time tracking

### 4. Dispatch Cost Monitoring
- Track fuel costs
- Monitor overtime expenses
- Analyze repair costs
- Identify repeat visits
- Cost breakdown by technician
- Visual cost distribution charts

### 5. Weather Integration
- Real-time weather conditions
- Weather-adjusted ETA calculations
- Impact on technician dispatch
- Multiple location monitoring

## 🏗️ Architecture

### Microservices Structure

```
commlink/
├── frontend/                 # React + TypeScript frontend
├── backend/
│   ├── api-gateway/         # API Gateway (Port 3000)
│   ├── technician-service/  # Technician management (Port 3001)
│   ├── ticket-service/      # Ticket management (Port 3002)
│   ├── dispatch-service/    # Cost monitoring (Port 3003)
│   └── weather-service/     # Weather & ETA (Port 3004)
├── shared/
│   └── types/               # Shared TypeScript types
└── docker-compose.yml       # Container orchestration
```

### Technology Stack

**Frontend:**
- React 18
- TypeScript
- React Leaflet (Maps)
- Axios (HTTP client)
- Lucide React (Icons)
- Vite (Build tool)

**Backend:**
- Node.js + Express
- TypeScript
- CORS enabled
- RESTful APIs

**DevOps:**
- Docker & Docker Compose
- Microservices architecture
- Hot reload in development

## 📦 Installation

### Prerequisites
- Node.js 20+
- npm or yarn
- Docker & Docker Compose (optional)

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd telcom1
```

2. **Install dependencies**
```bash
npm install
```

3. **Install service dependencies**
```bash
# Install all backend services
cd backend/api-gateway && npm install && cd ../..
cd backend/technician-service && npm install && cd ../..
cd backend/ticket-service && npm install && cd ../..
cd backend/dispatch-service && npm install && cd ../..
cd backend/weather-service && npm install && cd ../..

# Install frontend
cd frontend && npm install && cd ..
```

4. **Start all services**

**Option A: Using npm scripts (Development)**
```bash
# Terminal 1 - Start all backend services
npm run dev:backend

# Terminal 2 - Start frontend
npm run dev:frontend
```

**Option B: Using Docker Compose (Recommended)**
```bash
docker-compose up --build
```

5. **Access the application**
- Frontend: http://localhost:5173
- API Gateway: http://localhost:3000
- Technician Service: http://localhost:3001
- Ticket Service: http://localhost:3002
- Dispatch Service: http://localhost:3003
- Weather Service: http://localhost:3004

## 🎨 Design Philosophy

### Minimalistic UI
- Clean, borderless design
- No shadows or heavy effects
- Red accent color (#dc2626)
- High contrast for readability
- Responsive layout

### Color Palette
- Primary Red: `#dc2626`
- Background: `#f9fafb`
- Text: `#111827`
- Borders: `#e5e7eb`

## 🔧 Configuration

### Frontend Environment Variables

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

### Backend Environment Variables

Each service can have its own `.env` file:

**API Gateway** (`backend/api-gateway/.env`):
```env
PORT=3000
TECHNICIAN_SERVICE_URL=http://localhost:3001
TICKET_SERVICE_URL=http://localhost:3002
DISPATCH_SERVICE_URL=http://localhost:3003
WEATHER_SERVICE_URL=http://localhost:3004
```

**Other Services**:
```env
PORT=300X  # Replace X with service port
```

## 📡 API Documentation

### Technician Service (Port 3001)

```bash
GET    /technicians              # Get all technicians
GET    /technicians/:id          # Get technician by ID
PATCH  /technicians/:id/status   # Update status
PATCH  /technicians/:id/location # Update location
PATCH  /technicians/:id/assign   # Assign task
GET    /technicians/status/available # Get available technicians
```

### Ticket Service (Port 3002)

```bash
GET    /tickets                  # Get all tickets
GET    /tickets/:id              # Get ticket by ID
POST   /tickets                  # Create ticket
PATCH  /tickets/:id/assign       # Assign to technician
PATCH  /tickets/:id/status       # Update status
PATCH  /tickets/:id/accept       # Accept ticket
PATCH  /tickets/:id/reject       # Reject ticket
GET    /tickets/queue/priority   # Get priority queue
```

### Dispatch Service (Port 3003)

```bash
GET    /costs                    # Get all costs
GET    /costs/:id                # Get cost by ID
POST   /costs                    # Create cost record
GET    /costs/summary/total      # Get cost summary
GET    /costs/analysis/repeat-visits    # Repeat visit analysis
GET    /costs/analysis/by-technician    # Cost by technician
GET    /costs/analysis/daily-trends     # Daily cost trends
```

### Weather Service (Port 3004)

```bash
GET    /weather                  # Get weather by location
GET    /weather/all              # Get all weather data
POST   /weather/calculate-eta    # Calculate ETA with weather
GET    /weather/forecast         # Get weather forecast
```

## 🌐 Integration with Real APIs

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for detailed instructions on:
- Integrating OpenWeatherMap API
- Setting up Google Maps
- Implementing real traffic data
- Production deployment

## 🐳 Docker Deployment

### Build and run all services:
```bash
docker-compose up --build
```

### Run in detached mode:
```bash
docker-compose up -d
```

### Stop all services:
```bash
docker-compose down
```

### View logs:
```bash
docker-compose logs -f [service-name]
```

## 📊 Dummy Data

The application comes with pre-populated dummy data:
- 6 technicians with different statuses
- 6 service tickets with various priorities
- 5 dispatch cost records
- 4 weather locations in Metro Manila

## 🔒 Security Considerations

- CORS enabled for development
- Environment variables for sensitive data
- API key protection (see Integration Guide)
- Rate limiting recommended for production

## 🚀 Production Deployment

### Build for Production

**Frontend:**
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

**Backend Services:**
```bash
cd backend/[service-name]
npm run build
npm start
```

### Environment Setup
1. Set production API URLs
2. Configure CORS for production domains
3. Set up SSL/TLS certificates
4. Configure reverse proxy (nginx)
5. Set up monitoring and logging

## 📈 Scaling

The microservices architecture allows independent scaling:
- Scale individual services based on load
- Use container orchestration (Kubernetes)
- Implement load balancing
- Add caching layer (Redis)
- Database per service pattern

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

**CommLink Development Team**

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check the [Integration Guide](./INTEGRATION_GUIDE.md)
- Review API documentation

## 🗺️ Roadmap

- [ ] Real-time WebSocket updates
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Machine learning for ETA prediction
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Export reports (PDF/Excel)
- [ ] SMS/Email notifications
- [ ] Role-based access control
- [ ] Audit logging

## 📸 Screenshots

### Live Technician Map
Real-time tracking of all field technicians with status indicators and ETAs.

### Ticketing System
Comprehensive ticket management with priority-based assignment.

### Priority Queue
Automatic sorting and prioritization of critical incidents.

### Cost Monitoring
Detailed cost analysis and breakdown by technician and job type.

---

**Built with ❤️ for telecommunications operations management**