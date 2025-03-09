
import React from 'react';
import { Brain, Sparkles, HistoryIcon, Network, Compass, BrainCircuit, GitBranch, LineChart, Map, Star } from 'lucide-react';
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

      {/* Knowledge Graph Simulation */}
      <div className="absolute inset-0 z-0 opacity-25">
        <svg width="100%" height="100%" viewBox="0 0 500 400">
          {/* Graph Nodes */}
          {[...Array(15)].map((_, i) => {
            const x = 100 + Math.random() * 300;
            const y = 80 + Math.random() * 240;
            const size = 5 + Math.random() * 10;
            return (
              <g key={i} className="node">
                <circle 
                  cx={x} 
                  cy={y} 
                  r={size} 
                  fill={`hsl(${210 + i * 30 % 180}, 70%, 60%)`} 
                  opacity={0.8}
                  style={{
                    animation: `pulse ${2 + Math.random() * 3}s infinite alternate`
                  }}
                />
                {/* Orbit rings for larger nodes */}
                {size > 10 && (
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={size * 1.8} 
                    fill="none" 
                    stroke={`hsl(${210 + i * 30 % 180}, 70%, 70%)`}
                    strokeWidth="0.5" 
                    strokeDasharray="3,3" 
                    opacity={0.5} 
                  />
                )}
              </g>
            );
          })}
          
          {/* Graph Connections */}
          {[...Array(20)].map((_, i) => {
            const startNode = Math.floor(Math.random() * 15);
            const endNode = Math.floor(Math.random() * 15);
            if (startNode === endNode) return null;
            
            const startX = 100 + Math.random() * 300;
            const startY = 80 + Math.random() * 240;
            const endX = 100 + Math.random() * 300;
            const endY = 80 + Math.random() * 240;
            
            // Create curved paths
            const dx = endX - startX;
            const dy = endY - startY;
            const dr = Math.sqrt(dx * dx + dy * dy) * 1.2;
            
            return (
              <path 
                key={i}
                d={`M${startX},${startY}A${dr},${dr} 0 0,1 ${endX},${endY}`}
                stroke={`hsl(${210 + i * 20 % 180}, 80%, 65%)`}
                strokeWidth={Math.random() * 1.5 + 0.5}
                fill="none"
                opacity={0.4}
                strokeDasharray={i % 3 === 0 ? "5,5" : ""}
              />
            );
          })}
          
          {/* Contextual Field Elements */}
          {[...Array(4)].map((_, i) => {
            const cx = 100 + Math.random() * 300;
            const cy = 80 + Math.random() * 240;
            const rx = 50 + Math.random() * 100;
            const ry = 40 + Math.random() * 80;
            
            return (
              <ellipse 
                key={`field-${i}`}
                cx={cx}
                cy={cy}
                rx={rx}
                ry={ry}
                fill={`hsl(${210 + i * 40 % 180}, 70%, 50%)`}
                opacity={0.05}
                className="contextual-field"
              />
            );
          })}
        </svg>
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
        
        {/* Visualization Architecture Layers */}
        <div className="grid grid-cols-3 gap-x-8 gap-y-6 max-w-md mt-6">
          {[
            { icon: <Brain size={24} />, label: "Entity Layer", description: "Multidimensional nodes with temporal signatures" },
            { icon: <Network size={24} />, label: "Relation Layer", description: "Dynamic connections showing influence patterns" },
            { icon: <Star size={24} />, label: "Contextual Field", description: "Historical atmosphere with emergent patterns" },
            { icon: <GitBranch size={24} />, label: "Dynamic Rendering", description: "Adaptive layouts with temporal gravity" },
            { icon: <Map size={24} />, label: "Spatial Navigation", description: "Multi-dimensional exploration pathways" },
            { icon: <LineChart size={24} />, label: "Temporal Analysis", description: "Chronological evolution visualization" }
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
              <span className="text-xs font-medium text-cosmic-accent mb-1">{item.label}</span>
              <span className="text-xs text-muted-foreground leading-tight">{item.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-muted-foreground opacity-60">
        <span>Enter historical text above to begin your exploration</span>
      </div>
    </div>
  );
};

export default VisualizationPlaceholder;
