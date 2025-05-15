import React, { useState, useEffect } from 'react';
import { fetchRoutes } from '../api/cityApi';
import { useVisualizerContext } from '../context/VisualizerContext';
import { FaRoute, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';

const SavedRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    setStartPoint,
    setEndPoint,
    setWaypoints,
    setAlgorithm,
    setMapCenter
  } = useVisualizerContext();
  
  useEffect(() => {
    const loadRoutes = async () => {
      if (isOpen) {
        try {
          setLoading(true);
          const data = await fetchRoutes();
          setRoutes(data);
        } catch (error) {
          console.error('Error loading saved routes:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadRoutes();
  }, [isOpen]);
  
  const handleLoadRoute = (route) => {
    setStartPoint(route.startPoint);
    setEndPoint(route.endPoint);
    setWaypoints(route.waypoints || []);
    setAlgorithm(route.algorithm || 'Dijkstra');
    
    // Center map on the route
    const midLat = (route.startPoint[0] + route.endPoint[0]) / 2;
    const midLng = (route.startPoint[1] + route.endPoint[1]) / 2;
    setMapCenter([midLat, midLng]);
    
    setIsOpen(false);
  };
  
  if (!isOpen) {
    return (
      <button
        className="fixed bottom-20 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg z-[1000] hover:bg-blue-700 transition-all"
        onClick={() => setIsOpen(true)}
        title="Saved Routes"
      >
        <FaRoute size={20} />
      </button>
    );
  }
  
  return (
    <div className="fixed right-4 bottom-20 z-[1000] w-80">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between bg-blue-600 text-white p-3">
          <h3 className="font-medium">Saved Routes</h3>
          <button onClick={() => setIsOpen(false)} className="text-white hover:text-blue-200">
            <FaTimes />
          </button>
        </div>
        
        <div className="max-h-80 overflow-y-auto p-2">
          {loading ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              Loading saved routes...
            </div>
          ) : routes.length === 0 ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No saved routes found.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {routes.map(route => (
                <li key={route.id} className="py-3">
                  <div className="flex flex-col">
                    <div className="font-medium text-gray-900 dark:text-white">{route.name}</div>
                    {route.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {route.description}
                      </div>
                    )}
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {route.algorithm} - {route.waypoints?.length || 0} waypoints
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(route.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      className="mt-2 flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      onClick={() => handleLoadRoute(route)}
                    >
                      <FaMapMarkerAlt className="mr-1" size={12} /> Load route
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedRoutes;
