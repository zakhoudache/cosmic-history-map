
import React from "react";
import { Link, useLocation } from "react-router-dom";
import AuthButtons from "./AuthButtons";

const Header = () => {
  const location = useLocation();

  // Determine if we're on the homepage
  const isHomePage = location.pathname === "/";
  
  // Apply different styles based on route
  const headerClass = isHomePage 
    ? "absolute top-0 left-0 right-0 z-50" 
    : "bg-background/80 backdrop-blur-md border-b border-galaxy-nova/10";

  return (
    <header className={`py-4 ${headerClass}`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link 
          to="/" 
          className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-galaxy-spiral to-galaxy-nova"
        >
          ChronicleNexus
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link 
            to="/" 
            className={`text-sm hover:text-galaxy-nova transition-colors ${location.pathname === "/" ? "text-galaxy-nova" : "text-foreground/80"}`}
          >
            Home
          </Link>
          <Link 
            to="/visualize" 
            className={`text-sm hover:text-galaxy-nova transition-colors ${location.pathname === "/visualize" ? "text-galaxy-nova" : "text-foreground/80"}`}
          >
            Visualize
          </Link>
          <Link 
            to="/about" 
            className={`text-sm hover:text-galaxy-nova transition-colors ${location.pathname === "/about" ? "text-galaxy-nova" : "text-foreground/80"}`}
          >
            About
          </Link>
          <AuthButtons />
        </nav>
      </div>
    </header>
  );
};

export default Header;
