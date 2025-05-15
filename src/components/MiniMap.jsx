import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Rectangle, useMap } from 'react-leaflet';

const ZOOM_DIFFERENCE = 4;

const MinimapBounds = ({ parentMap, zoom }) => {
  const minimap = useMap();
  const [bounds, setBounds] = useState(parentMap.getBounds());

  // Keep minimap in sync with main map
  useEffect(() => {
    const onMove = () => {
      setBounds(parentMap.getBounds());
      minimap.setView(parentMap.getCenter(), parentMap.getZoom() - ZOOM_DIFFERENCE);
    };

    parentMap.on('move', onMove);
    parentMap.on('zoom', onMove);

    return () => {
      parentMap.off('move', onMove);
      parentMap.off('zoom', onMove);
    };
  }, [parentMap, minimap]);

  return (
    <Rectangle
      bounds={bounds}
      pathOptions={{
        color: '#ff7800',
        weight: 1,
        fillColor: '#ff7800',
        fillOpacity: 0.1,
      }}
    />
  );
};

const MiniMap = ({ darkMode }) => {
  const parentMap = useMap();
  const [center, setCenter] = useState(parentMap.getCenter());
  const [zoom, setZoom] = useState(parentMap.getZoom() - ZOOM_DIFFERENCE);

  useEffect(() => {
    const onMove = () => {
      setCenter(parentMap.getCenter());
      setZoom(parentMap.getZoom() - ZOOM_DIFFERENCE);
    };

    parentMap.on('move', onMove);
    parentMap.on('zoom', onMove);

    return () => {
      parentMap.off('move', onMove);
      parentMap.off('zoom', onMove);
    };
  }, [parentMap]);

  const minimapStyle = {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    zIndex: 1000,
    width: '200px',
    height: '200px',
    border: '2px solid rgba(0, 0, 0, 0.2)',
    borderRadius: '4px',
    overflow: 'hidden',
  };

  return (
    <div style={minimapStyle}>
      <MapContainer
        center={center}
        zoom={zoom}
        dragging={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        attributionControl={false}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url={
            darkMode
              ? "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
        />
        <MinimapBounds parentMap={parentMap} zoom={zoom} />
      </MapContainer>
    </div>
  );
};

export default MiniMap; 