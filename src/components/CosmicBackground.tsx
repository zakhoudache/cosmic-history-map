import React from "react";

interface CosmicBackgroundProps {
  density?: number;
  opacity?: number;
}

const CosmicBackground: React.FC<CosmicBackgroundProps> = ({ 
  density = 50,
  opacity = 20
}) => {
  return (
    <>
      {/* Galaxy gradient background */}
      <div className={`absolute inset-0 bg-galaxy-gradient opacity-${opacity/10} animate-galaxy-spin pointer-events-none`}></div>
      
      {/* Star field */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(density)].map((_, i) => (
          <div
            key={i}
            className={`star absolute ${
              i % 4 === 0 
                ? 'star-large twinkle-slow' 
                : i % 3 === 0 
                  ? 'star-medium twinkle-medium' 
                  : 'star-small twinkle-fast'
            }`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default CosmicBackground;
