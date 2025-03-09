import { SimulationNode, GraphLink, SimulationEntity, EntityLink } from "@/types/simulation";

// Helper function to create a link between two simulation entities
export function createLink(
  source: SimulationEntity,
  target: SimulationEntity,
  type: string,
  strength: number = 1
): EntityLink {
  return {
    source: source.id,
    target: target.id,
    type,
    strength,
  };
}

// Create nodes from historical entities for simulation
export function createSimulationNodes(entities: any[]): SimulationNode[] {
  return entities.map((entity) => ({
    id: entity.id || `node-${Math.random().toString(36).substr(2, 9)}`,
    name: entity.name || entity.title || "Unknown Entity",
    type: entity.type || "person",
    group: entity.group || "default",
    color: entity.color || "#ffffff",
    // Add other properties as needed
    x: undefined,
    y: undefined,
    z: undefined,
    ...entity,
  }));
}

// Create links between nodes based on relationships
export function createSimulationLinks(
  nodes: SimulationEntity[],
  relationships: any[] = []
): EntityLink[] {
  const links: EntityLink[] = [];

  // Create links from explicit relationships if provided
  if (relationships.length > 0) {
    relationships.forEach((rel) => {
      links.push({
        source: rel.source,
        target: rel.target,
        type: rel.type || "related",
        strength: rel.strength || 1,
      });
    });
    return links;
  }

  // Otherwise, create some default connections for visualization
  for (let i = 0; i < nodes.length; i++) {
    // Connect each node to a few others to create a connected graph
    const numConnections = Math.min(2, nodes.length - 1);
    for (let j = 0; j < numConnections; j++) {
      const targetIndex = (i + j + 1) % nodes.length;
      links.push(
        createLink(
          nodes[i],
          nodes[targetIndex],
          "related",
          Math.random() * 0.5 + 0.5
        )
      );
    }
  }

  return links;
}
