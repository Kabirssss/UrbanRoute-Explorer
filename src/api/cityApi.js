const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchCities = async () => {
  try {
    const response = await fetch(`${API_URL}/cities`);
    if (!response.ok) {
      throw new Error('Failed to fetch cities');
    }
    const data = await response.json();
    return data.cities;
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
};

export const fetchCityData = async (cityName) => {
  try {
    const response = await fetch(`${API_URL}/cities/${cityName}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data for city: ${cityName}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching data for city ${cityName}:`, error);
    throw error;
  }
};

export const saveRoute = async (routeData) => {
  try {
    const response = await fetch(`${API_URL}/routes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(routeData),
    });

    if (!response.ok) {
      throw new Error('Failed to save route');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving route:', error);
    throw error;
  }
};

export const fetchRoutes = async () => {
  try {
    const response = await fetch(`${API_URL}/routes`);
    if (!response.ok) {
      throw new Error('Failed to fetch routes');
    }
    const data = await response.json();
    return data.routes;
  } catch (error) {
    console.error('Error fetching routes:', error);
    throw error;
  }
};
