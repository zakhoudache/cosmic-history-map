import React, { useEffect, useRef, useState } from 'react';
import { HistoricalEntity } from '@/utils/mockData';
import { useAnimateOnMount } from '@/utils/animations';
import { Clock, Calendar, ArrowRight } from 'lucide-react';
import VisualizationPlaceholder from './VisualizationPlaceholder';

interface TimelineProps {
  entities?: HistoricalEntity[];
  timelineData?: any;
  onEntitySelect?: (entity: HistoricalEntity) => void;
}

const Timeline: React.FC<TimelineProps> = ({ 
  entities = [], 
  timelineData,
  onEntitySelect 
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const isVisible = useAnimateOnMount(500);
  const hasData = entities && entities.length > 0 && timelineData;
  
  // Sort entities by start date
  const sortedEntities = [...entities].sort((a, b) => {
    const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
    const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
    return dateA - dateB;
  });

  // Group timeline events by period if timeline data is available
  const timelinePeriods = timelineData?.periods || [];
  
  if (!hasData) {
    return (
      <VisualizationPlaceholder 
        title="Temporal Timeline"
        description="View historical entities arranged chronologically along an interactive timeline."
      />
    );
  }
  
  return (
    <div 
      ref={timelineRef}
      className="w-full min-h-[300px] glass rounded-lg p-6 overflow-hidden"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
      }}
    >
      {/* Timeline header with time range */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-cosmic-accent mr-2" />
          <h3 className="text-lg font-medium">Chronological Timeline</h3>
        </div>
        
        {timelineData?.startYear && timelineData?.endYear && (
          <div className="text-sm text-muted-foreground flex items-center">
            <span>{timelineData.startYear}</span>
            <ArrowRight className="h-3 w-3 mx-2" />
            <span>{timelineData.endYear}</span>
          </div>
        )}
      </div>
      
      {/* Timeline periods */}
      {timelinePeriods.length > 0 && (
        <div className="mb-8">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-0 w-full h-1 bg-muted top-4 rounded-full"></div>
            
            {/* Period markers */}
            <div className="flex justify-between relative">
              {timelinePeriods.map((period: any, index: number) => (
                <div key={index} className="flex flex-col items-center relative z-10">
                  <div className="w-8 h-8 rounded-full cosmic-gradient flex items-center justify-center mb-2">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-sm font-medium">{period.name}</div>
                  <div className="text-xs text-muted-foreground">{period.year}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Timeline entities */}
      <div className="space-y-4 mt-8">
        {sortedEntities.map((entity, index) => {
          // Format dates for display
          const startDate = entity.startDate ? new Date(entity.startDate).getFullYear() : 'Unknown';
          const endDate = entity.endDate ? new Date(entity.endDate).getFullYear() : 'Present';
          const dateDisplay = startDate === endDate ? startDate : `${startDate} - ${endDate}`;
          
          // Determine entity type color
          const getTypeColor = (type: string) => {
            switch (type) {
              case 'person': return 'bg-blue-500';
              case 'event': return 'bg-amber-500';
              case 'place': return 'bg-green-500';
              case 'concept': return 'bg-purple-500';
              default: return 'bg-gray-500';
            }
          };
          
          return (
            <div 
              key={entity.id}
              className="flex items-start p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              onClick={() => onEntitySelect && onEntitySelect(entity)}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                transition: `opacity 0.5s ease-out ${index * 0.1}s, transform 0.5s ease-out ${index * 0.1}s`
              }}
            >
              <div className="flex-shrink-0 mr-4">
                <div className="text-sm font-mono text-muted-foreground w-24 text-right">{dateDisplay}</div>
              </div>
              
              <div className={`w-3 h-3 rounded-full mt-1 mr-3 flex-shrink-0 ${getTypeColor(entity.type)}`}></div>
              
              <div className="flex-grow">
                <h4 className="text-base font-medium">{entity.name}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">{entity.description}</p>
              </div>
              
              <div className="flex-shrink-0 ml-2 text-xs px-2 py-1 rounded-full bg-white/10 text-muted-foreground">
                {entity.type}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Empty state if no entities with dates */}
      {sortedEntities.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No entities with temporal data available
        </div>
      )}
    </div>
  );
};

export default Timeline;
