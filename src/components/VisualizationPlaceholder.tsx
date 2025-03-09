
import React, { useEffect, useState } from 'react';
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
  const [stars, setStars] = useState<{ x: number, y: number, size: string, delay: number }[]>([]);
  
  useEffect(() => {
    // Generate random stars for the background
    const starCount = 150;
    const newStars = Array.from({ length: starCount }).map(() => {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const sizeOptions = ['star-tiny', 'star-small', 'star-medium', 'star-large'];
      const sizeIndex = Math.floor(Math.random() * sizeOptions.length);
      const animationOptions = ['twinkle-slow', 'twinkle-medium', 'twinkle-fast'];
      const animIndex = Math.floor(Math.random() * animationOptions.length);
      
      return {
        x,
        y,
        size: `${sizeOptions[sizeIndex]} ${animationOptions[animIndex]}`,
        delay: Math.random() * 5
      };
    });
    
    setStars(newStars);
  }, []);
  
  return (
    <div 
      className="relative w-full h-full min-h-[300px] flex flex-col items-center justify-center overflow-hidden glass rounded-lg"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.8s ease-in-out'
      }}
    >
      {/* Star field background */}
      <div className="absolute inset-0 w-full h-full star-field" aria-hidden="true">
        {stars.map((star, i) => (
          <div
            key={`star-${i}`}
            className={`star ${star.size}`}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              animationDelay: `${star.delay}s`
            }}
          />
        ))}
      </div>

      {/* Galactic nebula background */}
      <div className="absolute inset-0 w-full h-full galaxy-gradient opacity-60" aria-hidden="true" />
      
      {/* Simulated background visualization */}
      <div className="absolute inset-0 w-full h-full" aria-hidden="true">
        <svg width="100%" height="100%" viewBox="0 0 800 600" className="opacity-20">
          <defs>
            <radialGradient id="bg-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--galaxy-core))" />
              <stop offset="100%" stopColor="hsl(var(--cosmic-dark))" />
            </radialGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

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
                      fill={`hsla(${(i * 30) % 360}, 70%, 60%, 0.7)`} 
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
                    stroke={`hsla(${(i * 20) % 360}, 70%, 60%, 0.5)`}
                    strokeWidth={Math.random() * 2 + 0.8}
                    fill="none"
                  />
                );
              })}
            </>
          )}

          {/* Simulated cosmic visualization */}
          {type === 'cosmic' && (
            <>
              {/* Celestial bodies */}
              {[...Array(7)].map((_, i) => {
                const x = 100 + Math.random() * 600;
                const y = 100 + Math.random() * 400;
                const size = 15 + Math.random() * 25;
                return (
                  <g key={`c-${i}`}>
                    <circle 
                      cx={x}
                      cy={y}
                      r={size}
                      fill={`hsla(${(i * 60) % 360}, 80%, 60%, 0.6)`}
                      filter="url(#glow)"
                    />
                    <circle 
                      cx={x}
                      cy={y}
                      r={size + 15}
                      fill="none"
                      stroke={`hsla(${(i * 60) % 360}, 80%, 60%, 0.3)`}
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      className="animate-spin-slow"
                      style={{ animationDuration: `${20 + i * 5}s` }}
                    />
                  </g>
                );
              })}

              {/* Connection lines between celestial bodies */}
              {[...Array(10)].map((_, i) => {
                const x1 = 100 + Math.random() * 600;
                const y1 = 100 + Math.random() * 400;
                const x2 = 100 + Math.random() * 600;
                const y2 = 100 + Math.random() * 400;
                
                // Create a curved path
                const midX = (x1 + x2) / 2 + (Math.random() * 80 - 40);
                const midY = (y1 + y2) / 2 + (Math.random() * 80 - 40);
                
                return (
                  <g key={`conn-${i}`}>
                    <path
                      d={`M${x1},${y1} Q${midX},${midY} ${x2},${y2}`}
                      stroke={`hsla(${(i * 40 + 200) % 360}, 80%, 65%, 0.4)`}
                      strokeWidth="1.5"
                      fill="none"
                      strokeDasharray="8,4"
                    />
                    {/* Add animated particles along the path */}
                    {[...Array(3)].map((_, j) => (
                      <circle
                        key={`p-${i}-${j}`}
                        r="2"
                        fill={`hsla(${(i * 40 + 200) % 360}, 80%, 75%, 0.8)`}
                        filter="url(#glow)"
                        className="animate-pulse-subtle"
                        style={{
                          offsetPath: `path('M${x1},${y1} Q${midX},${midY} ${x2},${y2}')`,
                          offsetDistance: `${j * 33}%`,
                          animation: `flowParticle ${4 + Math.random() * 3}s infinite linear ${j * 1.5}s`
                        }}
                      />
                    ))}
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
                stroke="rgba(255, 255, 255, 0.4)" 
                strokeWidth="2"
                strokeDasharray="2,2"
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
                    rx="6"
                    fill={`hsla(${(i * 60 + 200) % 360}, 70%, 50%, 0.1)`}
                    stroke={`hsla(${(i * 60 + 200) % 360}, 70%, 50%, 0.25)`}
                    strokeWidth="1.5"
                  />
                );
              })}
              
              {/* Events */}
              {[...Array(12)].map((_, i) => {
                const x = 80 + i * 60;
                const y = Math.random() > 0.5 ? 260 : 340;
                const direction = y === 260 ? -1 : 1;
                
                return (
                  <g key={`e-${i}`} className="animate-pulse-subtle" style={{ animationDelay: `${i * 0.2}s` }}>
                    <circle 
                      cx={x}
                      cy={300}
                      r="5"
                      fill={`hsla(${(i * 30) % 360}, 70%, 60%, 0.8)`}
                      filter="url(#glow)"
                    />
                    <line 
                      x1={x} 
                      y1={300} 
                      x2={x} 
                      y2={y} 
                      stroke="rgba(255, 255, 255, 0.3)"
                      strokeDasharray="4,4"
                    />
                    <circle 
                      cx={x}
                      cy={y}
                      r="4"
                      fill={`hsla(${(i * 30) % 360}, 70%, 60%, 0.7)`}
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
        <div className="h-20 w-20 rounded-full cosmic-gradient flex items-center justify-center mb-4 shadow-lg shadow-cosmic/30">
          {type === 'knowledge-graph' && <Network className="h-10 w-10 text-white" />}
          {type === 'cosmic' && <Sparkles className="h-10 w-10 text-white" />}
          {type === 'timeline' && <History className="h-10 w-10 text-white" />}
        </div>
        
        <h3 className="text-xl font-medium mb-2 text-primary">ChronoMind Visualization</h3>
        <p className="text-muted-foreground mb-6">{message}</p>

        {/* Floating decorative elements */}
        <div className="absolute -top-10 -left-10 text-primary/30 animate-float-slow">
          <CircleDashed className="h-16 w-16" />
        </div>
        <div className="absolute -bottom-6 -right-6 text-primary/30 animate-float-slow" style={{ animationDelay: '1s' }}>
          <GitBranch className="h-12 w-12" />
        </div>
        <div className="absolute top-20 right-10 text-primary/30 animate-pulse-subtle">
          <Star className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
};

export default VisualizationPlaceholder;
