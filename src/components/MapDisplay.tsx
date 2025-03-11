
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapStyle } from './MapStyleEditor';
import { Skeleton } from "@/components/ui/skeleton";
import { Info } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { mockHistoricalData } from '@/utils/mockData';
import { toast } from "@/hooks/use-toast";

// Initialize with a default token, but we'll try to get it from Supabase
mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

interface MapDisplayProps {
  mapType: string;
  mapTitle?: string;
  mapSubtitle?: string;
  regionData?: any[];
  currentStyle?: MapStyle;
  useMockData?: boolean;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ 
  mapType, 
  mapTitle = "Historical Map", 
  mapSubtitle = "Interactive visualization",
  regionData = [],
  currentStyle,
  useMockData = false
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [mockDataLoaded, setMockDataLoaded] = useState(false);

  // Function to update the Mapbox token
  const updateMapboxToken = (token: string) => {
    if (token && token.trim() !== '') {
      mapboxgl.accessToken = token;
      // If we already tried to create a map and failed, try again
      if (tokenError && mapContainer.current && !map.current) {
        initializeMap();
      }
      setTokenError(false);
      // Save token to localStorage for future use
      localStorage.setItem('mapbox_token', token);
    }
  };

  // Try to load token from localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken) {
      updateMapboxToken(savedToken);
    }
  }, []);

  // Initialize map function
  const initializeMap = () => {
    if (map.current || !mapContainer.current) return;

    try {
      const initialStyle = currentStyle?.basemapStyle || 'mapbox://styles/mapbox/light-v11';
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: initialStyle,
        center: [10, 40], // Center on Europe/Mediterranean for historical maps
        zoom: 2,
        projection: 'globe',
        pitch: 40,
        bearing: 0,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Set the map as loaded
      map.current.on('load', () => {
        setMapLoaded(true);
      });

      // Catch any errors during initialization
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        // Fix the error by checking if e.error exists and has a status property
        if (e.error && typeof e.error === 'object' && 'status' in e.error && e.error.status === 401) {
          setTokenError(true);
          map.current?.remove();
          map.current = null;
        }
      });

      // Apply initial container styles if available
      if (currentStyle && mapContainer.current) {
        mapContainer.current.style.filter = currentStyle.filter;
        mapContainer.current.style.fontFamily = currentStyle.fontFamily;
      }
    } catch (error) {
      console.error("Error initializing map:", error);
      setTokenError(true);
    }
  };

  // Initialize map
  useEffect(() => {
    initializeMap();

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Apply map style based on the currentStyle prop
  useEffect(() => {
    if (!map.current || !mapLoaded || !currentStyle) return;

    // Apply the style to the map
    try {
      // Change the base map style if it's different
      if (map.current.getStyle().name !== currentStyle.basemapStyle) {
        map.current.setStyle(currentStyle.basemapStyle);
      }

      // Apply custom styles once the style is loaded
      map.current.once('style.load', () => {
        if (!map.current) return;

        // Apply water color
        map.current.setPaintProperty('water', 'fill-color', currentStyle.water);

        // Apply land color to background
        map.current.setPaintProperty('land', 'fill-color', currentStyle.land);
        
        // Apply text color to all symbol layers
        const layers = map.current.getStyle().layers;
        if (layers) {
          layers.forEach(layer => {
            if (layer.type === 'symbol') {
              map.current?.setPaintProperty(layer.id, 'text-color', currentStyle.text);
            }
          });
        }

        // Apply container style
        if (mapContainer.current) {
          mapContainer.current.style.filter = currentStyle.filter;
          mapContainer.current.style.fontFamily = currentStyle.fontFamily;
        }
      });
    } catch (error) {
      console.error("Error applying map style:", error);
    }
  }, [currentStyle, mapLoaded]);

  // Update map based on mapType
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Different configurations based on map type
    switch (mapType) {
      case 'historical':
        map.current.setZoom(3);
        map.current.setCenter([20, 35]); // Mediterranean/Europe
        map.current.setPitch(45);
        break;
      case 'thematic':
        map.current.setZoom(2);
        map.current.setCenter([0, 20]);
        map.current.setPitch(30);
        break;
      case 'outline':
        map.current.setZoom(1.5);
        map.current.setCenter([0, 0]);
        map.current.setPitch(0);
        break;
      case 'relief':
        map.current.setZoom(3);
        map.current.setCenter([90, 30]); // Asia
        map.current.setPitch(60);
        break;
      case 'interactive':
        map.current.setZoom(2);
        map.current.setCenter([0, 30]);
        map.current.setPitch(40);
        break;
      case 'concept':
        map.current.setZoom(2);
        map.current.setCenter([-30, 40]);
        map.current.setPitch(20);
        break;
      default:
        map.current.setZoom(2);
        map.current.setCenter([0, 30]);
    }
  }, [mapType, mapLoaded]);

  // Function to load mock historical data onto the map
  const loadMockHistoricalData = () => {
    if (!map.current || !mapLoaded) return [];
    
    // Transform historical entities to map-compatible format
    return mockHistoricalData.map(entity => {
      // Generate deterministic coordinates based on entity name
      const nameHash = entity.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const longitude = ((nameHash % 340) - 170) * 0.5; // Range from -85 to 85
      const latitude = ((nameHash * 13) % 150 - 75) * 0.5; // Range from -37.5 to 37.5
      
      // Pick a color based on entity group
      const groupColors: Record<string, string> = {
        'Culture': '#8E76DB',
        'Art': '#6A9CE2',
        'Architecture': '#76CCB9',
        'Literature': '#EB6784',
        'Science': '#FFB572',
        'Religion': '#A3A1FB',
        'Exploration': '#5EC2CC',
        'Technology': '#D5A5F8'
      };
      
      const color = entity.group && groupColors[entity.group] ? 
        groupColors[entity.group] : 
        '#' + ((nameHash * 123456) % 16777215).toString(16).padStart(6, '0');
      
      return {
        id: entity.id,
        name: entity.name,
        description: entity.description || '',
        coordinates: [longitude, latitude] as [number, number],
        significance: entity.significance || 5,
        color: color,
        startYear: entity.startDate ? parseInt(entity.startDate) : null,
        endYear: entity.endDate ? parseInt(entity.endDate) : null,
        type: entity.type
      };
    });
  };

  // Load and add map data points
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    const markers = document.getElementsByClassName('mapboxgl-marker');
    while (markers[0]) {
      markers[0].remove();
    }

    // Determine which data to use
    let dataToShow = regionData;
    
    // If useMockData is enabled or no regionData is provided, use mock data
    if (useMockData || (regionData.length === 0 && !mockDataLoaded)) {
      dataToShow = loadMockHistoricalData();
      if (useMockData && !mockDataLoaded) {
        setMockDataLoaded(true);
        toast({
          title: "Mock Data Loaded",
          description: "Using sample historical data for map visualization",
        });
      }
    }

    // Add sample data points if no data is available
    if (dataToShow.length === 0) {
      const samplePoints = [
        { coordinates: [12.496366, 41.902782], name: "Rome" },
        { coordinates: [2.352222, 48.856614], name: "Paris" },
        { coordinates: [28.979530, 41.015137], name: "Istanbul" },
        { coordinates: [31.233334, 30.033333], name: "Cairo" },
        { coordinates: [116.407395, 39.904211], name: "Beijing" },
        { coordinates: [-74.005941, 40.712784], name: "New York" },
        { coordinates: [-43.172897, -22.906847], name: "Rio de Janeiro" },
        { coordinates: [37.617300, 55.755826], name: "Moscow" }
      ];

      // Add markers for sample points
      samplePoints.forEach(point => {
        // Create a DOM element for the marker
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.width = '15px';
        el.style.height = '15px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = currentStyle?.borderColor || '#8e7651';
        el.style.border = `2px solid ${currentStyle?.borderColor || '#8e7651'}`;
        el.style.opacity = '0.8';
        el.style.cursor = 'pointer';

        // Add markers to the map
        new mapboxgl.Marker(el)
          .setLngLat(point.coordinates as [number, number])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(point.name))
          .addTo(map.current!);
      });
    } else {
      // Add markers for actual data points
      dataToShow.forEach(point => {
        if (!point.coordinates || !Array.isArray(point.coordinates)) {
          console.warn("Invalid coordinates for point:", point);
          return;
        }

        // Create a DOM element for the marker
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.width = `${Math.min(point.significance || 5, 10) + 5}px`;
        el.style.height = `${Math.min(point.significance || 5, 10) + 5}px`;
        el.style.borderRadius = '50%';
        el.style.backgroundColor = point.color || currentStyle?.borderColor || '#8e7651';
        el.style.border = `2px solid ${currentStyle?.borderColor || '#8e7651'}`;
        el.style.opacity = '0.8';
        el.style.cursor = 'pointer';

        // Create popup content with more detailed information
        const popupContent = document.createElement('div');
        popupContent.innerHTML = `
          <h3 class="text-sm font-medium">${point.name}</h3>
          ${point.type ? `<p class="text-xs text-foreground/70">${point.type}</p>` : ''}
          ${point.startYear ? `<p class="text-xs">Period: ${point.startYear}${point.endYear ? ` - ${point.endYear}` : ''}</p>` : ''}
          ${point.description ? `<p class="text-xs mt-1">${point.description.slice(0, 100)}${point.description.length > 100 ? '...' : ''}</p>` : ''}
        `;

        // Add markers to the map
        new mapboxgl.Marker(el)
          .setLngLat(point.coordinates as [number, number])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupContent))
          .addTo(map.current!);
      });
    }
  }, [mapLoaded, mapType, currentStyle, regionData, useMockData]);

  // Handle token input submission
  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMapboxToken(tokenInput);
  };

  // Toggle mock data
  const toggleMockData = () => {
    setMockDataLoaded(!mockDataLoaded);
  };

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-galaxy-nova/30">
      {/* Map title overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
        <div className="bg-black/60 backdrop-blur-sm p-3 rounded-lg border border-galaxy-nova/30 shadow-lg max-w-[70%]">
          <h3 className="text-lg font-semibold text-foreground">{mapTitle}</h3>
          <p className="text-sm text-foreground/70">{mapSubtitle}</p>
        </div>
        <div className="bg-black/60 backdrop-blur-sm p-2 rounded-lg border border-galaxy-nova/30 shadow-lg">
          <Info className="w-5 h-5 text-galaxy-nova" />
        </div>
      </div>
      
      {/* Token error message and input form */}
      {tokenError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-30">
          <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border border-galaxy-nova/30 shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold text-foreground mb-4">Mapbox Token Required</h3>
            <p className="text-sm text-foreground/70 mb-4">
              Please enter a valid Mapbox public token to display the map. You can get one by signing up at 
              <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-galaxy-nova ml-1">mapbox.com</a>.
            </p>
            <form onSubmit={handleTokenSubmit} className="space-y-4">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Enter your Mapbox token"
                className="w-full p-2 rounded bg-background border border-galaxy-nova/30 text-foreground/90"
              />
              <button 
                type="submit"
                className="w-full py-2 px-4 bg-galaxy-nova/80 hover:bg-galaxy-nova rounded text-white transition-colors"
              >
                Submit Token
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Map container */}
      <div 
        ref={mapContainer} 
        className="w-full h-full min-h-[400px]"
        style={{
          filter: currentStyle?.filter || 'none',
          fontFamily: currentStyle?.fontFamily || 'inherit'
        }}
      />

      {/* Loading state */}
      {!mapLoaded && !tokenError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-20">
          <div className="space-y-4 text-center">
            <Skeleton className="h-[300px] w-[400px] rounded-lg bg-galaxy-nova/10" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px] mx-auto bg-galaxy-nova/10" />
              <Skeleton className="h-4 w-[200px] mx-auto bg-galaxy-nova/10" />
            </div>
          </div>
        </div>
      )}

      {/* Mock data toggle button */}
      {mapLoaded && (
        <div className="absolute bottom-4 left-4 z-10">
          <button
            onClick={toggleMockData}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              mockDataLoaded 
                ? 'bg-galaxy-nova text-white' 
                : 'bg-black/60 backdrop-blur-sm border border-galaxy-nova/30 text-foreground/70'
            }`}
          >
            {mockDataLoaded ? 'Using Mock Data' : 'Use Mock Data'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MapDisplay;
