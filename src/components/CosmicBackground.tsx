
import React from "react";

const CosmicBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Dark background with reduced opacity */}
      <div className="fixed inset-0 bg-black bg-opacity-70"></div>
      
      {/* Gradient overlay with increased visibility */}
      <div className="fixed inset-0 bg-gradient-to-b from-indigo-900/30 via-purple-900/30 to-gray-900/40"></div>
      
      {/* Animated stars with increased opacity */}
      <div className="fixed inset-0">
        <div className="h-full w-full bg-[url('/stars-bg.png')] opacity-70"></div>
      </div>
      
      {/* Cosmic fog/nebula effect with reduced blur */}
      <div className="fixed inset-0 backdrop-blur-[50px]">
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-purple-500/20 filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-1/3 h-1/3 rounded-full bg-indigo-500/20 filter blur-3xl animate-pulse"></div>
      </div>
    </div>
  );
};

export default CosmicBackground;
