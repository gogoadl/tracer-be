# AI Log Frontend

A modern React-based web application for viewing and analyzing command logs with AI-powered summaries.

## Features

- 📅 View logs by date from the sidebar
- 🤖 AI-generated summaries of command logs
- 🔄 Reanalyze logs on demand
- 🌙 Dark/Light theme toggle
- 📱 Responsive design
- ⚡ Fast development with Vite

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Axios** - API client
- **Docker** - Containerization

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on http://localhost:8000

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at http://localhost:3000

### Build for Production

```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

## Docker

### Build Docker Image

```bash
docker build -t ai-log-frontend .
```

### Run Docker Container

```bash
docker run -p 8080:80 ai-log-frontend
```

The app will be available at http://localhost:8080

### Environment Variables

Set the backend API URL:

```bash
# .env file
VITE_API_URL=http://your-backend-url:8000
```

## Project Structure

```
ai-log-frontend/
├── src/
│   ├── components/      # React components
│   │   ├── Sidebar.jsx      # Date list sidebar
│   │   ├── SummaryCard.jsx  # AI summary card
│   │   ├── LogEntry.jsx     # Individual log entry
│   │   └── ThemeToggle.jsx  # Theme toggle button
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   ├── api.js           # API service
│   └── index.css        # Global styles
├── public/              # Static assets
├── Dockerfile           # Docker configuration
├── nginx.conf           # Nginx configuration
├── package.json         # Dependencies
└── vite.config.js       # Vite configuration
```

## API Endpoints

The frontend expects the following backend endpoints:

- `GET /logs` - List available log dates
- `GET /logs/{date}` - Get logs for a specific date
- `POST /analyze/{date}` - Trigger reanalysis for a date

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

MIT

