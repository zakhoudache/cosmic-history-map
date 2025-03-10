
import React, { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapStyle } from './MapStyleEditor';

// Mapbox public token - replace with your own or use environment variables
// You should create an account at mapbox.com to get your own token
const MAPBOX_TOKEN = 'pk.eyJ1IjoiemFjazk0MDAiLCJhIjoiY2tyaWRyb3d3Njg5OTJvbnhvanFldHlmMCJ9.2Sdj3kBXnQBvWf9mFndDww';

interface MapRegion {
  id: string;
  name: string;
  description?: string;
  coordinates: [number, number];
  significance: number;
  color: string;
  startYear?: number;
  endYear?: number;
  type: string;
}

interface MapLegendItem {
  label: string;
  color: string;
}

interface MapSettings {
  zoom: number;
  center: [number, number];
  style: string;
  bounds?: [[number, number], [number, number]]; // Southwest and Northeast corners
}

interface MapMetadata {
  generatedFrom: string;
  timeperiod?: {
    start: string;
    end: string;
  };
  sourceId?: string;
}

interface MapData {
  mapType: string;
  title: string;
  subtitle?: string;
  regions: MapRegion[];
  settings: MapSettings;
  legend: {
    title: string;
    items: MapLegendItem[];
  };
  metadata: MapMetadata;
}

interface MapDisplayProps {
  mapType: "historical" | "thematic" | "outline" | "relief" | "interactive" | "concept";
  mapTitle: string;
  mapSubtitle?: string;
  regionData?: any;
  sourceId?: string;
  sourceType?: string;
  onMapGenerated?: (mapId: string) => void;
  currentStyle?: MapStyle;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ 
  mapType, 
  mapTitle, 
  mapSubtitle,
  regionData,
  sourceId,
  sourceType,
  onMapGenerated,
  currentStyle
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapData, setMapData] = useState<MapData | null>(null);
  
  // Initialize mapbox map when component mounts
  useEffect(() => {
    // Set the Mapbox access token
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    return () => {
      // Cleanup the map instance when component unmounts
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);
  
  useEffect(() => {
    // Reset loading state when map type changes
    setIsLoading(true);
    setMapData(null);
    
    // Function to fetch map data from Supabase
    const fetchExistingMapData = async () => {
      try {
        if (sourceId) {
          // Try to find an existing map for this content
          const { data: contentMapLinks, error: linkError } = await supabase
            .from('content_maps')
            .select('map_id')
            .eq('content_id', sourceId);
            
          if (linkError) {
            console.error("Error fetching map links:", linkError);
            generateMapData();
            return;
          }
          
          if (contentMapLinks && contentMapLinks.length > 0) {
            // Found an existing map, fetch it
            const { data: mapData, error: mapError } = await supabase
              .from('maps')
              .select('*')
              .eq('id', contentMapLinks[0].map_id)
              .single();
              
            if (mapError) {
              console.error("Error fetching map data:", mapError);
              generateMapData();
              return;
            }
            
            setMapData(mapData.content);
            setIsLoading(false);
            return;
          }
        }
        
        // If no source ID or no existing map, check for maps by type
        const { data: maps, error } = await supabase
          .from('maps')
          .select('*')
          .eq('type', mapType)
          .limit(1);
          
        if (error || !maps || maps.length === 0) {
          console.log("No existing maps found, generating new map data");
          generateMapData();
          return;
        }
        
        setMapData(maps[0].content);
        setIsLoading(false);
      } catch (error) {
        console.error("Error in map data fetch:", error);
        generateMapData();
      }
    };
    
    // Generate map data for visualization
    const generateMapData = async () => {
      try {
        if (!regionData || regionData.length === 0) {
          // If no region data provided, use mock data
          generateMockMapData();
          return;
        }
        
        // Call the Supabase Edge Function to generate map data
        const { data, error } = await supabase.functions.invoke('generate-map-data', {
          body: { 
            entities: regionData,
            mapType: mapType,
            sourceType: sourceType,
            sourceId: sourceId,
            storeMap: true
          }
        });
        
        if (error) {
          console.error("Error calling generate-map-data function:", error);
          generateMockMapData();
          return;
        }
        
        console.log("Generated map data:", data);
        setMapData(data.mapContent);
        setIsLoading(false);
        
        // If callback provided and map was stored, notify parent
        if (onMapGenerated && data.mapId) {
          onMapGenerated(data.mapId);
        }
      } catch (error) {
        console.error("Error generating map data:", error);
        generateMockMapData();
      }
    };
    
    // Generate mock map data for demonstration with appropriate focus areas
    const generateMockMapData = () => {
      // This is a fallback for demo purposes
      const regions = getMockRegionsForType(mapType);
      const focusArea = getMapFocusAreaForType(mapType, regions);
      
      const mockData: MapData = {
        mapType: mapType,
        title: mapTitle,
        regions: regions,
        settings: {
          zoom: focusArea.zoom,
          center: focusArea.center,
          style: getMapStyleForType(mapType),
          bounds: focusArea.bounds
        },
        legend: {
          title: "Key Elements",
          items: regions.slice(0, 3).map(region => ({
            label: region.name,
            color: region.color
          }))
        },
        metadata: {
          generatedFrom: sourceType || "Historical Analysis",
          timeperiod: mapType === 'historical' ? {
            start: regions[0]?.startYear?.toString() || "1066",
            end: regions[0]?.endYear?.toString() || "1279"
          } : undefined
        }
      };
      
      setTimeout(() => {
        setMapData(mockData);
        setIsLoading(false);
      }, 800); // Simulate network delay
    };
    
    // Start the data fetching process
    if (sourceId) {
      fetchExistingMapData();
    } else {
      generateMapData();
    }
    
  }, [mapType, mapTitle, mapSubtitle, regionData, sourceId, sourceType]);
  
  // Initialize and update the map when mapData changes or after loading finishes
  useEffect(() => {
    if (isLoading || !mapData || !mapContainerRef.current) return;
    
    // Initialize map if it doesn't exist
    if (!mapInstance.current) {
      const mapStyle = currentStyle?.basemapStyle || getMapboxStyleForType(mapType);
      const center = mapData.settings?.center || [0, 20];
      const zoom = mapData.settings?.zoom || 2;
      
      mapInstance.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: mapStyle,
        center: center,
        zoom: zoom,
        projection: mapType === 'relief' ? 'globe' : 'mercator',
        attributionControl: false
      });
      
      // Add navigation controls
      mapInstance.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add attribution
      mapInstance.current.addControl(new mapboxgl.AttributionControl({ compact: true }));
      
      // Wait for map to load before adding data
      mapInstance.current.on('load', () => {
        applyCustomMapStyle(mapInstance.current!, currentStyle);
        addMapData(mapInstance.current!, mapData);
        
        // Fit map to bounds if provided
        if (mapData.settings?.bounds) {
          mapInstance.current!.fitBounds(mapData.settings.bounds, {
            padding: 50,
            duration: 1000
          });
        }
      });
    } else {
      // The map already exists, just update it
      const map = mapInstance.current;
      
      // Update map style if needed
      if (currentStyle?.basemapStyle) {
        map.setStyle(currentStyle.basemapStyle);
        
        // Re-add data after style change
        map.once('style.load', () => {
          applyCustomMapStyle(map, currentStyle);
          addMapData(map, mapData);
          
          // Fit map to bounds if provided
          if (mapData.settings?.bounds) {
            map.fitBounds(mapData.settings.bounds, {
              padding: 50,
              duration: 1000
            });
          }
        });
      } else {
        // Update map data directly
        addMapData(map, mapData);
        
        // Fit map to bounds if provided
        if (mapData.settings?.bounds) {
          map.fitBounds(mapData.settings.bounds, {
            padding: 50,
            duration: 1000
          });
        } else {
          // Update center and zoom
          if (mapData.settings?.center) {
            map.setCenter(mapData.settings.center);
          }
          if (mapData.settings?.zoom) {
            map.setZoom(mapData.settings.zoom);
          }
        }
      }
    }
    
  }, [isLoading, mapData, mapType]);
  
  // Update map style when currentStyle changes
  useEffect(() => {
    if (!mapInstance.current || !currentStyle) return;
    
    const map = mapInstance.current;
    
    // Update the map style
    if (map.isStyleLoaded()) {
      applyCustomMapStyle(map, currentStyle);
    } else {
      map.once('style.load', () => {
        applyCustomMapStyle(map, currentStyle);
      });
    }
  }, [currentStyle]);
  
  // Apply custom map style
  const applyCustomMapStyle = (map: mapboxgl.Map, style?: MapStyle) => {
    if (!style || !map.isStyleLoaded()) return;
    
    try {
      // Apply filters using CSS
      const mapContainer = mapContainerRef.current;
      if (mapContainer) {
        // Apply filter
        mapContainer.style.filter = style.filter;
        
        // Apply font family to container
        mapContainer.style.fontFamily = style.fontFamily;
      }
      
      // Modify the map style layers
      if (map.getLayer('background')) {
        map.setPaintProperty('background', 'background-color', style.background);
      }
      
      if (map.getLayer('water')) {
        map.setPaintProperty('water', 'fill-color', style.water);
      }
      
      if (map.getLayer('land')) {
        map.setPaintProperty('land', 'fill-color', style.land);
      }
      
      // Update text colors
      const textLayers = map.getStyle().layers.filter(layer => 
        layer.id.includes('label') || layer.id.includes('text')
      );
      
      textLayers.forEach(layer => {
        if (layer.type === 'symbol' && map.getLayer(layer.id)) {
          map.setPaintProperty(layer.id, 'text-color', style.text);
        }
      });
      
      // Update border styles if applicable
      const lineLayers = map.getStyle().layers.filter(layer => 
        layer.type === 'line' && (layer.id.includes('border') || layer.id.includes('boundary'))
      );
      
      lineLayers.forEach(layer => {
        if (map.getLayer(layer.id)) {
          map.setPaintProperty(layer.id, 'line-color', style.borderColor);
          map.setPaintProperty(layer.id, 'line-width', style.borderWidth);
        }
      });
      
      // If we have custom region-points, update their styling as well
      if (map.getLayer('region-points')) {
        map.setPaintProperty('region-points', 'circle-stroke-width', style.borderWidth);
      }
      
      // Style the region labels
      if (map.getLayer('region-labels')) {
        map.setPaintProperty('region-labels', 'text-color', style.text);
        map.setLayoutProperty('region-labels', 'text-font', [style.fontFamily.split(',')[0].replace(/'/g, '')]);
      }
      
    } catch (error) {
      console.error("Error applying custom map style:", error);
    }
  };
  
  // Function to add map data to the Mapbox instance
  const addMapData = (map: mapboxgl.Map, mapData: MapData) => {
    if (!mapData.regions || !mapData.regions.length) return;
    
    // Remove existing sources and layers
    if (map.getSource('regions')) {
      map.removeLayer('region-points');
      map.removeLayer('region-labels');
      map.removeSource('regions');
    }
    
    // Create GeoJSON feature collection for map points
    const geojson = {
      type: 'FeatureCollection' as const,
      features: mapData.regions.map(region => ({
        type: 'Feature' as const,
        properties: {
          id: region.id,
          name: region.name,
          description: region.description || '',
          significance: region.significance,
          color: region.color,
          startYear: region.startYear,
          endYear: region.endYear,
          type: region.type
        },
        geometry: {
          type: 'Point' as const,
          coordinates: region.coordinates
        }
      }))
    };
    
    // Add source for regions
    map.addSource('regions', {
      type: 'geojson',
      data: geojson
    });
    
    // Add point layer for regions
    map.addLayer({
      id: 'region-points',
      type: 'circle',
      source: 'regions',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['get', 'significance'],
          1, 5,
          10, 20
        ],
        'circle-color': ['get', 'color'],
        'circle-opacity': 0.6,
        'circle-stroke-color': ['get', 'color'],
        'circle-stroke-width': 1,
        'circle-stroke-opacity': 0.9
      }
    });
    
    // Add text labels for regions
    map.addLayer({
      id: 'region-labels',
      type: 'symbol',
      source: 'regions',
      layout: {
        'text-field': [
          'format',
          ['get', 'name'],
          { 'font-scale': 1.0 },
          '\n',
          {},
          ['case',
            ['all', ['has', 'startYear'], ['has', 'endYear']],
            [
              'format',
              ['concat', '(', ['to-string', ['get', 'startYear']], '-', ['to-string', ['get', 'endYear']], ')'],
              { 'font-scale': 0.8 }
            ],
            ''
          ]
        ],
        'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
        'text-offset': [0, 1.5],
        'text-anchor': 'top',
        'text-size': 12,
        'text-allow-overlap': false,
        'text-max-width': 12
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': 'rgba(0, 0, 0, 0.9)',
        'text-halo-width': 1.5
      }
    });
    
    // Add popups on click
    map.on('click', 'region-points', (e) => {
      if (!e.features || e.features.length === 0) return;
      
      const feature = e.features[0];
      const props = feature.properties;
      
      if (!feature.geometry || feature.geometry.type !== 'Point') return;
      
      // Get coordinates using Mapbox's point geometry type
      const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
      
      // Format popup content
      let popupContent = `<h3>${props.name}</h3>`;
      if (props.startYear && props.endYear) {
        popupContent += `<p>${props.startYear} - ${props.endYear}</p>`;
      }
      if (props.description) {
        popupContent += `<p>${props.description}</p>`;
      }
      
      // Create and show popup
      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(popupContent)
        .addTo(map);
    });
    
    // Change cursor on hover
    map.on('mouseenter', 'region-points', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    
    map.on('mouseleave', 'region-points', () => {
      map.getCanvas().style.cursor = '';
    });
  };
  
  // Get mock regions data based on map type with more historical context
  const getMockRegionsForType = (type: string): MapRegion[] => {
    switch (type) {
      case 'historical':
        return [
          { id: 'roman_empire', name: 'Roman Empire', coordinates: [12.5, 41.9], significance: 10, color: '#8E76DB', startYear: 117, endYear: 476, type: 'empire', description: 'The Roman Empire at its greatest territorial extent under Emperor Trajan.' },
          { id: 'constantinople', name: 'Constantinople', coordinates: [28.9, 41.0], significance: 9, color: '#6A9CE2', startYear: 330, endYear: 1453, type: 'capital', description: 'Capital of the Byzantine Empire and major cultural center.' },
          { id: 'athens', name: 'Athens', coordinates: [23.7, 37.9], significance: 8, color: '#76CCB9', startYear: -500, endYear: -323, type: 'city-state', description: 'Center of Greek civilization and birthplace of democracy.' },
          { id: 'alexandria', name: 'Alexandria', coordinates: [29.9, 31.2], significance: 8, color: '#EB6784', startYear: -331, endYear: 641, type: 'city', description: 'Major Hellenistic cultural center founded by Alexander the Great.' }
        ];
      case 'thematic':
        return [
          { id: 'agricultural_revolution', name: 'Agricultural Revolution', coordinates: [44.0, 33.0], significance: 10, color: '#8E76DB', startYear: -10000, endYear: -8000, type: 'development', description: 'Birth of farming in the Fertile Crescent.' },
          { id: 'silk_road_east', name: 'Silk Road (East)', coordinates: [80.0, 41.0], significance: 9, color: '#6A9CE2', startYear: -200, endYear: 1450, type: 'trade', description: 'Eastern section of the ancient trade network connecting East and West.' },
          { id: 'silk_road_west', name: 'Silk Road (West)', coordinates: [35.0, 40.0], significance: 9, color: '#76CCB9', startYear: -200, endYear: 1450, type: 'trade', description: 'Western section of the trade route connecting China with the Mediterranean.' },
          { id: 'plague_europe', name: 'Black Death', coordinates: [15.0, 45.0], significance: 8, color: '#EB6784', startYear: 1347, endYear: 1351, type: 'pandemic', description: 'Devastating plague that killed 30-60% of Europe\'s population.' }
        ];
      case 'outline':
        return [
          { id: 'mesopotamia', name: 'Mesopotamia', coordinates: [44.0, 33.0], significance: 10, color: '#8E76DB', startYear: -3500, endYear: -500, type: 'region', description: 'The "Cradle of Civilization" between the Tigris and Euphrates rivers.' },
          { id: 'nile_valley', name: 'Nile Valley', coordinates: [31.2, 30.0], significance: 9, color: '#6A9CE2', startYear: -3000, endYear: -30, type: 'region', description: 'Ancient Egyptian civilization centered on the Nile.' },
          { id: 'indus_valley', name: 'Indus Valley', coordinates: [72.0, 24.0], significance: 8, color: '#76CCB9', startYear: -3300, endYear: -1300, type: 'region', description: 'Early urbanized society in South Asia.' },
          { id: 'yellow_river', name: 'Yellow River Valley', coordinates: [114.0, 34.0], significance: 8, color: '#EB6784', startYear: -1800, endYear: -200, type: 'region', description: 'Birthplace of Chinese civilization.' }
        ];
      case 'relief':
        return [
          { id: 'himalaya', name: 'Himalayan Mountains', coordinates: [86.9, 27.9], significance: 10, color: '#8C7B68', type: 'mountain', description: 'Natural barrier that shaped Asian civilizations and trade routes.' },
          { id: 'mediterranean', name: 'Mediterranean Sea', coordinates: [15.0, 38.0], significance: 10, color: '#6A9CE2', type: 'sea', description: 'Major route for trade and cultural exchange in the ancient world.' },
          { id: 'sahara', name: 'Sahara Desert', coordinates: [2.0, 23.0], significance: 9, color: '#D4B16A', type: 'desert', description: 'Natural barrier that isolated Sub-Saharan Africa.' },
          { id: 'ganges', name: 'Ganges Plain', coordinates: [83.0, 25.3], significance: 8, color: '#76CCB9', type: 'plain', description: 'Fertile region that supported dense populations and major Indian civilizations.' }
        ];
      case 'interactive':
        return [
          { id: 'mongol_empire', name: 'Mongol Empire', coordinates: [107.0, 47.9], significance: 10, color: '#8E76DB', startYear: 1206, endYear: 1368, type: 'empire', description: 'Largest contiguous land empire in history.' },
          { id: 'viking_expansion', name: 'Viking Expansion', coordinates: [10.7, 59.9], significance: 8, color: '#6A9CE2', startYear: 793, endYear: 1066, type: 'expansion', description: 'Norse seafarers who raided, traded, and settled throughout Europe.' },
          { id: 'crusades', name: 'Crusades', coordinates: [35.2, 31.8], significance: 9, color: '#EB6784', startYear: 1095, endYear: 1291, type: 'conflict', description: 'Series of religious wars sanctioned by the Latin Church.' },
          { id: 'islamic_caliphate', name: 'Islamic Caliphate', coordinates: [39.8, 21.4], significance: 10, color: '#76CCB9', startYear: 632, endYear: 750, type: 'empire', description: 'Early Islamic state established after Muhammad\'s death.' }
        ];
      case 'concept':
        return [
          { id: 'democracy_athens', name: 'Athenian Democracy', coordinates: [23.7, 37.9], significance: 9, color: '#8E76DB', startYear: -508, endYear: -322, type: 'concept', description: 'First known democracy in the world.' },
          { id: 'magna_carta', name: 'Magna Carta', coordinates: [-0.8, 51.4], significance: 8, color: '#6A9CE2', startYear: 1215, endYear: 1215, type: 'document', description: 'Charter of rights limiting monarchical powers.' },
          { id: 'renaissance_florence', name: 'Renaissance', coordinates: [11.2, 43.8], significance: 10, color: '#76CCB9', startYear: 1400, endYear: 1600, type: 'movement', description: 'Cultural movement that profoundly affected European intellectual life.' },
          { id: 'enlightenment_paris', name: 'Enlightenment', coordinates: [2.3, 48.8], significance: 9, color: '#EB6784', startYear: 1715, endYear: 1789, type: 'movement', description: 'Intellectual movement emphasizing reason and individualism.' }
        ];
      default:
        return [];
    }
  };
  
  // Get map focus area (center, zoom, bounds) for different map types
  const getMapFocusAreaForType = (type: string, regions: MapRegion[]) => {
    // Calculate bounds based on region coordinates
    const calculateBounds = (regions: MapRegion[]): [[number, number], [number, number]] | undefined => {
      if (!regions.length) return undefined;
      
      let minLng = regions[0].coordinates[0];
      let maxLng = regions[0].coordinates[0];
      let minLat = regions[0].coordinates[1];
      let maxLat = regions[0].coordinates[1];
      
      regions.forEach(region => {
        minLng = Math.min(minLng, region.coordinates[0]);
        maxLng = Math.max(maxLng, region.coordinates[0]);
        minLat = Math.min(minLat, region.coordinates[1]);
        maxLat = Math.max(maxLat, region.coordinates[1]);
      });
      
      // Add padding around bounds
      const padLng = (maxLng - minLng) * 0.3;
      const padLat = (maxLat - minLat) * 0.3;
      
      return [
        [minLng - padLng, minLat - padLat],
        [maxLng + padLng, maxLat + padLat]
      ];
    };
    
    // Calculate center based on regions
    const calculateCenter = (regions: MapRegion[]): [number, number] => {
      if (!regions.length) return [0, 20];
      
      const sumLng = regions.reduce((sum, region) => sum + region.coordinates[0], 0);
      const sumLat = regions.reduce((sum, region) => sum + region.coordinates[1], 0);
      
      return [sumLng / regions.length, sumLat / regions.length];
    };
    
    const bounds = calculateBounds(regions);
    const center = calculateCenter(regions);
    
    switch (type) {
      case 'historical':
        return {
          center: center,
          zoom: 5,
          bounds: bounds
        };
      case 'thematic':
        return {
          center: [60, 40], // Centered on Eurasia for trade routes
          zoom: 3,
          bounds: bounds
        };
      case 'outline':
        return {
          center: [60, 30], // Centered on early civilizations
          zoom: 4,
          bounds: bounds
        };
      case 'relief':
        return {
          center: center,
          zoom: 4,
          bounds: bounds
        };
      case 'interactive':
        return {
          center: center,
          zoom: 4,
          bounds: bounds
        };
      case 'concept':
        return {
          center: [15, 40], // Centered on Mediterranean/Europe for most concept examples
          zoom: 4,
          bounds: bounds
        };
      default:
        return {
          center: [0, 20],
          zoom: 2,
          bounds: undefined
        };
    }
  };
  
  // Get Mapbox style URL based on map type
  const getMapboxStyleForType = (type: string): string => {
    switch (type) {
      case 'historical':
        return 'mapbox://styles/mapbox/light-v11';
      case 'thematic':
        return 'mapbox://styles/mapbox/light-v11';
      case 'outline':
        return 'mapbox://styles/mapbox/streets-v12';
      case 'relief':
        return 'mapbox://styles/mapbox/outdoors-v12';
      case 'interactive':
        return 'mapbox://styles/mapbox/dark-v11';
      case 'concept':
        return 'mapbox://styles/mapbox/dark-v11';
      default:
        return 'mapbox://styles/mapbox/light-v11';
    }
  };
  
  // Get map style based on type (for non-Mapbox fallback)
  const getMapStyleForType = (type: string) => {
    switch (type) {
      case 'historical': return 'satellite';
      case 'thematic': return 'light';
      case 'outline': return 'light';
      case 'relief': return 'terrain';
      case 'interactive': return 'streets';
      case 'concept': return 'dark';
      default: return 'light';
    }
  };
  
  // Get background styling for different map types (for loading state)
  const getMapBackgroundForType = (type: string) => {
    switch (type) {
      case 'historical': 
        return 'radial-gradient(circle at center, #283048 0%, #141E30 100%)';
      case 'thematic': 
        return 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
      case 'outline': 
        return '#f8f9fa';
      case 'relief': 
        return 'linear-gradient(135deg, #94B49F 0%, #D8E9A8 100%)';
      case 'interactive': 
        return 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)';
      case 'concept': 
        return 'radial-gradient(circle at center, #232526 0%, #414345 100%)';
      default: 
        return '#f5f7fa';
    }
  };
  
  // Handle export map functionality
  const handleExportMap = () => {
    if (!mapInstance.current) return;
    
    // Get map canvas and convert to image
    const canvas = mapInstance.current.getCanvas();
    const dataUrl = canvas.toDataURL('image/png');
    
    // Create download link
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${mapData?.title || mapTitle}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Map Exported",
      description: `${mapData?.title || mapTitle} has been exported as an image`,
    });
  };
  
  // Rendering map legends based on the data
  const renderMapLegend = () => {
    if (!mapData || !mapData.legend || !mapData.legend.items) return null;
    
    return (
      <div className="absolute bottom-4 left-4 p-3 bg-background/80 backdrop-blur-sm border border-galaxy-nova/30 rounded-md text-xs space-y-2 max-w-[200px] z-10">
        <p className="font-medium text-foreground/90">{mapData.legend.title || "Legend"}</p>
        <div className="space-y-1">
          {mapData.legend.items.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: item.color || '#8E76DB' }}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render map or loading state
  return (
    <div className="relative w-full h-full">
      {isLoading ? (
        <div 
          className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center"
          style={{ background: getMapBackgroundForType(mapType) }}
        >
          <Loader className="w-8 h-8 text-white animate-spin opacity-70" />
        </div>
      ) : (
        <div className="w-full h-full rounded-xl overflow-hidden relative">
          <div ref={mapContainerRef} className="absolute inset-0" />
          {renderMapLegend()}
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="outline"
              size="sm"
              className="bg-background/50 backdrop-blur-sm border-galaxy-nova/30 hover:bg-background/70 hover:border-galaxy-nova/50"
              onClick={handleExportMap}
            >
              Export Map
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapDisplay;
