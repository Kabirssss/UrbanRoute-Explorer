import React, { createContext, useContext, useReducer, useEffect } from "react";

const VisualizerContext = createContext();

// Updated to use a function that dynamically loads the data
const getPositionFromNodeId = (nodeId, nodesData) => {
  if (!nodesData) return null;
  const node = nodesData.find((n) => n.id === nodeId);
  return node ? [node.lat, node.lon] : null;
};

const initialState = {
  algorithm: "Dijkstra",
  city: "Pune", // Default city
  startPoint: [18.5204, 73.8567], // Safe default for Pune
  endPoint: [18.5404, 73.8667], // Safe default for Pune
  visualizing: false,
  clearBoard: false,
  nodeVisited: 0,
  shortestNodes: 0,
  darkMode: false,
  nodesData: [],
  edgesData: [],
  waypoints: [],
  mapCenter: [18.5204, 73.8567], // Default center for Pune
  is3DMode: false
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_ALGORITHM":
      return { ...state, algorithm: action.payload };
    case "SET_CITY":
      return { ...state, city: action.payload };
    case "SET_START_POINT":
      return { ...state, startPoint: action.payload };
    case "SET_END_POINT":
      return { ...state, endPoint: action.payload };
    case "SET_VISUALIZING":
      console.log("⚡ Context: Setting visualizing to:", action.payload);
      
      // When starting visualization
      if (action.payload === true) {
        console.log("Starting visualization...");
        window.VISUALIZATION_IN_PROGRESS = true;
        window.STOP_VISUALIZATION = false;
        return { 
          ...state, 
          visualizing: true
        };
      }
      
      // When stopping visualization
      console.log("Stopping visualization...");
      window.STOP_VISUALIZATION = true;
      window.VISUALIZATION_IN_PROGRESS = false;
      return { 
        ...state, 
        visualizing: false
      };
    case "SET_CLEAR_BOARD":
      return { ...state, clearBoard: action.payload };
    case "SET_NODE_VISITED":
      return { ...state, nodeVisited: action.payload };
    case "SET_SHORTEST_NODES":
      return { ...state, shortestNodes: action.payload };
    case "SET_DARK_MODE":
      return { ...state, darkMode: action.payload };
    case "SET_NODES":
      return { ...state, nodesData: action.payload };
    case "SET_EDGES":
      return { ...state, edgesData: action.payload };
    case "SET_CENTER":
      return { ...state, mapCenter: action.payload };
    case "SET_WAYPOINTS":
      return { ...state, waypoints: action.payload };
    case "ADD_WAYPOINT":
      return { ...state, waypoints: [...state.waypoints, action.payload] };
    case "REMOVE_WAYPOINT":
      return { ...state, waypoints: state.waypoints.filter((_, i) => i !== action.payload) };
    case "REORDER_WAYPOINTS":
      return { ...state, waypoints: action.payload };
    case "SET_3D_MODE":
      return { ...state, is3DMode: action.payload };
    default:
      return state;
  }
};

export const useVisualizerContext = () => useContext(VisualizerContext);

export const VisualizerProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = {
    ...state,
    setAlgorithm: (payload) => dispatch({ type: "SET_ALGORITHM", payload }),
    setCity: (payload) => dispatch({ type: "SET_CITY", payload }),
    setStartPoint: (payload) => dispatch({ type: "SET_START_POINT", payload }),
    setEndPoint: (payload) => dispatch({ type: "SET_END_POINT", payload }),
    setVisualizing: (payload) => dispatch({ type: "SET_VISUALIZING", payload }),
    setClearBoard: (payload) => dispatch({ type: "SET_CLEAR_BOARD", payload }),
    setDarkMode: (payload) => dispatch({ type: "SET_DARK_MODE", payload }),
    setNodes: (payload) => dispatch({ type: "SET_NODES", payload }),
    setEdges: (payload) => dispatch({ type: "SET_EDGES", payload }),
    setNodeVisited: (payload) =>
      dispatch({ type: "SET_NODE_VISITED", payload }),
    setShortestNodes: (payload) =>
      dispatch({ type: "SET_SHORTEST_NODES", payload }),
    setMapCenter: (payload) => dispatch({ type: "SET_CENTER", payload }),
    setWaypoints: (waypoints) => dispatch({ type: "SET_WAYPOINTS", payload: waypoints }),
    addWaypoint: (waypoint) => dispatch({ type: "ADD_WAYPOINT", payload: waypoint }),
    removeWaypoint: (index) => dispatch({ type: "REMOVE_WAYPOINT", payload: index }),
    reorderWaypoints: (newOrder) => dispatch({ type: "REORDER_WAYPOINTS", payload: newOrder }),
    set3DMode: (enabled) => dispatch({ type: "SET_3D_MODE", payload: enabled })
  };

  return (
    <VisualizerContext.Provider value={value}>
      {children}
    </VisualizerContext.Provider>
  );
};
