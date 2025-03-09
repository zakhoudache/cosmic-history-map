
import React from "react";
import { RotateCcw, Stars, Network, Clock, Search, Map } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon: Icon }) => {
  return (
    <Card className="bg-background/50 backdrop-blur-sm border border-galaxy-nova/30 hover:border-galaxy-nova/50 transition-all duration-300">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="rounded-full p-2 bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-16">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
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
      </div>
    </section>
  );
};

export default FeaturesSection;
