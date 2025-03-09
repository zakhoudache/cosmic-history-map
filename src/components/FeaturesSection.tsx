
import React from 'react';
import FeatureCard from './FeatureCard';
import { Separator } from "@/components/ui/separator";
import { RotateCcw, Star, Network, Clock, Search, Map } from 'lucide-react';

interface FeaturesSectionProps {
  className?: string;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ className = "" }) => {
  return (
    <section className={`py-16 ${className}`}>
      <Separator className="mb-16" />
      
      <div className="mb-12 text-center animate-on-scroll">
        <h2 className="text-3xl font-bold mb-4">Features</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Discover the power of ChronoMind's historical data visualization capabilities.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          title="AI-Powered Analysis"
          description="Advanced AI analyzes any historical text to extract entities, events, and relationships."
          icon={RotateCcw}
        />
        
        <FeatureCard
          title="Cosmic Visualization"
          description="Stunning interactive cosmic map where historical elements appear as celestial bodies."
          icon={Star}
        />
        
        <FeatureCard
          title="Knowledge Graph"
          description="Visual network representation of historical connections and influences."
          icon={Network}
        />
        
        <FeatureCard
          title="Timeline View"
          description="Chronological representation that adjusts based on temporal range of identified elements."
          icon={Clock}
        />
        
        <FeatureCard
          title="Semantic Search"
          description="AI-powered search that understands queries beyond exact keyword matching."
          icon={Search}
        />
        
        <FeatureCard
          title="Historical Maps"
          description="Multiple map types generated from historical text analysis."
          icon={Map}
        />
      </div>
    </section>
  );
};

export default FeaturesSection;
