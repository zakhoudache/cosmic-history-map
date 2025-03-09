
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-lg shadow-sm"
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
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cosmic-light via-cosmic to-cosmic-dark flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-background animate-pulse-subtle"></div>
            </div>
            <span className="text-xl font-medium tracking-tight">
              Chrono<span className="cosmic-text font-semibold">Mind</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-sm font-medium hover:text-cosmic transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-cosmic after:transition-all hover:after:w-full"
            >
              Home
            </Link>
            <Link 
              to="/visualize" 
              className="text-sm font-medium hover:text-cosmic transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-cosmic after:transition-all hover:after:w-full"
            >
              Visualize
            </Link>
            <Link 
              to="/about" 
              className="text-sm font-medium hover:text-cosmic transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-cosmic after:transition-all hover:after:w-full"
            >
              About
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
          <div className="px-4 py-3 space-y-3 border-t animate-fade-in">
            <Link
              to="/"
              className="block py-2 text-sm font-medium hover:text-cosmic transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/visualize"
              className="block py-2 text-sm font-medium hover:text-cosmic transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Visualize
            </Link>
            <Link
              to="/about"
              className="block py-2 text-sm font-medium hover:text-cosmic transition-colors"
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
