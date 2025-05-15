import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner-overlay">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading city data...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner; 