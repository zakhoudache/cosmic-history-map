
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
  // Creating realistic entities based on the subject content
  let entities: HistoricalEntity[] = [];
  
  // Common entity types we want to extract
  const entityTypes = ['Person', 'Event', 'Place', 'Concept', 'Document', 'Treaty'];
  
  switch (subject.id) {
    case "201": // الحضارة الإسلامية في الأندلس
      entities = [
        {
          id: `${subject.id}-1`,
          name: "الأندلس",
          type: "Place",
          startDate: "711",
          endDate: "1492",
          description: "منطقة تاريخية في شبه الجزيرة الإيبيرية حكمها المسلمون لقرون عديدة",
          significance: 10,
          group: "الحضارة الإسلامية",
          domains: ["تاريخ", "جغرافيا"],
          location: "إسبانيا والبرتغال حالياً",
          imageUrl: "https://example.com/andalus.jpg",
          relations: []
        },
        {
          id: `${subject.id}-2`,
          name: "قرطبة",
          type: "Place",
          startDate: "756",
          endDate: "1236",
          description: "عاصمة الأندلس وأحد أهم المراكز الثقافية والعلمية في العالم الإسلامي",
          significance: 9,
          group: "المدن الأندلسية",
          domains: ["ثقافة", "علوم"],
          location: "جنوب إسبانيا",
          imageUrl: "https://example.com/cordoba.jpg",
          relations: [
            { targetId: `${subject.id}-1`, type: "part_of", strength: 9 }
          ]
        },
        {
          id: `${subject.id}-3`,
          name: "عبد الرحمن الداخل",
          type: "Person",
          startDate: "731",
          endDate: "788",
          description: "مؤسس الدولة الأموية في الأندلس ولقب بصقر قريش",
          significance: 9,
          group: "الحكام",
          domains: ["سياسة", "تاريخ"],
          location: "الأندلس",
          imageUrl: "https://example.com/abdulrahman.jpg",
          relations: [
            { targetId: `${subject.id}-1`, type: "ruled", strength: 10 },
            { targetId: `${subject.id}-2`, type: "established", strength: 8 }
          ]
        },
        {
          id: `${subject.id}-4`,
          name: "قصر الحمراء",
          type: "Place",
          startDate: "1238",
          endDate: "1492",
          description: "قصر وقلعة أندلسية في غرناطة، من أهم معالم العمارة الإسلامية",
          significance: 9,
          group: "العمارة الإسلامية",
          domains: ["فن", "عمارة"],
          location: "غرناطة، إسبانيا",
          imageUrl: "https://example.com/alhambra.jpg",
          relations: [
            { targetId: `${subject.id}-1`, type: "located_in", strength: 8 }
          ]
        },
        {
          id: `${subject.id}-5`,
          name: "مسجد قرطبة",
          type: "Place",
          startDate: "785",
          endDate: "987",
          description: "من أشهر المساجد في العالم الإسلامي ومن أروع نماذج العمارة الإسلامية",
          significance: 10,
          group: "العمارة الإسلامية",
          domains: ["عمارة", "دين"],
          location: "قرطبة، إسبانيا",
          imageUrl: "https://example.com/cordoba_mosque.jpg",
          relations: [
            { targetId: `${subject.id}-2`, type: "located_in", strength: 10 }
          ]
        },
        {
          id: `${subject.id}-6`,
          name: "العلوم الأندلسية",
          type: "Concept",
          startDate: "750",
          endDate: "1492",
          description: "إسهامات علماء الأندلس في مجالات الرياضيات والفلك والطب والفلسفة",
          significance: 9,
          group: "المعرفة",
          domains: ["علوم"],
          imageUrl: "https://example.com/andalusian_science.jpg",
          relations: [
            { targetId: `${subject.id}-1`, type: "developed_in", strength: 9 }
          ]
        },
        {
          id: `${subject.id}-7`,
          name: "الترجمة في الأندلس",
          type: "Concept",
          startDate: "800",
          endDate: "1200",
          description: "حركة ترجمة النصوص اليونانية والفارسية إلى العربية ومنها إلى اللاتينية",
          significance: 8,
          group: "المعرفة",
          domains: ["ثقافة", "لغة"],
          imageUrl: "https://example.com/translation.jpg",
          relations: [
            { targetId: `${subject.id}-6`, type: "contributed_to", strength: 8 }
          ]
        },
        {
          id: `${subject.id}-8`,
          name: "معاهدة غرناطة",
          type: "Treaty",
          startDate: "1491",
          endDate: "1491",
          description: "المعاهدة التي وقعت بين آخر ملوك غرناطة والملكين الكاثوليكيين فرديناند وإيزابيلا",
          significance: 9,
          group: "معاهدات",
          domains: ["سياسة", "تاريخ"],
          location: "غرناطة، الأندلس",
          relations: [
            { targetId: `${subject.id}-1`, type: "ended", strength: 10 }
          ]
        }
      ];
      break;
      
    case "202": // دور المرأة في التاريخ الإسلامي
      entities = [
        {
          id: `${subject.id}-1`,
          name: "المرأة في الإسلام",
          type: "Concept",
          description: "مكانة ودور المرأة في التاريخ الإسلامي وإسهاماتها المختلفة",
          significance: 10,
          domains: ["تاريخ", "مجتمع"],
          relations: []
        },
        {
          id: `${subject.id}-2`,
          name: "السيدة خديجة",
          type: "Person",
          startDate: "555",
          endDate: "619",
          description: "أول زوجات النبي محمد وأول من آمن به، كانت سيدة أعمال ناجحة",
          significance: 10,
          group: "الصحابيات",
          domains: ["دين", "اقتصاد"],
          location: "مكة، الجزيرة العربية",
          relations: [
            { targetId: `${subject.id}-1`, type: "exemplifies", strength: 10 }
          ]
        },
        {
          id: `${subject.id}-3`,
          name: "عائشة بنت أبي بكر",
          type: "Person",
          startDate: "613",
          endDate: "678",
          description: "زوجة النبي محمد وعالمة في الحديث والفقه، نقلت الكثير من أحاديث النبي",
          significance: 9,
          group: "الصحابيات",
          domains: ["دين", "علم"],
          location: "المدينة المنورة",
          relations: [
            { targetId: `${subject.id}-1`, type: "exemplifies", strength: 9 }
          ]
        },
        {
          id: `${subject.id}-4`,
          name: "رابعة العدوية",
          type: "Person",
          startDate: "717",
          endDate: "801",
          description: "صوفية مشهورة ومن أوائل الزهاد المسلمين، اشتهرت بمفهوم الحب الإلهي",
          significance: 8,
          group: "المتصوفات",
          domains: ["تصوف", "أدب"],
          location: "البصرة، العراق",
          relations: [
            { targetId: `${subject.id}-1`, type: "exemplifies", strength: 8 }
          ]
        },
        {
          id: `${subject.id}-5`,
          name: "شجرة الدر",
          type: "Person",
          startDate: "1200",
          endDate: "1257",
          description: "ملكة مصر وأول امرأة تحكم في العصر الإسلامي، أسست دولة المماليك",
          significance: 9,
          group: "الحاكمات",
          domains: ["سياسة", "تاريخ"],
          location: "القاهرة، مصر",
          relations: [
            { targetId: `${subject.id}-1`, type: "exemplifies", strength: 9 }
          ]
        },
        {
          id: `${subject.id}-6`,
          name: "الشفاء بنت عبد الله",
          type: "Person",
          startDate: "600",
          endDate: "640",
          description: "من أوائل المعلمات في الإسلام، علمت الكتابة والقراءة للنساء",
          significance: 7,
          group: "المعلمات",
          domains: ["تعليم", "ثقافة"],
          location: "المدينة المنورة",
          relations: [
            { targetId: `${subject.id}-1`, type: "exemplifies", strength: 7 }
          ]
        },
        {
          id: `${subject.id}-7`,
          name: "نسيبة بنت كعب",
          type: "Person",
          startDate: "600",
          endDate: "634",
          description: "محاربة شاركت في معركة أحد ودافعت عن النبي محمد",
          significance: 8,
          group: "المحاربات",
          domains: ["عسكري", "تاريخ"],
          location: "المدينة المنورة",
          relations: [
            { targetId: `${subject.id}-1`, type: "exemplifies", strength: 8 }
          ]
        },
        {
          id: `${subject.id}-8`,
          name: "وثيقة المساواة في الإسلام",
          type: "Document",
          description: "وثيقة تاريخية تؤكد على المساواة بين الرجل والمرأة في الإسلام",
          significance: 9,
          group: "وثائق",
          domains: ["دين", "مجتمع"],
          relations: [
            { targetId: `${subject.id}-1`, type: "supports", strength: 9 }
          ]
        }
      ];
      break;
      
    case "203": // الطرق الصوفية وأثرها في المجتمع
      entities = [
        {
          id: `${subject.id}-1`,
          name: "التصوف الإسلامي",
          type: "Concept",
          startDate: "800",
          endDate: "present",
          description: "المدرسة الروحية في الإسلام التي تركز على تزكية النفس والقرب من الله",
          significance: 10,
          domains: ["دين", "فلسفة"],
          relations: []
        },
        {
          id: `${subject.id}-2`,
          name: "الطريقة القادرية",
          type: "Concept",
          startDate: "1166",
          endDate: "present",
          description: "إحدى أقدم الطرق الصوفية، أسسها عبد القادر الجيلاني",
          significance: 9,
          group: "الطرق الصوفية",
          domains: ["تصوف", "دين"],
          location: "بغداد، العراق",
          relations: [
            { targetId: `${subject.id}-1`, type: "part_of", strength: 9 }
          ]
        },
        {
          id: `${subject.id}-3`,
          name: "الطريقة النقشبندية",
          type: "Concept",
          startDate: "1389",
          endDate: "present",
          description: "من أكبر الطرق الصوفية، أسسها بهاء الدين نقشبند",
          significance: 9,
          group: "الطرق الصوفية",
          domains: ["تصوف", "دين"],
          location: "آسيا الوسطى",
          relations: [
            { targetId: `${subject.id}-1`, type: "part_of", strength: 9 }
          ]
        },
        {
          id: `${subject.id}-4`,
          name: "الطريقة الشاذلية",
          type: "Concept",
          startDate: "1258",
          endDate: "present",
          description: "من أشهر الطرق الصوفية في شمال أفريقيا، أسسها أبو الحسن الشاذلي",
          significance: 8,
          group: "الطرق الصوفية",
          domains: ["تصوف", "دين"],
          location: "المغرب العربي ومصر",
          relations: [
            { targetId: `${subject.id}-1`, type: "part_of", strength: 8 }
          ]
        },
        {
          id: `${subject.id}-5`,
          name: "عبد القادر الجيلاني",
          type: "Person",
          startDate: "1077",
          endDate: "1166",
          description: "متصوف ومؤسس الطريقة القادرية ومن كبار علماء الإسلام",
          significance: 9,
          group: "متصوفون",
          domains: ["تصوف", "دين"],
          location: "بغداد، العراق",
          relations: [
            { targetId: `${subject.id}-2`, type: "founded", strength: 10 }
          ]
        },
        {
          id: `${subject.id}-6`,
          name: "التكايا والزوايا",
          type: "Concept",
          description: "أماكن تجمع الصوفية للعبادة والتعليم والخدمة الاجتماعية",
          significance: 7,
          group: "مؤسسات صوفية",
          domains: ["تصوف", "عمارة"],
          relations: [
            { targetId: `${subject.id}-1`, type: "associated_with", strength: 7 }
          ]
        },
        {
          id: `${subject.id}-7`,
          name: "الذكر الصوفي",
          type: "Concept",
          description: "ممارسة روحية تتضمن تكرار أسماء الله والأدعية بطرق منظمة",
          significance: 8,
          group: "ممارسات صوفية",
          domains: ["تصوف"],
          relations: [
            { targetId: `${subject.id}-1`, type: "practice_of", strength: 9 }
          ]
        },
        {
          id: `${subject.id}-8`,
          name: "معاهدة الطرق الصوفية",
          type: "Treaty",
          startDate: "1300",
          description: "وثيقة تاريخية تنظم العلاقة بين مختلف الطرق الصوفية",
          significance: 7,
          group: "معاهدات",
          domains: ["تصوف", "سياسة"],
          relations: [
            { targetId: `${subject.id}-1`, type: "regulates", strength: 7 }
          ]
        }
      ];
      break;
      
    default:
      // Create some generic entities if no specific subject match
      entities = [
        {
          id: `${subject.id}-1`,
          name: subject.title,
          type: "Concept",
          description: subject.originalText.substring(0, 150) + "...",
          significance: 7,
          domains: ["تاريخ", "ثقافة"],
          relations: []
        },
        {
          id: `${subject.id}-2`,
          name: "مفهوم تاريخي",
          type: "Concept",
          description: "مفهوم مرتبط بالموضوع التاريخي",
          significance: 6,
          domains: ["تاريخ"],
          relations: [
            { targetId: `${subject.id}-1`, type: "related_to", strength: 6 }
          ]
        }
      ];
  }
  
  // Create connections based on relations
  entities.forEach(entity => {
    if (entity.relations && entity.relations.length > 0) {
      entity.connections = entity.relations.map(r => r.targetId);
    }
  });
  
  return entities;
};
