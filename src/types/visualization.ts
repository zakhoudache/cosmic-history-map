export type VisualizationType = 'timeline' | 'cosmic' | 'knowledge-graph' | 'video';

export interface VisualizationData {
  nodes: VisualizationNode[];
  edges: VisualizationEdge[];
}

export interface VisualizationNode {
  id: string;
  label: string;
  group?: string;
  title?: string;
  x?: number;
  y?: number;
  size?: number;
}

export interface VisualizationEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  title?: string;
}
