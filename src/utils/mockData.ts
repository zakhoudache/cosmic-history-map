export interface HistoricalEntity {
  id: string;
  name: string;
  type: string;
  startDate?: string;
  endDate?: string;
  description: string;
  significance: number;
  group?: string;
  domains?: string[];
  location?: string;
  imageUrl?: string;
  relations?: Array<{
    targetId: string;
    type: string;
    strength: number;
  }>;
  connections?: string[];
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  index?: number;
}

export const mockHistoricalData: HistoricalEntity[] = [
  {
    id: "1",
    name: "Cleopatra",
    type: "Person",
    startDate: "-0069-01-01",
    endDate: "-0030-08-12",
    description: "The last active ruler of the Ptolemaic Kingdom of Egypt.",
    significance: 9,
    group: "Ptolemaic Dynasty",
    domains: ["Politics", "History"],
    location: "Alexandria, Egypt",
    imageUrl: "https://example.com/cleopatra.jpg",
    relations: [
      { targetId: "2", type: "related", strength: 7 },
      { targetId: "3", type: "enemy", strength: 8 },
    ],
  },
  {
    id: "2",
    name: "Julius Caesar",
    type: "Person",
    startDate: "-0100-07-12",
    endDate: "-0044-03-15",
    description: "A Roman general and statesman.",
    significance: 10,
    group: "Roman Republic",
    domains: ["Politics", "Military"],
    location: "Rome, Italy",
    imageUrl: "https://example.com/julius_caesar.jpg",
    relations: [
      { targetId: "1", type: "related", strength: 7 },
      { targetId: "4", type: "led_to", strength: 9 },
    ],
  },
  {
    id: "3",
    name: "Mark Antony",
    type: "Person",
    startDate: "-0083-01-14",
    endDate: "-0030-08-01",
    description: "A Roman politician and general.",
    significance: 8,
    group: "Roman Republic",
    domains: ["Politics", "Military"],
    location: "Rome, Italy",
    imageUrl: "https://example.com/mark_antony.jpg",
    relations: [
      { targetId: "1", type: "enemy", strength: 8 },
      { targetId: "4", type: "fought_in", strength: 6 },
    ],
  },
  {
    id: "4",
    name: "Battle of Actium",
    type: "Event",
    startDate: "-0031-09-02",
    endDate: "-0031-09-02",
    description:
      "A decisive naval battle between Octavian and the forces of Mark Antony and Cleopatra.",
    significance: 9,
    group: "Roman Civil Wars",
    domains: ["Military", "Politics"],
    location: "Actium, Greece",
    imageUrl: "https://example.com/battle_of_actium.jpg",
    relations: [
      { targetId: "2", type: "caused_by", strength: 9 },
      { targetId: "3", type: "participant", strength: 7 },
    ],
  },
  {
    id: "5",
    name: "Roman Empire",
    type: "Place",
    startDate: "-0027-01-01",
    endDate: "0476-01-01",
    description: "A powerful empire that dominated Europe for centuries.",
    significance: 10,
    group: "Ancient Civilizations",
    domains: ["Politics", "History"],
    location: "Rome, Italy",
    imageUrl: "https://example.com/roman_empire.jpg",
    relations: [{ targetId: "4", type: "resulted_in", strength: 8 }],
  },
  {
    id: "6",
    name: "Ptolemaic Kingdom",
    type: "Place",
    startDate: "-0305-01-01",
    endDate: "-0030-01-01",
    description: "An ancient kingdom in Egypt.",
    significance: 7,
    group: "Ancient Civilizations",
    domains: ["Politics", "History"],
    location: "Alexandria, Egypt",
    imageUrl: "https://example.com/ptolemaic_kingdom.jpg",
    relations: [{ targetId: "1", type: "ruled_by", strength: 9 }],
  },
  {
    id: "7",
    name: "Hellenistic Period",
    type: "Period",
    startDate: "-0323-01-01",
    endDate: "-0030-01-01",
    description:
      "A period in ancient history between the death of Alexander the Great and the emergence of the Roman Empire.",
    significance: 8,
    group: "Ancient History",
    domains: ["History", "Culture"],
    location: "Mediterranean Region",
    imageUrl: "https://example.com/hellenistic_period.jpg",
    relations: [{ targetId: "6", type: "part_of", strength: 7 }],
  },
  {
    id: "8",
    name: "Alexandria",
    type: "Place",
    startDate: "-0331-01-01",
    endDate: "present",
    description: "A major city in ancient Egypt, founded by Alexander the Great.",
    significance: 9,
    group: "Ancient Cities",
    domains: ["History", "Culture"],
    location: "Egypt",
    imageUrl: "https://example.com/alexandria.jpg",
    relations: [
      { targetId: "1", type: "located_in", strength: 10 },
      { targetId: "6", type: "capital_of", strength: 9 },
    ],
  },
  {
    id: "9",
    name: "Roman Republic",
    type: "Place",
    startDate: "-0509-01-01",
    endDate: "-0027-01-01",
    description: "The era of classical Roman civilization.",
    significance: 8,
    group: "Ancient Civilizations",
    domains: ["Politics", "History"],
    location: "Rome, Italy",
    imageUrl: "https://example.com/roman_republic.jpg",
    relations: [{ targetId: "2", type: "part_of", strength: 9 }],
  },
  {
    id: "10",
    name: "Ancient Egypt",
    type: "Place",
    startDate: "-3100-01-01",
    endDate: "-0030-01-01",
    description: "One of the oldest and most influential civilizations.",
    significance: 10,
    group: "Ancient Civilizations",
    domains: ["History", "Culture"],
    location: "Egypt",
    imageUrl: "https://example.com/ancient_egypt.jpg",
    relations: [{ targetId: "1", type: "located_in", strength: 8 }],
  },
];

export const arabicHistoricalData: HistoricalEntity[] = [
  {
    id: "101",
    name: "محمد الفاتح",
    type: "Person",
    startDate: "1432-01-01",
    endDate: "1481-01-01",
    description: "السلطان العثماني الذي فتح القسطنطينية.",
    significance: 9,
    group: "الدولة العثمانية",
    domains: ["Politics", "Military"],
    location: "إسطنبول، تركيا",
    imageUrl: "https://example.com/mohamed_al_fatih.jpg",
    relations: [{ targetId: "104", type: "led_to", strength: 9 }],
  },
  {
    id: "102",
    name: "صلاح الدين الأيوبي",
    type: "Person",
    startDate: "1137-01-01",
    endDate: "1193-01-01",
    description: "قائد عسكري ومؤسس الدولة الأيوبية.",
    significance: 10,
    group: "الدولة الأيوبية",
    domains: ["Politics", "Military"],
    location: "دمشق، سوريا",
    imageUrl: "https://example.com/salah_al_din.jpg",
    relations: [{ targetId: "103", type: "fought_in", strength: 8 }],
  },
  {
    id: "103",
    name: "معركة حطين",
    type: "Event",
    startDate: "1187-01-01",
    endDate: "1187-01-01",
    description: "معركة فاصلة بين المسلمين والصليبيين.",
    significance: 9,
    group: "الحروب الصليبية",
    domains: ["Military", "History"],
    location: "حطين، فلسطين",
    imageUrl: "https://example.com/battle_of_hattin.jpg",
    relations: [{ targetId: "102", type: "participant", strength: 10 }],
  },
  {
    id: "104",
    name: "فتح القسطنطينية",
    type: "Event",
    startDate: "1453-01-01",
    endDate: "1453-01-01",
    description: "سقوط القسطنطينية بيد العثمانيين.",
    significance: 10,
    group: "الدولة العثمانية",
    domains: ["Military", "History"],
    location: "القسطنطينية، تركيا",
    imageUrl: "https://example.com/fall_of_constantinople.jpg",
    relations: [{ targetId: "101", type: "led_by", strength: 10 }],
  },
  {
    id: "105",
    name: "الدولة العثمانية",
    type: "Place",
    startDate: "1299-01-01",
    endDate: "1922-01-01",
    description: "إمبراطورية إسلامية حكمت أجزاء واسعة من العالم.",
    significance: 10,
    group: "الإمبراطوريات الإسلامية",
    domains: ["Politics", "History"],
    location: "إسطنبول، تركيا",
    imageUrl: "https://example.com/ottoman_empire.jpg",
    relations: [{ targetId: "101", type: "part_of", strength: 9 }],
  },
];

export const arabicHistoricalSubjects = [
  {
    id: "201",
    title: "الحضارة الإسلامية في الأندلس",
    originalText:
      "تعتبر الحضارة الإسلامية في الأندلس من أزهى الحقب التاريخية التي جمعت بين العلم والفن والأدب. ازدهرت مدن مثل قرطبة وإشبيلية كمنارات للعلم والثقافة، حيث ترجمت الكتب اليونانية والفارسية وأضيفت إليها إسهامات العلماء المسلمين في الفلك والرياضيات والطب. كما تميزت العمارة الإسلامية في الأندلس بجمالها الفريد الذي يظهر في قصر الحمراء ومسجد قرطبة الكبير.",
  },
  {
    id: "202",
    title: "دور المرأة في التاريخ الإسلامي",
    originalText:
      "لعبت المرأة دوراً هاماً في التاريخ الإسلامي، سواء في السياسة أو العلم أو الأدب. من أمثلة ذلك السيدة خديجة زوجة النبي محمد صلى الله عليه وسلم، وعائشة أم المؤمنين التي كانت عالمة بالحديث والفقه، ورابعة العدوية المتصوفة الشهيرة. كما برزت نساء حكمن دولاً وأثرن في مجرى الأحداث، مثل شجرة الدر في مصر.",
  },
  {
    id: "203",
    title: "الطرق الصوفية وأثرها في المجتمع",
    originalText:
      "تعتبر الطرق الصوفية جزءاً لا يتجزأ من التاريخ الإسلامي، حيث ساهمت في نشر الإسلام وتعزيز القيم الروحية والأخلاقية في المجتمع. انتشرت الطرق الصوفية في مختلف أنحاء العالم الإسلامي، وقامت بدور كبير في التربية والتعليم والإصلاح الاجتماعي. من أبرز الطرق الصوفية القادرية والنقشبندية والشاذلية.",
  },
];

export const prepareSimulationData = (entities: HistoricalEntity[]) => {
  // Create a deep copy to avoid mutating the original data
  const simulationData = JSON.parse(JSON.stringify(entities));
  
  // Process connections between entities
  simulationData.forEach((entity: any) => {
    // If the entity has relations, ensure they're properly formatted for D3
    if (entity.relations && entity.relations.length > 0) {
      // Initialize connections array if it doesn't exist
      if (!entity.connections) {
        entity.connections = [];
      }
      
      // Add all target IDs from relations to connections
      entity.relations.forEach((relation: any) => {
        if (relation.targetId && !entity.connections.includes(relation.targetId)) {
          entity.connections.push(relation.targetId);
        }
      });
    }
  });
  
  return simulationData;
};

export const generateEntitiesFromSubject = (subject: { id: string; title: string; originalText: string; }) => {
  // Mock implementation - replace with actual logic
  const entities: HistoricalEntity[] = [
    {
      id: `${subject.id}-1`,
      name: subject.title,
      type: "Concept",
      description: subject.originalText.substring(0, 150) + "...",
      significance: 7,
      domains: ["History", "Culture"],
      location: "Various",
      imageUrl: "https://example.com/concept.jpg",
      relations: [],
    },
    {
      id: `${subject.id}-2`,
      name: "الأندلس",
      type: "Place",
      description: "منطقة تاريخية في جنوب إسبانيا تحت الحكم الإسلامي.",
      significance: 8,
      domains: ["History", "Geography"],
      location: "إسبانيا",
      imageUrl: "https://example.com/alandalus.jpg",
      relations: [],
    },
    // Add more entities as needed based on the subject
  ];
  return entities;
};
