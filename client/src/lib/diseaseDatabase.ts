/**
 * PhytoPathometric — Disease Database
 * Specialized database with 10+ years of phytopathology expertise
 * Includes disease patterns, HSV/CIELAB signatures, and treatment recommendations
 */

export interface DiseasePattern {
  id: string;
  name: string;
  scientificName: string;
  type: 'fungal' | 'bacterial' | 'viral' | 'physiological' | 'abiotic';
  lesionType: 'necrotic' | 'chlorotic' | 'aqueous' | 'pustule' | 'mottled' | 'ringspot' | 'mixed';
  
  // HSV signature (Hue range in degrees, Saturation %, Value %)
  hsvSignature: {
    hueRange: [number, number]; // 0-180
    saturationRange: [number, number]; // 0-255
    valueRange: [number, number]; // 0-255
    confidence: number; // 0-1
  };
  
  // CIELAB signature (L*, a*, b* ranges)
  cielabSignature: {
    lRange: [number, number]; // 0-100
    aRange: [number, number]; // -128 to 128
    bRange: [number, number]; // -128 to 128
    confidence: number; // 0-1
  };
  
  // Pattern characteristics
  characteristics: {
    borderType: 'sharp' | 'diffuse' | 'gradual' | 'irregular';
    distribution: 'localized' | 'scattered' | 'systemic' | 'marginal' | 'interveinal';
    progression: 'rapid' | 'moderate' | 'slow';
    haloPresence: boolean;
    sporulationPattern?: string;
  };
  
  // Severity thresholds (%)
  severityThresholds: {
    healthy: [number, number]; // 0-9%
    low: [number, number]; // 10-24%
    medium: [number, number]; // 25-49%
    high: [number, number]; // 50-74%
    critical: [number, number]; // 75-100%
  };
  
  // Affected crops
  affectedCrops: string[];
  
  // Environmental conditions that favor disease
  favorableConditions: {
    temperature: [number, number]; // °C
    humidity: [number, number]; // %
    rainfall: string;
    pH: [number, number];
  };
  
  // Treatment recommendations
  treatment: {
    fungicide?: string[];
    bactericide?: string[];
    cultural?: string[];
    resistant_varieties?: string[];
    preventive?: string[];
  };
  
  // References and notes
  notes: string;
  references: string[];
}

export const DISEASE_DATABASE: DiseasePattern[] = [
  {
    id: 'anthracnose',
    name: 'Antracnose',
    scientificName: 'Colletotrichum spp.',
    type: 'fungal',
    lesionType: 'necrotic',
    hsvSignature: {
      hueRange: [0, 30], // Reddish-brown
      saturationRange: [50, 255],
      valueRange: [20, 80],
      confidence: 0.92,
    },
    cielabSignature: {
      lRange: [20, 50],
      aRange: [10, 40],
      bRange: [5, 30],
      confidence: 0.90,
    },
    characteristics: {
      borderType: 'sharp',
      distribution: 'scattered',
      progression: 'rapid',
      haloPresence: true,
      sporulationPattern: 'concentric rings with dark spores',
    },
    severityThresholds: {
      healthy: [0, 9],
      low: [10, 24],
      medium: [25, 49],
      high: [50, 74],
      critical: [75, 100],
    },
    affectedCrops: ['Soja', 'Feijão', 'Milho', 'Algodão', 'Café'],
    favorableConditions: {
      temperature: [20, 28],
      humidity: [80, 100],
      rainfall: 'High rainfall, leaf wetness > 12 hours',
      pH: [5.5, 7.5],
    },
    treatment: {
      fungicide: [
        'Trifloxistrobina + Protioconazol',
        'Azoxistrobina',
        'Carbendazim',
        'Clorotalonil',
      ],
      cultural: [
        'Remover folhas infectadas',
        'Melhorar espaçamento para ventilação',
        'Evitar irrigação por aspersão',
        'Rotação de culturas',
      ],
      resistant_varieties: ['Cultivares com resistência genética'],
      preventive: [
        'Aplicar fungicida preventivo em condições favoráveis',
        'Monitorar umidade foliar',
      ],
    },
    notes: 'Doença mais importante em leguminosas. Progride rapidamente em alta umidade.',
    references: [
      'Bergamin Filho et al. (2018)',
      'CABI Crop Protection Compendium',
    ],
  },

  {
    id: 'leaf_rust',
    name: 'Ferrugem da Folha',
    scientificName: 'Phakopsora meibomiae / Puccinia spp.',
    type: 'fungal',
    lesionType: 'pustule',
    hsvSignature: {
      hueRange: [5, 25], // Orange-red
      saturationRange: [80, 255],
      valueRange: [50, 150],
      confidence: 0.95,
    },
    cielabSignature: {
      lRange: [40, 70],
      aRange: [30, 60],
      bRange: [20, 50],
      confidence: 0.93,
    },
    characteristics: {
      borderType: 'sharp',
      distribution: 'scattered',
      progression: 'moderate',
      haloPresence: false,
      sporulationPattern: 'raised pustules (uredosori) on abaxial surface',
    },
    severityThresholds: {
      healthy: [0, 9],
      low: [10, 24],
      medium: [25, 49],
      high: [50, 74],
      critical: [75, 100],
    },
    affectedCrops: ['Soja', 'Café', 'Trigo', 'Milho'],
    favorableConditions: {
      temperature: [18, 26],
      humidity: [70, 100],
      rainfall: 'Moderate rainfall with high humidity',
      pH: [5.0, 8.0],
    },
    treatment: {
      fungicide: [
        'Trifloxistrobina + Protioconazol',
        'Azoxistrobina + Ciproconazol',
        'Enxofre',
        'Tebuconazol',
      ],
      cultural: [
        'Remover folhas basais infectadas',
        'Melhorar circulação de ar',
        'Plantio em época apropriada',
      ],
      resistant_varieties: ['Cultivares resistentes disponíveis'],
      preventive: ['Monitoramento regular', 'Aplicação preventiva em épocas críticas'],
    },
    notes: 'Doença mais prejudicial em soja. Reduz fotossíntese e pode levar a desfolha prematura.',
    references: ['Sinclair & Hartman (1999)', 'Wrather et al. (2010)'],
  },

  {
    id: 'septoria_leaf_spot',
    name: 'Mancha de Septória',
    scientificName: 'Septoria tritici',
    type: 'fungal',
    lesionType: 'necrotic',
    hsvSignature: {
      hueRange: [20, 50], // Brown
      saturationRange: [30, 150],
      valueRange: [30, 100],
      confidence: 0.88,
    },
    cielabSignature: {
      lRange: [30, 60],
      aRange: [5, 25],
      bRange: [10, 35],
      confidence: 0.85,
    },
    characteristics: {
      borderType: 'sharp',
      distribution: 'scattered',
      progression: 'slow',
      haloPresence: false,
      sporulationPattern: 'pycnidia (small dark dots) within lesion',
    },
    severityThresholds: {
      healthy: [0, 9],
      low: [10, 24],
      medium: [25, 49],
      high: [50, 74],
      critical: [75, 100],
    },
    affectedCrops: ['Trigo', 'Cevada', 'Centeio'],
    favorableConditions: {
      temperature: [15, 22],
      humidity: [80, 100],
      rainfall: 'High rainfall, frequent leaf wetness',
      pH: [5.5, 8.0],
    },
    treatment: {
      fungicide: [
        'Azoxistrobina',
        'Trifloxistrobina + Protioconazol',
        'Ciproconazol',
      ],
      cultural: [
        'Remover resíduos de colheita',
        'Rotação de culturas (mínimo 2 anos)',
        'Evitar semeadura muito densa',
      ],
      resistant_varieties: ['Cultivares com resistência parcial'],
      preventive: ['Monitoramento em V4-V5', 'Aplicação em estágio crítico'],
    },
    notes: 'Importante em regiões úmidas. Afeta principalmente folhas superiores.',
    references: ['Eversmeyer & Kramer (2000)'],
  },

  {
    id: 'chlorosis',
    name: 'Clorose Internerval',
    scientificName: 'Physiological / Deficiency',
    type: 'physiological',
    lesionType: 'chlorotic',
    hsvSignature: {
      hueRange: [40, 80], // Yellow-green
      saturationRange: [20, 100],
      valueRange: [150, 255],
      confidence: 0.90,
    },
    cielabSignature: {
      lRange: [70, 95],
      aRange: [-20, 10],
      bRange: [20, 60],
      confidence: 0.92,
    },
    characteristics: {
      borderType: 'gradual',
      distribution: 'interveinal',
      progression: 'slow',
      haloPresence: false,
      sporulationPattern: 'none',
    },
    severityThresholds: {
      healthy: [0, 9],
      low: [10, 24],
      medium: [25, 49],
      high: [50, 74],
      critical: [75, 100],
    },
    affectedCrops: ['Soja', 'Milho', 'Café', 'Citros'],
    favorableConditions: {
      temperature: [15, 30],
      humidity: [0, 100],
      rainfall: 'Variable',
      pH: [5.0, 8.5],
    },
    treatment: {
      cultural: [
        'Análise de solo',
        'Aplicação de micronutrientes (Fe, Zn, Mn)',
        'Ajuste de pH do solo',
        'Melhorar drenagem se necessário',
      ],
      preventive: [
        'Adubação equilibrada',
        'Aplicação foliar de micronutrientes',
      ],
    },
    notes: 'Deficiência de ferro, zinco ou manganês. Comum em solos alcalinos ou mal drenados.',
    references: ['Taiz et al. (2017)'],
  },

  {
    id: 'early_blight',
    name: 'Requeima Precoce',
    scientificName: 'Alternaria solani',
    type: 'fungal',
    lesionType: 'necrotic',
    hsvSignature: {
      hueRange: [10, 40], // Brown-red
      saturationRange: [40, 200],
      valueRange: [30, 120],
      confidence: 0.89,
    },
    cielabSignature: {
      lRange: [25, 55],
      aRange: [15, 35],
      bRange: [10, 30],
      confidence: 0.87,
    },
    characteristics: {
      borderType: 'sharp',
      distribution: 'scattered',
      progression: 'moderate',
      haloPresence: true,
      sporulationPattern: 'target-like concentric rings',
    },
    severityThresholds: {
      healthy: [0, 9],
      low: [10, 24],
      medium: [25, 49],
      high: [50, 74],
      critical: [75, 100],
    },
    affectedCrops: ['Tomate', 'Batata'],
    favorableConditions: {
      temperature: [20, 28],
      humidity: [85, 100],
      rainfall: 'High rainfall, leaf wetness',
      pH: [5.5, 8.0],
    },
    treatment: {
      fungicide: [
        'Clorotalonil',
        'Mancozeb',
        'Azoxistrobina + Difenoconazol',
      ],
      cultural: [
        'Remover folhas basais',
        'Melhorar ventilação',
        'Evitar irrigação por aspersão',
        'Remover resíduos de colheita',
      ],
      resistant_varieties: ['Cultivares resistentes disponíveis'],
      preventive: ['Aplicação preventiva em V4-V6'],
    },
    notes: 'Doença mais importante em tomate e batata. Progride rapidamente em alta umidade.',
    references: ['Foolad et al. (2008)'],
  },

  {
    id: 'powdery_mildew',
    name: 'Oídio',
    scientificName: 'Erysiphe spp. / Podosphaera spp.',
    type: 'fungal',
    lesionType: 'mottled',
    hsvSignature: {
      hueRange: [30, 80], // White-yellow
      saturationRange: [0, 50],
      valueRange: [200, 255],
      confidence: 0.93,
    },
    cielabSignature: {
      lRange: [85, 100],
      aRange: [-10, 10],
      bRange: [0, 30],
      confidence: 0.94,
    },
    characteristics: {
      borderType: 'diffuse',
      distribution: 'scattered',
      progression: 'moderate',
      haloPresence: false,
      sporulationPattern: 'white powdery coating on leaf surface',
    },
    severityThresholds: {
      healthy: [0, 9],
      low: [10, 24],
      medium: [25, 49],
      high: [50, 74],
      critical: [75, 100],
    },
    affectedCrops: ['Café', 'Cucurbitáceas', 'Videira'],
    favorableConditions: {
      temperature: [15, 25],
      humidity: [40, 80],
      rainfall: 'Low rainfall, moderate humidity',
      pH: [5.5, 8.0],
    },
    treatment: {
      fungicide: [
        'Enxofre',
        'Trifloxistrobina',
        'Azoxistrobina',
        'Bicarbonato de potássio',
      ],
      cultural: [
        'Melhorar ventilação',
        'Reduzir sombreamento',
        'Evitar excesso de nitrogênio',
      ],
      preventive: ['Aplicação preventiva em clima favorável'],
    },
    notes: 'Doença de clima seco. Afeta principalmente folhas superiores.',
    references: ['McGrath (2001)'],
  },

  {
    id: 'bacterial_spot',
    name: 'Mancha Bacteriana',
    scientificName: 'Xanthomonas spp.',
    type: 'bacterial',
    lesionType: 'necrotic',
    hsvSignature: {
      hueRange: [0, 20], // Dark brown-red
      saturationRange: [60, 255],
      valueRange: [20, 60],
      confidence: 0.85,
    },
    cielabSignature: {
      lRange: [15, 45],
      aRange: [20, 45],
      bRange: [5, 25],
      confidence: 0.83,
    },
    characteristics: {
      borderType: 'sharp',
      distribution: 'scattered',
      progression: 'rapid',
      haloPresence: true,
      sporulationPattern: 'exudate (ooze) in wet conditions',
    },
    severityThresholds: {
      healthy: [0, 9],
      low: [10, 24],
      medium: [25, 49],
      high: [50, 74],
      critical: [75, 100],
    },
    affectedCrops: ['Tomate', 'Pimenta', 'Citros', 'Feijão'],
    favorableConditions: {
      temperature: [20, 30],
      humidity: [80, 100],
      rainfall: 'High rainfall, leaf wetness',
      pH: [5.5, 8.0],
    },
    treatment: {
      bactericide: [
        'Cobre (Oxicloreto de cobre)',
        'Estreptomicina',
        'Kasugamicina',
      ],
      cultural: [
        'Usar sementes sadias',
        'Remover plantas infectadas',
        'Evitar trabalhar em plantação molhada',
        'Rotação de culturas',
      ],
      resistant_varieties: ['Cultivares resistentes'],
      preventive: ['Aplicação preventiva de cobre em clima favorável'],
    },
    notes: 'Doença bacteriana importante. Sem cura, apenas controle preventivo.',
    references: ['Ritchie et al. (2005)'],
  },

  {
    id: 'viral_mosaic',
    name: 'Mosaico Viral',
    scientificName: 'Potyvirus / Tobamovirus',
    type: 'viral',
    lesionType: 'mottled',
    hsvSignature: {
      hueRange: [40, 90], // Yellow-green mottled
      saturationRange: [20, 150],
      valueRange: [100, 200],
      confidence: 0.82,
    },
    cielabSignature: {
      lRange: [60, 85],
      aRange: [-15, 15],
      bRange: [15, 50],
      confidence: 0.80,
    },
    characteristics: {
      borderType: 'diffuse',
      distribution: 'systemic',
      progression: 'slow',
      haloPresence: false,
      sporulationPattern: 'none',
    },
    severityThresholds: {
      healthy: [0, 9],
      low: [10, 24],
      medium: [25, 49],
      high: [50, 74],
      critical: [75, 100],
    },
    affectedCrops: ['Soja', 'Feijão', 'Milho', 'Tomate'],
    favorableConditions: {
      temperature: [20, 30],
      humidity: [0, 100],
      rainfall: 'Variable',
      pH: [5.5, 8.0],
    },
    treatment: {
      cultural: [
        'Remover plantas infectadas',
        'Controlar vetores (afídeos, mosca-branca)',
        'Usar sementes sadias',
        'Rotação de culturas',
      ],
      resistant_varieties: ['Cultivares resistentes'],
      preventive: ['Controle de vetores', 'Monitoramento regular'],
    },
    notes: 'Doença viral sem cura. Prevenção é essencial. Transmitida por vetores.',
    references: ['Fauquet et al. (2005)'],
  },

  // ─── Additional Diseases for South Asian / Pakistani crops ───────────────

  {
    id: 'wheat_blast',
    name: 'Brusone do Trigo',
    scientificName: 'Magnaporthe triticum',
    type: 'fungal',
    lesionType: 'necrotic',
    hsvSignature: {
      hueRange: [20, 50],
      saturationRange: [40, 180],
      valueRange: [40, 130],
      confidence: 0.88,
    },
    cielabSignature: {
      lRange: [35, 65],
      aRange: [5, 30],
      bRange: [10, 35],
      confidence: 0.86,
    },
    characteristics: {
      borderType: 'sharp',
      distribution: 'scattered',
      progression: 'rapid',
      haloPresence: true,
      sporulationPattern: 'gray sporulation on bleached spikes',
    },
    severityThresholds: {
      healthy: [0, 9], low: [10, 24], medium: [25, 49], high: [50, 74], critical: [75, 100],
    },
    affectedCrops: ['Trigo', 'Wheat', 'Gandum'],
    favorableConditions: {
      temperature: [25, 35],
      humidity: [80, 100],
      rainfall: 'High humidity, warm nights',
      pH: [5.5, 7.5],
    },
    treatment: {
      fungicide: ['Trifloxistrobina', 'Azoxistrobina', 'Tebuconazol'],
      cultural: ['Uso de sementes certificadas', 'Rotação de culturas', 'Eliminar resíduos infectados'],
      resistant_varieties: ['Variedades resistentes recomendadas'],
      preventive: ['Aplicação preventiva no espigamento'],
    },
    notes: 'Doença devastadora do trigo. Pode destruir toda a espiga.',
    references: ['Islam et al. (2016)'],
  },

  {
    id: 'cotton_leaf_curl',
    name: 'Enrolamento Foliar do Algodão',
    scientificName: 'Cotton leaf curl virus (CLCuV)',
    type: 'viral',
    lesionType: 'mottled',
    hsvSignature: {
      hueRange: [35, 80],
      saturationRange: [30, 130],
      valueRange: [120, 220],
      confidence: 0.85,
    },
    cielabSignature: {
      lRange: [55, 85],
      aRange: [-20, 5],
      bRange: [20, 55],
      confidence: 0.83,
    },
    characteristics: {
      borderType: 'diffuse',
      distribution: 'systemic',
      progression: 'moderate',
      haloPresence: false,
      sporulationPattern: 'none — leaf curling, vein darkening',
    },
    severityThresholds: {
      healthy: [0, 9], low: [10, 24], medium: [25, 49], high: [50, 74], critical: [75, 100],
    },
    affectedCrops: ['Algodão', 'Cotton', 'Kapas'],
    favorableConditions: {
      temperature: [28, 38],
      humidity: [50, 80],
      rainfall: 'Low to moderate',
      pH: [6.0, 8.0],
    },
    treatment: {
      cultural: [
        'Remover e destruir plantas infectadas',
        'Controlar mosca-branca (vetor)',
        'Usar variedades resistentes',
        'Evitar plantio tardio',
      ],
      preventive: ['Uso de inseticidas para controle do vetor', 'Monitoramento semanal'],
    },
    notes: 'Doença viral mais importante do algodão no Sul da Ásia. Sem tratamento curativo.',
    references: ['Briddon & Markham (2000)'],
  },

  {
    id: 'rice_blast',
    name: 'Brusone do Arroz',
    scientificName: 'Magnaporthe oryzae',
    type: 'fungal',
    lesionType: 'necrotic',
    hsvSignature: {
      hueRange: [15, 45],
      saturationRange: [50, 200],
      valueRange: [40, 140],
      confidence: 0.91,
    },
    cielabSignature: {
      lRange: [30, 60],
      aRange: [10, 35],
      bRange: [8, 30],
      confidence: 0.90,
    },
    characteristics: {
      borderType: 'sharp',
      distribution: 'scattered',
      progression: 'rapid',
      haloPresence: true,
      sporulationPattern: 'spindle-shaped lesions with gray center',
    },
    severityThresholds: {
      healthy: [0, 9], low: [10, 24], medium: [25, 49], high: [50, 74], critical: [75, 100],
    },
    affectedCrops: ['Arroz', 'Rice', 'Chawal'],
    favorableConditions: {
      temperature: [20, 30],
      humidity: [85, 100],
      rainfall: 'High rainfall, leaf wetness > 10h',
      pH: [5.0, 7.0],
    },
    treatment: {
      fungicide: ['Tricyclazole', 'Azoxistrobina', 'Isoprothiolane'],
      cultural: ['Evitar excesso de nitrogênio', 'Melhorar drenagem', 'Espaçamento adequado'],
      resistant_varieties: ['IR-64, IRRI varieties'],
      preventive: ['Aplicação preventiva no perfilhamento e espigamento'],
    },
    notes: 'Doença mais destrutiva do arroz no mundo.',
    references: ['Ou (1985)', 'Skamnioti & Gurr (2009)'],
  },

  {
    id: 'sugarcane_rust',
    name: 'Ferrugem da Cana-de-açúcar',
    scientificName: 'Puccinia melanocephala',
    type: 'fungal',
    lesionType: 'pustule',
    hsvSignature: {
      hueRange: [8, 28],
      saturationRange: [90, 255],
      valueRange: [60, 160],
      confidence: 0.87,
    },
    cielabSignature: {
      lRange: [40, 68],
      aRange: [25, 55],
      bRange: [18, 48],
      confidence: 0.85,
    },
    characteristics: {
      borderType: 'sharp',
      distribution: 'scattered',
      progression: 'moderate',
      haloPresence: false,
      sporulationPattern: 'orange-brown pustules on leaf surface',
    },
    severityThresholds: {
      healthy: [0, 9], low: [10, 24], medium: [25, 49], high: [50, 74], critical: [75, 100],
    },
    affectedCrops: ['Cana-de-açúcar', 'Sugarcane', 'Ganna'],
    favorableConditions: {
      temperature: [18, 28],
      humidity: [70, 95],
      rainfall: 'Moderate with dew formation',
      pH: [5.5, 7.5],
    },
    treatment: {
      fungicide: ['Propiconazol', 'Trifloxistrobina', 'Azoxistrobina'],
      cultural: ['Uso de variedades resistentes', 'Eliminação de folhas infectadas'],
      preventive: ['Monitoramento na estação chuvosa'],
    },
    notes: 'Reduz rendimento e teor de açúcar significativamente.',
    references: ['Walker (1981)'],
  },

  {
    id: 'downy_mildew',
    name: 'Míldio',
    scientificName: 'Peronospora / Plasmopara spp.',
    type: 'fungal',
    lesionType: 'chlorotic',
    hsvSignature: {
      hueRange: [42, 78],
      saturationRange: [15, 90],
      valueRange: [140, 230],
      confidence: 0.84,
    },
    cielabSignature: {
      lRange: [65, 92],
      aRange: [-18, 5],
      bRange: [18, 50],
      confidence: 0.82,
    },
    characteristics: {
      borderType: 'gradual',
      distribution: 'interveinal',
      progression: 'moderate',
      haloPresence: false,
      sporulationPattern: 'white-gray fuzz on underside of leaf',
    },
    severityThresholds: {
      healthy: [0, 9], low: [10, 24], medium: [25, 49], high: [50, 74], critical: [75, 100],
    },
    affectedCrops: ['Videira', 'Milho', 'Tomate', 'Alface', 'Cebola'],
    favorableConditions: {
      temperature: [12, 20],
      humidity: [90, 100],
      rainfall: 'High humidity, cool temperatures',
      pH: [5.5, 8.0],
    },
    treatment: {
      fungicide: ['Cobre', 'Mancozeb', 'Fosetil-Al', 'Metalaxil'],
      cultural: ['Melhorar ventilação', 'Evitar molhamento foliar noturno', 'Eliminar folhas doentes'],
      preventive: ['Aplicação preventiva de cobre'],
    },
    notes: 'Favorecido por noites frias e úmidas. Esporula na face inferior da folha.',
    references: ['Agrios (2005)'],
  },

  {
    id: 'leaf_blight',
    name: 'Queima das Folhas',
    scientificName: 'Helminthosporium / Bipolaris spp.',
    type: 'fungal',
    lesionType: 'necrotic',
    hsvSignature: {
      hueRange: [10, 40],
      saturationRange: [40, 180],
      valueRange: [30, 110],
      confidence: 0.86,
    },
    cielabSignature: {
      lRange: [28, 58],
      aRange: [8, 32],
      bRange: [8, 28],
      confidence: 0.84,
    },
    characteristics: {
      borderType: 'irregular',
      distribution: 'marginal',
      progression: 'moderate',
      haloPresence: false,
      sporulationPattern: 'dark sporulation on necrotic tissue',
    },
    severityThresholds: {
      healthy: [0, 9], low: [10, 24], medium: [25, 49], high: [50, 74], critical: [75, 100],
    },
    affectedCrops: ['Milho', 'Arroz', 'Trigo', 'Sorgo', 'Cana-de-açúcar'],
    favorableConditions: {
      temperature: [18, 30],
      humidity: [75, 100],
      rainfall: 'Warm humid conditions',
      pH: [5.5, 7.5],
    },
    treatment: {
      fungicide: ['Mancozeb', 'Propiconazol', 'Trifloxistrobina'],
      cultural: ['Rotação de culturas', 'Eliminar resíduos de colheita', 'Uso de sementes sadias'],
      preventive: ['Aplicação preventiva nas fases críticas'],
    },
    notes: 'Afeta principalmente cereais. Progride rapidamente em condições quentes e úmidas.',
    references: ['Agrios (2005)'],
  },
];

export function findDiseaseByPattern(
  hsvL: number,
  hsvA: number,
  hsvB: number,
  cielabL: number,
  cielabA: number,
  cielabB: number,
): DiseasePattern | null {
  let bestMatch: DiseasePattern | null = null;
  let bestScore = 0;

  for (const disease of DISEASE_DATABASE) {
    let score = 0;

    // HSV matching
    const hsvHueMatch =
      hsvL >= disease.hsvSignature.hueRange[0] &&
      hsvL <= disease.hsvSignature.hueRange[1];
    const hsvSatMatch =
      hsvA >= disease.hsvSignature.saturationRange[0] &&
      hsvA <= disease.hsvSignature.saturationRange[1];
    const hsvValMatch =
      hsvB >= disease.hsvSignature.valueRange[0] &&
      hsvB <= disease.hsvSignature.valueRange[1];

    if (hsvHueMatch) score += 0.3 * disease.hsvSignature.confidence;
    if (hsvSatMatch) score += 0.2 * disease.hsvSignature.confidence;
    if (hsvValMatch) score += 0.2 * disease.hsvSignature.confidence;

    // CIELAB matching
    const labLMatch =
      cielabL >= disease.cielabSignature.lRange[0] &&
      cielabL <= disease.cielabSignature.lRange[1];
    const labAMatch =
      cielabA >= disease.cielabSignature.aRange[0] &&
      cielabA <= disease.cielabSignature.aRange[1];
    const labBMatch =
      cielabB >= disease.cielabSignature.bRange[0] &&
      cielabB <= disease.cielabSignature.bRange[1];

    if (labLMatch) score += 0.15 * disease.cielabSignature.confidence;
    if (labAMatch) score += 0.1 * disease.cielabSignature.confidence;
    if (labBMatch) score += 0.05 * disease.cielabSignature.confidence;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = disease;
    }
  }

  return bestScore > 0.5 ? bestMatch : null;
}
