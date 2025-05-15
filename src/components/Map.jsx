import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  Popup,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import { Icon, DivIcon } from "leaflet";
import { useVisualizerContext } from "../context/VisualizerContext";
import AnimatedPolyline from "./AnimatedPolyline.jsx";
import { findShortestPathWithAnimation } from "../Algorithms/Dijkstra.jsx";
import { AStarSearch } from "../Algorithms/AStar.jsx";
import { bfs } from "../Algorithms/BFS.jsx";
import { dfs } from "../Algorithms/DFS.jsx";
import {
  createGraph,
  getNodeIdfromPostion,
  getPositionFromNodeId,
  findNearestNode,
} from "./Helper.jsx";
import NavBar from "./NavBar";
import LoadingSpinner from './LoadingSpinner';
import Legend from './Legend';
import DistanceMarker from './DistanceMarker';
import { haversineDistance } from './haversine';
import MiniMap from './MiniMap';
import WaypointManager from './WaypointManager';
import Map3D from './Map3D';
import ZoomControls from './ZoomControls';
import cityDefaults from '../data/cityDefaults';
import SimpleControls from './SimpleControls';

const Map = () => {
  const {
    startPoint,
    setStartPoint,
    endPoint,
    setEndPoint,
    algorithm,
    visualizing,
    clearBoard,
    setShortestNodes,
    setNodeVisited,
    darkMode,
    nodesData,
    edgesData,
    mapCenter,
    setMapCenter,
    city,
    setVisualizing,
    waypoints,
    setWaypoints,
    addWaypoint,
    is3DMode,
    set3DMode,
  } = useVisualizerContext();

  const [pathPositions, setPathPositions] = useState([]);
  const [visitedPositions, setVisitedPositions] = useState([]);
  const [visitedAnimationComplete, setVisitedAnimationComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [distanceMarkers, setDistanceMarkers] = useState([]);
  const [highlightedElement, setHighlightedElement] = useState(null);
  const [isCancelled, setIsCancelled] = useState(false);
  const [pathFound, setPathFound] = useState(false);
  const [showPathFoundMessage, setShowPathFoundMessage] = useState(false);
  const [pathDistance, setPathDistance] = useState(0);

  const startMarkerRef = useRef(startPoint);
  const endMarkerRef = useRef(endPoint);
  const waypointRefs = useRef([]);

  // Log whenever visualization state changes
  useEffect(() => {
    console.log("Visualization state changed to:", visualizing);
    
    if (!visualizing) {
      console.log("Visualization stopped");
      setIsCancelled(true);
    }
  }, [visualizing]);

  // Add this effect to show the path found message only after visited animation completes
  useEffect(() => {
    if (visitedAnimationComplete && pathPositions.length > 0 && !showPathFoundMessage) {
      console.log("Visited animation complete, showing path found message");
      setShowPathFoundMessage(true);
      setHighlightedElement('path'); // Auto-highlight the path when found
      
      // Auto-hide the notification after 5 seconds
      setTimeout(() => setShowPathFoundMessage(false), 5000);
    }
  }, [visitedAnimationComplete, pathPositions]);

  // Main effect for path calculation
  useEffect(() => {
    let cancelled = false;
    let calculationStarted = false;
    
    console.log("Map effect: visualizing =", visualizing);
    
    if (visualizing) {
      console.log("Starting visualization process");
      calculationStarted = true; // Flag to prevent immediate cleanup
      
      // Create a persistent record that we've started
      window.VISUALIZATION_IN_PROGRESS = true;
      
      const calculatePath = async () => {
        try {
          // Verify that we have the needed data before starting
          if (!nodesData || nodesData.length === 0 || !edgesData || edgesData.length === 0) {
            console.error("No graph data available!");
            window.alert("Error: No graph data available. Please try another city.");
            setVisualizing(false);
            window.STOP_VISUALIZATION = true;
            window.VISUALIZATION_IN_PROGRESS = false;
            return;
          }
          
          // Prevent immediate cleanup
          await new Promise(resolve => setTimeout(resolve, 50)); 
          
          if (cancelled || window.STOP_VISUALIZATION) {
            console.log("Cancelled before calculation could begin");
            return;
          }
          
          setIsLoading(true);
          
          try {
            // Create graph with error handling
            const graph = createGraph(nodesData, edgesData);
            if (!graph) {
              throw new Error("Failed to create graph");
            }
            
            setVisitedAnimationComplete(false);
            
            // Prevent cleanup during long calculations
            if (cancelled || window.STOP_VISUALIZATION) {
              console.log("Cancelled during graph creation");
              return;
            }
            
            if (waypoints.length > 0) {
              const allPoints = [startPoint, ...waypoints, endPoint];
              let totalPath = [];
              let totalVisitedNodes = [];
              let totalShortestDistance = 0;
              let totalDistance = 0;
              
              for (let i = 0; i < allPoints.length - 1; i++) {
                if (cancelled || window.STOP_VISUALIZATION) {
                  console.log("Cancelled during waypoint processing");
                  return;
                }
                const segmentStart = allPoints[i];
                const segmentEnd = allPoints[i + 1];
                
                const nodeIdStart = getNodeIdfromPostion(segmentStart, nodesData);
                const nodeIdEnd = getNodeIdfromPostion(segmentEnd, nodesData);
                
                let result;
                switch (algorithm) {
                  case "Dijkstra":
                    result = findShortestPathWithAnimation(
                      graph,
                      nodeIdStart,
                      nodeIdEnd,
                      1
                    );
                    break;
                  case "A*":
                    result = AStarSearch(graph, nodeIdStart, nodeIdEnd, 1);
                    break;
                  case "BFS":
                    result = bfs(graph, nodeIdStart, nodeIdEnd);
                    break;
                  case "DFS":
                    result = dfs(graph, nodeIdStart, nodeIdEnd);
                    break;
                  default:
                    console.error("Unknown algorithm:", algorithm);
                    return;
                }
                
                const { path, visitedNodes, shortDist, d } = result;
                
                totalPath = [...totalPath, ...path];
                totalVisitedNodes = [...totalVisitedNodes, ...visitedNodes];
                totalShortestDistance += shortDist;
                totalDistance += d;
              }
              
              if (cancelled || window.STOP_VISUALIZATION) {
                console.log("Cancelled after waypoint processing");
                return;
              }
              
              setNodeVisited(totalDistance.toFixed(2));
              setShortestNodes(totalShortestDistance.toFixed(2));
              
              if (totalPath.length > 0) {
                const pathPositions = totalPath
                  .map((nodeId) => getPositionFromNodeId(nodeId, nodesData))
                  .filter((pos) => pos !== null);
                setPathPositions(pathPositions);

                // Path found - store states but don't show message yet
                setPathFound(true);
                setPathDistance(totalShortestDistance.toFixed(2));
              } else {
                window.alert("Path not Found");
              }
              
              if (totalVisitedNodes.length > 0) {
                const visitedPositions = totalVisitedNodes
                  .map(([parent, child]) => [
                    getPositionFromNodeId(parent, nodesData),
                    getPositionFromNodeId(child, nodesData),
                  ])
                  .filter((pair) => pair[0] !== null && pair[1] !== null);
                setVisitedPositions(visitedPositions);
              }
            } else {
              const nodeIdStart = getNodeIdfromPostion(startPoint, nodesData);
              const nodeIdEnd = getNodeIdfromPostion(endPoint, nodesData);
              let result;

              switch (algorithm) {
                case "Dijkstra":
                  result = findShortestPathWithAnimation(
                    graph,
                    nodeIdStart,
                    nodeIdEnd,
                    1
                  );
                  break;
                case "A*":
                  result = AStarSearch(graph, nodeIdStart, nodeIdEnd, 1);
                  break;
                case "BFS":
                  result = bfs(graph, nodeIdStart, nodeIdEnd);
                  break;
                case "DFS":
                  result = dfs(graph, nodeIdStart, nodeIdEnd);
                  break;
                default:
                  console.error("Unknown algorithm:", algorithm);
                  return;
              }

              const { path, visitedNodes, shortDist, d } = result;
              setNodeVisited(d.toFixed(2));
              setShortestNodes(shortDist.toFixed(2));

              if (path.length > 0) {
                const pathPositions = path
                  .map((nodeId) => getPositionFromNodeId(nodeId, nodesData))
                  .filter((pos) => pos !== null);
                setPathPositions(pathPositions);

                // Path found - store states but don't show message yet
                setPathFound(true); 
                setPathDistance(shortDist.toFixed(2));
              } else {
                window.alert("Path not Found");
              }

              if (visitedNodes.length > 0) {
                const visitedPositions = visitedNodes
                  .map(([parent, child]) => [
                    getPositionFromNodeId(parent, nodesData),
                    getPositionFromNodeId(child, nodesData),
                  ])
                  .filter((pair) => pair[0] !== null && pair[1] !== null);
                setVisitedPositions(visitedPositions);
              }
            }
          } catch (graphError) {
            console.error("Error creating graph:", graphError);
            window.alert("Failed to create route graph. Please try another city.");
            throw graphError;
          }
        } catch (error) {
          console.error("Error in visualization:", error);
          window.STOP_VISUALIZATION = true;
          window.VISUALIZATION_IN_PROGRESS = false;
          setVisualizing(false);
        } finally {
          if (!cancelled && !window.STOP_VISUALIZATION) {
            console.log("Visualization completed normally");
            setIsLoading(false);
            // Don't set visualizing to false here
            // Let the user explicitly stop the visualization
          } else {
            console.log("Visualization was cancelled");
            setIsLoading(false);
            window.VISUALIZATION_IN_PROGRESS = false;
            // Only reset UI state, not the visualizing flag
            setVisitedPositions([]);
            setPathPositions([]);
            setDistanceMarkers([]);
            setVisitedAnimationComplete(false);
          }
        }
      };

      calculatePath();
    } else if (calculationStarted) {
      // Only clean up if we actually started a calculation
      console.log("Visualization stopped");
      window.STOP_VISUALIZATION = true;
      window.VISUALIZATION_IN_PROGRESS = false;
    }
    
    return () => {
      if (calculationStarted) {
        cancelled = true;
        console.log("Cleanup function executed");
      }
    };
  }, [visualizing]);

  // Handle canceled visualization
  useEffect(() => {
    if (!visualizing && isCancelled) {
      console.log("Handling cancellation cleanup");
      setVisitedPositions([]);
      setPathPositions([]);
      setDistanceMarkers([]);
      setVisitedAnimationComplete(false);
      setIsCancelled(false);
    }
  }, [visualizing, isCancelled]);

  // City data loading effect
  useEffect(() => {
    const loadCityData = async () => {
      try {
        setIsLoading(true);
        // Reset visualization state when city changes
        setVisitedPositions([]);
        setPathPositions([]);
        setDistanceMarkers([]);
        setVisitedAnimationComplete(false);
      } catch (error) {
        console.error('Error loading city data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCityData();
  }, [city]);

  // Clear board effect
  useEffect(() => {
    setVisitedPositions([]);
    setPathPositions([]);
    setShortestNodes(0);
    setNodeVisited(0);
  }, [clearBoard]);

  // Waypoints effect
  useEffect(() => {
    waypointRefs.current = waypointRefs.current.slice(0, waypoints.length);
  }, [waypoints]);

  // Initial setup effect
  useEffect(() => {
    // This will run only on the initial component mount
    if (city && cityDefaults[city]) {
      const defaults = cityDefaults[city];
      setMapCenter(defaults.center);
      setStartPoint(defaults.startPoint);
      setEndPoint(defaults.endPoint);
    }
  }, []); // Empty dependency array means this runs once on mount

  // Center map effect
  useEffect(() => {
    console.log("Start/end point changed");
    setMapCenter([(startPoint[0]+endPoint[0])/2, (startPoint[1]+endPoint[1])/2]);
  }, [startPoint, endPoint]);

  function FlyMapTo() {
    const map = useMap();

    useEffect(() => {
      map.flyTo(mapCenter);
    }, [mapCenter]);

    return null;
  }

  const handleMarkerDragEnd = (markerRef, setPoint) => {
    const marker = markerRef.current;
    if (marker != null) {
      const newPosition = marker.getLatLng();
      const nearestNode = findNearestNode(newPosition, nodesData);
      if (nearestNode) {
        setPoint([nearestNode.lat, nearestNode.lon]);
        marker.setLatLng([nearestNode.lat, nearestNode.lon]);
      }
    }
  };

  const startEventHandlers = useMemo(
    () => ({
      dragend() {
        handleMarkerDragEnd(startMarkerRef, setStartPoint);
      },
    }),
    [nodesData]
  );

  const endEventHandlers = useMemo(
    () => ({
      dragend() {
        handleMarkerDragEnd(endMarkerRef, setEndPoint);
      },
    }),
    [nodesData]
  );

  const calculateDistanceMarkers = (positions) => {
    if (!positions || positions.length < 2) return [];
    
    const markers = [];
    let totalDistance = 0;
    const markerInterval = 1; // Show marker every 1 km
    
    for (let i = 1; i < positions.length; i++) {
      const prevPos = positions[i - 1];
      const currentPos = positions[i];
      
      const segmentDistance = haversineDistance(
        prevPos[0], prevPos[1],
        currentPos[0], currentPos[1]
      );
      
      totalDistance += segmentDistance;
      
      if (totalDistance >= markerInterval) {
        markers.push({
          position: currentPos,
          distance: totalDistance
        });
        totalDistance = 0; // Reset for next interval
      }
    }
    
    return markers;
  };

  useEffect(() => {
    if (pathPositions.length > 0) {
      const markers = calculateDistanceMarkers(pathPositions);
      setDistanceMarkers(markers);
    } else {
      setDistanceMarkers([]);
    }
  }, [pathPositions]);

  const createMarkerIcon = (type) => {
    let url, className;
    
    switch (type) {
      case 'start':
        url = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png';
        className = 'marker-icon start-marker';
        break;
      case 'end':
        url = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png';
        className = 'marker-icon end-marker';
        break;
      case 'waypoint':
        url = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png';
        className = 'marker-icon waypoint-marker';
        break;
      default:
        url = markerIconPng;
        className = 'marker-icon';
    }
    
    if (highlightedElement === type) {
      className += ' marker-icon-highlighted';
    }
    
    return new DivIcon({
      html: `<img src="${url}" class="${className}" alt="${type} marker" />`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      className: 'custom-marker-container'
    });
  };

  const handleLegendClick = (itemType) => {
    setHighlightedElement(itemType === highlightedElement ? null : itemType);
    
    if (itemType !== highlightedElement) {
      switch (itemType) {
        case 'start':
          setMapCenter(startPoint);
          break;
        case 'end':
          setMapCenter(endPoint);
          break;
        case 'path':
          if (pathPositions.length > 0) {
            const midIndex = Math.floor(pathPositions.length / 2);
            setMapCenter(pathPositions[midIndex]);
          }
          break;
        case 'visited':
          break;
        default:
          break;
      }
    }
  };

  const legendItems = [
    { color: 'red', label: 'Shortest Path', description: 'Optimal route', type: 'path' },
    { color: 'blue', label: 'Visited Nodes', description: 'Explored areas', type: 'visited' },
    { 
      icon: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png', 
      label: 'Start Point', 
      description: 'Starting location',
      type: 'start' 
    },
    { 
      icon: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png', 
      label: 'End Point', 
      description: 'Destination',
      type: 'end' 
    },
    {
      custom: true,
      label: 'Distance Markers',
      description: 'Shows distance in km',
      type: 'distance'
    }
  ];

  const handleMapDoubleClick = (e) => {
    if (visualizing) return;
    
    const { lat, lng } = e.latlng;
    const nearestNode = findNearestNode({ lat, lng }, nodesData);
    
    if (nearestNode) {
      addWaypoint([nearestNode.lat, nearestNode.lon]);
    }
  };

  const handleWaypointDragEnd = (markerRef, index) => {
    const marker = markerRef.current;
    if (marker != null) {
      const newPosition = marker.getLatLng();
      const nearestNode = findNearestNode(newPosition, nodesData);
      
      if (nearestNode) {
        const newWaypoints = [...waypoints];
        newWaypoints[index] = [nearestNode.lat, nearestNode.lon];
        setWaypoints(newWaypoints);
        marker.setLatLng([nearestNode.lat, nearestNode.lon]);
      }
    }
  };

  const createWaypointEventHandlers = (index) => {
    return useMemo(
      () => ({
        dragend() {
          handleWaypointDragEnd(waypointRefs.current[index], index);
        },
      }),
      [waypointRefs, index, nodesData]
    );
  };

  return (
    <>
      <NavBar legendItems={legendItems} onLegendClick={handleLegendClick} highlightedElement={highlightedElement} />
      <WaypointManager />
      <SimpleControls />
      
      {/* Path Found Notification */}
      {showPathFoundMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-3 rounded-lg shadow-xl z-[2000] animate-bounce">
          <div className="font-bold text-lg">Path Found!</div>
          <div>Distance: {pathDistance} KM</div>
        </div>
      )}
      
      {is3DMode ? (
        <Map3D 
          pathPositions={pathPositions}
          visitedPositions={visitedPositions}
          distanceMarkers={distanceMarkers}
          highlightedElement={highlightedElement}
          pathFound={pathFound}
        />
      ) : (
        <MapContainer
          center={mapCenter}
          zoom={12.5}
          className="w-full h-screen"
          zoomControl={false} // Already false, ensuring zoom control is disabled
          doubleClickZoom={false}
        >
          <FlyMapTo />
          <MapEventHandler onDoubleClick={handleMapDoubleClick} />
          
          <TileLayer
            url={
              darkMode
                ? "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            }
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <ZoomControls darkMode={darkMode} />
          
          <Marker
            draggable={true}
            eventHandlers={startEventHandlers}
            position={startPoint}
            ref={startMarkerRef}
            icon={createMarkerIcon('start')}
          >
            <Popup>
              <p>Latitude: {startPoint[0]}</p>
              <p>Longitude: {startPoint[1]}</p>
            </Popup>
          </Marker>
          
          <Marker
            draggable={true}
            eventHandlers={endEventHandlers}
            position={endPoint}
            ref={endMarkerRef}
            icon={createMarkerIcon('end')}
          >
            <Popup>
              <p>Latitude: {endPoint[0]}</p>
              <p>Longitude: {endPoint[1]}</p>
            </Popup>
          </Marker>
          
          {visitedPositions.length > 0 && (
            <AnimatedPolyline
              positions={visitedPositions}
              color={highlightedElement === 'visited' ? 'rgba(0, 0, 255, 0.9)' : 'rgba(0, 0, 255, 0.5)'}
              weight={highlightedElement === 'visited' ? 3 : 1}
              onAnimationComplete={() => {
                console.log("Visited animation complete!");
                setVisitedAnimationComplete(true);
              }}
            />
          )}
          
          {visitedAnimationComplete && pathPositions.length > 0 && (
            <AnimatedPolyline 
              positions={pathPositions} 
              color={highlightedElement === 'path' ? 'rgba(255, 0, 0, 0.9)' : 'rgba(255, 0, 0, 0.7)'}
              weight={highlightedElement === 'path' ? 5 : 3}
            />
          )}
          
          {distanceMarkers.map((marker, index) => (
            <DistanceMarker
              key={index}
              position={marker.position}
              distance={marker.distance}
            />
          ))}
          
          {waypoints.map((waypoint, index) => (
            <Marker
              key={`waypoint-${index}`}
              draggable={!visualizing}
              eventHandlers={createWaypointEventHandlers(index)}
              position={waypoint}
              ref={(el) => (waypointRefs.current[index] = el)}
              icon={createMarkerIcon('waypoint')}
            >
              <Popup>
                <p>Waypoint {index + 1}</p>
                <p>Latitude: {waypoint[0]}</p>
                <p>Longitude: {waypoint[1]}</p>
              </Popup>
            </Marker>
          ))}
          
          <MiniMap darkMode={darkMode} />
        </MapContainer>
      )}
      
      {isLoading && <LoadingSpinner />}
    </>
  );
};

const MapEventHandler = ({ onDoubleClick }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;
    
    map.on('dblclick', onDoubleClick);
    
    return () => {
      map.off('dblclick', onDoubleClick);
    };
  }, [map, onDoubleClick]);
  
  return null;
};

export default Map;
