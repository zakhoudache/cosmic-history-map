export interface HistoricalEntity {
  id: string;
  name: string;
  type: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  significance?: number;
  group?: string;
  relations?: { target: string; type: string; }[];
}

// Add SimulationNode interface to extend HistoricalEntity for D3 visualization
export interface SimulationNode extends HistoricalEntity {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  index?: number;
}

// Add utility function to convert HistoricalEntity to SimulationNode
export function prepareSimulationData(entities: HistoricalEntity[]): SimulationNode[] {
  return entities.map(entity => ({
    ...entity,
    x: undefined,
    y: undefined,
    vx: undefined,
    vy: undefined,
    fx: null,
    fy: null
  }));
}

export const mockHistoricalData: HistoricalEntity[] = [
  {
    id: "renaissance",
    name: "Renaissance",
    type: "Period",
    startDate: "1300",
    endDate: "1600",
    description: "A period of European cultural, artistic, political and economic rebirth.",
    significance: 9,
    group: "Culture",
    relations: [
      { target: "daVinci", type: "artist" },
      { target: "michelangelo", type: "artist" }
    ]
  },
  {
    id: "daVinci",
    name: "Leonardo da Vinci",
    type: "Person",
    startDate: "1452",
    endDate: "1519",
    description: "An Italian polymath of the High Renaissance.",
    significance: 8,
    group: "Art",
    relations: [
      { target: "monaLisa", type: "painted" }
    ]
  },
  {
    id: "monaLisa",
    name: "Mona Lisa",
    type: "Artwork",
    description: "A 16th-century portrait painted in oil on a poplar panel by Leonardo da Vinci.",
    significance: 7,
    group: "Art",
    relations: []
  },
  {
    id: "michelangelo",
    name: "Michelangelo",
    type: "Person",
    startDate: "1475",
    endDate: "1564",
    description: "An Italian sculptor, painter, architect and poet of the High Renaissance.",
    significance: 8,
    group: "Art",
    relations: [
      { target: "sistineChapel", type: "painted" }
    ]
  },
  {
    id: "sistineChapel",
    name: "Sistine Chapel",
    type: "Building",
    description: "A chapel in the Apostolic Palace, Vatican City, known for its Renaissance art.",
    significance: 7,
    group: "Architecture",
    relations: []
  },
  {
    id: "shakespeare",
    name: "William Shakespeare",
    type: "Person",
    startDate: "1564",
    endDate: "1616",
    description: "An English playwright, poet and actor, widely regarded as the greatest writer in the English language.",
    significance: 8,
    group: "Literature",
    relations: [
      { target: "hamlet", type: "wrote" }
    ]
  },
  {
    id: "hamlet",
    name: "Hamlet",
    type: "Play",
    description: "A tragedy by William Shakespeare, believed to have been written between 1599 and 1601.",
    significance: 7,
    group: "Literature",
    relations: []
  },
  {
    id: "copernicus",
    name: "Nicolaus Copernicus",
    type: "Person",
    startDate: "1473",
    endDate: "1543",
    description: "A Renaissance-era mathematician and astronomer who formulated a model of the universe that placed the Sun rather than Earth at the center.",
    significance: 7,
    group: "Science",
    relations: [
      { target: "heliocentrism", type: "developed" }
    ]
  },
  {
    id: "heliocentrism",
    name: "Heliocentrism",
    type: "Theory",
    description: "The astronomical model in which the Earth and planets revolve around the Sun.",
    significance: 6,
    group: "Science",
    relations: []
  },
  {
    id: "martinLuther",
    name: "Martin Luther",
    type: "Person",
    startDate: "1483",
    endDate: "1546",
    description: "A German theologian, composer, priest, monk, and a seminal figure in the Protestant Reformation.",
    significance: 7,
    group: "Religion",
    relations: [
      { target: "ninetyFiveTheses", type: "authored" }
    ]
  },
  {
    id: "ninetyFiveTheses",
    name: "Ninety-Five Theses",
    type: "Document",
    description: "A list of propositions for debate concerned with the question of indulgences, written by Martin Luther in 1517.",
    significance: 6,
    group: "Religion",
    relations: []
  },
  {
    id: "columbus",
    name: "Christopher Columbus",
    type: "Person",
    startDate: "1451",
    endDate: "1506",
    description: "An Italian explorer and navigator who completed four Spanish-based voyages across the Atlantic Ocean.",
    significance: 7,
    group: "Exploration",
    relations: [
      { target: "discoveryOfAmerica", type: "ledTo" }
    ]
  },
  {
    id: "discoveryOfAmerica",
    name: "Discovery of America",
    type: "Event",
    description: "The event of Europeans encountering the Americas, initiated by Christopher Columbus in 1492.",
    significance: 6,
    group: "Exploration",
    relations: []
  },
  {
    id: "printingPress",
    name: "Printing Press",
    type: "Invention",
    startDate: "1440",
    description: "A mechanical device for applying pressure to an inked surface resting upon a print medium, thereby transferring the ink.",
    significance: 8,
    group: "Technology",
    relations: [
      { target: "spreadOfKnowledge", type: "ledTo" }
    ]
  },
  {
    id: "spreadOfKnowledge",
    name: "Spread of Knowledge",
    type: "Process",
    description: "The increase in the dissemination and availability of information and knowledge, facilitated by the printing press.",
    significance: 7,
    group: "Technology",
    relations: []
  }
];
