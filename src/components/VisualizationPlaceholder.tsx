
import React from 'react';
import { Brain, Sparkles, HistoryIcon, Network, Compass, BrainCircuit } from 'lucide-react';
import { useAnimateOnMount } from '@/utils/animations';

interface VisualizationPlaceholderProps {
  title: string;
  description?: string;
}

const VisualizationPlaceholder: React.FC<VisualizationPlaceholderProps> = ({
  title,
  description = "Enter historical text to generate an interactive visualization that reveals connections and patterns across time."
}) => {
  const isVisible = useAnimateOnMount(300);

  return (
    <div className="w-full h-full min-h-[450px] relative overflow-hidden rounded-lg glass">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-cosmic-dark to-cosmic/20 z-0 opacity-80"></div>
      
      {/* Star field background */}
      <div className="absolute inset-0 z-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              opacity: Math.random() * 0.7 + 0.3,
              animation: `pulse ${Math.random() * 3 + 2}s infinite alternate`
            }}
          />
        ))}
      </div>

      {/* Nebula effects */}
      <div 
        className="absolute rounded-full filter blur-3xl z-0 opacity-20 bg-cosmic-accent"
        style={{
          width: '30%',
          height: '30%',
          top: '20%',
          left: '30%',
        }}
      />
      <div 
        className="absolute rounded-full filter blur-3xl z-0 opacity-10 bg-purple-500"
        style={{
          width: '25%',
          height: '25%',
          top: '50%',
          right: '20%',
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center"
           style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.8s ease-out, transform 0.8s ease-out' }}>
        <div className="mb-6 relative">
          <BrainCircuit className="h-16 w-16 text-cosmic-accent" />
          <div className="absolute -inset-2 rounded-full border border-cosmic animate-pulse opacity-30"></div>
        </div>
        <h3 className="text-2xl font-light mb-4 cosmic-text">{title}</h3>
        <p className="text-muted-foreground max-w-md mb-8">{description}</p>
        
        {/* Icon features group */}
        <div className="grid grid-cols-3 gap-6 max-w-md mt-4">
          {[
            { icon: <Network size={24} />, label: "Network Analysis" },
            { icon: <HistoryIcon size={24} />, label: "Temporal Context" },
            { icon: <Sparkles size={24} />, label: "AI-Powered Insights" },
            { icon: <Brain size={24} />, label: "Conceptual Mapping" },
            { icon: <Compass size={24} />, label: "Historical Navigation" },
            { icon: <Sparkles size={24} />, label: "Pattern Detection" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center" 
                 style={{ 
                   opacity: isVisible ? 1 : 0, 
                   transform: isVisible ? 'translateY(0)' : 'translateY(15px)', 
                   transition: `opacity 0.8s ease-out ${i * 0.1 + 0.3}s, transform 0.8s ease-out ${i * 0.1 + 0.3}s` 
                 }}>
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center mb-2 border border-white/10">
                {item.icon}
              </div>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VisualizationPlaceholder;
