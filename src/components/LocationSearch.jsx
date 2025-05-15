import React, { useState, useRef, useEffect } from 'react';
import { useVisualizerContext } from '../context/VisualizerContext';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { findNearestNode } from './Helper';

const LocationSearch = () => {
  const {
    nodesData,
    setStartPoint,
    setEndPoint,
    setMapCenter,
    darkMode
  } = useVisualizerContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);

  // Simulate search functionality with nodes data
  const handleSearch = () => {
    if (!searchTerm.trim() || !nodesData) return;
    
    setIsSearching(true);
    
    // In a real app, you'd connect to a geocoding API
    // For this example, we'll just filter nodes with coordinates similar to the query
    // or that might represent street names, etc.
    try {
      // Convert search term to lowercase for case-insensitive comparison
      const term = searchTerm.toLowerCase();
      
      // Create a set to avoid duplicates in search results
      const uniqueResults = new Set();
      const results = [];
      
      // Sample node properties to search through
      nodesData.forEach((node, index) => {
        // In a real app, each node would have more properties like street names
        // Here we just use the node ID and coordinates for demonstration
        const nodeString = `node ${index}: ${node.lat}, ${node.lon}`;
        
        if (nodeString.toLowerCase().includes(term) && !uniqueResults.has(nodeString)) {
          uniqueResults.add(nodeString);
          results.push({
            id: index,
            name: `Location at ${node.lat.toFixed(4)}, ${node.lon.toFixed(4)}`,
            lat: node.lat,
            lon: node.lon
          });
        }
        
        // Limit results to prevent overwhelming the UI
        if (results.length >= 5) return;
      });
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error during search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result, destination) => {
    // Find the nearest node to the clicked result
    const nearestNode = findNearestNode({ lat: result.lat, lng: result.lon }, nodesData);
    
    if (nearestNode) {
      const position = [nearestNode.lat, nearestNode.lon];
      
      if (destination === 'start') {
        setStartPoint(position);
      } else if (destination === 'end') {
        setEndPoint(position);
      }
      
      // Center map on the selected location
      setMapCenter(position);
      
      // Clear search results
      setSearchResults([]);
      setSearchTerm('');
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target)) {
        setSearchResults([]);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <div
      className={`search-container ${darkMode ? 'dark' : ''}`}
      ref={searchInputRef}
    >
      <div className="search-input-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search for locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        {searchTerm ? (
          <button
            className="search-clear-btn"
            onClick={() => {
              setSearchTerm('');
              setSearchResults([]);
            }}
          >
            <FaTimes />
          </button>
        ) : null}
        <button
          className="search-btn"
          onClick={handleSearch}
          disabled={isSearching}
        >
          <FaSearch />
        </button>
      </div>
      
      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((result) => (
            <div key={result.id} className="search-result-item">
              <div className="search-result-content">
                <span className="search-result-name">{result.name}</span>
                <span className="search-result-coords">
                  {result.lat.toFixed(4)}, {result.lon.toFixed(4)}
                </span>
              </div>
              <div className="search-result-actions">
                <button
                  className="search-action-btn start"
                  onClick={() => handleResultClick(result, 'start')}
                >
                  Set Start
                </button>
                <button
                  className="search-action-btn end"
                  onClick={() => handleResultClick(result, 'end')}
                >
                  Set End
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch; 