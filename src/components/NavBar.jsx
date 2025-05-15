import React, {useState, useEffect, useRef} from 'react';
import { useVisualizerContext } from '../context/VisualizerContext';
import { FaMoon, FaSun, FaBars, FaRoute, FaCube, FaStop } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import useCounter from './useCounter';
import { findNearestNode } from './Helper';

const NavBar = ({ legendItems, onLegendClick, highlightedElement }) => {
  const {
    algorithm,
    setAlgorithm,
    city,
    setCity,
    visualizing,
    setVisualizing,
    nodeVisited,
    shortestNodes,
    clearBoard,
    setClearBoard,
    darkMode,
    setDarkMode,
    setNodes,
    setEdges,
    setMapCenter,
    setStartPoint,
    setEndPoint,
    nodesData,
    is3DMode,
    set3DMode
  } = useVisualizerContext();
  const [drawerOpen, setDrawerOpen] = useState(false);  
  const animatedNodeVisited = useCounter(nodeVisited, 5000);
  const animatedShortestNodes = useCounter(shortestNodes, 5000);
  const [isLoading, setIsLoading] = useState(false);
  
  const cityDropdownRef = useRef(null);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  const handleAlgorithmChange = (event) => {
    setAlgorithm(event.target.value);
  };

  const handleCityChange = async(selectedCity) => {
    try {
      setIsLoading(true);
      setCity(selectedCity);
      
      const nodesResponse = await fetch(`/Data/${selectedCity}/nodes.json`);
      const edgesResponse = await fetch(`/Data/${selectedCity}/edges.json`);
      
      const nodesData = await nodesResponse.json();
      const edgesData = await edgesResponse.json();
      
      setNodes(nodesData);
      setEdges(edgesData);
      
      FlyMapTo();
    } catch (error) {
      console.error('Error loading city data:', error);
    } finally {
      setIsLoading(false);
      setIsCityDropdownOpen(false);
    }
  };

  const cities = ["Pune","Agra", "Jaipur", "Kanpur", "Kota"]; 

  async function fetchData(){
    const [nodesJson,edgesJson] =  await Promise.all([
          fetch(`/Data/${city}/nodes.json`,{
          headers: {
            "Content-Type": "application/json",
          }}),
          fetch(`/Data/${city}/edges.json`,{
            headers: {
              "Content-Type": "application/json",
            }})
        ]);
    const nodes = await nodesJson.json();
    const edges = await edgesJson.json();
    return [nodes,edges];
  }

  const cityDefaults = {
    Pune: {
      center: [18.5204, 73.8567],
      startPoint: [18.5304, 73.8567],
      endPoint: [18.5404, 73.8667]
    },
    Agra: {
      center: [27.1767, 78.0081],
      startPoint: [27.1867, 78.0081],
      endPoint: [27.1967, 78.0181]
    },
    // Add other cities as needed
  };

  useEffect(() => {
    fetchData()
    .then((res)=>{
      setNodes(res[0]);
      setEdges(res[1]);
      
      if (cityDefaults[city]) {
        // Use predefined good locations for the city
        setMapCenter(cityDefaults[city].center);
        
        // Find nearest nodes to our preferred coordinates
        const nearestStartNode = findNearestNode({ 
          lat: cityDefaults[city].startPoint[0], 
          lng: cityDefaults[city].startPoint[1] 
        }, res[0]);
        
        const nearestEndNode = findNearestNode({ 
          lat: cityDefaults[city].endPoint[0], 
          lng: cityDefaults[city].endPoint[1] 
        }, res[0]);
        
        setStartPoint([nearestStartNode.lat, nearestStartNode.lon]);
        setEndPoint([nearestEndNode.lat, nearestEndNode.lon]);
      } else {
        // Fallback to the original method
        setMapCenter([(res[0][20].lat+res[0][100].lat)/2,(res[0][20].lon +res[0][100].lon)/2]);
        setStartPoint([res[0][20].lat,res[0][20].lon]);
        setEndPoint([res[0][100].lat,res[0][100].lon])
      }
    });
  }, [city]);

  const handleVisualize = () => {
    console.log("Starting visualization, current state:", visualizing);
    setVisualizing(true);
    setDrawerOpen(false);
  };

  const handleStopVisualization = () => {
    console.log("EMERGENCY STOP TRIGGERED");
    
    // Force update with direct DOM manipulation to confirm the button was clicked
    document.title = "Stopping...";
    
    // Multiple approaches to ensure it stops
    window.setTimeout(() => {
      setVisualizing(false);
      console.log("Stop command sent");
      document.title = "Visualization Stopped";
    }, 10);
    
    // Fallback to force a re-render
    setClearBoard(prev => !prev);
  };

  console.log("NavBar render - visualizing state:", visualizing);

  const handleClearBoard = () => {
    setClearBoard(!clearBoard);
  };
  
  const handleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const handleToggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <>
      {/* Main control panel - always visible at the top */}
      <div className="fixed top-0 left-0 right-0 bg-gray-800 text-white p-3 z-[1000] shadow-lg">
        <div className="container mx-auto flex flex-wrap items-center justify-between">
          {/* Title and stats */}
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-bold hidden md:block">UrbanRoute Explorer</h1>
            <div className="stats flex space-x-4 text-sm">
              <div className="stat">
                <span className="text-gray-400 mr-1">Distance:</span>
                <span className="font-medium">{animatedShortestNodes} KM</span>
              </div>
              <div className="stat">
                <span className="text-gray-400 mr-1">Explored:</span>
                <span className="font-medium">{animatedNodeVisited} KM</span>
              </div>
            </div>
          </div>
          
          {/* Main controls */}
          <div className="flex items-center space-x-3 flex-1 justify-center mx-4">
            {/* Algorithm selector */}
            <div className="relative w-40">
              <select
                value={algorithm}
                onChange={handleAlgorithmChange}
                className="bg-gray-700 text-white p-2 rounded w-full text-sm appearance-none cursor-pointer"
              >
                <option value="Dijkstra">Dijkstra</option>
                <option value="A*">A*</option>
                <option value="BFS">BFS</option>
                <option value="DFS">DFS</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path>
                </svg>
              </div>
            </div>
            
            {/* City selector */}
            <div className="relative w-40" ref={cityDropdownRef}>
              <button 
                className="bg-gray-700 text-white p-2 rounded w-full flex items-center justify-between text-sm"
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              >
                <span>{city}</span>
                <svg className={`w-4 h-4 transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              {isCityDropdownOpen && (
                <div className="absolute left-0 right-0 mt-1 bg-gray-700 rounded shadow-lg z-50">
                  <div className="max-h-56 overflow-y-auto">
                    {cities.map((cityName) => (
                      <button
                        key={cityName}
                        className={`p-2 text-left w-full hover:bg-gray-600 text-sm ${cityName === city ? 'bg-gray-600' : ''}`}
                        onClick={() => handleCityChange(cityName)}
                      >
                        {cityName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            {/* Debug visualization state */}
            {console.log("Rendering button based on visualizing:", visualizing)}
            
            {visualizing ? (
              <button
                onClick={handleStopVisualization}
                className="stop-btn py-2 px-3 flex items-center justify-center space-x-1 text-sm font-bold"
                style={{
                  animation: 'pulse-stop 0.8s infinite',
                  display: 'flex',
                  backgroundColor: '#ff0000'
                }}
                data-testid="stop-button"
              >
                <FaStop size={14} />
                <span>STOP</span>
              </button>
            ) : (
              <button
                onClick={handleVisualize}
                className="visualize-btn py-2 px-3 flex items-center justify-center space-x-1 text-sm"
              >
                <FaRoute size={14} />
                <span>Visualize</span>
              </button>
            )}
            
            <button
              onClick={handleClearBoard}
              className="clear-btn py-2 px-3 text-sm"
              disabled={visualizing}
            >
              Clear
            </button>
            
            <button 
              onClick={handleDarkMode}
              className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? <FaSun className="text-yellow-300" size={14} /> : <FaMoon className="text-gray-300" size={14} />}
            </button>
            
            <button 
              onClick={() => set3DMode(!is3DMode)}
              className={`p-2 rounded-full transition-colors ${
                is3DMode 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
              title={is3DMode ? "Switch to 2D View" : "Switch to 3D View"}
            >
              <FaCube size={14} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Legend panel at the bottom right - updated to be interactive */}
      <div className={`fixed bottom-16 right-4 bg-gray-800 bg-opacity-90 text-white p-3 rounded-lg shadow-lg z-[900] max-w-xs ${darkMode ? 'border border-gray-700' : ''}`}>
        <div className="text-sm font-medium mb-2">Map Legend</div>
        <div className="space-y-1">
          {legendItems.map((item, index) => (
            <div 
              key={index} 
              className={`legend-item flex items-start space-x-2 ${highlightedElement === item.type ? 'active' : ''}`}
              onClick={() => onLegendClick(item.type)}
            >
              {item.icon ? (
                <img 
                  src={item.icon} 
                  alt={item.label} 
                  className="w-4 h-6 mt-0.5 legend-item-icon" 
                />
              ) : (
                <div 
                  className="w-4 h-4 rounded-sm mt-0.5 legend-item-icon" 
                  style={{ backgroundColor: item.color }} 
                />
              )}
              <div>
                <div className="text-xs font-medium">{item.label}</div>
                <div className="text-xs text-gray-400">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {isLoading && <LoadingSpinner />}
    </>
  );
};

export default React.memo(NavBar);
