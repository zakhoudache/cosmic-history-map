
import { ReactNode } from "react";

export type VisualizationType = "timeline" | "cosmic" | "knowledge-graph" | "video";

export interface GraphNode {
  id: string;
  name: string;
  val?: number;
  color?: string;
  group?: string | number;
  type?: string;
  neighbours?: string[];
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  fx?: number | null;
  fy?: number | null;
  fz?: number | null;
}

export interface GraphLink {
  source: string;
  target: string;
  value?: number;
  strength?: number;
  type?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

export interface TimelineData {
  id: string;
  title: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  type?: string;
  icon?: ReactNode;
  color?: string;
  group?: string;
}

export type SimulationNodeMap = Map<string, SimulationNode>;

export interface SimulationNode {
  id: string;
  name: string;
  type: string;
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  fx?: number | null;
  fy?: number | null;
  fz?: number | null;
  [key: string]: any;
}
