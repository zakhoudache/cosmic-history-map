
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Layers, Palette, Map, Brush, Sliders, Type, FileUp, Globe, Scale } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Define preset styles for different historical periods
export const MAP_STYLE_PRESETS = {
  ancient: {
    name: "Ancient World",
    basemapStyle: "mapbox://styles/mapbox/light-v11",
    background: "#f3e7c8", // Parchment color
    water: "#b8d0df",
    land: "#efe0be",
    text: "#5a3825",
    filter: "sepia(40%) brightness(105%)",
    borderWidth: 1,
    borderColor: "#8e7651",
    fontFamily: "'Palatino', serif",
    timeperiod: "3000 BCE - 500 CE"
  },
  medieval: {
    name: "Medieval Era",
    basemapStyle: "mapbox://styles/mapbox/light-v11",
    background: "#eee1c2",
    water: "#a3c3d9",
    land: "#e9d9b8",
    text: "#483626",
    filter: "sepia(50%) saturate(80%)",
    borderWidth: 2,
    borderColor: "#7a6342",
    fontFamily: "'Blackletter', 'Times New Roman', serif",
    timeperiod: "500 CE - 1500 CE"
  },
  renaissance: {
    name: "Renaissance",
    basemapStyle: "mapbox://styles/mapbox/light-v11",
    background: "#f0e4c9",
    water: "#b9d1eb",
    land: "#e4d7b6",
    text: "#583e2a",
    filter: "sepia(30%) contrast(110%)",
    borderWidth: 1.5,
    borderColor: "#9a7b51",
    fontFamily: "'Garamond', serif",
    timeperiod: "1400 CE - 1700 CE"
  },
  earlyModern: {
    name: "Early Modern",
    basemapStyle: "mapbox://styles/mapbox/light-v11",
    background: "#f9f2e0",
    water: "#c3d8e8",
    land: "#f0e8d0",
    text: "#3d3120",
    filter: "sepia(20%) saturate(90%)",
    borderWidth: 1,
    borderColor: "#8e7651",
    fontFamily: "'Baskerville', serif",
    timeperiod: "1700 CE - 1900 CE"
  },
  modern: {
    name: "Modern Era",
    basemapStyle: "mapbox://styles/mapbox/light-v11",
    background: "#ffffff",
    water: "#a4c8e0",
    land: "#f4f4f0",
    text: "#333333",
    filter: "none",
    borderWidth: 0.5,
    borderColor: "#666666",
    fontFamily: "'Arial', sans-serif",
    timeperiod: "1900 CE - Present"
  },
  custom: {
    name: "Custom Style",
    basemapStyle: "mapbox://styles/mapbox/light-v11",
    background: "#f8f4e8",
    water: "#c9ddec",
    land: "#eee4c7",
    text: "#333333",
    filter: "sepia(30%)",
    borderWidth: 1,
    borderColor: "#8e7651",
    fontFamily: "'Times New Roman', serif",
    timeperiod: "Custom"
  }
};

export interface MapStyle {
  basemapStyle: string;
  background: string;
  water: string;
  land: string;
  text: string;
  filter: string;
  borderWidth: number;
  borderColor: string;
  fontFamily: string;
  timeperiod?: string;
}

interface MapStyleEditorProps {
  onStyleChange: (style: MapStyle) => void;
  currentMapType: string;
}

const MapStyleEditor: React.FC<MapStyleEditorProps> = ({ onStyleChange, currentMapType }) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('ancient');
  const [currentStyle, setCurrentStyle] = useState<MapStyle>(MAP_STYLE_PRESETS.ancient);
  const [advancedMode, setAdvancedMode] = useState<boolean>(false);

  // Apply the appropriate preset based on map type when it changes
  useEffect(() => {
    let preset = 'ancient';
    
    // Select appropriate preset based on map type or timestamp
    switch (currentMapType) {
      case 'historical':
        if (currentStyle.timeperiod?.includes("BCE")) {
          preset = 'ancient';
        } else if (currentStyle.timeperiod?.includes("1400")) {
          preset = 'renaissance';
        } else if (currentStyle.timeperiod?.includes("1700")) {
          preset = 'earlyModern';
        } else {
          preset = 'medieval';
        }
        break;
      case 'thematic':
        preset = 'modern';
        break;
      case 'outline':
        preset = 'earlyModern';
        break;
      case 'relief':
        preset = 'renaissance';
        break;
      case 'interactive':
        preset = 'modern';
        break;
      case 'concept':
        preset = 'medieval';
        break;
      default:
        preset = 'ancient';
    }
    
    handlePresetChange(preset);
  }, [currentMapType]);

  // Handle preset selection
  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    const newStyle = MAP_STYLE_PRESETS[preset as keyof typeof MAP_STYLE_PRESETS];
    setCurrentStyle(newStyle);
    onStyleChange(newStyle);
  };

  // Handle individual style property changes
  const handleStyleChange = (property: keyof MapStyle, value: string | number) => {
    const updatedStyle = {
      ...currentStyle,
      [property]: value
    };
    setCurrentStyle(updatedStyle);
    onStyleChange(updatedStyle);
    
    // If we're editing, switch to custom preset
    if (selectedPreset !== 'custom') {
      setSelectedPreset('custom');
    }
  };

  // Apply the current style to the map
  const applyStyle = () => {
    onStyleChange(currentStyle);
    toast({
      title: "Style Applied",
      description: "Map style has been updated successfully.",
    });
  };

  // Reset to selected preset
  const resetStyle = () => {
    const presetStyle = MAP_STYLE_PRESETS[selectedPreset as keyof typeof MAP_STYLE_PRESETS];
    setCurrentStyle(presetStyle);
    onStyleChange(presetStyle);
    toast({
      title: "Style Reset",
      description: `Reverted to ${MAP_STYLE_PRESETS[selectedPreset as keyof typeof MAP_STYLE_PRESETS].name} preset.`,
    });
  };

  return (
    <Card className="border border-galaxy-nova/30 bg-black/30 backdrop-blur-sm shadow-md shadow-galaxy-nova/10 w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Palette className="w-5 h-5 text-galaxy-nova" />
          Map Style Editor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="preset">Historical Period</Label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setAdvancedMode(!advancedMode)}
              className="text-xs border-galaxy-nova/20 hover:border-galaxy-nova/40"
            >
              {advancedMode ? "Basic Mode" : "Advanced Mode"}
            </Button>
          </div>
          <Select value={selectedPreset} onValueChange={handlePresetChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a historical period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ancient">Ancient World (3000 BCE - 500 CE)</SelectItem>
              <SelectItem value="medieval">Medieval Era (500 - 1400 CE)</SelectItem>
              <SelectItem value="renaissance">Renaissance (1400 - 1700 CE)</SelectItem>
              <SelectItem value="earlyModern">Early Modern (1700 - 1900 CE)</SelectItem>
              <SelectItem value="modern">Modern Era (1900 CE - Present)</SelectItem>
              <SelectItem value="custom">Custom Style</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {advancedMode && (
          <>
            <Separator className="my-4" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basemapStyle" className="flex items-center gap-1">
                  <Map className="w-4 h-4" />
                  Base Map Style
                </Label>
                <Select 
                  value={currentStyle.basemapStyle} 
                  onValueChange={(value) => handleStyleChange("basemapStyle", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select base map style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mapbox://styles/mapbox/light-v11">Light</SelectItem>
                    <SelectItem value="mapbox://styles/mapbox/dark-v11">Dark</SelectItem>
                    <SelectItem value="mapbox://styles/mapbox/streets-v12">Streets</SelectItem>
                    <SelectItem value="mapbox://styles/mapbox/outdoors-v12">Outdoors</SelectItem>
                    <SelectItem value="mapbox://styles/mapbox/satellite-v9">Satellite</SelectItem>
                    <SelectItem value="mapbox://styles/mapbox/satellite-streets-v12">Satellite Streets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fontFamily" className="flex items-center gap-1">
                  <Type className="w-4 h-4" />
                  Font Family
                </Label>
                <Select 
                  value={currentStyle.fontFamily} 
                  onValueChange={(value) => handleStyleChange("fontFamily", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font family" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="'Palatino', serif">Palatino (Ancient)</SelectItem>
                    <SelectItem value="'Times New Roman', serif">Times New Roman (Medieval)</SelectItem>
                    <SelectItem value="'Garamond', serif">Garamond (Renaissance)</SelectItem>
                    <SelectItem value="'Baskerville', serif">Baskerville (Early Modern)</SelectItem>
                    <SelectItem value="'Arial', sans-serif">Arial (Modern)</SelectItem>
                    <SelectItem value="'Georgia', serif">Georgia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background" className="flex items-center gap-1">
                  <Layers className="w-4 h-4" />
                  Background Color
                </Label>
                <div className="flex space-x-2">
                  <Input 
                    id="background" 
                    type="text" 
                    value={currentStyle.background} 
                    onChange={(e) => handleStyleChange("background", e.target.value)} 
                    className="flex-1"
                  />
                  <Input 
                    type="color" 
                    value={currentStyle.background} 
                    onChange={(e) => handleStyleChange("background", e.target.value)} 
                    className="w-12 p-1 h-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="water" className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  Water Color
                </Label>
                <div className="flex space-x-2">
                  <Input 
                    id="water" 
                    type="text" 
                    value={currentStyle.water} 
                    onChange={(e) => handleStyleChange("water", e.target.value)} 
                    className="flex-1"
                  />
                  <Input 
                    type="color" 
                    value={currentStyle.water} 
                    onChange={(e) => handleStyleChange("water", e.target.value)} 
                    className="w-12 p-1 h-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="land" className="flex items-center gap-1">
                  <Layers className="w-4 h-4" />
                  Land Color
                </Label>
                <div className="flex space-x-2">
                  <Input 
                    id="land" 
                    type="text" 
                    value={currentStyle.land} 
                    onChange={(e) => handleStyleChange("land", e.target.value)} 
                    className="flex-1"
                  />
                  <Input 
                    type="color" 
                    value={currentStyle.land} 
                    onChange={(e) => handleStyleChange("land", e.target.value)} 
                    className="w-12 p-1 h-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="text" className="flex items-center gap-1">
                  <Type className="w-4 h-4" />
                  Text Color
                </Label>
                <div className="flex space-x-2">
                  <Input 
                    id="text" 
                    type="text" 
                    value={currentStyle.text} 
                    onChange={(e) => handleStyleChange("text", e.target.value)} 
                    className="flex-1"
                  />
                  <Input 
                    type="color" 
                    value={currentStyle.text} 
                    onChange={(e) => handleStyleChange("text", e.target.value)} 
                    className="w-12 p-1 h-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="filter" className="flex items-center gap-1">
                  <Brush className="w-4 h-4" />
                  Filter
                </Label>
                <Select 
                  value={currentStyle.filter} 
                  onValueChange={(value) => handleStyleChange("filter", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="sepia(30%)">Light Sepia</SelectItem>
                    <SelectItem value="sepia(50%) saturate(80%)">Medium Sepia</SelectItem>
                    <SelectItem value="sepia(70%) saturate(80%)">Heavy Sepia</SelectItem>
                    <SelectItem value="grayscale(50%)">Grayscale</SelectItem>
                    <SelectItem value="brightness(105%) contrast(105%)">Enhance</SelectItem>
                    <SelectItem value="sepia(30%) contrast(110%)">Vintage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            
              <div className="space-y-2">
                <Label htmlFor="borderWidth" className="flex items-center gap-1">
                  <Scale className="w-4 h-4" />
                  Border Width
                </Label>
                <Input 
                  id="borderWidth" 
                  type="number" 
                  min="0" 
                  max="5" 
                  step="0.5" 
                  value={currentStyle.borderWidth} 
                  onChange={(e) => handleStyleChange("borderWidth", parseFloat(e.target.value))} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="borderColor" className="flex items-center gap-1">
                  <Brush className="w-4 h-4" />
                  Border Color
                </Label>
                <div className="flex space-x-2">
                  <Input 
                    id="borderColor" 
                    type="text" 
                    value={currentStyle.borderColor} 
                    onChange={(e) => handleStyleChange("borderColor", e.target.value)} 
                    className="flex-1"
                  />
                  <Input 
                    type="color" 
                    value={currentStyle.borderColor} 
                    onChange={(e) => handleStyleChange("borderColor", e.target.value)} 
                    className="w-12 p-1 h-10"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex space-x-2 pt-2">
          <Button 
            variant="default" 
            className="bg-galaxy-nova hover:bg-galaxy-nova/90 flex-1"
            onClick={applyStyle}
          >
            Apply Style
          </Button>
          <Button 
            variant="outline" 
            className="border-galaxy-nova/30 hover:border-galaxy-nova/60"
            onClick={resetStyle}
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapStyleEditor;
