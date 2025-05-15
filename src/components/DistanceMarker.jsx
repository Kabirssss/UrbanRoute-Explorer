import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';

const DistanceMarker = ({ position, distance }) => {
  const customIcon = divIcon({
    className: 'distance-marker',
    html: `<div class="distance-label">${distance.toFixed(2)} km</div>`,
  });

  return (
    <Marker 
      position={position} 
      icon={customIcon}
      zIndexOffset={1000}
    >
      <Popup>
        <div>Distance: {distance.toFixed(2)} km</div>
      </Popup>
    </Marker>
  );
};

export default DistanceMarker; 