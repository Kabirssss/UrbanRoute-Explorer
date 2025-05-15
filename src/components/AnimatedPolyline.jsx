import React, { useEffect, useState, useRef } from "react";
import { Polyline } from "react-leaflet";

const AnimatedPolyline = ({ positions, color, weight = 1, onAnimationComplete }) => {
  const [currentPositions, setCurrentPositions] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (positions.length === 0) return;

    // Reset state when positions change
    setCurrentPositions([]);
    
    let index = 0;
    intervalRef.current = setInterval(() => {
      // Check the global stop flag
      if (window.STOP_VISUALIZATION) {
        clearInterval(intervalRef.current);
        console.log("Animation stopped by global flag");
        return;
      }
      
      setCurrentPositions(positions.slice(0, index + 1));
      index += 1;
      if (index >= positions.length) {
        clearInterval(intervalRef.current);
        if (onAnimationComplete && !window.STOP_VISUALIZATION) {
          onAnimationComplete();
        }
      }
    }, 1); 

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [positions]);

  return <Polyline positions={currentPositions} color={color} weight={weight} />;
};

export default AnimatedPolyline;
