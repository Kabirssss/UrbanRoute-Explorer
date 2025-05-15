import React from 'react';
import { useVisualizerContext } from '../context/VisualizerContext';

const Legend = () => {
  const { darkMode } = useVisualizerContext();

  const legendItems = [
    { color: 'red', label: 'Shortest Path', description: 'Optimal route' },
    { color: 'blue', label: 'Visited Nodes', description: 'Explored areas' },
    { 
      icon: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png', 
      label: 'Start Point', 
      description: 'Starting location' 
    },
    { 
      icon: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png', 
      label: 'End Point', 
      description: 'Destination' 
    }
  ];

  return (
    <div className={`legend-container ${darkMode ? 'dark' : ''}`}>
      <div className="legend-header">
        <h3>Legend</h3>
      </div>
      <div className="legend-items">
        {legendItems.map((item, index) => (
          <div key={index} className="legend-item">
            {item.icon ? (
              <img src={item.icon} alt={item.label} className="legend-icon" />
            ) : (
              <div className="legend-color" style={{ backgroundColor: item.color }} />
            )}
            <div className="legend-info">
              <span className="legend-label">{item.label}</span>
              <span className="legend-description">{item.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend; 