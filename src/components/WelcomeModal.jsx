import React, { useState, useEffect } from 'react';
import { FaTimes, FaMapMarkedAlt, FaRoute, FaSearch, FaMoon, FaRegCompass, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const WelcomeModal = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showAgain, setShowAgain] = useState(true);
  
  const steps = [
    {
      title: "Welcome to UrbanRoute Explorer!",
      description: "Find and visualize the shortest path between any two points on the map. This tutorial will guide you through the main features.",
      icon: <FaMapMarkedAlt className="text-blue-500" size={48} />,
    },
    {
      title: "Main Navigation Bar",
      description: "The top bar contains all essential controls: algorithm selection, city selector, and action buttons.",
      image: "interface-top-bar.png",
      pointerPosition: { top: '60px', left: '50%' },
    },
    {
      title: "Select Algorithm & City",
      description: "Choose different algorithms like Dijkstra, A*, BFS, or DFS. Select from available cities using the dropdown menu.",
      image: "algorithm-city.png",
      pointerPosition: { top: '60px', left: '30%' },
    },
    {
      title: "Start & End Markers",
      description: "Red marker indicates the start point, green marker indicates the destination. Drag them to change locations.",
      image: "markers.png",
      pointerPosition: { top: '50%', left: '50%' },
    },
    {
      title: "Waypoints Feature",
      description: "Use waypoints to create multi-stop routes. Click the waypoints button on the right side or double-click anywhere on the map to add waypoints.",
      image: "waypoints.png",
      pointerPosition: { top: '120px', right: '80px' },
    },
    {
      title: "Visualize & Clear",
      description: "Click Visualize to calculate and show the shortest path. Use Clear to reset the map.",
      image: "action-buttons.png",
      pointerPosition: { top: '60px', left: '80%' },
    },
    {
      title: "Legend & MiniMap",
      description: "The legend in the bottom-right explains map symbols. The minimap in the bottom-left helps with navigation.",
      image: "legend-minimap.png",
      pointerPosition: { bottom: '100px', left: '20%' },
    },
    {
      title: "Dark Mode",
      description: "Toggle between light and dark themes using the moon/sun icon in the top-right corner.",
      image: "dark-mode.png",
      pointerPosition: { top: '60px', right: '60px' },
    },
    {
      title: "You're All Set!",
      description: "Explore different cities, try various algorithms, and discover optimal routes. Happy exploring!",
      icon: <FaRoute className="text-green-500" size={48} />,
    }
  ];
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      if (!showAgain) {
        localStorage.setItem('hideWelcomeModal', 'true');
      }
      onClose();
    }
  };
  
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSkip = () => {
    if (!showAgain) {
      localStorage.setItem('hideWelcomeModal', 'true');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[2000] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {steps[currentStep].title}
          </h2>
          <button 
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            {steps[currentStep].icon && (
              <div className="mb-4">
                {steps[currentStep].icon}
              </div>
            )}
            
            {steps[currentStep].image && (
              <div className="relative mb-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <img
                  src={`/Images/tutorial/${steps[currentStep].image}`}
                  alt={steps[currentStep].title}
                  className="w-full h-auto max-h-[300px] object-cover"
                />
                
                {steps[currentStep].pointerPosition && (
                  <div 
                    className="absolute animate-pulse"
                    style={steps[currentStep].pointerPosition}
                  >
                    <div className="w-8 h-8 rounded-full bg-red-500 bg-opacity-70 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-red-600 animate-ping"></div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <p className="text-gray-600 dark:text-gray-300 text-center">
              {steps[currentStep].description}
            </p>
          </div>
          
          {/* Steps indicator */}
          <div className="flex justify-center mb-4">
            {steps.map((_, index) => (
              <div 
                key={index} 
                className={`w-2 h-2 mx-1 rounded-full ${
                  index === currentStep 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="show-again"
              checked={showAgain}
              onChange={() => setShowAgain(!showAgain)}
              className="mr-2 rounded"
            />
            <label htmlFor="show-again" className="text-sm text-gray-600 dark:text-gray-400">
              Show at startup
            </label>
          </div>
          
          <div className="flex space-x-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
              >
                <FaChevronLeft className="mr-1" size={12} /> Previous
              </button>
            )}
            
            <button
              onClick={handleNext}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors flex items-center"
            >
              {currentStep < steps.length - 1 ? 'Next' : 'Get Started'} 
              {currentStep < steps.length - 1 && <FaChevronRight className="ml-1" size={12} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;