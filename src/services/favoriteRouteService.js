import FavoriteRoute from '../models/FavoriteRoute';

const STORAGE_KEY = 'favorite_routes';

// Load all saved routes from localStorage
const getAllRoutes = () => {
  try {
    const routesJson = localStorage.getItem(STORAGE_KEY);
    if (!routesJson) return [];
    
    const routesData = JSON.parse(routesJson);
    return routesData.map(route => FavoriteRoute.fromJSON(route));
  } catch (error) {
    console.error('Error loading favorite routes:', error);
    return [];
  }
};

// Save a new route
const saveRoute = (route) => {
  try {
    const routes = getAllRoutes();
    routes.push(route);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(routes.map(r => r.toJSON())));
    return true;
  } catch (error) {
    console.error('Error saving favorite route:', error);
    return false;
  }
};

// Update an existing route
const updateRoute = (updatedRoute) => {
  try {
    const routes = getAllRoutes();
    const index = routes.findIndex(route => route.id === updatedRoute.id);
    
    if (index !== -1) {
      routes[index] = updatedRoute;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(routes.map(r => r.toJSON())));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating favorite route:', error);
    return false;
  }
};

// Delete a route by ID
const deleteRoute = (id) => {
  try {
    const routes = getAllRoutes();
    const filteredRoutes = routes.filter(route => route.id !== id);
    
    if (filteredRoutes.length !== routes.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRoutes.map(r => r.toJSON())));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting favorite route:', error);
    return false;
  }
};

// Get a route by ID
const getRouteById = (id) => {
  try {
    const routes = getAllRoutes();
    return routes.find(route => route.id === id) || null;
  } catch (error) {
    console.error('Error getting route by ID:', error);
    return null;
  }
};

// Filter routes by criteria (city, algorithm, etc.)
const filterRoutes = (criteria = {}) => {
  try {
    const routes = getAllRoutes();
    return routes.filter(route => {
      for (const [key, value] of Object.entries(criteria)) {
        if (route[key] !== value) return false;
      }
      return true;
    });
  } catch (error) {
    console.error('Error filtering routes:', error);
    return [];
  }
};

// Export routes to a JSON file
const exportRoutes = () => {
  try {
    const routes = getAllRoutes();
    const routesJson = JSON.stringify(routes.map(r => r.toJSON()), null, 2);
    const blob = new Blob([routesJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `favorite-routes-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error exporting routes:', error);
    return false;
  }
};

// Import routes from a JSON file
const importRoutes = (jsonData, merge = true) => {
  try {
    const importedRoutesData = JSON.parse(jsonData);
    const importedRoutes = importedRoutesData.map(route => FavoriteRoute.fromJSON(route));
    
    if (merge) {
      const currentRoutes = getAllRoutes();
      // Prevent duplicates by ID
      const existingIds = currentRoutes.map(r => r.id);
      const newRoutes = importedRoutes.filter(r => !existingIds.includes(r.id));
      const allRoutes = [...currentRoutes, ...newRoutes];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allRoutes.map(r => r.toJSON())));
    } else {
      // Replace all existing routes
      localStorage.setItem(STORAGE_KEY, JSON.stringify(importedRoutes.map(r => r.toJSON())));
    }
    
    return true;
  } catch (error) {
    console.error('Error importing routes:', error);
    return false;
  }
};

export default {
  getAllRoutes,
  getRouteById,
  saveRoute,
  updateRoute,
  deleteRoute,
  filterRoutes,
  exportRoutes,
  importRoutes
};