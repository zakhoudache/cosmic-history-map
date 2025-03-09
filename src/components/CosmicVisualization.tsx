<lov-code>
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HistoricalEntity, prepareVisualizationData } from '@/utils/mockData';
import { useAnimateOnMount } from '@/utils/animations';
import { Star, Users, Calendar, Map, Lightbulb, GitBranch } from 'lucide-react';
import VisualizationPlaceholder from './VisualizationPlaceholder';

interface CosmicVisualizationProps {
  entities?: HistoricalEntity[];
  onEntitySelect?: (entity: HistoricalEntity) => void;
}

// Extended entity type for D3 simulation
interface SimulationEntity extends HistoricalEntity, d3.SimulationNodeDatum {
  // Allow for D3 to add coordinates
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
}

// Link type for visualization
interface EntityLink {
  source: SimulationEntity;
  target: SimulationEntity;
  type?: string;
  strength: number;
}

// Helper color functions
function getEntityTypeColor(type: string, opacity: number = 1): string {
  switch (type) {
    case 'person':
      return `hsla(210, 100%, 60%, ${opacity})`;
    case 'event':
      return `hsla(30, 100%, 60%, ${opacity})`;
    case 'place':
      return `hsla(120, 70%, 60%, ${opacity})`;
    case 'concept':
      return `hsla(270, 70%, 60%, ${opacity})`;
    default:
      return `hsla(190, 70%, 60%, ${opacity})`;
  }
}

function lightenColor(color: string, amount: number): string {
  // Basic implementation to lighten HSLA colors
  return color.replace(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%/g, (_, h, s, l) => 
    `hsla(${h}, ${s}%, ${Math.min(100, Number(l) + amount)}%`
  );
}

function darkenColor(color: string, amount: number): string {
  // Basic implementation to darken HSLA colors
  return color.replace(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%/g, (_, h, s, l) => 
    `hsla(${h}, ${s}%, ${Math.max(0, Number(l) - amount)}%`
  );
}

const CosmicVisualization: React.FC<CosmicVisualizationProps> = ({ 
  entities,
  onEntitySelect
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const visualizationData: SimulationEntity[] = entities ? [...entities] as SimulationEntity[] : [];
  const isVisible = useAnimateOnMount(300);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const hasData = entities && entities.length > 0;
  
  // Initialize layout and resize handling
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const { width, height } = svgRef.current.parentElement?.getBoundingClientRect() || { width: 800, height: 600 };
        setDimensions({ width, height: Math.max(height, 500) });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);
  
  // Create and update visualization
  useEffect(() => {
    if (!hasData || !svgRef.current || !isVisible) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    // Set up the SVG
    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Create a defs section for gradients and filters
    const defs = svg.append("defs");
    
    // Add a space background gradient
    const bgGradient = defs.append("radialGradient")
      .attr("id", "space-background")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");
      
    bgGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "hsl(260, 60%, 15%)")
      .attr("stop-opacity", 1);
      
    bgGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "hsl(240, 70%, 5%)")
      .attr("stop-opacity", 1);
    
    // Add glow filter for nodes
    const glowFilter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    
    glowFilter.append("feGaussianBlur")
      .attr("stdDeviation", "5")
      .attr("result", "blur");
      
    glowFilter.append("feComposite")
      .attr("in", "SourceGraphic")
      .attr("in2", "blur")
      .attr("operator", "over");
    
    // Add a brighter inner glow filter
    const innerGlowFilter = defs.append("filter")
      .attr("id", "inner-glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    
    innerGlowFilter.append("feGaussianBlur")
      .attr("stdDeviation", "2")
      .attr("result", "blur");
      
    innerGlowFilter.append("feComposite")
      .attr("in", "SourceGraphic")
      .attr("in2", "blur")
      .attr("operator", "over");
    
    // Create entity-specific gradients
    visualizationData.forEach((entity, i) => {
      // Create a radial gradient for each entity
      const entityGradient = defs.append("radialGradient")
        .attr("id", `entity-gradient-${entity.id}`)
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%");
      
      // Get base color by entity type
      const baseColor = getEntityTypeColor(entity.type);
      
      entityGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", lightenColor(baseColor, 30))
        .attr("stop-opacity", 1);
        
      entityGradient.append("stop")
        .attr("offset", "70%")
        .attr("stop-color", baseColor)
        .attr("stop-opacity", 1);
        
      entityGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", darkenColor(baseColor, 20))
        .attr("stop-opacity", 1);
    });
    
    // Add the space background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#space-background)");
    
    // Add star field
    addStarField(svg, width, height, 200);
    
    // Add cosmic dust clouds
    addNebulaEffect(svg, width, height);
    
    // Calculate entity group membership
    const groupSets: Record<string, Set<string>> = {};
    
    visualizationData.forEach(entity => {
      if (entity.group) {
        if (!groupSets[entity.group]) {
          groupSets[entity.group] = new Set<string>();
        }
        groupSets[entity.group].add(entity.id);
      }
    });
    
    // Draw group ellipses
    if (Object.keys(groupSets).length > 0) {
      const groupLayer = svg.append("g").attr("class", "group-layer");
      
      Object.entries(groupSets).forEach(([groupName, entityIds], idx) => {
        // Calculate centroid for group
        const groupEntities = visualizationData.filter(e => entityIds.has(e.id));
        
        // Set default positions in case entities don't have x/y yet
        groupEntities.forEach(entity => {
          if (entity.x === undefined) entity.x = centerX + (Math.random() - 0.5) * 200;
          if (entity.y === undefined) entity.y = centerY + (Math.random() - 0.5) * 200;
        });
        
        const avgX = groupEntities.reduce((sum, e) => sum + (e.x || 0), 0) / groupEntities.length;
        const avgY = groupEntities.reduce((sum, e) => sum + (e.y || 0), 0) / groupEntities.length;
        
        const minX = Math.min(...groupEntities.map(e => e.x || 0));
        const maxX = Math.max(...groupEntities.map(e => e.x || 0));
        const minY = Math.min(...groupEntities.map(e => e.y || 0));
        const maxY = Math.max(...groupEntities.map(e => e.y || 0));
        
        const rx = Math.max(100, (maxX - minX) / 1.5);
        const ry = Math.max(100, (maxY - minY) / 1.5);
        
        // Draw ellipse for group
        const groupColor = `hsl(${idx * 60 % 360}, 70%, 30%)`;
        
        groupLayer.append("ellipse")
          .attr("cx", avgX || centerX)
          .attr("cy", avgY || centerY)
          .attr("rx", rx)
          .attr("ry", ry)
          .attr("fill", `${groupColor}33`)
          .attr("stroke", `${groupColor}66`)
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "5,5")
          .attr("opacity", 0)
          .transition()
          .duration(1000)
          .delay(800)
          .attr("opacity", 0.6);
        
        // Add group label
        groupLayer.append("text")
          .attr("x", (avgX || centerX) + rx * 0.7)
          .attr("y", (avgY || centerY) - ry * 0.7)
          .attr("text-anchor", "end")
          .attr("font-size", 14)
          .attr("font-weight", "bold")
          .attr("fill", `hsl(${idx * 60 % 360}, 70%, 80%)`)
          .attr("opacity", 0)
          .text(groupName.toUpperCase())
          .transition()
          .duration(1000)
          .delay(1200)
          .attr("opacity", 0.8);
      });
    }
    
    // Extract entity connections
    const getEntityConnections = (entity: SimulationEntity): EntityLink[] => {
      // Handle both 'connections' (from mock data) and 'relations' (from API)
      if (entity.relations && Array.isArray(entity.relations)) {
        return entity.relations
          .map(relation => {
            const targetId = relation.targetId;
            const target = visualizationData.find(e => e.id === targetId);
            if (target) {
              return { 
                source: entity, 
                target,
                type: relation.type || 'connected to',
                strength: relation.strength || 1
              } as EntityLink;
            }
            return null;
          })
          .filter(Boolean) as EntityLink[]; // Remove null values
      } 
      return [];
    };
    
    // Get all valid links
    const allLinks = visualizationData
      .flatMap(entity => getEntityConnections(entity))
      .filter(link => link !== null);
    
    // Create link gradients
    allLinks.forEach((link, i) => {
      if (!link) return;
      
      const linkGradient = defs.append("linearGradient")
        .attr("id", `link-gradient-${i}`)
        .attr("gradientUnits", "userSpaceOnUse");
      
      const sourceColor = getEntityTypeColor(link.source.type);
      const targetColor = getEntityTypeColor(link.target.type);
      
      linkGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", sourceColor);
        
      linkGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", targetColor);
    });
    
    // Custom force for d3 v7
    const customForceGrouping = (groupSets: Record<string, Set<string>>, strength: number) => {
      return (alpha: number) => {
        // Apply grouping force
        for (const [groupName, entityIds] of Object.entries(groupSets)) {
          // Get all nodes in this group
          const groupNodes = visualizationData.filter(node => 
            entityIds.has(node.id)
          );
          
          if (groupNodes.length < 2) continue;
          
          // Calculate centroid
          const groupCenterX = d3.mean(groupNodes, d => d.x) || 0;
          const groupCenterY = d3.mean(groupNodes, d => d.y) || 0;
          
          // Pull group nodes toward centroid
          groupNodes.forEach(node => {
            node.vx = (node.vx || 0) + (groupCenterX - (node.x || 0)) * alpha * strength;
            node.vy = (node.vy || 0) + (groupCenterY - (node.y || 0)) * alpha * strength;
          });
        }
      };
    };
    
    // Set up force simulation
    const simulation = d3.forceSimulation(visualizationData)
      .force("center", d3.forceCenter(centerX, centerY))
      .force("charge", d3.forceManyBody().strength(d => {
        const entity = d as SimulationEntity;
        return (entity.significance ? entity.significance * -70 : -200);
      }))
      .force("collision", d3.forceCollide().radius(d => {
        const entity = d as SimulationEntity;
        return (entity.significance || 5) * 5 + 30;
      }))
      .force("x", d3.forceX(centerX).strength(0.05))
      .force("y", d3.forceY(centerY).strength(0.05));
    
    // Add custom grouping force
    if (Object.keys(groupSets).length > 0) {
      simulation.on("tick.group", customForceGrouping(groupSets, 0.1));
    }
    
    // Create entity links
    const links = svg.append("g")
      .attr("class", "links")
      .selectAll("g")
      .data(allLinks)
      .enter()
      .append("g")
      .attr("class", "link");
    
    // Add link lines with gradients
    links.append("path")
      .attr("class", "link-path")
      .attr("stroke", (_, i) => `url(#link-gradient-${i})`)
      .attr("stroke-width", d => Math.max(1, d.strength * 1.5))
      .attr("fill", "none")
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 20)
      .duration(1000)
      .attr("opacity", 0.6);
    
    // Create link decorations
    links.each(function(d) {
      const linkG = d3.select(this);
      
      // Add pulsing particles to links for animated flow
      for (let i = 0; i < Math.ceil(d.strength); i++) {
        linkG.append("circle")
          .attr("r", 1.5)
          .attr("fill", "white")
          .attr("opacity", 0)
          .attr("class", `particle-${i}`)
          .transition()
          .delay(i * 300 + 1000)
          .duration(500)
          .attr("opacity", 0.8);
      }
    });
    
    // Create entity nodes
    const nodeGroups = svg.append("g")
      .attr("class", "nodes")
      .selectAll(".node")
      .data(visualizationData)
      .enter()
      .append("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        if (onEntitySelect) {
          onEntitySelect(d as SimulationEntity);
        }
      })
      .call(d3.drag<SVGGElement, SimulationEntity>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }) as any);
    
    // Add outer glow for each entity
    nodeGroups.append("circle")
      .attr("r", d => (d.significance || 5) * 4 + 15)
      .attr("fill", d => getEntityTypeColor(d.type, 0.2))
      .attr("filter", "url(#glow)")
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 100)
      .duration(1000)
      .attr("opacity", 1);
    
    // Add inner core for each entity
    nodeGroups.append("circle")
      .attr("r", d => (d.significance || 5) * 4 + 8)
      .attr("fill", d => `url(#entity-gradient-${d.id})`)
      .attr("stroke", d => getEntityTypeColor(d.type))
      .attr("stroke-width", 2)
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 100 + 200)
      .duration(800)
      .attr("opacity", 0.9);

    // Add orbital rings for more significant entities
    nodeGroups.filter(d => (d.significance || 0) > 7)
      .append("circle")
      .attr("r", d => (d.significance || 5) * 5 + 20)
      .attr("fill", "none")
      .attr("stroke", d => getEntityTypeColor(d.type))
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,6")
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 100 + 500)
      .duration(1000)
      .attr("opacity", 0.5);
    
    // Add entity type icons
    nodeGroups.append("g")
      .attr("class", "entity-icon")
      .attr("transform", d => `translate(-12, -12) scale(${0.8 + (d.significance || 5) / 10})`)
      .html(d => {
        const size = 24;
        const color = "white";
        
        switch (d.type) {
          case "person":
            return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
              <circle cx="12" cy="8" r="5"/>
              <path d="M20 21a8 8 0 0 0-16 0"/>
            </svg>`;
          case "event":
            return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 10h18"/>
              <path d="M16 2v2"/>
              <path d="M8 2v2"/>
            </svg>`;
          case "place":
            return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>`;
          case "concept":
            return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
              <path d="M12 2a8 8 0 0 0-8 8c0 2.2.7 4.3 2 6l6 6 6-6c1.3-1.7 2-3.8 2-6a8 8 0 0 0-8-8Z"/>
            </svg>`;
          default:
            return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
            </svg>`;
        }
      })
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 100 + 800)
      .duration(1000)
      .attr("opacity", 1);
    
    // Add ripple effect for significant entities
    nodeGroups.filter(d => d.significance && d.significance > 6)
      .each(function(d) {
        const node = d3.select(this);
        const baseRadius = (d.significance || 5) * 4 + 8;
        
        // First ripple
        const ripple1 = node.append("circle")
          .attr("r", baseRadius)
          .attr("fill", "none")
          .attr("stroke", getEntityTypeColor(d.type))
          .attr("stroke-width", 1.5)
          .attr("opacity", 0.7);
        
        // Second ripple
        const ripple2 = node.append("circle")
          .attr("r", baseRadius)
          .attr("fill", "none")
          .attr("stroke", getEntityTypeColor(d.type))
          .attr("stroke-width", 1)
          .attr("opacity", 0.5);
        
        // Animate ripples
        function animateRipple1() {
          ripple1
            .attr("r", baseRadius)
            .attr("opacity", 0.7)
            .transition()
            .duration(3000)
            .attr("r", baseRadius * 2)
            .attr("opacity", 0)
            .on("end", animateRipple1);
        }
        
        function animateRipple2() {
          ripple2
            .attr("r", baseRadius)
            .attr("opacity", 0.5)
            .transition()
            .duration(3000)
            .delay(1000)
            .attr("r", baseRadius * 1.7)
            .attr("opacity", 0)
            .on("end", animateRipple2);
        }
        
        setTimeout(() => {
          animateRipple1();
          animateRipple2();
        }, 1000 + (d.significance || 5) * 100);
      });
    
    // Add entity labels with enhanced styling
    nodeGroups.append("foreignObject")
      .attr("width", d => 120 + (d.significance || 5) * 4)
      .attr("height", 40)
      .attr("x", d => -(60 + (d.significance || 5) * 2))
      .attr("y", d => (d.significance || 5) * 4 + 15)
      .html(d => {
        const typeColor = getEntityTypeColor(d.type);
        const fontWeight = d.significance && d.significance > 7 ? 'bold' : 'normal';
        const fontSize = 12 + Math.min((d.significance || 5) / 3, 4);
        
        return `
          <div style="color: white; text-align: center; text-shadow: 0 0 5px ${typeColor}, 0 0 10px rgba(0,0,0,0.8); 
                      font-weight: ${fontWeight}; font-size: ${fontSize}px; overflow: hidden; width: 100%; height: 100%;">
            ${d.name}
          </div>
        `;
      })
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 100 + 1000)
      .duration(1000)
      .attr("opacity", 1);
    
    // Update positions on each simulation tick
    simulation.on("tick", () => {
      // Update link paths
      links.selectAll(".link-path")
        .attr("d", d => {
          if (!d.source.x || !d.source.y || !d.target.x || !d.target.y) return "";
          
          const sourceX = d.source.x;
          const sourceY = d.source.y;
          const targetX = d.target.x;
          const targetY = d.target.y;
          
          // Calculate path with curve
          const dx = targetX - sourceX;
          const dy = targetY - sourceY;
          const dr = Math.sqrt(dx * dx + dy * dy) * 1.2;
          
          return `M${sourceX},${sourceY}A${dr},${dr} 0 0,1 ${targetX},${targetY}`;
        });
      
      // Update link particles
      links.each(function(d) {
        if (!d.source.x || !d.source.y || !d.target.x || !d.target.y) return;
        
        const sourceX = d.source.x;
        const sourceY = d.source.y;
        const targetX = d.target.x;
        const targetY = d.target.y;
        
        // Calculate path length for parametric positioning
        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        const pathLength = Math.sqrt(dx * dx + dy * dy);
        
        // Update each particle
        for (let i = 0; i < Math.ceil(d.strength); i++) {
          // Calculate position along path (parametric)
          // Each particle has a different offset and speed
          const offset = (Date.now() / (2000 + i * 500)) % 1;
          const t = (offset + i * 0.3) % 1;
          
          // Cubic easing for more natural movement
          const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          
          // Calculate position along curved path
          const angle = Math.atan2(dy, dx);
          const arcFactor = 0.5;
          const midX = (sourceX + targetX) / 2;
          const midY = (sourceY + targetY) / 2 - Math.sin(angle) * pathLength * arcFactor;
          
          // Quadratic Bezier interpolation
          const u = 1 - eased;
          const x = u * u * sourceX + 2 * u * eased * midX + eased * eased * targetX;
          const y = u * u * sourceY + 2 * u * eased * midY + eased * eased * targetY;
          
          d3.select(this).select(`.particle-${i}`)
            .attr("cx", x)
            .attr("cy", y);
        }
      });
      
      // Update node positions
      nodeGroups.attr("transform", d => {
        return `translate(${d.x || 0}, ${d.y || 0})`;
      });
    });
    
    // Add legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(20, ${height - 120})`);
    
    legend.append("rect")
      .attr("width", 160)
      .attr("height", 110)
      .attr("rx", 8)
      .attr("fill", "rgba(0, 0, 0, 0.5)")
      .attr("stroke", "rgba(255, 255, 255, 0.2)")
      .attr("stroke-width", 1);
    
    const legendItems = legend.selectAll(".legend-item")
      .data([
        { type: "person", label: "Person", icon: Users },
        { type: "event", label: "Event", icon: Calendar },
        { type: "place", label: "Place", icon: Map },
        { type: "concept", label: "Concept", icon: Lightbulb }
      ])
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (_, i) => `translate(15, ${25 + i * 22})`);
    
    legendItems.append("circle")
      .attr("r", 6)
      .attr("fill", d => getEntityTypeColor(d.type));
      
    legendItems.append("text")
      .attr("x", 15)
      .attr("y", 4)
      .attr("fill", "white")
      .attr("font-size", 12)
      .text(d => d.label);
    
    // Stop simulation after a certain time to reduce CPU usage
    setTimeout(() => {
      simulation.stop();
    }, 15000);
    
    return () => {
      simulation.stop();
    };
  }, [visualizationData, isVisible, dimensions, onEntitySelect]);
  
  // Helper function to add star field
  function addStarField(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, width: number, height: number, count: number) {
    const stars = [];
    
    // Create varied star data
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 2;
      const opacity = Math.random() * 0.8 + 0.2;
      const blinkDuration = 2000 + Math.random() * 8000;
      const blinkDelay = Math.random() * 8000;
      
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size,
        opacity,
        blinkDuration,
        blinkDelay
      });
    }
    
    // Add stars to visualization
    const starGroup = svg.append("g").attr("class", "star-field");
    
    stars.forEach(star => {
      const starElement = starGroup.append("circle")
        .attr("cx", star.x)
        .attr("cy", star.y)
        .attr("r", star.size)
        .attr("fill", "white")
        .attr("opacity", star.opacity);
      
      // Add twinkling animation for some stars
      if (Math.random() > 0.6) {
        function blink() {
          starElement
            .transition()
            .duration(star.blinkDuration / 2)
            .delay(star.blinkDelay)
            .attr("opacity", star.opacity * 0.3)
            .transition()
            .duration(star.blinkDuration / 2)
            .attr("opacity", star.opacity)
            .on("end", blink);
        }
        
        blink();
      }
    });
    
    return starGroup;
  }
  
  // Helper function to add nebula effects
  function addNebulaEffect(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, width: number, height: number) {
    const defs = svg.select("defs");
    
    // Create noise filter for nebula texture
    const noise = defs.append("filter")
      .attr("id", "noise")
      .attr("x", "0%")
      .attr("y", "0%")
      .attr("width", "100%")
