export interface HistoricalEntity {
  id: string;
  name: string;
  type: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  significance?: number;
  group?: string;
  location?: string;  // Added location property
  imageUrl?: string;  // Added imageUrl property
  relations?: { 
    target?: string; // Support both target and targetId for backward compatibility
    targetId?: string; 
    type?: string; 
    strength?: number;
  }[];
  connections?: string[]; // For compatibility with ElementCard
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

// For backwards compatibility with CosmicVisualization
export const prepareVisualizationData = prepareSimulationData;

// Add getEntityConnections function for knowledge graph
export function getEntityConnections(entities: HistoricalEntity[], entity: HistoricalEntity) {
  if (entity.relations && Array.isArray(entity.relations)) {
    return entity.relations
      .map(relation => {
        // Support both target and targetId properties
        const targetId = relation.target || relation.targetId;
        const target = entities.find(e => e.id === targetId);
        if (target) {
          return { 
            source: entity, 
            target, 
            type: relation.type || 'default', 
            strength: relation.strength || 1 
          };
        }
        return null;
      })
      .filter(Boolean); // Remove null values
  } 
  return [];
}

// Add Arabic historical subjects (not yet expanded into entities)
export const arabicHistoricalSubjects = [
  {
    id: "coldWar",
    title: "الحرب الباردة",
    originalText: `الحرب الباردة (بالإنجليزية: Cold War)‏، هي فترة من التوتر الجيوسياسي بين الاتحاد السوفيتي والولايات المتحدة وحلفائهما من حوالي عام 1947 إلى عام 1991. كانت حربًا باردة، أي أنه لم تكن هناك مواجهة عسكرية مباشرة بين القوتين العظميين، وذلك بسبب الخوف المتبادل من حدوث تدمير نووي. بدلاً من ذلك، انخرطت في صراعات غير مباشرة، مثل سباق التسلح، والحرب الإعلامية، والمنافسة التكنولوجية. كما دعمت كل منهما أطرافًا متعارضة في الحروب المحلية، مثل الحرب الكورية والحرب الفيتنامية وغيرها من الصراعات في العالم الثالث.

    تسمى هذه الفترة بالحرب الباردة لأنها لم تتطور إلى حرب ساخنة، أو صراع مباشر بين القوى الكبرى. شهدت هذه الفترة توترات في العلاقات الدولية، وإنشاء تحالفات عسكرية متنافسة مثل حلف شمال الأطلسي (الناتو) وحلف وارسو، وسباق التسلح النووي، والحروب بالوكالة في مختلف أنحاء العالم، وتنافس في استكشاف الفضاء.

    انتهت الحرب الباردة بانهيار الاتحاد السوفيتي في عام 1991، تاركة الولايات المتحدة كقوة عظمى وحيدة في العالم.`
  },
  {
    id: "liberationMovements",
    title: "حركات التحرر",
    originalText: `حركات التحرر الوطني هي حركات سياسية واجتماعية ظهرت في العديد من البلدان، خاصة في آسيا وأفريقيا والشرق الأوسط خلال القرنين التاسع عشر والعشرين، بهدف التحرر من الاستعمار الأوروبي والحصول على الاستقلال.

    اتخذت هذه الحركات أشكالًا مختلفة، بدءًا من النضال السلمي المدني، مثل حركة المقاومة السلمية التي قادها المهاتما غاندي في الهند، إلى الكفاح المسلح، مثل ثورة الجزائر ضد الاستعمار الفرنسي. كما تبنت هذه الحركات أيديولوجيات متنوعة، بما في ذلك القومية والاشتراكية والإسلام السياسي.

    في العالم العربي، كانت حركات التحرر الوطني مرتبطة بشكل وثيق بالقومية العربية، خاصة خلال حقبة الخمسينيات والستينيات من القرن العشرين، عندما ظهرت شخصيات مثل جمال عبد الناصر في مصر وأحمد بن بلة في الجزائر. وكانت قضية فلسطين محورية في النضال العربي ضد الاستعمار والإمبريالية.

    حققت معظم حركات التحرر الوطني أهدافها في الحصول على الاستقلال السياسي بحلول سبعينيات القرن العشرين، لكنها واجهت تحديات كبيرة في بناء دول مستقلة قوية اقتصاديًا وسياسيًا.`
  },
  {
    id: "worldWar2",
    title: "الحرب العالمية الثانية",
    originalText: `الحرب العالمية الثانية كانت نزاعًا عالميًا استمر من عام 1939 إلى عام 1945، وشارك فيها معظم دول العالم، بما في ذلك جميع القوى العظمى، التي شكلت تحالفين عسكريين متعارضين: الحلفاء (بقيادة بريطانيا والاتحاد السوفيتي والولايات المتحدة) ودول المحور (ألمانيا وإيطاليا واليابان).

    بدأت الحرب رسميًا في 1 سبتمبر 1939، مع غزو ألمانيا النازية لبولندا، مما أدى إلى إعلان فرنسا وبريطانيا الحرب على ألمانيا. امتد الصراع بسرعة ليشمل دولًا في جميع القارات، وكان بمثابة الصراع الأكثر دموية في تاريخ البشرية، حيث قتل ما بين 70 إلى 85 مليون شخص.

    تميزت الحرب العالمية الثانية بأحداث مهمة مثل المحرقة النازية، والقصف الاستراتيجي للمدن، واستخدام الأسلحة النووية في الحرب، والتطورات التكنولوجية والعسكرية الكبيرة.

    انتهت الحرب في أوروبا في 8 مايو 1945 (يوم النصر في أوروبا)، بعد استسلام ألمانيا. وانتهت في آسيا في 2 سبتمبر 1945، باستسلام اليابان بعد قصف هيروشيما وناغازاكي بالقنابل الذرية.

    كان للحرب العالمية الثانية آثار بعيدة المدى على السياسة والاقتصاد العالميين، بما في ذلك إنشاء الأمم المتحدة، وبداية الحرب الباردة، وتفكيك الإمبراطوريات الاستعمارية الأوروبية، وصعود الولايات المتحدة والاتحاد السوفيتي كقوى عظمى.`
  },
  {
    id: "algerianRevolution",
    title: "الثورة الجزائرية",
    originalText: `الثورة الجزائرية، المعروفة أيضًا باسم حرب التحرير الجزائرية، كانت حربًا خاضها الشعب الجزائري ضد الاستعمار الفرنسي من 1954 إلى 1962. وقد بدأت الثورة في 1 نوفمبر 1954، عندما أطلقت جبهة التحرير الوطني سلسلة من الهجمات المنسقة على أهداف عسكرية وحكومية فرنسية.

    كانت الجزائر مستعمرة فرنسية منذ عام 1830، وكانت تعتبر جزءًا لا يتجزأ من فرنسا. وعلى مدى أكثر من قرن، قامت فرنسا بتوطين مئات الآلاف من الأوروبيين (المعروفين باسم "الأقدام السوداء") في الجزائر، وحرمت السكان الأصليين من حقوقهم السياسية والاقتصادية.

    تميزت الثورة الجزائرية بحرب عصابات شرسة في المناطق الريفية، وأعمال تفجير وإرهاب في المدن، وقمع وحشي من قبل القوات الفرنسية، بما في ذلك التعذيب والإعدامات الجماعية. قامت فرنسا بنشر نصف مليون جندي في الجزائر في محاولة لقمع الثورة.

    أدت الثورة الجزائرية إلى أزمة سياسية عميقة في فرنسا، وسقوط الجمهورية الفرنسية الرابعة، وعودة الجنرال شارل ديغول إلى السلطة في عام 1958. وفي النهاية، تفاوض ديغول مع جبهة التحرير الوطني، مما أدى إلى اتفاقيات إيفيان واستقلال الجزائر في 5 يوليو 1962.

    كانت الثورة الجزائرية واحدة من أكثر حروب الاستقلال دموية في القرن العشرين، حيث قتل ما بين 300,000 و1,000,000 جزائري، فضلاً عن عشرات الآلاف من الفرنسيين والأوروبيين.

    أصبحت الثورة الجزائرية رمزًا للنضال ضد الاستعمار في العالم الثالث، وألهمت حركات التحرر الوطني الأخرى في أفريقيا وآسيا.`
  }
];

// Function to expand Arabic subjects into entities for visualization
export function expandArabicSubjects(): HistoricalEntity[] {
  // Cold War entities
  const coldWarEntities = [
    {
      id: "coldWar",
      name: "الحرب الباردة",
      type: "Period",
      startDate: "1947",
      endDate: "1991",
      description: "فترة من التوتر السياسي والعسكري بين القوى الغربية بقيادة الولايات المتحدة والكتلة الشرقية بقيادة الاتحاد السوفيتي.",
      significance: 9,
      group: "Politics",
      location: "",
      imageUrl: "",
      relations: [
        { targetId: "sovietUnion", type: "conflicting" },
        { targetId: "unitedStates", type: "conflicting" },
        { targetId: "berlinWall", type: "causal" }
      ]
    },
    {
      id: "sovietUnion",
      name: "الاتحاد السوفيتي",
      type: "Place",
      startDate: "1922",
      endDate: "1991",
      description: "دولة اشتراكية فيدرالية متعددة القوميات كانت موجودة في أوراسيا من عام 1922 إلى عام 1991.",
      significance: 8,
      group: "Politics",
      location: "Northern Eurasia",
      imageUrl: "https://images.unsplash.com/photo-1492321936769-b49830bc1d1e",
      relations: [
        { targetId: "coldWar", type: "conflicting" },
        { targetId: "berlinWall", type: "causal" }
      ]
    },
    {
      id: "unitedStates",
      name: "الولايات المتحدة الأمريكية",
      type: "Place",
      startDate: "1776",
      description: "جمهورية دستورية فيدرالية تتكون من 50 ولاية ومقاطعة فيدرالية واحدة.",
      significance: 8,
      group: "Politics",
      location: "North America",
      imageUrl: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
      relations: [
        { targetId: "coldWar", type: "conflicting" },
        { targetId: "berlinWall", type: "causal" }
      ]
    },
    {
      id: "berlinWall",
      name: "جدار برلين",
      type: "Building",
      startDate: "1961",
      endDate: "1989",
      description: "حاجز مادي وأيديولوجي بني بعد الحرب العالمية الثانية لفصل برلين الغربية عن برلين الشرقية وألمانيا الشرقية.",
      significance: 7,
      group: "Politics",
      location: "Berlin, Germany",
      imageUrl: "https://images.unsplash.com/photo-1433086966358-54859d0ed716",
      relations: []
    }
  ];

  // Liberation Movements entities
  const liberationMovementsEntities = [
    {
      id: "liberationMovements",
      name: "حركات التحرر الوطني",
      type: "Process",
      startDate: "1945",
      endDate: "1975",
      description: "سلسلة من الحركات السياسية والثورية التي سعت إلى تحرير البلدان من الاستعمار والسيطرة الأجنبية بعد الحرب العالمية الثانية.",
      significance: 8,
      group: "Politics",
      location: "",
      imageUrl: "",
      relations: [
        { targetId: "algerianRevolution", type: "evolutionary" },
        { targetId: "nasserism", type: "correlative" }
      ]
    },
    {
      id: "nasserism",
      name: "الناصرية",
      type: "Concept",
      startDate: "1952",
      endDate: "1970",
      description: "أيديولوجية سياسية عربية مستوحاة من سياسات الرئيس المصري جمال عبد الناصر، تدعو إلى القومية العربية والاشتراكية العربية.",
      significance: 7,
      group: "Politics",
      location: "",
      imageUrl: "",
      relations: [
        { targetId: "nasserGamal", type: "developed" }
      ]
    },
    {
      id: "nasserGamal",
      name: "جمال عبد الناصر",
      type: "Person",
      startDate: "1918",
      endDate: "1970",
      description: "زعيم سياسي مصري والرئيس الثاني لمصر، ساهم في نشر أفكار القومية العربية والاشتراكية العربية.",
      significance: 8,
      group: "Politics",
      location: "Egypt",
      imageUrl: "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb",
      relations: [
        { targetId: "suezCrisis", type: "causal" }
      ]
    },
    {
      id: "suezCrisis",
      name: "أزمة السويس",
      type: "Event",
      startDate: "1956",
      endDate: "1956",
      description: "أزمة دولية عندما قامت مصر بتأميم قناة السويس، مما أدى إلى تدخل عسكري من بريطانيا وفرنسا وإسرائيل.",
      significance: 7,
      group: "Politics",
      location: "Egypt",
      imageUrl: "",
      relations: []
    }
  ];

  // World War II entities
  const worldWar2Entities = [
    {
      id: "worldWar2",
      name: "الحرب العالمية الثانية",
      type: "Period",
      startDate: "1939",
      endDate: "1945",
      description: "نزاع عالمي بدأ في 1 سبتمبر 1939 بغزو ألمانيا النازية لبولندا وانتهى في 2 سبتمبر 1945 باستسلام اليابان.",
      significance: 10,
      group: "War",
      location: "Global",
      imageUrl: "",
      relations: [
        { targetId: "hitler", type: "causal" },
        { targetId: "holocaust", type: "causal" },
        { targetId: "liberationMovements", type: "ledTo" }
      ]
    },
    {
      id: "hitler",
      name: "أدولف هتلر",
      type: "Person",
      startDate: "1889",
      endDate: "1945",
      description: "سياسي ألماني كان زعيم الحزب النازي ومستشار ألمانيا من 1933 إلى 1945.",
      significance: 9,
      group: "Politics",
      location: "Germany",
      imageUrl: "",
      relations: [
        { targetId: "naziParty", type: "ledTo" },
        { targetId: "holocaust", type: "causal" }
      ]
    },
    {
      id: "naziParty",
      name: "الحزب النازي",
      type: "Concept",
      startDate: "1920",
      endDate: "1945",
      description: "حزب سياسي ألماني متطرف تأسس بعد الحرب العالمية الأولى وقاد ألمانيا إلى الحرب العالمية الثانية.",
      significance: 8,
      group: "Politics",
      location: "Germany",
      imageUrl: "",
      relations: [
        { targetId: "holocaust", type: "causal" }
      ]
    },
    {
      id: "holocaust",
      name: "المحرقة",
      type: "Event",
      startDate: "1941",
      endDate: "1945",
      description: "الإبادة الجماعية للستة ملايين يهودي أوروبي التي نفذتها ألمانيا النازية وحلفاؤها.",
      significance: 9,
      group: "War",
      location: "Europe",
      imageUrl: "",
      relations: []
    }
  ];

  // Algerian Revolution entities
  const algerianRevolutionEntities = [
    {
      id: "algerianRevolution",
      name: "الثورة الجزائرية",
      type: "Event",
      startDate: "1954",
      endDate: "1962",
      description: "حرب استقلال قادها جبهة التحرير الوطني الجزائرية ضد الاستعمار الفرنسي.",
      significance: 8,
      group: "Revolution",
      location: "Algeria",
      imageUrl: "https://images.unsplash.com/photo-1466442929976-97f336a657be",
      relations: [
        { targetId: "fln", type: "causal" },
        { targetId: "deMarguerite", type: "conflicting" }
      ]
    },
    {
      id: "fln",
      name: "جبهة التحرير الوطني",
      type: "Concept",
      startDate: "1954",
      description: "حزب سياسي جزائري وحركة ثورية قادت الكفاح من أجل استقلال الجزائر من فرنسا.",
      significance: 7,
      group: "Politics",
      location: "Algeria",
      imageUrl: "",
      relations: [
        { targetId: "benBella", type: "causal" }
      ]
    },
    {
      id: "benBella",
      name: "أحمد بن بلة",
      type: "Person",
      startDate: "1916",
      endDate: "2012",
      description: "ثوري جزائري وأول رئيس للجزائر المستقلة من 1963 إلى 1965.",
      significance: 7,
      group: "Politics",
      location: "Algeria",
      imageUrl: "",
      relations: []
    },
    {
      id: "deMarguerite",
      name: "مارسيل بيجار",
      type: "Person",
      startDate: "1907",
      endDate: "1990",
      description: "جنرال فرنسي اشتهر بدوره في معركة الجزائر وأساليبه القاسية في قمع المقاومة الجزائرية.",
      significance: 6,
      group: "Military",
      location: "France",
      imageUrl: "",
      relations: []
    }
  ];

  // Combine all entities
  const allEntities = [
    ...coldWarEntities,
    ...liberationMovementsEntities,
    ...worldWar2Entities,
    ...algerianRevolutionEntities
  ];

  // Add connections field to entities for ElementCard component
  allEntities.forEach(entity => {
    if (entity.relations) {
      entity.connections = entity.relations.map(relation => relation.targetId || relation.target || '');
    } else {
      entity.connections = [];
    }
  });

  return allEntities;
}

// Use the function to create the Arabic historical data from the subjects
export const arabicHistoricalData = expandArabicSubjects();

// Add the original mock data
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

// Add connections field to entities for ElementCard component
mockHistoricalData.forEach(entity => {
  if (entity.relations) {
    entity.connections = entity.relations.map(relation => relation.target || relation.targetId || '');
  } else {
    entity.connections = [];
  }
});
