import React from "react";
import FeatureCard from "@/components/FeatureCard";
import { RotateCcw, Stars, Network, Clock, Search, Map } from "lucide-react";

const FeaturesSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <FeatureCard
        title="AI-Powered Analysis"
        description="Advanced AI analyzes any historical text to extract entities, events, and relationships."
        icon={RotateCcw}
      />
      
      <FeatureCard
        title="Cosmic Visualization"
        description="Stunning interactive cosmic map where historical elements appear as celestial bodies."
        icon={Stars}
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
  );
};

export default FeaturesSection;
