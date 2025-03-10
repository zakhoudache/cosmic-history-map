
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
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Cosmic Background */}
      <div className="fixed inset-0 bg-background bg-[radial-gradient(ellipse_at_center,rgba(91,33,182,0.15),rgba(0,0,0,0)_70%)]"></div>
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9nPjwvc3ZnPg==')] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]"></div>
      
      {/* Glowing Orbs for cosmic effect */}
      <div className="fixed top-20 right-20 w-64 h-64 bg-galaxy-nova/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-20 left-20 w-64 h-64 bg-galaxy-blue-giant/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Stars */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className={`absolute ${
              i % 20 === 0 
                ? 'w-1.5 h-1.5 bg-white rounded-full animate-pulse-slow' 
                : i % 10 === 0 
                  ? 'w-1 h-1 bg-white/80 rounded-full animate-twinkle' 
                  : 'w-0.5 h-0.5 bg-white/60 rounded-full'
            }`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
      
      {/* Shooting Stars */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full before:content-[''] before:absolute before:w-20 before:h-0.5 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-white/70 before:blur-sm before:right-0 before:rounded-full animate-shooting-star"
            style={{
              top: `${Math.random() * 50}%`,
              left: `${Math.random() * 70}%`,
              animationDelay: `${5 + Math.random() * 15}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
      
      {/* Aurora Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -inset-x-full -bottom-40 h-80 bg-gradient-to-r from-galaxy-blue-giant/20 via-galaxy-nova/20 to-aurora-purple/20 blur-3xl opacity-30 animate-aurora"></div>
        <div className="absolute -inset-x-full -bottom-40 h-80 translate-x-1/4 bg-gradient-to-r from-aurora-green/20 via-galaxy-nova/20 to-aurora-blue/20 blur-3xl opacity-30 animate-aurora animation-delay-1000"></div>
      </div>
      
      <Header />
      
      <main className={`flex-1 w-full mx-auto px-4 sm:px-6 md:px-8 py-6 relative z-10 transition-all duration-700 ${
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
              HistoryGPT — Cosmic Historical Visualization
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2 sm:mt-0">
            © {new Date().getFullYear()} HistoryGPT
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
