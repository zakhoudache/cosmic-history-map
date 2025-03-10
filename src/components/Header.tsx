
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import AuthButtons from "./AuthButtons";
import { Globe, BarChart2, Info, Youtube, MapPin, BookOpen } from "lucide-react";

const Header: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-black/40 border-b border-galaxy-nova/20">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <Link
            to="/"
            className="mr-6 flex items-center space-x-2 hover:opacity-80 transition-opacity relative group"
          >
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-galaxy-nova/20 to-galaxy-blue-giant/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Globe className="h-6 w-6 text-galaxy-nova animate-pulse-subtle" />
            <span className="hidden font-bold sm:inline-block bg-gradient-to-r from-galaxy-star to-galaxy-nova bg-clip-text text-transparent">
              HistoryGPT
            </span>
            <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-galaxy-nova/0 via-galaxy-nova/50 to-galaxy-nova/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/visualize"
              className={cn(
                "transition-colors hover:text-galaxy-nova relative group py-1",
                location.pathname === "/visualize"
                  ? "text-galaxy-nova"
                  : "text-foreground/70"
              )}
            >
              <span className="flex items-center gap-1.5">
                <BarChart2 className="h-4 w-4" />
                <span>Visualize</span>
              </span>
              <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-galaxy-nova/0 via-galaxy-nova/50 to-galaxy-nova/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              {location.pathname === "/visualize" && (
                <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-galaxy-nova/0 via-galaxy-nova/50 to-galaxy-nova/0"></div>
              )}
            </Link>
            <Link
              to="/maps"
              className={cn(
                "transition-colors hover:text-galaxy-nova relative group py-1",
                location.pathname === "/maps"
                  ? "text-galaxy-nova"
                  : "text-foreground/70"
              )}
            >
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>Maps</span>
              </span>
              <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-galaxy-nova/0 via-galaxy-nova/50 to-galaxy-nova/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              {location.pathname === "/maps" && (
                <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-galaxy-nova/0 via-galaxy-nova/50 to-galaxy-nova/0"></div>
              )}
            </Link>
            <Link
              to="/storytelling"
              className={cn(
                "transition-colors hover:text-galaxy-nova relative group py-1",
                location.pathname === "/storytelling"
                  ? "text-galaxy-nova"
                  : "text-foreground/70"
              )}
            >
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                <span>Storytelling</span>
              </span>
              <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-galaxy-nova/0 via-galaxy-nova/50 to-galaxy-nova/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              {location.pathname === "/storytelling" && (
                <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-galaxy-nova/0 via-galaxy-nova/50 to-galaxy-nova/0"></div>
              )}
            </Link>
            <Link
              to="/youtube-analysis"
              className={cn(
                "transition-colors hover:text-galaxy-nova relative group py-1",
                location.pathname === "/youtube-analysis"
                  ? "text-galaxy-nova"
                  : "text-foreground/70"
              )}
            >
              <span className="flex items-center gap-1.5">
                <Youtube className="h-4 w-4" />
                <span>YouTube Analysis</span>
              </span>
              <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-galaxy-nova/0 via-galaxy-nova/50 to-galaxy-nova/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              {location.pathname === "/youtube-analysis" && (
                <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-galaxy-nova/0 via-galaxy-nova/50 to-galaxy-nova/0"></div>
              )}
            </Link>
            <Link
              to="/about"
              className={cn(
                "transition-colors hover:text-galaxy-nova relative group py-1",
                location.pathname === "/about"
                  ? "text-galaxy-nova"
                  : "text-foreground/70"
              )}
            >
              <span className="flex items-center gap-1.5">
                <Info className="h-4 w-4" />
                <span>About</span>
              </span>
              <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-galaxy-nova/0 via-galaxy-nova/50 to-galaxy-nova/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              {location.pathname === "/about" && (
                <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-galaxy-nova/0 via-galaxy-nova/50 to-galaxy-nova/0"></div>
              )}
            </Link>
          </nav>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-galaxy-nova/30 to-galaxy-blue-giant/30 blur-md opacity-70"></div>
            <AuthButtons />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
