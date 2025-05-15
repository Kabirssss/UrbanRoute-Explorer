import React, { useState } from 'react';
import { useVisualizerContext } from '../context/VisualizerContext';
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaMapMarkerAlt, FaGripLines, FaTimes, FaRoute } from 'react-icons/fa';
import { findNearestNode } from './Helper';

const WaypointManager = () => {
  const { 
    waypoints, 
    setWaypoints, 
    addWaypoint, 
    removeWaypoint, 
    reorderWaypoints,
    nodesData,
    setMapCenter,
    visualizing
  } = useVisualizerContext();
  
  const [isOpen, setIsOpen] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  const handleAddWaypoint = () => {
    // Add a waypoint near the center of the current view
    if (nodesData && nodesData.length > 0) {
      const centerNodeIndex = Math.floor(nodesData.length / 2);
      const newWaypoint = [nodesData[centerNodeIndex].lat, nodesData[centerNodeIndex].lon];
      addWaypoint(newWaypoint);
    }
  };

  const handleRemoveWaypoint = (index) => {
    removeWaypoint(index);
  };

  const handleMoveUp = (index) => {
    if (index <= 0) return;
    const newWaypoints = [...waypoints];
    [newWaypoints[index], newWaypoints[index - 1]] = [newWaypoints[index - 1], newWaypoints[index]];
    reorderWaypoints(newWaypoints);
  };

  const handleMoveDown = (index) => {
    if (index >= waypoints.length - 1) return;
    const newWaypoints = [...waypoints];
    [newWaypoints[index], newWaypoints[index + 1]] = [newWaypoints[index + 1], newWaypoints[index]];
    reorderWaypoints(newWaypoints);
  };

  const handleFocusWaypoint = (waypoint) => {
    setMapCenter(waypoint);
  };

  // Drag and drop functionality
  const handleDragStart = (index) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null) return;
    if (draggedItem === index) return;
    
    const newWaypoints = [...waypoints];
    const draggedWaypoint = newWaypoints[draggedItem];
    
    // Remove the dragged item
    newWaypoints.splice(draggedItem, 1);
    // Insert it at the new position
    newWaypoints.splice(index, 0, draggedWaypoint);
    
    reorderWaypoints(newWaypoints);
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="fixed right-4 top-24 z-[1000]">
      <div className="flex flex-col items-end">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`mb-2 p-2 rounded-full shadow-lg transition-colors ${
            isOpen 
              ? 'bg-blue-500 text-white' 
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title={isOpen ? "Hide waypoints" : "Show waypoints"}
        >
          {isOpen ? (
            <FaTimes size={20} />
          ) : (
            <FaRoute size={20} className="text-blue-500 dark:text-blue-400" />
          )}
        </button>
        
        {isOpen && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-72 overflow-hidden animate-fade-in">
            <div className="p-3 bg-blue-500 text-white dark:bg-blue-600 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
              <h3 className="text-sm font-medium">Waypoints ({waypoints.length})</h3>
              <button
                onClick={handleAddWaypoint}
                className="text-white hover:text-blue-100 p-1 rounded"
                title="Add waypoint"
                disabled={visualizing}
              >
                <FaPlus size={16} />
              </button>
            </div>
            
            <div className="max-h-72 overflow-y-auto">
              {waypoints.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No waypoints added. Click the + button to add one or double-click on the map.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {waypoints.map((waypoint, index) => (
                    <li 
                      key={index}
                      className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      draggable={!visualizing}
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="flex items-center">
                        <div className="mr-2 text-gray-400 cursor-move">
                          <FaGripLines size={14} />
                        </div>
                        <div className="flex-1 text-xs">
                          <div className="font-medium">Waypoint {index + 1}</div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {waypoint[0].toFixed(5)}, {waypoint[1].toFixed(5)}
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleFocusWaypoint(waypoint)}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            title="Focus on map"
                          >
                            <FaMapMarkerAlt size={14} />
                          </button>
                          {index > 0 && (
                            <button
                              onClick={() => handleMoveUp(index)}
                              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                              title="Move up"
                              disabled={visualizing}
                            >
                              <FaArrowUp size={14} />
                            </button>
                          )}
                          {index < waypoints.length - 1 && (
                            <button
                              onClick={() => handleMoveDown(index)}
                              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                              title="Move down"
                              disabled={visualizing}
                            >
                              <FaArrowDown size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveWaypoint(index)}
                            className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            title="Remove waypoint"
                            disabled={visualizing}
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaypointManager;