import React, { useEffect, useState } from 'react';
import { useVisualizerContext } from '../context/VisualizerContext';
import { FaRoute, FaStop, FaExclamationTriangle } from 'react-icons/fa';

// Create a global flag for emergency stopping that can be accessed outside React
window.STOP_VISUALIZATION = false;
// Add another global to track if visualization is in progress
window.VISUALIZATION_IN_PROGRESS = false;

const SimpleControls = () => {
  const { visualizing, setVisualizing, setClearBoard, nodesData, edgesData } = useVisualizerContext();
  const [internalState, setInternalState] = useState(false);
  const [error, setError] = useState(null);

  // Initialize and synchronize global state
  useEffect(() => {
    console.log("SimpleControls: visualizing changed to", visualizing);
    window.STOP_VISUALIZATION = false;
    window.VISUALIZATION_IN_PROGRESS = visualizing;
    setInternalState(visualizing);
    
    return () => {
      // Don't reset on unmount as it might interfere with ongoing operations
    };
  }, [visualizing]);

  const startVisualization = () => {
    try {
      console.log("START button clicked");
      
      // First check if we have data before starting
      if (!nodesData || nodesData.length === 0 || !edgesData || edgesData.length === 0) {
        console.error("No graph data available!");
        setError("No graph data available. Please try another city.");
        setTimeout(() => setError(null), 5000);
        return;
      }
      
      // Proceed with starting visualization
      window.STOP_VISUALIZATION = false;
      window.VISUALIZATION_IN_PROGRESS = true;
      setInternalState(true);
      setError(null);
      
      // Use setTimeout to avoid state batching issues
      setTimeout(() => {
        console.log("Setting visualizing state to TRUE");
        setVisualizing(true);
      }, 10);
    } catch (err) {
      console.error("Error starting visualization:", err);
      setError("Failed to start visualization. Try reloading the page.");
      setInternalState(false);
      window.VISUALIZATION_IN_PROGRESS = false;
    }
  };

  const stopVisualization = () => {
    try {
      console.log("STOP button clicked");
      window.STOP_VISUALIZATION = true;
      setInternalState(false);
      
      // Apply multiple approaches with increasing delays
      setTimeout(() => {
        console.log("Setting visualizing to FALSE (first attempt)");
        setVisualizing(false);
      }, 10);
      
      setTimeout(() => {
        if (window.VISUALIZATION_IN_PROGRESS) {
          console.log("Setting visualizing to FALSE (second attempt)");
          window.VISUALIZATION_IN_PROGRESS = false;
          setVisualizing(false);
          setClearBoard(prev => !prev);
        }
      }, 200);
    } catch (err) {
      console.error("Error stopping visualization:", err);
      // Force reset all states
      window.STOP_VISUALIZATION = true;
      window.VISUALIZATION_IN_PROGRESS = false;
      setInternalState(false);
      setVisualizing(false);
    }
  };

  // Use either the React state or the global flag
  const isVisualizing = internalState || visualizing || window.VISUALIZATION_IN_PROGRESS;

  return (
    <div className="fixed top-16 left-4 z-[3000] p-3 rounded-md shadow-lg" style={{
      background: isVisualizing ? '#ff0000' : '#10b981',
      boxShadow: '0 0 15px rgba(0, 0, 0, 0.5)'
    }}>
      {error && (
        <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-xs">
          {error}
        </div>
      )}
      
      {isVisualizing ? (
        <button 
          onClick={stopVisualization} 
          className="bg-white text-red-600 px-5 py-3 rounded-md font-bold text-lg animate-pulse"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white'
          }}
        >
          <FaExclamationTriangle className="inline mr-2" size={20} /> 
          STOP NOW
        </button>
      ) : (
        <button 
          onClick={startVisualization} 
          className="bg-white text-green-600 px-5 py-3 rounded-md font-bold"
        >
          <FaRoute className="inline mr-2" size={16} /> START
        </button>
      )}
      <div className="mt-2 text-white font-medium text-center">
        {isVisualizing ? "RUNNING..." : "Ready"}
      </div>
      <div className="mt-1 text-xs text-white text-center">
        Status: {visualizing ? "Active" : "Idle"}
      </div>
    </div>
  );
};

export default SimpleControls;
