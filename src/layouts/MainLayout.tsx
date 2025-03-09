
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

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Cosmic background effects */}
      <div className="absolute inset-0 bg-galaxy-gradient opacity-20 animate-galaxy-spin pointer-events-none"></div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className={`star absolute ${i % 4 === 0 ? 'star-large twinkle-slow' : i % 3 === 0 ? 'star-medium twinkle-medium' : 'star-small twinkle-fast'}`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
      
      <Header />
      
      <main className={`flex-1 w-full relative z-10 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        {children}
      </main>
      
      <footer className="py-6 px-4 sm:px-6 md:px-8 border-t border-galaxy-nova/20 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            ChronoLoom — Cosmic Historical Visualization
          </p>
          <p className="text-sm text-muted-foreground mt-2 sm:mt-0">
            © {new Date().getFullYear()} ChronoLoom
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
