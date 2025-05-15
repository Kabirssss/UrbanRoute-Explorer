import React from 'react';
import { useMap } from 'react-leaflet';
import { FaPlus, FaMinus, FaMapMarkerAlt, FaFlag } from 'react-icons/fa';
import { useVisualizerContext } from '../context/VisualizerContext';

const ZoomControls = ({ darkMode }) => {
  const map = useMap();
  const { startPoint, endPoint } = useVisualizerContext();
  
  const handleZoomIn = () => {
    map.zoomIn();
  };
  
  const handleZoomOut = () => {
    map.zoomOut();
  };
  
  const goToStart = () => {
    map.setView(startPoint, 15); // Zoom level 15 for better visibility
  };
  
  const goToEnd = () => {
    map.setView(endPoint, 15); // Zoom level 15 for better visibility
  };
  
  return (
    <div className={`fixed bottom-[375px] right-4 z-[2000] flex flex-col gap-2`}>
      <button 
        onClick={handleZoomIn}
        className={`p-2 rounded-md shadow-md transition-colors zoom-control-button ${
          darkMode 
            ? 'bg-gray-800 text-white hover:bg-gray-700' 
            : 'bg-white text-gray-800 hover:bg-gray-100'
        }`}
        title="Zoom in"
        aria-label="Zoom in"
      >
        <FaPlus size={16} />
      </button>
      <button 
        onClick={handleZoomOut}
        className={`p-2 rounded-md shadow-md transition-colors zoom-control-button ${
          darkMode 
            ? 'bg-gray-800 text-white hover:bg-gray-700' 
            : 'bg-white text-gray-800 hover:bg-gray-100'
        }`}
        title="Zoom out"
        aria-label="Zoom out"
      >
        <FaMinus size={16} />
      </button>
      
      {/* Divider */}
      <div className={`h-px w-full my-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
      
      {/* Go to Start button */}
      <button 
        onClick={goToStart}
        className={`p-2 rounded-md shadow-md transition-colors zoom-control-button ${
          darkMode 
            ? 'bg-gray-800 text-red-400 hover:bg-gray-700' 
            : 'bg-white text-red-600 hover:bg-gray-100'
        }`}
        title="Go to Start Marker"
        aria-label="Go to Start Marker"
      >
        <FaMapMarkerAlt size={16} />
      </button>
      
      {/* Go to End button */}
      <button 
        onClick={goToEnd}
        className={`p-2 rounded-md shadow-md transition-colors zoom-control-button ${
          darkMode 
            ? 'bg-gray-800 text-green-400 hover:bg-gray-700' 
            : 'bg-white text-green-600 hover:bg-gray-100'
        }`}
        title="Go to Destination Marker"
        aria-label="Go to Destination Marker"
      >
        <FaFlag size={16} />
      </button>
    </div>
  );
};

export default ZoomControls;
