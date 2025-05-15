const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fallbackData = require('./fallbackData');
const db = require('./database/db');
const cityRoutes = require('./routes/cityRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const { protect } = require('./middleware/authMiddleware');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://your-production-domain.com' : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev')); // Logging

// Data paths
const cityDataPath = path.join(__dirname, '../public/Data');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/users', userRoutes);

// Legacy routes for backward compatibility
app.get('/api/cities', (req, res) => {
  try {
    const cities = fs.readdirSync(cityDataPath)
      .filter(file => fs.statSync(path.join(cityDataPath, file)).isDirectory());
    res.json({ cities });
  } catch (err) {
    console.error('Error reading cities directory:', err);
    res.status(500).json({ error: 'Failed to load cities', details: err.message });
  }
});

// Get city data (nodes and edges)
app.get('/api/cities/:city', (req, res) => {
  const { city } = req.params;
  const cityPath = path.join(cityDataPath, city);
  
  try {
    // Verify the directory exists
    if (!fs.existsSync(cityPath)) {
      console.log(`City directory not found for ${city}, generating fallback data`);
      const data = fallbackData.generateCityData(city);
      return res.json(data);
    }
    
    // Read nodes and edges files
    const nodesPath = path.join(cityPath, 'nodes.json');
    const edgesPath = path.join(cityPath, 'edges.json');
    
    if (!fs.existsSync(nodesPath) || !fs.existsSync(edgesPath)) {
      return res.status(404).json({ error: 'City data incomplete' });
    }
    
    const nodes = JSON.parse(fs.readFileSync(nodesPath, 'utf8'));
    const edges = JSON.parse(fs.readFileSync(edgesPath, 'utf8'));
    
    res.json({ nodes, edges });
  } catch (err) {
    console.error(`Error loading data for city ${city}:`, err);
    res.status(500).json({
      error: 'Failed to load city data',
      details: err.message
    });
  }
});

// Save user routes
app.post('/api/routes', (req, res) => {
  const { name, description, startPoint, endPoint, waypoints, algorithm } = req.body;
  
  if (!name || !startPoint || !endPoint) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const route = {
      id: Date.now().toString(),
      name,
      description,
      startPoint,
      endPoint,
      waypoints: waypoints || [],
      algorithm,
      createdAt: new Date().toISOString()
    };
    
    const routesPath = path.join(__dirname, 'data/routes');
    if (!fs.existsSync(routesPath)) {
      fs.mkdirSync(routesPath, { recursive: true });
    }
    
    const filePath = path.join(routesPath, `${route.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(route, null, 2));
    
    res.status(201).json(route);
  } catch (err) {
    console.error('Error saving route:', err);
    res.status(500).json({ error: 'Failed to save route' });
  }
});

// Get user routes
app.get('/api/routes', (req, res) => {
  try {
    const routesPath = path.join(__dirname, 'data/routes');
    if (!fs.existsSync(routesPath)) {
      return res.json({ routes: [] });
    }
    
    const routes = fs.readdirSync(routesPath)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(routesPath, file);
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      });
    
    res.json({ routes });
  } catch (err) {
    console.error('Error loading routes:', err);
    res.status(500).json({ error: 'Failed to load routes' });
  }
});

// Health check endpoint for connection testing
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Apply error handler middleware
app.use(errorHandler);

// Connect to database and start server
db.connect()
  .then(() => {
    startServer();
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
    console.log('Starting server without database connection...');
    startServer();
  });

function startServer() {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Another instance might be running.`);
      console.log('Try stopping other instances or change the port in .env file.');
    } else {
      console.error('Error starting server:', err);
    }
    process.exit(1);
  });
}
