
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapStyle } from './MapStyleEditor';
import { Skeleton } from "@/components/ui/skeleton";
import { Info } from 'lucide-react';

// Temporary Mapbox token - in production this should come from environment variables
mapboxgl.accessToken = 'pk.eyJ1IjoiZWR1bWFwcyIsImEiOiJjbHd4cjJodWIwMXcxMmxtbGVlNXRiOHd5In0.x-UbXjYgL-wRYx1P0D-pYQ';

interface MapDisplayProps {
  mapType: string;
  mapTitle?: string;
  mapSubtitle?: string;
  regionData?: any[];
  currentStyle?: MapStyle;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ 
  mapType, 
  mapTitle = "Historical Map", 
  mapSubtitle = "Interactive visualization",
  regionData = [],
  currentStyle
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

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

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

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

    // Apply initial container styles if available
    if (currentStyle && mapContainer.current) {
      mapContainer.current.style.filter = currentStyle.filter;
      mapContainer.current.style.fontFamily = currentStyle.fontFamily;
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

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

  // Add sample data points for demonstration
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    const markers = document.getElementsByClassName('mapboxgl-marker');
    while (markers[0]) {
      markers[0].remove();
    }

    // Add sample data points
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

    // Add markers
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

    // Add region data if available
    if (regionData && regionData.length > 0) {
      // Process and add region data...
      console.log("Region data available:", regionData);
    }
  }, [mapLoaded, mapType, currentStyle, regionData]);

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
      {!mapLoaded && (
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
    </div>
  );
};

export default MapDisplay;
