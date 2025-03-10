import React, { useState, useEffect } from "react";
import Header from "@/components/Header";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  
  // Handle component mount for animations
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate a few shooting stars randomly
  const renderShootingStars = () => {
    return [...Array(3)].map((_, i) => (
      <div
        key={`shooting-${i}`}
        className="shooting-star"
        style={{
          top: `${Math.random() * 50}%`,
          left: `${Math.random() * 70}%`,
          animationDelay: `${5 + Math.random() * 15}s`,
          animationDuration: `${3 + Math.random() * 4}s`,
        }}
      />
    ));
  };

  // Generate cosmic dust particles
  const renderCosmicDust = () => {
    return [...Array(15)].map((_, i) => (
      <div
        key={`dust-${i}`}
        className="cosmic-dust"
        style={{
          width: `${1 + Math.random() * 2}px`,
          height: `${1 + Math.random() * 2}px`,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 10}s`,
          animationDuration: `${15 + Math.random() * 20}s`,
        }}
      />
    ));
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden cosmic-container">
      {/* Cosmic background effects */}
      <div className="constellation"></div>
      
      {/* Aurora effects */}
      <div className="aurora aurora-purple"></div>
      <div className="aurora aurora-blue"></div>
      <div className="aurora aurora-green"></div>
      
      {/* Star field */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className={`star absolute ${
              i % 20 === 0 
                ? 'bright-star twinkle-slow' 
                : i % 10 === 0 
                  ? 'star-large twinkle-slow' 
                  : i % 5 === 0 
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
        
        {/* Add one supernova */}
        <div 
          className="supernova"
          style={{
            top: `${20 + Math.random() * 60}%`,
            left: `${20 + Math.random() * 60}%`,
            animationDuration: '8s',
            animationIterationCount: 'infinite',
          }}
        />
        
        {renderShootingStars()}
        {renderCosmicDust()}
      </div>
      
      <Header />
      
      <main className={`flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 relative z-10 galaxy-card mt-4 transition-all duration-700 cosmic-scroll ${
        mounted 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4'
      }`}>
        {children}
      </main>
      
      <footer className="py-6 px-4 sm:px-6 md:px-8 border-t border-galaxy-nova/20 backdrop-blur-sm relative z-10 mt-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-galaxy-nova to-galaxy-blue-giant mr-2"></div>
            <p className="text-sm text-muted-foreground">
              ChronoMind — Cosmic Historical Visualization
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2 sm:mt-0">
            © {new Date().getFullYear()} ChronoMind
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
