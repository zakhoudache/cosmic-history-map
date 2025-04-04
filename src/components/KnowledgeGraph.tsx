
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { KnowledgeGraphNode, KnowledgeGraphEdge } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Search, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import VisualizationPlaceholder from './VisualizationPlaceholder';

interface CustomNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: string;
  properties?: Record<string, any>;
  x?: number;
  y?: number;
}

interface CustomLink extends d3.SimulationLinkDatum<CustomNode> {
  source: CustomNode;
  target: CustomNode;
  label?: string;
  type?: string;
}

interface KnowledgeGraphProps {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  onNodeClick?: (node: KnowledgeGraphNode) => void;
  isLoading?: boolean;
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ 
  nodes = [], 
  edges = [], 
  onNodeClick,
  isLoading = false
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Ensure nodes and edges have the required properties
  const processedNodes: CustomNode[] = nodes.map(node => ({
    ...node,
    id: node.id,
    label: node.label || node.id,
    type: node.type || 'default',
  }));

  const processedEdges: CustomLink[] = edges.map(edge => ({
    source: processedNodes.find(n => n.id === edge.source) as CustomNode || processedNodes[0],
    target: processedNodes.find(n => n.id === edge.target) as CustomNode || processedNodes[0],
    label: edge.label,
    type: edge.type
  }));

  // Function to toggle fullscreen
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Function to reset zoom
  const resetZoom = () => {
    if (!svgRef.current) return;
    
    d3.select(svgRef.current)
      .transition()
      .duration(750)
      .call(
        d3.zoom<SVGSVGElement, unknown>().transform as any,
        d3.zoomIdentity
      );
    
    setZoomLevel(1);
  };

  // Function to zoom in
  const zoomIn = () => {
    if (!svgRef.current) return;
    
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(
        d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
        1.3
      );
    
    setZoomLevel(prev => prev * 1.3);
  };

  // Function to zoom out
  const zoomOut = () => {
    if (!svgRef.current) return;
    
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(
        d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
        1 / 1.3
      );
    
    setZoomLevel(prev => prev / 1.3);
  };

  // Function to handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (!term) {
      setHighlightedNodes([]);
      return;
    }
    
    const matchedNodeIds = processedNodes
      .filter(node => 
        node.label.toLowerCase().includes(term.toLowerCase()) ||
        node.type.toLowerCase().includes(term.toLowerCase())
      )
      .map(node => node.id);
    
    setHighlightedNodes(matchedNodeIds);
  };

  // D3 visualization effect
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || processedNodes.length === 0) return;

    // Get container dimensions
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up the SVG
    const svg = d3.select(svgRef.current)
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .attr("viewBox", [0, 0, containerWidth, containerHeight])
      .attr("style", "max-width: 100%; height: auto;");

    // Create a group for the visualization
    const g = svg.append("g");

    // Define node type colors
    const nodeColors: Record<string, string> = {
      person: "#8B5CF6",  // Purple
      event: "#F97316",   // Orange
      place: "#10B981",   // Green
      concept: "#0EA5E9", // Blue
      time: "#EC4899",    // Pink
      object: "#F43F5E",  // Rose
      default: "#6B7280", // Gray
      document: "#4338CA", // Indigo
      organization: "#D946EF", // Fuchsia
      technology: "#0EA5E9", // Light blue
      process: "#10B981", // Emerald
      theory: "#8B5CF6"   // Purple
    };
    
    // Define edge type styles
    const edgeStyles: Record<string, { color: string, dashed: boolean }> = {
      related: { color: "#6B7280", dashed: false },
      causes: { color: "#F97316", dashed: false },
      partOf: { color: "#0EA5E9", dashed: true },
      creates: { color: "#10B981", dashed: false },
      influences: { color: "#8B5CF6", dashed: true },
      default: { color: "#6B7280", dashed: false }
    };

    // Create a force simulation
    const simulation = d3.forceSimulation<CustomNode>(processedNodes)
      .force("link", d3.forceLink<CustomNode, CustomLink>(processedEdges)
        .id(d => d.id)
        .distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("collide", d3.forceCollide().radius(50))
      .force("center", d3.forceCenter(containerWidth / 2, containerHeight / 2));

    // Create arrow markers for edges
    svg.append("defs").selectAll("marker")
      .data(Object.keys(edgeStyles))
      .enter().append("marker")
      .attr("id", d => `arrow-${d}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", d => edgeStyles[d]?.color || edgeStyles.default.color)
      .attr("d", "M0,-5L10,0L0,5");

    // Create edges
    const link = g.append("g")
      .attr("class", "links")
      .selectAll("path")
      .data(processedEdges)
      .enter().append("path")
      .attr("stroke", d => edgeStyles[d.type || "default"]?.color || edgeStyles.default.color)
      .attr("stroke-width", 1.5)
      .attr("fill", "none")
      .attr("marker-end", d => `url(#arrow-${d.type || "default"})`)
      .attr("stroke-dasharray", d => edgeStyles[d.type || "default"]?.dashed ? "5,5" : "")
      .attr("class", "link");

    // Create edge labels
    const edgeLabels = g.append("g")
      .attr("class", "edge-labels")
      .selectAll("text")
      .data(processedEdges)
      .enter().append("text")
      .attr("dy", -5)
      .attr("text-anchor", "middle")
      .attr("fill", "#D1D5DB")
      .attr("font-size", "8px")
      .text(d => d.label || "");

    // Create a group for each node
    const node = g.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(processedNodes)
      .enter().append("g")
      .attr("class", "node")
      .on("click", (event, d) => {
        if (onNodeClick) onNodeClick(d);
      })
      .call(d3.drag<SVGGElement, CustomNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    // Add circles for nodes
    node.append("circle")
      .attr("r", d => (d.properties?.importance || 1) * 10)
      .attr("fill", d => nodeColors[d.type] || nodeColors.default)
      .attr("stroke", "#2D3748")
      .attr("stroke-width", 1.5)
      .attr("class", d => highlightedNodes.includes(d.id) ? "highlighted" : "")
      .attr("opacity", d => highlightedNodes.length > 0 
        ? (highlightedNodes.includes(d.id) ? 1 : 0.3) 
        : 1);

    // Add labels for nodes
    node.append("text")
      .attr("dx", 0)
      .attr("dy", d => (d.properties?.importance || 1) * 10 + 10)
      .attr("text-anchor", "middle")
      .attr("fill", "#E5E7EB")
      .attr("font-size", "10px")
      .text(d => d.label)
      .attr("opacity", d => highlightedNodes.length > 0 
        ? (highlightedNodes.includes(d.id) ? 1 : 0.3) 
        : 1);

    // Add type labels
    node.append("text")
      .attr("dx", 0)
      .attr("dy", d => (d.properties?.importance || 1) * 10 + 22)
      .attr("text-anchor", "middle")
      .attr("fill", d => nodeColors[d.type] || nodeColors.default)
      .attr("font-size", "8px")
      .text(d => d.type)
      .attr("opacity", d => highlightedNodes.length > 0 
        ? (highlightedNodes.includes(d.id) ? 1 : 0.3) 
        : 0.7);

    // Update function for simulation
    simulation.on("tick", () => {
      // Constrain nodes to the visualization area
      processedNodes.forEach(d => {
        d.x = Math.max(50, Math.min(containerWidth - 50, d.x || 0));
        d.y = Math.max(50, Math.min(containerHeight - 50, d.y || 0));
      });

      // Update link positions - using explicit type checks to avoid apply errors
      link.attr("d", d => {
        if (typeof d.source === 'object' && d.source !== null && 'x' in d.source && 
            typeof d.target === 'object' && d.target !== null && 'x' in d.target) {
          const sourceX = d.source.x || 0;
          const sourceY = d.source.y || 0;
          const targetX = d.target.x || 0;
          const targetY = d.target.y || 0;
          
          return `M${sourceX},${sourceY}L${targetX},${targetY}`;
        }
        return '';
      });

      // Update edge label positions
      edgeLabels.attr("transform", d => {
        if (typeof d.source === 'object' && d.source !== null && 'x' in d.source && 
            typeof d.target === 'object' && d.target !== null && 'x' in d.target) {
          const sourceX = d.source.x || 0;
          const sourceY = d.source.y || 0;
          const targetX = d.target.x || 0;
          const targetY = d.target.y || 0;
          
          const midX = (sourceX + targetX) / 2;
          const midY = (sourceY + targetY) / 2;
          const angle = Math.atan2(targetY - sourceY, targetX - sourceX) * 180 / Math.PI;
          return `translate(${midX}, ${midY}) rotate(${angle})`;
        }
        return '';
      });

      // Update node positions
      node.attr("transform", d => `translate(${d.x || 0}, ${d.y || 0})`);
    });

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, CustomNode, CustomNode>, d: CustomNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, CustomNode, CustomNode>, d: CustomNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, CustomNode, CustomNode>, d: CustomNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Clean up the simulation when component unmounts
    return () => {
      simulation.stop();
    };
  }, [processedNodes, processedEdges, highlightedNodes, onNodeClick]);

  if (isLoading) {
    return <VisualizationPlaceholder type="knowledge-graph" message="Building knowledge graph..." />;
  }

  if (nodes.length === 0) {
    return <VisualizationPlaceholder type="knowledge-graph" message="No knowledge graph data available" />;
  }

  return (
    <div className={`relative ${isFullScreen ? 'fixed inset-0 z-50 bg-black' : 'w-full h-[600px]'}`}>
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        <Button
          size="icon"
          variant="outline"
          className="w-8 h-8 bg-black/50"
          onClick={zoomIn}
        >
          <ZoomIn size={14} />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="w-8 h-8 bg-black/50"
          onClick={zoomOut}
        >
          <ZoomOut size={14} />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="w-8 h-8 bg-black/50"
          onClick={toggleFullScreen}
        >
          {isFullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </Button>
      </div>
      
      <div className="absolute top-2 left-2 z-10 flex items-center">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="h-8 bg-black/50 border-gray-700 pl-8 pr-4 w-56 text-sm"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div 
        ref={containerRef} 
        className="w-full h-full bg-black/20 rounded-lg overflow-hidden"
      >
        <svg ref={svgRef} width="100%" height="100%"></svg>
      </div>
    </div>
  );
};

export default KnowledgeGraph;
