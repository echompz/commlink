# Quick Start Guide - CommLink

Follow these simple steps to get the CommLink website running on your computer.

## Prerequisites

Make sure you have these installed:
- **Node.js** (version 20 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

To check if you have them:
```bash
node --version
npm --version
```

## Step-by-Step Instructions

### Option 1: Quick Start (Recommended for First Time)

Open your terminal and run these commands one by one:

```bash
# 1. Navigate to the project folder
cd /Users/cristenleitolentino/Code/telcom1

# 2. Install main dependencies
npm install

# 3. Install frontend dependencies
cd frontend
npm install
cd ..

# 4. Install backend dependencies
cd backend/api-gateway && npm install && cd ../..
cd backend/technician-service && npm install && cd ../..
cd backend/ticket-service && npm install && cd ../..
cd backend/dispatch-service && npm install && cd ../..
cd backend/weather-service && npm install && cd ../..

# 5. Start the backend services (keep this terminal open)
npm run dev:backend
```

**Open a NEW terminal window** and run:
```bash
# 6. Navigate to project folder
cd /Users/cristenleitolentino/Code/telcom1

# 7. Start the frontend (keep this terminal open)
npm run dev:frontend
```

### Option 2: Using Docker (If you have Docker installed)

```bash
# Navigate to project folder
cd /Users/cristenleitolentino/Code/telcom1

# Start everything with one command
docker-compose up --build
```

## Accessing the Website

Once everything is running, open your web browser and go to:

**🌐 http://localhost:5173**

You should see the CommLink dashboard!

## What You'll See

The website has 4 main sections accessible from the left sidebar:

1. **Live Technician Map** - See all technicians on a map
2. **Ticketing System** - Manage service tickets
3. **Priority Queue** - View urgent tickets
4. **Cost Monitoring** - Track operational costs

## Troubleshooting

### "Port already in use" error

If you see this error, another program is using the port. Try:

```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:3002 | xargs kill -9
lsof -ti:3003 | xargs kill -9
lsof -ti:3004 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

Then try starting again.

### "Cannot find module" error

Run the install commands again:
```bash
cd /Users/cristenleitolentino/Code/telcom1
npm install
cd frontend && npm install && cd ..
```

### Services not connecting

Make sure ALL backend services are running. You should see:
```
🚀 API Gateway running on port 3000
🔧 Technician Service running on port 3001
🎫 Ticket Service running on port 3002
💰 Dispatch Service running on port 3003
🌤️  Weather Service running on port 3004
```

### Map not loading

The map uses OpenStreetMap which requires internet connection. Make sure you're online.

## Stopping the Application

**If using npm:**
- Press `Ctrl + C` in both terminal windows

**If using Docker:**
```bash
docker-compose down
```

## Next Steps

- Check out `README.md` for detailed documentation
- See `INTEGRATION_GUIDE.md` to integrate real weather and map APIs
- Explore the different features in the UI

## Need Help?

Common issues:
1. **Blank screen** - Check browser console (F12) for errors
2. **No data showing** - Backend services might not be running
3. **Map not interactive** - Wait a few seconds for it to load

## Development Mode

The app runs in development mode with:
- ✅ Hot reload (changes update automatically)
- ✅ Dummy data pre-loaded
- ✅ All features enabled
- ✅ Console logging for debugging

Enjoy using CommLink! 🚀