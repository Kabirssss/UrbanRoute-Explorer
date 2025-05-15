import React, { useState, useEffect } from "react";
import DeckGL from '@deck.gl/react';
import { PathLayer, ScatterplotLayer } from '@deck.gl/layers';
import { TileLayer } from '@deck.gl/geo-layers';
import { useVisualizerContext } from '../context/VisualizerContext';
import { FaPlus, FaMinus, FaMapMarkerAlt, FaFlag } from 'react-icons/fa';

const Map3D = ({ pathPositions, visitedPositions, distanceMarkers, highlightedElement, pathFound }) => {
  const {
    startPoint,
    endPoint,
    waypoints,
    darkMode,
    mapCenter
  } = useVisualizerContext();
  
  const [viewState, setViewState] = useState({
    longitude: mapCenter[1],
    latitude: mapCenter[0],
    zoom: 12,
    pitch: 45,
    bearing: 0
  });

  // Convert lat/lon to deck.gl format [lon, lat] and add elevation
  const convertCoordinates = (positions, baseElevation = 0) => {
    if (!positions || !positions.length) return [];
    return positions.map(pos => [pos[1], pos[0], baseElevation]); // [lon, lat, elevation]
  };
  
  // Get enhanced styling for highlighted elements
  const getHighlightedStyle = (type, defaultColor, highlightedColor) => {
    if (highlightedElement === type) {
      return {
        color: highlightedColor || defaultColor,
        width: 8,
        elevation: 1000,
        elevationScale: 2,
        radius: 20,
        radiusScale: 2,
        animate: true
      };
    }
    return {
      color: defaultColor,
      width: 5,
      elevation: 500,
      elevationScale: 1,
      radius: 10,
      radiusScale: 1,
      animate: false
    };
  };

  // Handle zoom controls for 3D view
  const handleZoomIn = () => {
    setViewState(prevViewState => ({
      ...prevViewState,
      zoom: Math.min(prevViewState.zoom + 1, 20) // Max zoom level of 20
    }));
  };
  
  const handleZoomOut = () => {
    setViewState(prevViewState => ({
      ...prevViewState,
      zoom: Math.max(prevViewState.zoom - 1, 1) // Min zoom level of 1
    }));
  };

  // Add navigation functions
  const goToStart = () => {
    setViewState(prevViewState => ({
      ...prevViewState,
      longitude: startPoint[1],
      latitude: startPoint[0],
      zoom: 15
    }));
  };
  
  const goToEnd = () => {
    setViewState(prevViewState => ({
      ...prevViewState,
      longitude: endPoint[1],
      latitude: endPoint[0],
      zoom: 15
    }));
  };

  // Enhanced styling for path highlighting with a glow effect when path is found
  const getPathLayer = () => {
    if (!pathPositions || pathPositions.length === 0) return [];
    
    const layers = [];
    
    // Glow effect under the path when found
    if (pathFound) {
      layers.push(
        new PathLayer({
          id: 'path-glow',
          data: [{
            path: pathPositions.map((pos, i) => {
              const progress = i / pathPositions.length;
              const elevation = Math.sin(progress * Math.PI) * 300; // Lower elevation for glow
              return [pos[1], pos[0], elevation - 50]; // Slightly below main path
            }),
            color: [255, 255, 0, 150] // Yellow glow
          }],
          getPath: d => d.path,
          getColor: d => d.color,
          getWidth: 18, // Wider for glow effect
          widthMinPixels: 14,
          rounded: true,
          pickable: false
        })
      );
    }
    
    // Main path layer
    layers.push(
      new PathLayer({
        id: 'shortest-path',
        data: [{
          path: pathPositions.map((pos, i) => {
            const progress = i / pathPositions.length;
            const elevation = Math.sin(progress * Math.PI) * (highlightedElement === 'path' ? 800 : 500);
            return [pos[1], pos[0], elevation];
          }),
          color: pathFound && highlightedElement === 'path' 
            ? [255, 50, 50, 255] // Brighter red when found and highlighted
            : pathFound 
              ? [255, 0, 0, 230] // Standard bright red when found
              : [255, 0, 0, 200] // Normal red
        }],
        getPath: d => d.path,
        getColor: d => d.color,
        getWidth: pathFound ? 8 : (highlightedElement === 'path' ? 7 : 5),
        widthMinPixels: pathFound ? 7 : (highlightedElement === 'path' ? 6 : 4),
        pickable: true,
        rounded: true
      })
    );
    
    return layers;
  };

  // Create layers for path visualization
  const layers = [
    // Base tile layer
    new TileLayer({
      data: darkMode 
        ? 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
        : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      minZoom: 0,
      maxZoom: 19,
      tileSize: 256
    }),
    
    // Visited nodes paths
    ...(visitedPositions.length > 0 ? [
      new PathLayer({
        id: 'visited-paths',
        data: visitedPositions.map(pair => ({
          path: [
            [pair[0][1], pair[0][0], 0], // Convert from [lat, lon] to [lon, lat, elevation]
            [pair[1][1], pair[1][0], 0]
          ],
          color: highlightedElement === 'visited' ? [0, 0, 255, 200] : [0, 0, 255, 150]
        })),
        getPath: d => d.path,
        getColor: d => d.color,
        getWidth: highlightedElement === 'visited' ? 3 : 2,
        widthMinPixels: highlightedElement === 'visited' ? 3 : 2
      })
    ] : []),
    
    // Path layers with enhanced highlighting
    ...getPathLayer(),
    
    // Start point - with highlight effect
    new ScatterplotLayer({
      id: 'start-point',
      data: [{ position: [startPoint[1], startPoint[0], 0] }],
      getPosition: d => d.position,
      getFillColor: [255, 0, 0, 255],
      getRadius: highlightedElement === 'start' ? 20 : 12,
      radiusScale: highlightedElement === 'start' ? 1.5 : 1,
      radiusMinPixels: highlightedElement === 'start' ? 8 : 5,
      pickable: true,
      onClick: () => console.log("Start point clicked"),
      updateTriggers: {
        getRadius: highlightedElement
      }
    }),
    
    // End point - with highlight effect
    new ScatterplotLayer({
      id: 'end-point',
      data: [{ position: [endPoint[1], endPoint[0], 0] }],
      getPosition: d => d.position,
      getFillColor: [0, 255, 0, 255],
      getRadius: highlightedElement === 'end' ? 20 : 12,
      radiusScale: highlightedElement === 'end' ? 1.5 : 1,
      radiusMinPixels: highlightedElement === 'end' ? 8 : 5,
      pickable: true,
      onClick: () => console.log("End point clicked"),
      updateTriggers: {
        getRadius: highlightedElement
      }
    }),
    
    // Waypoints
    ...(waypoints.length > 0 ? [
      new ScatterplotLayer({
        id: 'waypoints',
        data: waypoints.map(wp => ({ 
          position: [wp[1], wp[0], 0]
        })),
        getPosition: d => d.position,
        getFillColor: [0, 128, 255],
        getRadius: 8,
        radiusMinPixels: 4,
        pickable: true
      })
    ] : [])
  ];

  return (
    <div className="w-full h-screen">
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState }) => setViewState(viewState)}
        controller={true}
        layers={layers}
      />
      
      {/* Zoom and navigation controls for 3D view */}
      <div className={`fixed bottom-[375px] right-4 z-[900] flex flex-col gap-2`}>
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
    </div>
  );
};

export default Map3D;
