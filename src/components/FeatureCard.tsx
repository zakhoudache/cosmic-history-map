
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  icon: Icon,
  iconColor = "white" 
}) => {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">
        {description}
      </p>
    </div>
  );
};

export default FeatureCard;
