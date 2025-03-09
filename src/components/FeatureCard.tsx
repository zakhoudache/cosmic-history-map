import React from "react";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon: Icon }) => {
  return (
    <div className="feature-card animate-on-scroll border border-galaxy-nova/30 shadow-lg shadow-galaxy-core/10">
      <div className="feature-icon border border-galaxy-nova/30 shadow-md shadow-galaxy-core/10">
        <Icon className="h-6 w-6 text-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2 text-galaxy-nova">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
};

export default FeatureCard;
