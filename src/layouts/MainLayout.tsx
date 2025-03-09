
import React from "react";
import Header from "@/components/Header";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        {children}
      </main>
      <footer className="py-6 px-4 sm:px-6 md:px-8 border-t">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            ChronoMind — Cosmic Historical Visualization
          </p>
          <p className="text-sm text-muted-foreground mt-2 sm:mt-0">
            © {new Date().getFullYear()} ChronoMind
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
