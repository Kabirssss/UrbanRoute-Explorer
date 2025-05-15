/**
 * This script generates fallback data for cities when the actual data files aren't available
 */
const fs = require('fs');
const path = require('path');

// Get the public/Data directory path
const dataDir = path.join(__dirname, '..', 'public', 'Data');

// Create test data for a city
function generateCityData(cityName, nodeCount = 500, edgeCount = 1000) {
  // Create the city directory if it doesn't exist
  const cityDir = path.join(dataDir, cityName);
  if (!fs.existsSync(cityDir)) {
    fs.mkdirSync(cityDir, { recursive: true });
  }
  
  // Generate nodes with realistic coordinates based on city
  const centerCoords = getCityCenterCoords(cityName);
  const nodes = [];
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      id: i.toString(),
      lat: centerCoords.lat + (Math.random() - 0.5) * 0.1,
      lon: centerCoords.lon + (Math.random() - 0.5) * 0.1
    });
  }
  
  // Generate edges between nodes
  const edges = [];
  for (let i = 0; i < edgeCount; i++) {
    const source = Math.floor(Math.random() * nodeCount);
    // Connect to a node that's close by to create a more realistic graph
    const target = Math.min(nodeCount - 1, Math.max(0, source + Math.floor((Math.random() - 0.5) * 20)));
    
    edges.push({
      source: source.toString(),
      target: target.toString(),
      weight: Math.random() * 10 // Random weight between 0 and 10
    });
  }
  
  // Write the files
  fs.writeFileSync(path.join(cityDir, 'nodes.json'), JSON.stringify(nodes));
  fs.writeFileSync(path.join(cityDir, 'edges.json'), JSON.stringify(edges));
  
  console.log(`Generated fallback data for ${cityName}: ${nodes.length} nodes, ${edges.length} edges`);
  return { nodes, edges };
}

function getCityCenterCoords(cityName) {
  // Default coordinates for cities
  const cityCoords = {
    'Pune': { lat: 18.5204, lon: 73.8567 },
    'Agra': { lat: 27.1767, lon: 78.0081 },
    'Jaipur': { lat: 26.9124, lon: 75.7873 },
    'Kanpur': { lat: 26.4499, lon: 80.3319 },
    'Kota': { lat: 25.2138, lon: 75.8648 },
  };
  
  return cityCoords[cityName] || { lat: 20.5937, lon: 78.9629 }; // Default to center of India
}

// Create the data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Generate data for all supported cities
const citiesToGenerate = ['Pune', 'Agra', 'Jaipur', 'Kanpur', 'Kota'];
citiesToGenerate.forEach(city => {
  // Only generate if data doesn't already exist
  const cityDir = path.join(dataDir, city);
  const nodesPath = path.join(cityDir, 'nodes.json');
  const edgesPath = path.join(cityDir, 'edges.json');
  
  if (!fs.existsSync(nodesPath) || !fs.existsSync(edgesPath)) {
    generateCityData(city);
  }
});

module.exports = { generateCityData };
