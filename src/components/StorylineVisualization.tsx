
import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TimelineNode {
  id: string;
  name: string;
  period: string;
  description: string;
  imageUrl?: string;
  column: 'left' | 'center' | 'right';
  connections: string[];
}

interface StorylineVisualizationProps {
  nodes: TimelineNode[];
  title: string;
  subtitle?: string;
}

const StorylineVisualization: React.FC<StorylineVisualizationProps> = ({
  nodes,
  title,
  subtitle
}) => {
  return (
    <div className="w-full min-h-[800px] bg-gradient-to-br from-galaxy-core/20 to-galaxy-nova/5 rounded-lg p-6 relative">
      {/* Header */}
      <div className="text-center mb-10 bg-gradient-to-r from-galaxy-nova/20 to-galaxy-star/20 rounded-lg p-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-galaxy-star via-galaxy-nova to-galaxy-blue-giant bg-clip-text text-transparent">
          {title}
        </h2>
        {subtitle && (
          <p className="text-foreground/70 mt-2">{subtitle}</p>
        )}
      </div>

      {/* Main columns layout */}
      <div className="grid grid-cols-3 gap-6 relative">
        {/* Connector lines layer */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full">
            {nodes.map(node => 
              node.connections.map(targetId => {
                const target = nodes.find(n => n.id === targetId);
                if (!target) return null;
                
                return (
                  <motion.path
                    key={`${node.id}-${targetId}`}
                    d={`M ${node.column === 'left' ? 0 : node.column === 'center' ? 50 : 100}% 
                       ${node.id.charCodeAt(0) * 10} 
                       Q ${(node.column === 'left' ? 25 : node.column === 'center' ? 75 : 100)}% 
                       ${(node.id.charCodeAt(0) + target.id.charCodeAt(0)) * 5}
                       ${target.column === 'left' ? 0 : target.column === 'center' ? 50 : 100}% 
                       ${target.id.charCodeAt(0) * 10}`}
                    stroke="url(#lineGradient)"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                );
              })
            )}
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgb(var(--galaxy-nova))" stopOpacity="0.3" />
                <stop offset="50%" stopColor="rgb(var(--galaxy-star))" stopOpacity="0.5" />
                <stop offset="100%" stopColor="rgb(var(--galaxy-nova))" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Columns */}
        {['left', 'center', 'right'].map((column) => (
          <div key={column} className="space-y-8">
            {nodes
              .filter(node => node.column === column)
              .map((node, index) => (
                <motion.div
                  key={node.id}
                  className={cn(
                    "p-4 rounded-lg border backdrop-blur-sm",
                    "border-galaxy-nova/30 bg-galaxy-core/20",
                    "hover:border-galaxy-nova/50 hover:bg-galaxy-core/30 transition-all"
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {node.imageUrl && (
                    <div className="w-16 h-16 rounded-full overflow-hidden mb-3 mx-auto border-2 border-galaxy-nova/30">
                      <img src={node.imageUrl} alt={node.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-galaxy-star text-center mb-2">{node.name}</h3>
                  <p className="text-sm text-galaxy-nova mb-2 text-center">{node.period}</p>
                  <p className="text-sm text-foreground/70 text-center">{node.description}</p>
                </motion.div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StorylineVisualization;
