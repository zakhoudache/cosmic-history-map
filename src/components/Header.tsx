
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-lg shadow-sm border-b border-galaxy-nova/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center py-4">
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cosmic-light via-cosmic to-cosmic-dark flex items-center justify-center group-hover:shadow-md group-hover:shadow-cosmic/30 transition-all duration-300">
              <div className="h-3 w-3 rounded-full bg-background animate-pulse-subtle"></div>
            </div>
            <span className="text-xl font-medium tracking-tight">
              Chrono<span className="cosmic-text font-semibold">Mind</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors relative py-1 group ${
                isActive('/') 
                  ? 'text-cosmic' 
                  : 'text-foreground/80 hover:text-cosmic'
              }`}
            >
              <span className="relative z-10">Home</span>
              <span className={`absolute bottom-0 left-0 h-0.5 bg-cosmic transition-all duration-300 ${
                isActive('/') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
            <Link 
              to="/visualize" 
              className={`text-sm font-medium transition-colors relative py-1 group ${
                isActive('/visualize') 
                  ? 'text-cosmic' 
                  : 'text-foreground/80 hover:text-cosmic'
              }`}
            >
              <span className="relative z-10 flex items-center">
                Visualize
                {isActive('/visualize') && <Sparkles className="h-3 w-3 ml-1 text-cosmic-light animate-pulse" />}
              </span>
              <span className={`absolute bottom-0 left-0 h-0.5 bg-cosmic transition-all duration-300 ${
                isActive('/visualize') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
            <Link 
              to="/about" 
              className={`text-sm font-medium transition-colors relative py-1 group ${
                isActive('/about') 
                  ? 'text-cosmic' 
                  : 'text-foreground/80 hover:text-cosmic'
              }`}
            >
              <span className="relative z-10">About</span>
              <span className={`absolute bottom-0 left-0 h-0.5 bg-cosmic transition-all duration-300 ${
                isActive('/about') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-cosmic" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 py-3 space-y-3 border-t border-galaxy-nova/10 bg-background/80 backdrop-blur-lg animate-fade-in">
            <Link
              to="/"
              className={`block py-2 text-sm font-medium transition-colors ${
                isActive('/') ? 'text-cosmic' : 'hover:text-cosmic'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/visualize"
              className={`block py-2 text-sm font-medium transition-colors ${
                isActive('/visualize') ? 'text-cosmic' : 'hover:text-cosmic'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Visualize {isActive('/visualize') && <Sparkles className="h-3 w-3 ml-1 inline text-cosmic-light animate-pulse" />}
            </Link>
            <Link
              to="/about"
              className={`block py-2 text-sm font-medium transition-colors ${
                isActive('/about') ? 'text-cosmic' : 'hover:text-cosmic'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
