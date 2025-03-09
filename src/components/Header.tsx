
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Network, 
  Info, 
  Home, 
  Youtube 
} from "lucide-react";
import AuthButtons from "./AuthButtons";
import { useAuth } from "@/hooks/useAuth";
import { useMobile } from "@/hooks/use-mobile";

const Header: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useMobile();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border supports-backdrop-blur:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">ChronoLoom</span>
          </Link>
          
          <nav className="hidden md:flex gap-6 items-center">
            <Link to="/" className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}>
              <span className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                Home
              </span>
            </Link>
            <Link to="/visualize" className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/visualize') ? 'text-primary' : 'text-muted-foreground'}`}>
              <span className="flex items-center gap-1">
                <Network className="h-4 w-4" />
                Visualize
              </span>
            </Link>
            <Link to="/youtube" className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/youtube') ? 'text-primary' : 'text-muted-foreground'}`}>
              <span className="flex items-center gap-1">
                <Youtube className="h-4 w-4" />
                YouTube Analysis
              </span>
            </Link>
            <Link to="/about" className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/about') ? 'text-primary' : 'text-muted-foreground'}`}>
              <span className="flex items-center gap-1">
                <Info className="h-4 w-4" />
                About
              </span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <AuthButtons />
        </div>
      </div>
      
      {/* Mobile navigation */}
      {isMobile && (
        <div className="container pb-1">
          <nav className="flex gap-1 items-center justify-between">
            <Link to="/" className="flex-1">
              <Button 
                variant={isActive('/') ? "default" : "ghost"} 
                size="sm" 
                className="w-full py-1"
              >
                <Home className="h-4 w-4 mr-1" />
                Home
              </Button>
            </Link>
            <Link to="/visualize" className="flex-1">
              <Button 
                variant={isActive('/visualize') ? "default" : "ghost"} 
                size="sm" 
                className="w-full py-1"
              >
                <Network className="h-4 w-4 mr-1" />
                Visualize
              </Button>
            </Link>
            <Link to="/youtube" className="flex-1">
              <Button 
                variant={isActive('/youtube') ? "default" : "ghost"} 
                size="sm" 
                className="w-full py-1"
              >
                <Youtube className="h-4 w-4 mr-1" />
                YouTube
              </Button>
            </Link>
            <Link to="/about" className="flex-1">
              <Button 
                variant={isActive('/about') ? "default" : "ghost"} 
                size="sm" 
                className="w-full py-1"
              >
                <Info className="h-4 w-4 mr-1" />
                About
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
