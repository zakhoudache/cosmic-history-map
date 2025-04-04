
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HistoricalEntity, FormattedHistoricalEntity } from '@/types/supabase';
import { 
  X, 
  Calendar, 
  MapPin, 
  BarChart2, 
  Tag, 
  BookOpen, 
  Link2, 
  Image, 
  Trash2,
  Info,
  Save,
  Edit3,
  Eye,
  EyeOff,
  PlusCircle,
  Pencil,
  Star,
  Users,
  Clock,
  Layers,
  BookMarked,
  MessageCircle,
  ArrowRight,
  Link
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/utils/dateUtils';

interface ElementCardProps {
  entity: FormattedHistoricalEntity;
  onClose: () => void;
  onUpdate?: (entities: FormattedHistoricalEntity[]) => void;
  entities?: FormattedHistoricalEntity[];
  onDelete?: (id: string) => void;
}

const ElementCard: React.FC<ElementCardProps> = ({ 
  entity, 
  onClose, 
  onUpdate, 
  entities = [],
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEntity, setEditedEntity] = useState({ ...entity });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newRelation, setNewRelation] = useState({
    targetId: '',
    type: 'related',
    strength: 5 // Default strength
  });
  const [showAddRelation, setShowAddRelation] = useState(false);
  
  const hasImage = !!entity.imageUrl;
  
  const entityTypes = [
    'person', 'event', 'place', 'concept', 'period',
    'artwork', 'document', 'building', 'theory', 
    'invention', 'process', 'play', 'movement', 'group'
  ];
  
  const relationTypes = [
    { value: 'related', label: 'Related to' },
    { value: 'causal', label: 'Caused' },
    { value: 'created', label: 'Created' },
    { value: 'influenced', label: 'Influenced' },
    { value: 'participated', label: 'Participated in' },
    { value: 'preceded', label: 'Preceded' },
    { value: 'succeeded', label: 'Succeeded' },
    { value: 'contained', label: 'Contained' },
    { value: 'partOf', label: 'Part of' },
    { value: 'conflicted', label: 'Conflicted with' },
    { value: 'allied', label: 'Allied with' },
    { value: 'studied', label: 'Studied' },
    { value: 'married', label: 'Married to' },
    { value: 'parent', label: 'Parent of' },
    { value: 'child', label: 'Child of' },
    { value: 'sibling', label: 'Sibling of' },
    { value: 'founded', label: 'Founded' },
    { value: 'worked', label: 'Worked at' },
    { value: 'taught', label: 'Taught' },
    { value: 'wrote', label: 'Wrote' },
    { value: 'built', label: 'Built' },
    { value: 'discovered', label: 'Discovered' },
    { value: 'invented', label: 'Invented' },
    { value: 'developed', label: 'Developed' },
    { value: 'destroyed', label: 'Destroyed' },
    { value: 'conquered', label: 'Conquered' },
    { value: 'ruled', label: 'Ruled' },
    { value: 'located', label: 'Located in' },
    { value: 'traded', label: 'Traded with' }
  ];

  const handleChange = (field: string, value: any) => {
    setEditedEntity(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (onUpdate && entities) {
      const updatedEntities = entities.map(e => 
        e.id === entity.id ? editedEntity : e
      );
      onUpdate(updatedEntities);
      toast.success("Entity updated successfully");
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(entity.id);
      onClose();
    }
  };

  const handleAddRelation = () => {
    // Ensure strength is provided
    const relationWithStrength = {
      ...newRelation,
      strength: newRelation.strength || 5 // Default strength if not provided
    };
    
    if (relationWithStrength.targetId && relationWithStrength.type) {
      const updatedRelations = [...(editedEntity.relations || []), relationWithStrength];
      setEditedEntity(prev => ({
        ...prev,
        relations: updatedRelations
      }));
      
      setNewRelation({
        targetId: '',
        type: 'related',
        strength: 5
      });
      
      setShowAddRelation(false);
      
      if (onUpdate && entities) {
        const updatedEntities = entities.map(e => 
          e.id === entity.id ? {...editedEntity, relations: updatedRelations} : e
        );
        onUpdate(updatedEntities);
        toast.success("Relation added successfully");
      }
    } else {
      toast.error("Please select an entity and relation type");
    }
  };

  const removeRelation = (index: number) => {
    const updatedRelations = [...(editedEntity.relations || [])];
    updatedRelations.splice(index, 1);
    
    setEditedEntity(prev => ({
      ...prev,
      relations: updatedRelations
    }));
    
    if (onUpdate && entities) {
      const updatedEntities = entities.map(e => 
        e.id === entity.id ? {...editedEntity, relations: updatedRelations} : e
      );
      onUpdate(updatedEntities);
      toast.success("Relation removed");
    }
  };

  const getRelationName = (relationId: string) => {
    const targetEntity = entities.find(e => e.id === relationId);
    return targetEntity ? targetEntity.name : relationId;
  };

  // Get the type color for visualization 
  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      person: '#8B5CF6',  // Purple
      event: '#F97316',   // Orange
      place: '#10B981',   // Green
      concept: '#0EA5E9', // Blue
      period: '#EC4899',  // Pink
      artwork: '#F43F5E', // Rose
      document: '#6366F1', // Indigo
      building: '#4338CA', // Blue
      theory: '#8B5CF6',  // Purple
      invention: '#F97316', // Orange
      process: '#10B981', // Green
      play: '#0EA5E9',    // Blue
      movement: '#8B5CF6', // Purple
      group: '#F43F5E'    // Rose
    };
    
    return typeColors[type.toLowerCase()] || '#9b87f5';
  };

  return (
    <Card className="border-0 bg-transparent animate-in fade-in duration-300 overflow-hidden">
      <CardHeader className="relative pb-2 space-y-0">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-2 text-gray-400 hover:text-white hover:bg-black/30" 
          onClick={onClose}
        >
          <X size={18} />
        </Button>
        
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getTypeColor(entity.type) }}></div>
          {isEditing ? (
            <Select 
              value={editedEntity.type} 
              onValueChange={(value) => handleChange('type', value)}
            >
              <SelectTrigger className="h-8 w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {entityTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-sm text-galaxy-nova font-medium">
              {entity.type?.charAt(0).toUpperCase() + entity.type?.slice(1)}
            </span>
          )}
        </div>
        
        {isEditing ? (
          <Input 
            value={editedEntity.name} 
            onChange={(e) => handleChange('name', e.target.value)}
            className="text-xl font-semibold text-white"
          />
        ) : (
          <CardTitle className="text-2xl font-bold text-white">
            {entity.name}
          </CardTitle>
        )}
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <Calendar className="h-3.5 w-3.5" />
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input 
                type="date" 
                value={editedEntity.startDate} 
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="h-7 w-40"
              />
              {editedEntity.endDate && (
                <>
                  <span>-</span>
                  <Input 
                    type="date" 
                    value={editedEntity.endDate} 
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className="h-7 w-40"
                  />
                </>
              )}
            </div>
          ) : (
            <span>
              {entity.startDate && formatDate(entity.startDate)}
              {entity.endDate && ` - ${formatDate(entity.endDate)}`}
            </span>
          )}
        </div>
        
        {entity.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {isEditing ? (
              <Input 
                value={editedEntity.location} 
                onChange={(e) => handleChange('location', e.target.value)}
                className="h-7"
              />
            ) : (
              <span>{entity.location}</span>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-2 space-y-4">
        {entity.imageUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-md mb-4">
            <img 
              src={entity.imageUrl} 
              alt={entity.name} 
              className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
            />
          </div>
        )}
        
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                value={editedEntity.description || ''} 
                onChange={(e) => handleChange('description', e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="significance">Significance (1-10)</Label>
                <Input 
                  id="significance"
                  type="number" 
                  min="1" 
                  max="10" 
                  value={editedEntity.significance || 5} 
                  onChange={(e) => handleChange('significance', Number(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="group">Group/Category</Label>
                <Input 
                  id="group"
                  value={editedEntity.group || ''} 
                  onChange={(e) => handleChange('group', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input 
                id="imageUrl"
                value={editedEntity.imageUrl || ''} 
                onChange={(e) => handleChange('imageUrl', e.target.value)}
              />
            </div>
          </>
        ) : (
          <>
            <div className="text-sm text-foreground/90 space-y-1">
              {entity.description && (
                <p>{entity.description}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground flex items-center">
                  <Star className="h-3.5 w-3.5 mr-1" />
                  Significance
                </span>
                <div className="flex items-center gap-1">
                  <div className="h-2 bg-galaxy-nova/70 rounded-full" style={{ width: `${(entity.significance || 5) * 10}%` }}></div>
                  <span className="text-xs text-galaxy-nova ml-1">{entity.significance || 5}/10</span>
                </div>
              </div>
              
              {entity.group && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Tag className="h-3.5 w-3.5 mr-1" />
                    Group
                  </span>
                  <span className="text-sm text-foreground">{entity.group}</span>
                </div>
              )}
            </div>
          </>
        )}
        
        <Separator className="my-2" />
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-galaxy-nova" />
              <span className="text-sm font-medium">Relations</span>
            </div>
            
            {isEditing && (
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 px-2 text-xs"
                onClick={() => setShowAddRelation(true)}
              >
                <PlusCircle className="h-3.5 w-3.5 mr-1" />
                Add
              </Button>
            )}
          </div>
          
          {showAddRelation && (
            <div className="p-3 bg-black/30 rounded-md space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="target-entity" className="text-xs">Target Entity</Label>
                  <Select onValueChange={(value) => setNewRelation(prev => ({ ...prev, targetId: value }))}>
                    <SelectTrigger id="target-entity" className="h-8">
                      <SelectValue placeholder="Select entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {entities
                        .filter(e => e.id !== entity.id)
                        .map(e => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.name}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="relation-type" className="text-xs">Relation Type</Label>
                  <Select onValueChange={(value) => setNewRelation(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger id="relation-type" className="h-8">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="relation-strength" className="text-xs">Strength (1-10)</Label>
                <Input 
                  id="relation-strength"
                  type="number" 
                  min="1" 
                  max="10" 
                  className="h-8"
                  value={newRelation.strength} 
                  onChange={(e) => setNewRelation(prev => ({ ...prev, strength: Number(e.target.value) }))}
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 px-2 text-xs"
                  onClick={() => setShowAddRelation(false)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  className="h-7 px-2 text-xs"
                  onClick={handleAddRelation}
                >
                  Add Relation
                </Button>
              </div>
            </div>
          )}
          
          {entity.relations && entity.relations.length > 0 ? (
            <div className="space-y-2 mt-2">
              {entity.relations.map((relation, index) => (
                <div 
                  key={`${relation.targetId}-${index}`} 
                  className="flex items-center justify-between p-2 bg-black/20 rounded-sm"
                >
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm">{getRelationName(relation.targetId)}</span>
                    <span className="text-xs text-muted-foreground">({relation.type})</span>
                    {relation.strength && (
                      <span className="text-xs px-1.5 py-0.5 bg-primary/20 text-primary-foreground rounded-full">
                        {relation.strength}/10
                      </span>
                    )}
                  </div>
                  
                  {isEditing && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-muted-foreground" 
                      onClick={() => removeRelation(index)}
                    >
                      <X size={14} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No relations found.</p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        {isEditing ? (
          <>
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </>
        ) : (
          <div className="w-full flex justify-end">
            <Button onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        )}
      </CardFooter>
      
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Entity</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{entity.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ElementCard;
