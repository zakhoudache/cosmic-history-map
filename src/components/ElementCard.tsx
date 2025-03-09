
import React from 'react';
import { HistoricalEntity, mockHistoricalData } from '@/utils/mockData';
import { useAnimateOnMount } from '@/utils/animations';
import { X } from 'lucide-react';

interface ElementCardProps {
  entity: HistoricalEntity;
  onClose: () => void;
}

const ElementCard: React.FC<ElementCardProps> = ({ entity, onClose }) => {
  const isVisible = useAnimateOnMount(100);
  
  // Find related entities from connections or relations
  const connections = entity.connections || 
    (entity.relations ? entity.relations.map(r => r.target) : []);
  
  const relatedEntities = mockHistoricalData.filter(
    e => connections.includes(e.id) && e.id !== entity.id
  );
  
  // Format dates
  const formatDate = (dateStr: string | Date | undefined) => {
    if (!dateStr) return '';
    
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    const year = date.getFullYear();
    
    // Simplify to just display the year for historical entities
    return year;
  };
  
  const dateRange = entity.startDate && entity.endDate
    ? `${formatDate(entity.startDate)} - ${formatDate(entity.endDate)}`
    : entity.startDate 
      ? `${formatDate(entity.startDate)}` 
      : '';
  
  const entityTypeIcon = () => {
    switch(entity.type.toLowerCase()) {
      case "person": return "👤";
      case "event": return "📅";
      case "place": return "📍";
      case "concept": return "💡";
      default: return "•";
    }
  };
  
  return (
    <div 
      className={`glass rounded-lg overflow-hidden transition-all duration-300 transform ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      <div className="relative">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1 rounded-full bg-background/40 backdrop-blur-sm hover:bg-background/60 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        
        {/* Header */}
        <div className="cosmic-gradient p-4 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-block px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium mb-2">
                  {entityTypeIcon()} {entity.type.charAt(0).toUpperCase() + entity.type.slice(1)}
                </div>
                
                {dateRange && (
                  <div className="inline-block px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium mb-2 ml-2">
                    {dateRange}
                  </div>
                )}
              </div>
            </div>
            
            <h3 className="text-xl font-medium text-white mb-1">{entity.name}</h3>
            
            <div className="h-1 w-12 bg-white/30 rounded-full my-2"></div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-cosmic-accent/20 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-cosmic-light/20 blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-foreground/80 leading-relaxed">
            {entity.description}
          </p>
          
          {/* Related entities */}
          {relatedEntities.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Related Elements</h4>
              <div className="flex flex-wrap gap-2">
                {relatedEntities.map(related => (
                  <div 
                    key={related.id}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-xs font-medium"
                  >
                    {(() => {
                      switch(related.type.toLowerCase()) {
                        case "person": return "👤 ";
                        case "event": return "📅 ";
                        case "place": return "📍 ";
                        case "concept": return "💡 ";
                        default: return "";
                      }
                    })()}
                    {related.name}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Significance indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Historical Significance</span>
              <span>{entity.significance}/10</span>
            </div>
            <div className="mt-1 h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full cosmic-gradient rounded-full transition-all duration-1000"
                style={{ 
                  width: `${(entity.significance || 1) / 10 * 100}%`,
                  opacity: isVisible ? 1 : 0
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElementCard;
