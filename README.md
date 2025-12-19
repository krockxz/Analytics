# User Analytics Application

A full-stack analytics application that tracks user interactions on web pages and displays them in a dashboard with session views and heatmap visualizations.

## Features

- **Event Tracking**: Tracks page views and clicks with detailed information
- **Session Management**: Automatic session creation and tracking
- **Real-time Dashboard**: View sessions, user journeys, and analytics
- **Heatmap Visualization**: Visualize click patterns on your pages
- **Offline Support**: Queues events when offline and sends when online

## Tech Stack

- **Backend**: Node.js with Express and TypeScript
- **Frontend Dashboard**: Next.js 14 with React and TypeScript
- **Database**: MongoDB Atlas
- **Client Tracking**: Vanilla JavaScript with bundling via Rollup

## Project Structure

```
analytics/
├── client/          # JavaScript tracking script
├── backend/         # Node.js API server
├── dashboard/       # Next.js dashboard
├── shared/          # Shared types and utilities
└── demo.html        # Demo page for testing
```

## Quick Start

### 1. Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Client dependencies (for building the tracker)
cd ../client
npm install

# Dashboard dependencies
cd ../dashboard
npm install
```

### 2. Environment Setup

Backend environment variables are already configured in `backend/.env`:
- MongoDB connection string
- API server port
- CORS settings

Dashboard environment variables are configured in `dashboard/.env.local`:
- API URL
- Tracker script URL

### 3. Run the Application

1. **Start the Backend Server** (in a new terminal):
```bash
cd backend
npm run dev
```
The API will be running at `http://localhost:3001`

2. **Start the Dashboard** (in another new terminal):
```bash
cd dashboard
npm run dev
```
The dashboard will be running at `http://localhost:3000`

3. **Test with Demo Page**:
Open `demo.html` in your browser (served from any local server):
```bash
# Using Python 3
python -m http.server 8080

# Or using Node.js
npx serve .
```

Then visit `http://localhost:8080/demo.html`

## How to Use

### Adding Tracking to Your Website

1. Include the tracking script in your HTML:
```html
<script>
  // Configure API endpoint (optional, defaults to /api/v1)
  window.ANALYTICS_API_URL = 'http://localhost:3001/api/v1';
</script>
<script src="http://localhost:3001/client/dist/tracker.min.js"></script>
```

2. The tracker will automatically:
   - Generate and store a session ID
   - Track page views
   - Track clicks with coordinates
   - Handle offline queueing

### Viewing Analytics

1. **Sessions View** (Dashboard home):
   - Lists all user sessions
   - Shows event counts and session duration
   - Click on any session to view details

2. **Session Details**:
   - Timeline of all events
   - User journey visualization
   - Click-by-click breakdown

3. **Heatmap View**:
   - Enter a URL to visualize click patterns
   - See where users click most frequently
   - Overlay on actual page screenshot

## API Endpoints

### Events
- `POST /api/v1/events` - Create new event(s)
- `GET /api/v1/events/heatmap?url=<url>` - Get heatmap data for a page

### Sessions
- `GET /api/v1/sessions` - List all sessions
- `GET /api/v1/sessions/:id/events` - Get events for a specific session
- `GET /api/v1/sessions/:id/journey` - Get user journey for a session

## Building the Tracking Script

To build the client-side tracking script:
```bash
cd client
npm run build
```
This creates:
- `dist/tracker.js` - Development version
- `dist/tracker.min.js` - Production version (minified)

## Database Schema

### Events Collection
```javascript
{
  sessionId: string,
  type: 'page_view' | 'click',
  url: string,
  timestamp: Date,
  data: {
    // Click events
    x?: number,
    y?: number,
    element?: string,
    // Page view events
    title?: string,
    referrer?: string,
    userAgent?: string,
    screenWidth?: number,
    screenHeight?: number
  }
}
```

### Sessions Collection
```javascript
{
  sessionId: string,
  startTime: Date,
  endTime?: Date,
  eventCount: number,
  pageViews: number,
  clicks: number,
  isActive: boolean,
  lastActivity: Date,
  userAgent?: string,
  ipAddress?: string
}
```

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Dashboard tests
cd dashboard
npm test
```

### Building for Production
```bash
# Build backend
cd backend
npm run build

# Build client tracker
cd ../client
npm run build

# Build dashboard
cd ../dashboard
npm run build
```

## License

ISC

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request