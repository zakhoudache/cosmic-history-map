
// Mock data for developing the visualization components
// This would be replaced by actual AI-processed data in production

export interface HistoricalEntity {
  id: string;
  name: string;
  type: 'person' | 'event' | 'place' | 'concept';
  startDate?: Date | string;
  endDate?: Date | string;
  description: string;
  connections: string[]; // IDs of connected entities
  significance: number; // 1-10 scale of importance
  coordinates?: {
    x: number;
    y: number;
  };
  group?: string;
  imageUrl?: string;
}

// Sample historical data
export const mockHistoricalData: HistoricalEntity[] = [
  {
    id: "renaissance",
    name: "Renaissance",
    type: "event",
    startDate: "1300-01-01",
    endDate: "1600-12-31",
    description: "A period of cultural, artistic, political, and economic rebirth following the Middle Ages.",
    connections: ["davinci", "medici", "gutenberg", "humanism"],
    significance: 10,
    group: "cultural",
  },
  {
    id: "davinci",
    name: "Leonardo da Vinci",
    type: "person",
    startDate: "1452-04-15",
    endDate: "1519-05-02",
    description: "Italian polymath whose areas of interest included invention, drawing, painting, and more.",
    connections: ["renaissance", "medici"],
    significance: 9,
    group: "art",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Leonardo_da_Vinci_-_presumed_self-portrait_-_WGA12798.jpg/800px-Leonardo_da_Vinci_-_presumed_self-portrait_-_WGA12798.jpg",
  },
  {
    id: "medici",
    name: "Medici Family",
    type: "person",
    startDate: "1397-01-01",
    endDate: "1494-12-31",
    description: "Italian banking family and political dynasty that powered the Renaissance.",
    connections: ["renaissance", "davinci", "florence"],
    significance: 8,
    group: "politics",
  },
  {
    id: "gutenberg",
    name: "Johannes Gutenberg",
    type: "person",
    startDate: "1400-01-01",
    endDate: "1468-02-03",
    description: "Inventor of the printing press with movable type.",
    connections: ["renaissance", "printing"],
    significance: 9,
    group: "technology",
  },
  {
    id: "florence",
    name: "Florence",
    type: "place",
    description: "Center of Renaissance art and learning in Italy.",
    connections: ["renaissance", "medici", "davinci"],
    significance: 7,
    group: "geography",
  },
  {
    id: "humanism",
    name: "Humanism",
    type: "concept",
    startDate: "1300-01-01",
    endDate: "1600-12-31",
    description: "Intellectual movement emphasizing human potential and achievements.",
    connections: ["renaissance", "davinci"],
    significance: 8,
    group: "philosophy",
  },
  {
    id: "printing",
    name: "Printing Revolution",
    type: "event",
    startDate: "1440-01-01",
    endDate: "1500-12-31",
    description: "Widespread adoption of printing technology that revolutionized knowledge sharing.",
    connections: ["gutenberg", "renaissance"],
    significance: 9,
    group: "technology",
  }
];

// Function to get random positions for the visualization
export const getRandomPosition = (min: number = -100, max: number = 100) => {
  return Math.random() * (max - min) + min;
};

// Function to prepare data with coordinates for the visualization
export const prepareVisualizationData = () => {
  return mockHistoricalData.map(entity => ({
    ...entity,
    coordinates: {
      x: getRandomPosition(),
      y: getRandomPosition()
    }
  }));
};

// Function to get entity connections for the network graph
export const getEntityConnections = () => {
  const links: { source: string; target: string; value: number }[] = [];
  
  mockHistoricalData.forEach(entity => {
    entity.connections.forEach(connectionId => {
      // Avoid duplicate links
      const existingLink = links.find(
        link => 
          (link.source === entity.id && link.target === connectionId) || 
          (link.source === connectionId && link.target === entity.id)
      );
      
      if (!existingLink) {
        links.push({
          source: entity.id,
          target: connectionId,
          value: 1
        });
      }
    });
  });
  
  return links;
};
