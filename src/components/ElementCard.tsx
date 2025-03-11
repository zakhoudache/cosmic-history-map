
import React, { useState } from 'react';
import { HistoricalEntity } from '@/utils/mockData';
import { useAnimateOnMount } from '@/utils/animations';
import { X, User, CalendarDays, MapPin, LightbulbIcon, Sparkles, Edit, Plus, Trash, FilePlus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { v4 as uuidv4 } from 'uuid';

interface ElementCardProps {
  entity: HistoricalEntity;
  onClose: () => void;
  onEdit?: (entity: HistoricalEntity) => void;
  onAddRelated?: (parentEntity: HistoricalEntity) => void;
  onExportPDF?: () => void;
  onDelete?: (entityId: string) => void;
  allEntities?: HistoricalEntity[];
  onUpdateEntities?: (entities: HistoricalEntity[]) => void;
}

const ElementCard: React.FC<ElementCardProps> = ({ 
  entity, 
  onClose,
  onEdit,
  onAddRelated,
  onExportPDF,
  onDelete,
  allEntities,
  onUpdateEntities
}) => {
  const isVisible = useAnimateOnMount(100);
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEntity, setEditedEntity] = useState<HistoricalEntity>({...entity});
  const [showAddNodeForm, setShowAddNodeForm] = useState(false);
  const [newEntity, setNewEntity] = useState<Partial<HistoricalEntity>>({
    name: '',
    description: '',
    type: 'concept',
    significance: 5,
  });
  
  // Find related entities from connections or relations
  const connections = entity.relations ? entity.relations.map(r => r.targetId) : [];
  
  // We'll use an empty array for related entities instead of trying to find them in mockHistoricalData
  // This makes the component more reusable with different data sources
  const relatedEntities: HistoricalEntity[] = allEntities ? 
    allEntities.filter(e => connections.includes(e.id)) : [];
  
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

  const handleEditClick = () => {
    if (onEdit) {
      setIsEditing(true);
    } else {
      toast.info("Edit functionality not available in this context");
    }
  };

  const handleSaveEdit = () => {
    if (onUpdateEntities && allEntities) {
      const updatedEntities = allEntities.map(e => 
        e.id === editedEntity.id ? editedEntity : e
      );
      onUpdateEntities(updatedEntities);
      toast.success("Entity updated successfully");
      setIsEditing(false);
    } else if (onEdit) {
      onEdit(editedEntity);
      toast.success("Entity updated successfully");
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedEntity({...entity});
    setIsEditing(false);
  };

  const handleAddRelatedClick = () => {
    if (onAddRelated) {
      setShowAddNodeForm(true);
    } else {
      toast.info("Add related entity functionality not available in this context");
    }
  };

  const handleExportClick = () => {
    if (onExportPDF) {
      onExportPDF();
    } else {
      toast.info("Export functionality not available in this context");
    }
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(entity.id);
      onClose();
    } else {
      toast.info("Delete functionality not available in this context");
    }
  };

  const handleAddNewEntity = () => {
    if (!newEntity.name) {
      toast.error("Entity name is required");
      return;
    }

    if (onUpdateEntities && allEntities) {
      const newId = uuidv4();
      const completeNewEntity: HistoricalEntity = {
        id: newId,
        name: newEntity.name || 'New Entity',
        type: newEntity.type || 'concept',
        description: newEntity.description || '',
        significance: newEntity.significance || 5,
        relations: [{
          targetId: entity.id,
          type: 'default'
        }],
        // Add other required fields with default values
        startDate: '',
        endDate: '',
        group: '',
        location: '',
        imageUrl: ''
      };

      // Update the parent entity to also have a relation to the new entity
      const updatedParentEntity = {
        ...entity,
        relations: [
          ...(entity.relations || []),
          {
            targetId: newId,
            type: 'default'
          }
        ]
      };

      const updatedEntities = [
        ...allEntities.map(e => e.id === entity.id ? updatedParentEntity : e),
        completeNewEntity
      ];

      onUpdateEntities(updatedEntities);
      toast.success("New related entity added");
      setShowAddNodeForm(false);
      setNewEntity({
        name: '',
        description: '',
        type: 'concept',
        significance: 5,
      });
    } else if (onAddRelated) {
      onAddRelated(entity);
      setShowAddNodeForm(false);
    }
  };

  const handleCancelAdd = () => {
    setShowAddNodeForm(false);
    setNewEntity({
      name: '',
      description: '',
      type: 'concept',
      significance: 5,
    });
  };
  
  return (
    <div 
      className={`glass rounded-lg overflow-hidden transition-all duration-300 transform ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
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
        
        {isEditing ? (
          <div className="p-4 bg-background/80 backdrop-blur-md">
            <h3 className="text-lg font-medium mb-2">Edit Entity</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                <Input 
                  value={editedEntity.name}
                  onChange={(e) => setEditedEntity({...editedEntity, name: e.target.value})}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                <select
                  value={editedEntity.type}
                  onChange={(e) => setEditedEntity({...editedEntity, type: e.target.value})}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="person">Person</option>
                  <option value="event">Event</option>
                  <option value="place">Place</option>
                  <option value="concept">Concept</option>
                  <option value="period">Period</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <textarea
                  value={editedEntity.description}
                  onChange={(e) => setEditedEntity({...editedEntity, description: e.target.value})}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                />
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Significance (1-10)</label>
                <Input 
                  type="number"
                  min="1"
                  max="10"
                  value={editedEntity.significance}
                  onChange={(e) => setEditedEntity({...editedEntity, significance: parseInt(e.target.value) || 5})}
                  className="w-full"
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        ) : showAddNodeForm ? (
          <div className="p-4 bg-background/80 backdrop-blur-md">
            <h3 className="text-lg font-medium mb-2">Add Related Entity</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Name*</label>
                <Input 
                  value={newEntity.name}
                  onChange={(e) => setNewEntity({...newEntity, name: e.target.value})}
                  className="w-full"
                  placeholder="Enter name"
                />
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                <select
                  value={newEntity.type}
                  onChange={(e) => setNewEntity({...newEntity, type: e.target.value})}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="person">Person</option>
                  <option value="event">Event</option>
                  <option value="place">Place</option>
                  <option value="concept">Concept</option>
                  <option value="period">Period</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <textarea
                  value={newEntity.description}
                  onChange={(e) => setNewEntity({...newEntity, description: e.target.value})}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                  placeholder="Enter description"
                />
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Significance (1-10)</label>
                <Input 
                  type="number"
                  min="1"
                  max="10"
                  value={newEntity.significance}
                  onChange={(e) => setNewEntity({...newEntity, significance: parseInt(e.target.value) || 5})}
                  className="w-full"
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={handleCancelAdd}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAddNewEntity}>
                  Add Entity
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
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

              {/* Action buttons for editing, adding related entities, and exporting */}
              <div className={`mt-4 flex justify-end space-x-2 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
                {onEdit && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 px-2 text-xs" 
                    onClick={handleEditClick}
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                )}
                
                {onAddRelated && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 px-2 text-xs" 
                    onClick={handleAddRelatedClick}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Related
                  </Button>
                )}
                
                {onDelete && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 px-2 text-xs" 
                    onClick={handleDeleteClick}
                  >
                    <Trash className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                )}
                
                {onExportPDF && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 px-2 text-xs" 
                    onClick={handleExportClick}
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Export
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ElementCard;
