
import React from 'react';
import { Star, GitBranch, Network, CircleDashed, History, Sparkles } from 'lucide-react';
import { useAnimateOnMount } from '@/utils/animations';

interface VisualizationPlaceholderProps {
  type?: 'knowledge-graph' | 'cosmic' | 'timeline';
  message?: string;
}

const VisualizationPlaceholder: React.FC<VisualizationPlaceholderProps> = ({ 
  type = 'knowledge-graph',
  message = 'No visualization data available yet'
}) => {
  const isVisible = useAnimateOnMount(300);
  
  return (
    <div 
      className="relative w-full h-full min-h-[300px] flex flex-col items-center justify-center overflow-hidden glass rounded-lg"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.8s ease-in-out'
      }}
    >
      {/* Simulated background visualization */}
      <div className="absolute inset-0 w-full h-full" aria-hidden="true">
        <svg width="100%" height="100%" viewBox="0 0 800 600" className="opacity-10">
          <defs>
            <radialGradient id="bg-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(260, 60%, 30%)" />
              <stop offset="100%" stopColor="hsl(240, 50%, 10%)" />
            </radialGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background */}
          <rect width="100%" height="100%" fill="url(#bg-gradient)" />

          {/* Simulated nodes and connections for knowledge graph */}
          {type === 'knowledge-graph' && (
            <>
              {/* Nodes */}
              {[...Array(15)].map((_, i) => {
                const x = 100 + Math.random() * 600;
                const y = 100 + Math.random() * 400;
                const size = 5 + Math.random() * 15;
                return (
                  <g key={i} className="animate-pulse-subtle" style={{ animationDelay: `${i * 0.2}s` }}>
                    <circle 
                      cx={x} 
                      cy={y} 
                      r={size} 
                      fill={`hsla(${(i * 30) % 360}, 70%, 60%, 0.5)`} 
                      filter="url(#glow)"
                    />
                  </g>
                );
              })}
              
              {/* Connections */}
              {[...Array(20)].map((_, i) => {
                const fromIndex = Math.floor(Math.random() * 15);
                const toIndex = Math.floor(Math.random() * 15);
                const fromX = 100 + Math.random() * 600;
                const fromY = 100 + Math.random() * 400;
                const toX = 100 + Math.random() * 600;
                const toY = 100 + Math.random() * 400;
                
                return (
                  <path 
                    key={`p-${i}`}
                    d={`M${fromX},${fromY} Q${(fromX + toX) / 2 + (Math.random() * 100 - 50)},${(fromY + toY) / 2 + (Math.random() * 100 - 50)} ${toX},${toY}`}
                    stroke={`hsla(${(i * 20) % 360}, 70%, 60%, 0.2)`}
                    strokeWidth={Math.random() * 2 + 0.5}
                    fill="none"
                  />
                );
              })}
            </>
          )}

          {/* Simulated cosmic visualization */}
          {type === 'cosmic' && (
            <>
              {/* Stars */}
              {[...Array(100)].map((_, i) => {
                const x = Math.random() * 800;
                const y = Math.random() * 600;
                const size = Math.random() * 1.5;
                return (
                  <circle 
                    key={i} 
                    cx={x} 
                    cy={y} 
                    r={size} 
                    fill="white" 
                    opacity={Math.random() * 0.8 + 0.2}
                    className={Math.random() > 0.7 ? "animate-pulse-subtle" : ""}
                  />
                );
              })}

              {/* Nebula clouds */}
              {[...Array(5)].map((_, i) => {
                const x = 100 + Math.random() * 600;
                const y = 100 + Math.random() * 400;
                const size = 50 + Math.random() * 100;
                return (
                  <circle 
                    key={`n-${i}`}
                    cx={x}
                    cy={y}
                    r={size}
                    fill={`hsla(${(i * 40 + 200) % 360}, 70%, 50%, 0.05)`}
                    filter="url(#glow)"
                    className="animate-pulse-subtle"
                    style={{ animationDelay: `${i * 0.5}s` }}
                  />
                );
              })}

              {/* Celestial bodies */}
              {[...Array(7)].map((_, i) => {
                const x = 100 + Math.random() * 600;
                const y = 100 + Math.random() * 400;
                const size = 10 + Math.random() * 20;
                return (
                  <g key={`c-${i}`}>
                    <circle 
                      cx={x}
                      cy={y}
                      r={size}
                      fill={`hsla(${(i * 60) % 360}, 80%, 60%, 0.3)`}
                    />
                    <circle 
                      cx={x}
                      cy={y}
                      r={size + 10}
                      fill="none"
                      stroke={`hsla(${(i * 60) % 360}, 80%, 60%, 0.1)`}
                      strokeWidth="1"
                      strokeDasharray="3,3"
                      className="animate-spin-slow"
                      style={{ animationDuration: `${20 + i * 5}s` }}
                    />
                  </g>
                );
              })}
            </>
          )}

          {/* Simulated timeline */}
          {type === 'timeline' && (
            <>
              {/* Timeline base */}
              <line 
                x1="50" 
                y1="300" 
                x2="750" 
                y2="300" 
                stroke="rgba(255, 255, 255, 0.3)" 
                strokeWidth="2"
              />
              
              {/* Time periods */}
              {[...Array(3)].map((_, i) => {
                const startX = 100 + i * 200;
                const width = 150;
                return (
                  <rect 
                    key={`p-${i}`}
                    x={startX}
                    y="270"
                    width={width}
                    height="60"
                    rx="4"
                    fill={`hsla(${(i * 60 + 200) % 360}, 70%, 50%, 0.05)`}
                    stroke={`hsla(${(i * 60 + 200) % 360}, 70%, 50%, 0.2)`}
                    strokeWidth="1"
                  />
                );
              })}
              
              {/* Events */}
              {[...Array(10)].map((_, i) => {
                const x = 80 + i * 70;
                const y = Math.random() > 0.5 ? 270 : 330;
                const direction = y === 270 ? -1 : 1;
                
                return (
                  <g key={`e-${i}`}>
                    <circle 
                      cx={x}
                      cy={300}
                      r="5"
                      fill={`hsla(${(i * 30) % 360}, 70%, 60%, 0.8)`}
                    />
                    <line 
                      x1={x} 
                      y1={300} 
                      x2={x} 
                      y2={y} 
                      stroke="rgba(255, 255, 255, 0.2)"
                      strokeDasharray="2,2"
                    />
                    <circle 
                      cx={x}
                      cy={y}
                      r="3"
                      fill={`hsla(${(i * 30) % 360}, 70%, 60%, 0.6)`}
                    />
                  </g>
                );
              })}
            </>
          )}
        </svg>
      </div>

      {/* Overlay content */}
      <div className="relative flex flex-col items-center justify-center text-center p-8 max-w-md z-10">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          {type === 'knowledge-graph' && <Network className="h-10 w-10 text-primary" />}
          {type === 'cosmic' && <Sparkles className="h-10 w-10 text-primary" />}
          {type === 'timeline' && <History className="h-10 w-10 text-primary" />}
        </div>
        
        <h3 className="text-xl font-medium mb-2">ChronoMind Visualization</h3>
        <p className="text-muted-foreground mb-6">{message}</p>

        {/* Floating decorative elements */}
        <div className="absolute -top-10 -left-10 text-primary/20 animate-float-slow">
          <CircleDashed className="h-16 w-16" />
        </div>
        <div className="absolute -bottom-6 -right-6 text-primary/20 animate-float-slow" style={{ animationDelay: '1s' }}>
          <GitBranch className="h-12 w-12" />
        </div>
        <div className="absolute top-20 right-10 text-primary/20 animate-pulse-subtle">
          <Star className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
};

export default VisualizationPlaceholder;
