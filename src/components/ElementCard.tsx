
import React from 'react';
import { HistoricalEntity, mockHistoricalData } from '@/utils/mockData';
import { useAnimateOnMount } from '@/utils/animations';
import { X, User, CalendarDays, MapPin, LightbulbIcon, Sparkles } from 'lucide-react';

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

  // Get entity type specific styles and icons
  const getEntityTypeStyles = () => {
    switch(entity.type.toLowerCase()) {
      case "person":
        return {
          icon: <User className="h-6 w-6" />,
          gradient: "bg-gradient-to-br from-blue-500 to-purple-600",
          symbolBg: "bg-blue-400/20",
          border: "border-blue-400/30"
        };
      case "event":
        return {
          icon: <CalendarDays className="h-6 w-6" />,
          gradient: "bg-gradient-to-br from-red-500 to-orange-600",
          symbolBg: "bg-red-400/20",
          border: "border-red-400/30"
        };
      case "place":
        return {
          icon: <MapPin className="h-6 w-6" />,
          gradient: "bg-gradient-to-br from-green-500 to-emerald-600",
          symbolBg: "bg-green-400/20",
          border: "border-green-400/30"
        };
      case "concept":
        return {
          icon: <LightbulbIcon className="h-6 w-6" />,
          gradient: "bg-gradient-to-br from-amber-500 to-yellow-600",
          symbolBg: "bg-amber-400/20",
          border: "border-amber-400/30"
        };
      default:
        return {
          icon: <Sparkles className="h-6 w-6" />,
          gradient: "bg-gradient-to-br from-cosmic-light to-cosmic-accent",
          symbolBg: "bg-cosmic-light/20",
          border: "border-cosmic-light/30"
        };
    }
  };
  
  const typeStyles = getEntityTypeStyles();
  
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
        
        {/* Header with entity-specific styling */}
        <div className={`p-4 relative overflow-hidden ${typeStyles.gradient}`}>
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium mb-2`}>
                  <div className={`w-5 h-5 flex items-center justify-center rounded-full mr-1 ${typeStyles.symbolBg}`}>
                    {typeStyles.icon}
                  </div>
                  <span>{entity.type.charAt(0).toUpperCase() + entity.type.slice(1)}</span>
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
          
          {/* Background decoration - customized per entity type */}
          <div className={`absolute top-0 right-0 w-40 h-40 rounded-full ${typeStyles.symbolBg} blur-3xl -translate-y-1/2 translate-x-1/2`}></div>
          <div className={`absolute bottom-0 left-0 w-20 h-20 rounded-full ${typeStyles.symbolBg} blur-2xl translate-y-1/2 -translate-x-1/2`}></div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-foreground/80 leading-relaxed">
            {entity.description}
          </p>
          
          {/* Related entities with custom styling based on type */}
          {relatedEntities.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Related Elements</h4>
              <div className="flex flex-wrap gap-2">
                {relatedEntities.map(related => {
                  const relatedTypeStyle = (() => {
                    switch(related.type.toLowerCase()) {
                      case "person": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
                      case "event": return "bg-red-500/20 text-red-300 border-red-500/30";
                      case "place": return "bg-green-500/20 text-green-300 border-green-500/30";
                      case "concept": return "bg-amber-500/20 text-amber-300 border-amber-500/30";
                      default: return "bg-cosmic/20 text-cosmic-light border-cosmic/30";
                    }
                  })();
                  
                  const relatedIcon = (() => {
                    switch(related.type.toLowerCase()) {
                      case "person": return <User className="h-3 w-3 mr-1" />;
                      case "event": return <CalendarDays className="h-3 w-3 mr-1" />;
                      case "place": return <MapPin className="h-3 w-3 mr-1" />;
                      case "concept": return <LightbulbIcon className="h-3 w-3 mr-1" />;
                      default: return <Sparkles className="h-3 w-3 mr-1" />;
                    }
                  })();
                  
                  return (
                    <div 
                      key={related.id}
                      className={`inline-flex items-center px-3 py-1 rounded-full border ${relatedTypeStyle} text-xs font-medium`}
                    >
                      {relatedIcon}
                      {related.name}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Significance indicator with entity-specific colors */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Historical Significance</span>
              <span>{entity.significance}/10</span>
            </div>
            <div className="mt-1 h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full ${typeStyles.gradient} rounded-full transition-all duration-1000`}
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
