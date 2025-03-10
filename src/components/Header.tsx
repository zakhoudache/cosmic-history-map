
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import AuthButtons from "./AuthButtons";
import { Globe, BarChart2, Info, Youtube } from "lucide-react";

const Header: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-black/40 border-b border-galaxy-nova/20">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link
            to="/"
            className="mr-6 flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <Globe className="h-6 w-6 text-galaxy-nova" />
            <span className="hidden font-bold sm:inline-block bg-gradient-to-r from-galaxy-star to-galaxy-nova bg-clip-text text-transparent">
              HistoryGPT
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/visualize"
              className={cn(
                "transition-colors hover:text-galaxy-nova",
                location.pathname === "/visualize"
                  ? "text-galaxy-nova"
                  : "text-foreground/70"
              )}
            >
              <span className="flex items-center gap-1">
                <BarChart2 className="h-4 w-4" />
                <span>Visualize</span>
              </span>
            </Link>
            <Link
              to="/youtube-analysis"
              className={cn(
                "transition-colors hover:text-galaxy-nova",
                location.pathname === "/youtube-analysis"
                  ? "text-galaxy-nova"
                  : "text-foreground/70"
              )}
            >
              <span className="flex items-center gap-1">
                <Youtube className="h-4 w-4" />
                <span>YouTube Analysis</span>
              </span>
            </Link>
            <Link
              to="/about"
              className={cn(
                "transition-colors hover:text-galaxy-nova",
                location.pathname === "/about"
                  ? "text-galaxy-nova"
                  : "text-foreground/70"
              )}
            >
              <span className="flex items-center gap-1">
                <Info className="h-4 w-4" />
                <span>About</span>
              </span>
            </Link>
          </nav>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <AuthButtons />
        </div>
      </div>
    </header>
  );
};

export default Header;
