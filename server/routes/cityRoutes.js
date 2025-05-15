const express = require('express');
const fs = require('fs');
const path = require('path');
const City = require('../models/City');
const router = express.Router();
const fallbackData = require('../fallbackData');

const cityDataPath = path.join(__dirname, '../../public/Data');

// Get all cities (from DB and filesystem)
router.get('/', async (req, res) => {
  try {
    // Get cities from database
    const dbCities = await City.find().select('name centerCoords hasRealData');
    
    // Get cities from filesystem as backup
    let fsCities = [];
    try {
      fsCities = fs.readdirSync(cityDataPath)
        .filter(file => fs.statSync(path.join(cityDataPath, file)).isDirectory())
        .map(name => ({ name }));
    } catch (fsErr) {
      console.error('Error reading cities from filesystem:', fsErr);
    }
    
    // Combine and de-duplicate cities
    const cityNames = new Set([...dbCities.map(c => c.name), ...fsCities.map(c => c.name)]);
    const cities = Array.from(cityNames);
    
    res.json({ cities });
  } catch (err) {
    console.error('Error fetching cities:', err);
    res.status(500).json({ error: 'Failed to fetch cities', details: err.message });
  }
});

// Get specific city data
router.get('/:city', async (req, res) => {
  const { city } = req.params;
  
  try {
    // Try to get city info from database first
    const cityInfo = await City.findOne({ name: city });
    
    // Check filesystem for node and edge data
    const cityPath = path.join(cityDataPath, city);
    const nodesPath = path.join(cityPath, 'nodes.json');
    const edgesPath = path.join(cityPath, 'edges.json');
    
    // If files exist, read and return them
    if (fs.existsSync(nodesPath) && fs.existsSync(edgesPath)) {
      const nodes = JSON.parse(fs.readFileSync(nodesPath, 'utf8'));
      const edges = JSON.parse(fs.readFileSync(edgesPath, 'utf8'));
      return res.json({ 
        info: cityInfo || { name: city },
        nodes, 
        edges 
      });
    }
    
    // Generate fallback data if real data doesn't exist
    console.log(`Generating fallback data for ${city}`);
    const data = fallbackData.generateCityData(city);
    
    // Save city to database if it doesn't exist
    if (!cityInfo) {
      const newCity = new City({
        name: city,
        centerCoords: data.centerCoords || { lat: 0, lng: 0 },
        hasRealData: false
      });
      await newCity.save();
    }
    
    return res.json({ 
      info: cityInfo || { name: city },
      nodes: data.nodes, 
      edges: data.edges 
    });
  } catch (err) {
    console.error(`Error fetching data for city ${city}:`, err);
    res.status(500).json({ error: 'Failed to fetch city data', details: err.message });
  }
});

// Add a new city
router.post('/', async (req, res) => {
  const { name, centerCoords, description } = req.body;
  
  if (!name || !centerCoords) {
    return res.status(400).json({ error: 'Name and centerCoords are required' });
  }
  
  try {
    // Check if city already exists
    const existingCity = await City.findOne({ name });
    if (existingCity) {
      return res.status(409).json({ error: 'City already exists' });
    }
    
    // Create new city
    const city = new City({
      name,
      centerCoords,
      description,
      hasRealData: false
    });
    
    await city.save();
    res.status(201).json(city);
  } catch (err) {
    console.error('Error creating city:', err);
    res.status(500).json({ error: 'Failed to create city', details: err.message });
  }
});

module.exports = router;
