
import { FormattedHistoricalEntity } from "@/types/supabase";
import { v4 as uuidv4 } from 'uuid';

interface HistoricalSubject {
  id: string;
  title: string;
  originalText: string;
}

// Function to convert a historical subject into a set of entities for visualization
export const generateEntitiesFromSubject = (subject: HistoricalSubject): FormattedHistoricalEntity[] => {
  // Map of subject titles to their entity generation functions
  const subjectGenerators: Record<string, () => FormattedHistoricalEntity[]> = {
    "الحرب الباردة": generateColdWarEntities,
    "حركات التحرر": generateLiberationMovementsEntities,
    "الحرب العالمية الثانية": generateWWIIEntities,
    "الثورة الجزائرية": generateAlgerianRevolutionEntities
  };

  // Get the generator function for this subject or use default
  const generator = subjectGenerators[subject.title] || generateDefaultEntities;
  
  // Generate the entities using the appropriate generator
  return generator();

  // Default entity generator for any subject
  function generateDefaultEntities(): FormattedHistoricalEntity[] {
    // Extract main concepts from the subject text
    const mainConcept: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: subject.title,
      type: "concept",
      description: subject.originalText.substring(0, 200) + "...",
      significance: 10,
      startDate: "",
      endDate: "",
      relations: []
    };
    
    return [mainConcept];
  }

  // Cold War entities generator
  function generateColdWarEntities(): FormattedHistoricalEntity[] {
    const entities: FormattedHistoricalEntity[] = [];
    
    // Main event entity
    const coldWar: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "الحرب الباردة",
      type: "event",
      description: "فترة من التوتر الجيوسياسي بين الاتحاد السوفيتي والولايات المتحدة وحلفائهما.",
      significance: 10,
      startDate: "1947-03-12",
      endDate: "1991-12-26",
      relations: []
    };
    entities.push(coldWar);
    
    // Major powers
    const usa: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "الولايات المتحدة الأمريكية",
      type: "place",
      description: "قوة عظمى قادت المعسكر الغربي الرأسمالي خلال الحرب الباردة",
      significance: 9,
      location: "North America",
      relations: []
    };
    
    const ussr: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "الاتحاد السوفيتي",
      type: "place",
      description: "قوة عظمى قادت المعسكر الشرقي الشيوعي خلال الحرب الباردة",
      significance: 9,
      startDate: "1922-12-30",
      endDate: "1991-12-26",
      location: "Eurasia",
      relations: []
    };
    
    // Key concepts
    const capitalism: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "الرأسمالية",
      type: "concept",
      description: "نظام اقتصادي يقوم على الملكية الخاصة لوسائل الإنتاج",
      significance: 8,
      relations: []
    };
    
    const communism: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "الشيوعية",
      type: "concept",
      description: "نظرية سياسية واقتصادية تهدف إلى إنشاء مجتمع خالٍ من الطبقات",
      significance: 8,
      relations: []
    };
    
    // Key events
    const berlinWall: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "جدار برلين",
      type: "event",
      description: "حاجز أمني فصل برلين الغربية عن ألمانيا الشرقية وبرلين الشرقية",
      significance: 8,
      startDate: "1961-08-13",
      endDate: "1989-11-09",
      location: "Berlin, Germany",
      relations: []
    };
    
    const cubanMissileCrisis: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "أزمة الصواريخ الكوبية",
      type: "event",
      description: "مواجهة بين الولايات المتحدة والاتحاد السوفيتي بشأن صواريخ سوفيتية في كوبا",
      significance: 9,
      startDate: "1962-10-16",
      endDate: "1962-10-28",
      location: "Cuba",
      relations: []
    };
    
    // Key figures
    const kennedyJFK: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "جون كينيدي",
      type: "person",
      description: "الرئيس 35 للولايات المتحدة خلال أزمة الصواريخ الكوبية",
      significance: 7,
      startDate: "1917-05-29", 
      endDate: "1963-11-22",
      relations: []
    };
    
    const khrushchev: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "نيكيتا خروتشوف",
      type: "person",
      description: "زعيم الاتحاد السوفيتي خلال أزمة الصواريخ الكوبية",
      significance: 7,
      startDate: "1894-04-15",
      endDate: "1971-09-11",
      relations: []
    };
    
    // Add relations
    coldWar.relations = [
      { targetId: usa.id, type: "conflicting", strength: 3 },
      { targetId: ussr.id, type: "conflicting", strength: 3 },
      { targetId: berlinWall.id, type: "causal", strength: 2 },
      { targetId: cubanMissileCrisis.id, type: "causal", strength: 2 }
    ];
    
    usa.relations = [
      { targetId: coldWar.id, type: "correlative", strength: 3 },
      { targetId: capitalism.id, type: "correlative", strength: 3 },
      { targetId: kennedyJFK.id, type: "correlative", strength: 2 },
      { targetId: ussr.id, type: "conflicting", strength: 3 }
    ];
    
    ussr.relations = [
      { targetId: coldWar.id, type: "correlative", strength: 3 },
      { targetId: communism.id, type: "correlative", strength: 3 },
      { targetId: khrushchev.id, type: "correlative", strength: 2 },
      { targetId: usa.id, type: "conflicting", strength: 3 }
    ];
    
    berlinWall.relations = [
      { targetId: coldWar.id, type: "correlative", strength: 2 },
      { targetId: ussr.id, type: "causal", strength: 2 }
    ];
    
    cubanMissileCrisis.relations = [
      { targetId: coldWar.id, type: "correlative", strength: 3 },
      { targetId: usa.id, type: "correlative", strength: 2 },
      { targetId: ussr.id, type: "correlative", strength: 2 },
      { targetId: kennedyJFK.id, type: "correlative", strength: 2 },
      { targetId: khrushchev.id, type: "correlative", strength: 2 }
    ];
    
    kennedyJFK.relations = [
      { targetId: usa.id, type: "correlative", strength: 3 },
      { targetId: cubanMissileCrisis.id, type: "correlative", strength: 2 }
    ];
    
    khrushchev.relations = [
      { targetId: ussr.id, type: "correlative", strength: 3 },
      { targetId: cubanMissileCrisis.id, type: "correlative", strength: 2 }
    ];
    
    entities.push(usa, ussr, capitalism, communism, berlinWall, cubanMissileCrisis, kennedyJFK, khrushchev);
    return entities;
  }

  // Liberation Movements entities generator
  function generateLiberationMovementsEntities(): FormattedHistoricalEntity[] {
    const entities: FormattedHistoricalEntity[] = [];
    
    // Main concept
    const liberationMovements: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "حركات التحرر",
      type: "concept",
      description: "مجموعة من الحركات السياسية والاجتماعية والعسكرية التي ظهرت في أعقاب الحرب العالمية الثانية ضد الاستعمار",
      significance: 10,
      startDate: "1945-01-01",
      endDate: "1975-01-01",
      relations: []
    };
    entities.push(liberationMovements);
    
    // Key events and movements
    const indianIndependence: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "استقلال الهند",
      type: "event",
      description: "نيل الهند استقلالها من بريطانيا في عام 1947",
      significance: 8,
      startDate: "1947-08-15",
      location: "India",
      relations: []
    };
    
    const algerianWar: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "حرب التحرير الجزائرية",
      type: "event",
      description: "ثورة ضد الحكم الاستعماري الفرنسي في الجزائر",
      significance: 8,
      startDate: "1954-11-01",
      endDate: "1962-07-05",
      location: "Algeria",
      relations: []
    };
    
    const panAfricanism: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "حركة الوحدة الأفريقية",
      type: "concept",
      description: "حركة سياسية تهدف إلى توحيد الأفارقة في القارة وفي الشتات",
      significance: 7,
      relations: []
    };
    
    const arabNationalism: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "القومية العربية",
      type: "concept",
      description: "حركة سياسية تدعو إلى توحيد الشعوب الناطقة بالعربية في دولة واحدة",
      significance: 7,
      relations: []
    };
    
    // Key figures
    const gandhi: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "المهاتما غاندي",
      type: "person",
      description: "القائد الروحي لحركة استقلال الهند وداعية العصيان المدني اللاعنفي",
      significance: 9,
      startDate: "1869-10-02",
      endDate: "1948-01-30",
      relations: []
    };
    
    const nasser: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "جمال عبد الناصر",
      type: "person",
      description: "رئيس مصر ورمز القومية العربية",
      significance: 8,
      startDate: "1918-01-15",
      endDate: "1970-09-28",
      relations: []
    };
    
    const mandela: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "نيلسون مانديلا",
      type: "person",
      description: "ناشط مناهض للفصل العنصري وأول رئيس أسود لجنوب أفريقيا",
      significance: 9,
      startDate: "1918-07-18",
      endDate: "2013-12-05",
      relations: []
    };
    
    // Add relations
    liberationMovements.relations = [
      { targetId: indianIndependence.id, type: "causal", strength: 2 },
      { targetId: algerianWar.id, type: "causal", strength: 2 },
      { targetId: panAfricanism.id, type: "correlative", strength: 2 },
      { targetId: arabNationalism.id, type: "correlative", strength: 2 }
    ];
    
    indianIndependence.relations = [
      { targetId: liberationMovements.id, type: "correlative", strength: 2 },
      { targetId: gandhi.id, type: "correlative", strength: 3 }
    ];
    
    algerianWar.relations = [
      { targetId: liberationMovements.id, type: "correlative", strength: 2 },
      { targetId: arabNationalism.id, type: "correlative", strength: 2 }
    ];
    
    arabNationalism.relations = [
      { targetId: liberationMovements.id, type: "correlative", strength: 2 },
      { targetId: nasser.id, type: "correlative", strength: 3 }
    ];
    
    gandhi.relations = [
      { targetId: indianIndependence.id, type: "causal", strength: 3 }
    ];
    
    nasser.relations = [
      { targetId: arabNationalism.id, type: "correlative", strength: 3 }
    ];
    
    mandela.relations = [
      { targetId: liberationMovements.id, type: "correlative", strength: 2 },
      { targetId: panAfricanism.id, type: "correlative", strength: 2 }
    ];
    
    entities.push(indianIndependence, algerianWar, panAfricanism, arabNationalism, gandhi, nasser, mandela);
    return entities;
  }

  // World War II entities generator
  function generateWWIIEntities(): FormattedHistoricalEntity[] {
    const entities: FormattedHistoricalEntity[] = [];
    
    // Main event
    const wwii: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "الحرب العالمية الثانية",
      type: "event",
      description: "نزاع عالمي استمر من 1939 إلى 1945، وأشرك العديد من دول العالم",
      significance: 10,
      startDate: "1939-09-01",
      endDate: "1945-09-02",
      relations: []
    };
    entities.push(wwii);
    
    // Major powers - Allies
    const allies: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "قوات الحلفاء",
      type: "concept",
      description: "تحالف الدول التي حاربت ضد دول المحور في الحرب العالمية الثانية",
      significance: 9,
      relations: []
    };
    
    const uk: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "المملكة المتحدة",
      type: "place",
      description: "إحدى القوى الرئيسية في تحالف الحلفاء",
      significance: 8,
      location: "Europe",
      relations: []
    };
    
    const usa: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "الولايات المتحدة",
      type: "place",
      description: "قوة حليفة رئيسية انضمت للحرب بعد هجوم بيرل هاربر",
      significance: 8,
      location: "North America",
      relations: []
    };
    
    const ussr: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "الاتحاد السوفيتي",
      type: "place",
      description: "قوة حليفة رئيسية تكبدت أكبر خسائر بشرية في الحرب",
      significance: 8,
      location: "Eurasia",
      relations: []
    };
    
    // Major powers - Axis
    const axis: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "دول المحور",
      type: "concept",
      description: "تحالف المانيا النازية وإيطاليا الفاشية واليابان وحلفائهم",
      significance: 9,
      relations: []
    };
    
    const naziGermany: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "ألمانيا النازية",
      type: "place",
      description: "القوة الرئيسية في دول المحور بقيادة أدولف هتلر",
      significance: 8,
      startDate: "1933-01-30",
      endDate: "1945-05-08",
      location: "Europe",
      relations: []
    };
    
    const japan: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "اليابان",
      type: "place",
      description: "قوة محورية استهدفت التوسع في آسيا والمحيط الهادئ",
      significance: 8,
      location: "Asia",
      relations: []
    };
    
    // Key events
    const pearlHarbor: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "هجوم بيرل هاربر",
      type: "event",
      description: "هجوم ياباني مفاجئ على القاعدة البحرية الأمريكية في هاواي",
      significance: 8,
      startDate: "1941-12-07",
      location: "Hawaii, USA",
      relations: []
    };
    
    const normandy: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "عملية الإنزال في نورماندي",
      type: "event",
      description: "غزو الحلفاء لشمال غرب أوروبا المحتلة من قبل النازيين",
      significance: 8,
      startDate: "1944-06-06",
      location: "Normandy, France",
      relations: []
    };
    
    const hiroshima: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "قنبلة هيروشيما",
      type: "event",
      description: "إلقاء أول قنبلة ذرية في التاريخ على مدينة هيروشيما اليابانية",
      significance: 9,
      startDate: "1945-08-06",
      location: "Hiroshima, Japan",
      relations: []
    };
    
    // Key figures
    const hitler: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "أدولف هتلر",
      type: "person",
      description: "زعيم ألمانيا النازية ومحرك الحرب العالمية الثانية في أوروبا",
      significance: 9,
      startDate: "1889-04-20",
      endDate: "1945-04-30",
      relations: []
    };
    
    const churchill: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "ونستون تشرشل",
      type: "person",
      description: "رئيس وزراء المملكة المتحدة خلال معظم فترة الحرب العالمية الثانية",
      significance: 8,
      startDate: "1874-11-30",
      endDate: "1965-01-24",
      relations: []
    };
    
    // Add relations
    wwii.relations = [
      { targetId: allies.id, type: "causal", strength: 3 },
      { targetId: axis.id, type: "causal", strength: 3 },
      { targetId: pearlHarbor.id, type: "correlative", strength: 2 },
      { targetId: normandy.id, type: "correlative", strength: 2 },
      { targetId: hiroshima.id, type: "correlative", strength: 2 }
    ];
    
    allies.relations = [
      { targetId: uk.id, type: "correlative", strength: 3 },
      { targetId: usa.id, type: "correlative", strength: 3 },
      { targetId: ussr.id, type: "correlative", strength: 3 },
      { targetId: axis.id, type: "conflicting", strength: 3 }
    ];
    
    axis.relations = [
      { targetId: naziGermany.id, type: "correlative", strength: 3 },
      { targetId: japan.id, type: "correlative", strength: 3 },
      { targetId: allies.id, type: "conflicting", strength: 3 }
    ];
    
    naziGermany.relations = [
      { targetId: hitler.id, type: "correlative", strength: 3 },
      { targetId: axis.id, type: "correlative", strength: 3 }
    ];
    
    uk.relations = [
      { targetId: churchill.id, type: "correlative", strength: 3 },
      { targetId: allies.id, type: "correlative", strength: 3 }
    ];
    
    japan.relations = [
      { targetId: pearlHarbor.id, type: "causal", strength: 3 },
      { targetId: hiroshima.id, type: "correlative", strength: 3 }
    ];
    
    pearlHarbor.relations = [
      { targetId: japan.id, type: "causal", strength: 3 },
      { targetId: usa.id, type: "causal", strength: 3 }
    ];
    
    usa.relations = [
      { targetId: pearlHarbor.id, type: "correlative", strength: 2 },
      { targetId: hiroshima.id, type: "causal", strength: 3 }
    ];
    
    entities.push(allies, uk, usa, ussr, axis, naziGermany, japan, pearlHarbor, normandy, hiroshima, hitler, churchill);
    return entities;
  }

  // Algerian Revolution entities generator
  function generateAlgerianRevolutionEntities(): FormattedHistoricalEntity[] {
    const entities: FormattedHistoricalEntity[] = [];
    
    // Main event
    const algerianRevolution: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "الثورة الجزائرية",
      type: "event",
      description: "حرب استقلال الجزائر ضد الاستعمار الفرنسي من 1954 إلى 1962",
      significance: 10,
      startDate: "1954-11-01",
      endDate: "1962-07-05",
      location: "Algeria",
      relations: []
    };
    entities.push(algerianRevolution);
    
    // Organizations
    const fln: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "جبهة التحرير الوطني",
      type: "concept",
      description: "المنظمة السياسية والعسكرية الرئيسية التي قادت الثورة الجزائرية",
      significance: 9,
      startDate: "1954-11-01",
      relations: []
    };
    
    const oas: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "منظمة الجيش السري",
      type: "concept",
      description: "منظمة إرهابية فرنسية عارضت استقلال الجزائر",
      significance: 7,
      startDate: "1961-02-11",
      endDate: "1962-06-28",
      relations: []
    };
    
    // Countries and places
    const france: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "فرنسا",
      type: "place",
      description: "القوة الاستعمارية التي احتلت الجزائر من 1830 إلى 1962",
      significance: 8,
      location: "Europe",
      relations: []
    };
    
    const algeria: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "الجزائر",
      type: "place",
      description: "المستعمرة الفرنسية التي ناضلت للاستقلال",
      significance: 8,
      location: "North Africa",
      relations: []
    };
    
    // Key events
    const setifMassacre: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "مجزرة سطيف",
      type: "event",
      description: "قمع فرنسي دموي للمظاهرات الجزائرية في 8 مايو 1945",
      significance: 8,
      startDate: "1945-05-08",
      location: "Setif, Algeria",
      relations: []
    };
    
    const evianAccords: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "اتفاقيات إيفيان",
      type: "event",
      description: "الاتفاق الذي أنهى حرب الجزائر وأدى إلى استقلال الجزائر",
      significance: 9,
      startDate: "1962-03-18",
      location: "Evian-les-Bains, France",
      relations: []
    };
    
    const independenceDay: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "يوم الاستقلال الجزائري",
      type: "event",
      description: "إعلان استقلال الجزائر رسميًا عن فرنسا",
      significance: 10,
      startDate: "1962-07-05",
      location: "Algeria",
      relations: []
    };
    
    // Key figures
    const benBella: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "أحمد بن بلة",
      type: "person",
      description: "أحد قادة الثورة الجزائرية وأول رئيس للجزائر المستقلة",
      significance: 8,
      startDate: "1916-12-25",
      endDate: "2012-04-11",
      relations: []
    };
    
    const deGaulle: FormattedHistoricalEntity = {
      id: uuidv4(),
      name: "شارل ديغول",
      type: "person",
      description: "رئيس فرنسا الذي تفاوض على استقلال الجزائر",
      significance: 8,
      startDate: "1890-11-22",
      endDate: "1970-11-09",
      relations: []
    };
    
    // Add relations
    algerianRevolution.relations = [
      { targetId: fln.id, type: "correlative", strength: 3 },
      { targetId: france.id, type: "conflicting", strength: 3 },
      { targetId: algeria.id, type: "correlative", strength: 3 },
      { targetId: setifMassacre.id, type: "correlative", strength: 2 },
      { targetId: evianAccords.id, type: "correlative", strength: 2 },
      { targetId: independenceDay.id, type: "causal", strength: 3 }
    ];
    
    fln.relations = [
      { targetId: algerianRevolution.id, type: "correlative", strength: 3 },
      { targetId: benBella.id, type: "correlative", strength: 3 },
      { targetId: oas.id, type: "conflicting", strength: 3 }
    ];
    
    france.relations = [
      { targetId: algeria.id, type: "conflicting", strength: 3 },
      { targetId: deGaulle.id, type: "correlative", strength: 3 },
      { targetId: evianAccords.id, type: "correlative", strength: 2 }
    ];
    
    setifMassacre.relations = [
      { targetId: algerianRevolution.id, type: "causal", strength: 2 },
      { targetId: france.id, type: "causal", strength: 2 }
    ];
    
    benBella.relations = [
      { targetId: fln.id, type: "correlative", strength: 3 },
      { targetId: independenceDay.id, type: "correlative", strength: 2 }
    ];
    
    deGaulle.relations = [
      { targetId: france.id, type: "correlative", strength: 3 },
      { targetId: evianAccords.id, type: "causal", strength: 3 }
    ];
    
    evianAccords.relations = [
      { targetId: independenceDay.id, type: "causal", strength: 3 }
    ];
    
    entities.push(fln, oas, france, algeria, setifMassacre, evianAccords, independenceDay, benBella, deGaulle);
    return entities;
  }
};
