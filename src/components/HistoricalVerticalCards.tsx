
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Separator } from './ui/separator';
import { HistoricalEntity } from '@/utils/mockData';
import {
  User,
  CalendarDays,
  MapPin,
  FileText,
  Scroll,
  Lightbulb,
  Building,
  Clock,
  Flag
} from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useAnimateOnMount } from '@/utils/animations';

// Type mapping for entity icons
const typeIcons: Record<string, React.ReactNode> = {
  Person: <User className="h-5 w-5" />,
  Event: <CalendarDays className="h-5 w-5" />,
  Place: <MapPin className="h-5 w-5" />,
  Concept: <Lightbulb className="h-5 w-5" />,
  Document: <FileText className="h-5 w-5" />,
  Treaty: <Scroll className="h-5 w-5" />,
  Period: <Clock className="h-5 w-5" />,
  Building: <Building className="h-5 w-5" />,
  Default: <Flag className="h-5 w-5" />
};

// Type mapping for CSS classes
const typeClasses: Record<string, string> = {
  Person: "bg-blue-500/10 border-blue-500/20 text-blue-500/90",
  Event: "bg-orange-500/10 border-orange-500/20 text-orange-500/90",
  Place: "bg-green-500/10 border-green-500/20 text-green-500/90",
  Concept: "bg-purple-500/10 border-purple-500/20 text-purple-500/90", 
  Document: "bg-amber-500/10 border-amber-500/20 text-amber-500/90",
  Treaty: "bg-rose-500/10 border-rose-500/20 text-rose-500/90",
  Period: "bg-indigo-500/10 border-indigo-500/20 text-indigo-500/90",
  Building: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500/90",
  Default: "bg-gray-500/10 border-gray-500/20 text-gray-500/90"
};

interface HistoricalCardProps {
  entity: HistoricalEntity;
  index: number;
  onSelect: (entity: HistoricalEntity) => void;
}

const HistoricalCard: React.FC<HistoricalCardProps> = ({ entity, index, onSelect }) => {
  const isVisible = useAnimateOnMount(100 + index * 50);
  
  // Choose icon and styling based on type
  const entityType = entity.type || "Default";
  const normalizedType = entityType.charAt(0).toUpperCase() + entityType.slice(1).toLowerCase();
  const icon = typeIcons[normalizedType] || typeIcons.Default;
  const typeClass = typeClasses[normalizedType] || typeClasses.Default;
  
  // Format the date display
  const dateDisplay = entity.startDate && entity.endDate 
    ? `${entity.startDate} - ${entity.endDate}`
    : entity.startDate || entity.endDate || "تاريخ غير محدد";
  
  return (
    <Card 
      className={`relative border hover:shadow-lg transition-all duration-300 ${
        isVisible ? 'opacity-100 transform-none' : 'opacity-0 translate-y-8'
      } ${typeClass}`}
      onClick={() => onSelect(entity)}
    >
      <div className="absolute top-0 right-0 p-2">
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-white/90 shadow-sm">
          {icon}
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">{entity.name}</CardTitle>
        <div className="text-xs opacity-80">{dateDisplay}</div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-sm opacity-90" style={{ direction: 'rtl' }}>
          {entity.description.length > 120 
            ? entity.description.substring(0, 120) + "..." 
            : entity.description}
        </p>
        
        {entity.location && (
          <div className="mt-2 flex items-center text-xs opacity-70">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{entity.location}</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 flex-col items-start">
        <Separator className="w-full mb-2 opacity-40" />
        
        {entity.domains && entity.domains.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {entity.domains.map(domain => (
              <span 
                key={domain} 
                className="px-2 py-0.5 text-xs rounded-full bg-white/20"
              >
                {domain}
              </span>
            ))}
          </div>
        )}
        
        <div className="w-full mt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(entity);
            }}
          >
            عرض التفاصيل
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

interface HistoricalVerticalCardsProps {
  entities: HistoricalEntity[];
  onSelectEntity: (entity: HistoricalEntity) => void;
  title?: string;
}

const HistoricalVerticalCards: React.FC<HistoricalVerticalCardsProps> = ({ 
  entities, 
  onSelectEntity,
  title = "العناصر التاريخية الرئيسية"
}) => {
  if (!entities || entities.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">لا توجد عناصر تاريخية لعرضها</p>
      </div>
    );
  }
  
  // Group entities by type
  const groupedEntities: Record<string, HistoricalEntity[]> = {};
  
  entities.forEach(entity => {
    const type = entity.type || "Unknown";
    if (!groupedEntities[type]) {
      groupedEntities[type] = [];
    }
    groupedEntities[type].push(entity);
  });
  
  // Get the grouped sections
  const sections = Object.entries(groupedEntities);
  
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-center mb-6" style={{ direction: 'rtl' }}>
        {title}
      </h2>
      
      <div className="space-y-6">
        {sections.map(([type, typeEntities]) => (
          <div key={type} className="space-y-4">
            <h3 className="text-xl font-semibold opacity-80 mr-2" style={{ direction: 'rtl' }}>
              {type === "Person" ? "الشخصيات" : 
               type === "Event" ? "الأحداث" :
               type === "Place" ? "الأماكن" :
               type === "Concept" ? "المفاهيم" :
               type === "Document" ? "الوثائق" :
               type === "Treaty" ? "المعاهدات" :
               type === "Period" ? "الفترات الزمنية" :
               type === "Building" ? "المباني" : type}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {typeEntities.map((entity, index) => (
                <HistoricalCard 
                  key={entity.id} 
                  entity={entity} 
                  index={index}
                  onSelect={onSelectEntity}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoricalVerticalCards;
