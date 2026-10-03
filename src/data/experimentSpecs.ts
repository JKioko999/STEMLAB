import { ExperimentSpec } from '../types';

export const INITIAL_EXPERIMENTS: ExperimentSpec[] = [
  {
    id: 'exp-chem-titration-01',
    subject: 'chemistry',
    title: 'Acid-Base Titration: Standardization of Hydrochloric Acid',
    kcsePaper: '233/3 (KCSE Chemistry Practical Paper 3 - Q1)',
    topic: 'Acids, Bases & Volumetric Analysis',
    objectives: [
      'Accurately fill and read the burette to two decimal places (ending in .00 or .50 cm³)',
      'Pipette exactly 25.0 cm³ of 0.10 M Sodium Hydroxide (Solution B) into a conical flask',
      'Add phenolphthalein indicator and observe characteristic pink coloration in alkaline medium',
      'Titrate with Solution A (dilute HCl) dropwise to determine the precise equivalence end-point',
      'Obtain three consistent titration readings within ±0.20 cm³ and calculate the molarity of the acid'
    ],
    estimatedDurationMinutes: 45,
    apparatus: [
      { id: 'app-burette', name: '50cm³ Burette with Teflon Tap', subject: 'chemistry', icon: 'Burette' },
      { id: 'app-flask', name: '250cm³ Conical Flask', subject: 'chemistry', icon: 'FlaskConical' },
      { id: 'app-pipette', name: '25.0cm³ Pipette & Safety Filler', subject: 'chemistry', icon: 'Pipette' },
      { id: 'app-stand', name: 'Retort Stand & Burette Clamp', subject: 'chemistry', icon: 'Clamp' },
      { id: 'app-cylinder', name: '50cm³ Measuring Cylinder', subject: 'chemistry', icon: 'Cylinder' },
      { id: 'app-indicator-phen', name: 'Phenolphthalein Indicator Bottle', subject: 'chemistry', icon: 'Droplets' },
      { id: 'app-reagent-naoh', name: 'Solution B: 0.10M NaOH (Standard)', subject: 'chemistry', icon: 'Beaker' },
      { id: 'app-reagent-hcl', name: 'Solution A: Dilute HCl (Unknown)', subject: 'chemistry', icon: 'Beaker' },
      { id: 'app-white-tile', name: 'White Ceramic Tile', subject: 'chemistry', icon: 'Square' },
      // Distractor apparatus
      { id: 'app-distractor-burner', name: 'Bunsen Burner (Not Required)', subject: 'chemistry', icon: 'Flame', isDistractor: true }
    ],
    steps: [
      {
        id: 1,
        instruction: 'Mount the burette onto the retort stand and fill it with Solution A (Hydrochloric Acid) up to the 0.00 cm³ mark, ensuring no air bubbles are trapped in the jet tip.',
        validationType: 'apparatus_placed',
        validationDetail: 'Burette filled and mounted',
        marks: 1,
        hint: 'Use the fill tap or funnel to charge the burette with Solution A to the zero mark.',
        allowForcePush: true
      },
      {
        id: 2,
        instruction: 'Using the pipette and pipette filler, transfer exactly 25.0 cm³ of Solution B (0.10M Sodium Hydroxide) into the clean 250 cm³ conical flask.',
        validationType: 'volume_set',
        validationDetail: '25.0 cm³ Solution B in conical flask',
        marks: 2,
        hint: 'Deliver Solution B from the pipette into the conical flask until the bottom of the meniscus touches the mark.',
        allowForcePush: true
      },
      {
        id: 3,
        instruction: 'Add 2 to 3 drops of phenolphthalein indicator into the conical flask and swirl gently. Notice the intense pink color indicating alkaline conditions.',
        validationType: 'reagent_added',
        validationDetail: 'Phenolphthalein added to flask',
        marks: 1,
        hint: 'Click the indicator dropper to introduce drops into the conical flask.',
        allowForcePush: true
      },
      {
        id: 4,
        instruction: 'Place the conical flask on the white tile under the burette. Open the tap to titrate with Solution A while swirling continuously until the pink colour permanently discharges to colourless.',
        validationType: 'run_simulation',
        validationDetail: 'Titration reached neutral equivalence point',
        marks: 2,
        hint: 'Use dropwise mode as you approach the expected titre volume around 24.50 cm³.',
        allowForcePush: true
      },
      {
        id: 5,
        instruction: 'Record the initial and final burette readings in Table 1 for Titre I, II, and III. Complete calculations for average volume and acid molarity.',
        validationType: 'reading_recorded',
        validationDetail: 'Data table completed',
        marks: 2,
        hint: 'Consistent titres should be within ±0.20 cm³ of each other in accordance with KNEC KCSE rules.',
        allowForcePush: false
      }
    ],
    simulationType: 'titration',
    simulationConfig: {
      acidConcentrationM: 0.102, // calculated target
      baseVolumeCm3: 25.0,
      unknownMolarity: 0.102,
      indicator: 'Phenolphthalein',
      equivalencePointCm3: 24.50,
      colorBefore: '#f43f5e', // vivid pink
      colorAfter: '#f8fafc' // crystal clear
    },
    answerSheet: [
      {
        id: 'q-table-1',
        type: 'data_table',
        prompt: 'Table 1: Titration of 25.0 cm³ of Solution B (0.10M NaOH) against Solution A (HCl)',
        maxMarks: 5,
        tableHeaders: ['Titre Number', 'Final Burette Reading (cm³)', 'Initial Burette Reading (cm³)', 'Volume of Solution A Used (cm³)'],
        tableRows: [
          { label: 'Titre I (Trial)', simulatedValue: 24.50, tolerance: 0.20 },
          { label: 'Titre II (Accurate)', simulatedValue: 24.50, tolerance: 0.10 },
          { label: 'Titre III (Accurate)', simulatedValue: 24.40, tolerance: 0.10 }
        ]
      },
      {
        id: 'q-avg-volume',
        type: 'calculation',
        prompt: 'Calculate the average volume of Solution A used from your consistent titration readings (showing selected titres).',
        maxMarks: 2,
        correctNumericValue: 24.45,
        tolerance: 0.15,
        unit: 'cm³',
        formulaHint: 'V_avg = (Titre II + Titre III) / 2'
      },
      {
        id: 'q-molarity-calc',
        type: 'calculation',
        prompt: 'Calculate the concentration of the Hydrochloric acid (Solution A) in moles per litre (Molarity), given the mole ratio of HCl:NaOH is 1:1.',
        maxMarks: 3,
        correctNumericValue: 0.102,
        tolerance: 0.005,
        unit: 'mol/L (M)',
        formulaHint: 'M_A * V_A = M_B * V_B  =>  M_A = (0.10 * 25.0) / V_avg'
      },
      {
        id: 'q-color-obs',
        type: 'observation_inference',
        prompt: 'State the color change observed at the end-point of this titration and explain why this indicator is appropriate.',
        maxMarks: 2,
        observationAcceptedKeywords: ['pink to colourless', 'pink to clear', 'permanent colourless'],
        inferenceAcceptedKeywords: ['neutralisation', 'equivalence point', 'strong acid strong base', 'ph change']
      }
    ],
    ownerType: 'global',
    schoolId: null,
    teacherId: null,
    authorName: 'KCSE National Examinations Board (Curriculum Directorate)',
    status: 'published'
  },
  {
    id: 'exp-phys-ohms-law-02',
    subject: 'physics',
    title: "Ohm's Law and Determination of Internal Resistance",
    kcsePaper: '232/3 (KCSE Physics Practical Paper 3 - Q1)',
    topic: 'Current Electricity & Circuits',
    objectives: [
      'Correctly set up a series circuit consisting of cells, switch, ammeter, rheostat, and fixed resistor',
      'Connect a voltmeter in parallel across the variable resistor/terminals',
      'Read and log corresponding current (I in Amperes) and potential difference (V in Volts)',
      'Verify the relationship V = IR and understand the effect of internal resistance (E = V + Ir)',
      'Plot a graph of Potential Difference (V) against Current (I) and deduce internal resistance from slope'
    ],
    estimatedDurationMinutes: 40,
    apparatus: [
      { id: 'app-battery', name: 'Dry Cells Power Source (3.0 V)', subject: 'physics', icon: 'BatteryCharging' },
      { id: 'app-ammeter', name: 'Analogue DC Ammeter (0 - 1.0 A)', subject: 'physics', icon: 'Gauge' },
      { id: 'app-voltmeter', name: 'Analogue DC Voltmeter (0 - 3.0 V)', subject: 'physics', icon: 'Activity' },
      { id: 'app-rheostat', name: 'Variable Resistor (Rheostat 0-50 Ω)', subject: 'physics', icon: 'Sliders' },
      { id: 'app-switch', name: 'One-Way Contact Switch', subject: 'physics', icon: 'ToggleLeft' },
      { id: 'app-wires', name: 'Set of Connecting Wires with Crocodile Clips', subject: 'physics', icon: 'Zap' },
      { id: 'app-resistor-fixed', name: 'Carbon Resistor (4.0 Ω)', subject: 'physics', icon: 'Cpu' },
      // Distractor
      { id: 'app-prism', name: 'Glass Triangular Prism (Not Required)', subject: 'physics', icon: 'Triangle', isDistractor: true }
    ],
    steps: [
      {
        id: 1,
        instruction: 'Place the 3.0V DC cell pack into the circuit workspace and ensure the key switch is initially OPEN for safety.',
        validationType: 'apparatus_placed',
        validationDetail: 'Battery and switch placed in series',
        marks: 1,
        hint: 'Drag the power source and switch onto the circuit layout board.',
        allowForcePush: true
      },
      {
        id: 2,
        instruction: 'Connect the positive terminal of the cell to the positive terminal of the DC Ammeter in series.',
        validationType: 'connection_made',
        validationDetail: 'Battery (+) connected to Ammeter (+)',
        marks: 2,
        hint: 'Connect the red terminal of the cell to the ammeter entry terminal.',
        allowForcePush: true
      },
      {
        id: 3,
        instruction: 'Connect the negative terminal of the ammeter to the variable rheostat, and complete the circuit loop back through the switch to the negative cell terminal.',
        validationType: 'connection_made',
        validationDetail: 'Series circuit closed with rheostat',
        marks: 2,
        hint: 'Ensure all components form an unbroken series loop.',
        allowForcePush: true
      },
      {
        id: 4,
        instruction: 'Connect the Voltmeter in PARALLEL across the resistor terminals.',
        validationType: 'connection_made',
        validationDetail: 'Voltmeter connected across resistor',
        marks: 2,
        hint: 'Voltmeters must always be connected across components in parallel, never in series.',
        allowForcePush: true
      },
      {
        id: 5,
        instruction: 'Close the switch. Adjust the rheostat slider to obtain at least 4 distinct current readings (0.10A, 0.20A, 0.30A, 0.40A) and record corresponding voltages.',
        validationType: 'reading_recorded',
        validationDetail: 'Readings recorded in answer sheet',
        marks: 3,
        hint: 'Observe the deflected needle positions on both analogue meters.',
        allowForcePush: false
      }
    ],
    simulationType: 'circuit',
    simulationConfig: {
      emfVoltage: 3.0,
      internalResistance: 0.60,
      resistorValues: [2.0, 4.0, 6.0, 8.0, 10.0]
    },
    answerSheet: [
      {
        id: 'q-circuit-table',
        type: 'data_table',
        prompt: 'Table 2: Potential Difference (V) versus Current (I) readings',
        maxMarks: 5,
        tableHeaders: ['Trial', 'Current I (A)', 'Voltage V (V)', 'Resistance R = V/I (Ω)'],
        tableRows: [
          { label: 'Setting 1 (High R)', simulatedValue: 0.15, tolerance: 0.05 },
          { label: 'Setting 2 (Med-High R)', simulatedValue: 0.25, tolerance: 0.05 },
          { label: 'Setting 3 (Medium R)', simulatedValue: 0.35, tolerance: 0.05 },
          { label: 'Setting 4 (Low R)', simulatedValue: 0.45, tolerance: 0.05 }
        ]
      },
      {
        id: 'q-slope-resistance',
        type: 'calculation',
        prompt: 'From the recorded readings, calculate the gradient / resistance R = ΔV / ΔI.',
        maxMarks: 3,
        correctNumericValue: 4.8,
        tolerance: 0.4,
        unit: 'Ω',
        formulaHint: 'Slope = (V2 - V1) / (I2 - I1)'
      },
      {
        id: 'q-circuit-inference',
        type: 'short_answer',
        prompt: 'State why the switch should be opened between readings during a physical KCSE physics practical.',
        maxMarks: 2,
        observationAcceptedKeywords: ['prevent heating', 'prevent cell run down', 'internal resistance change', 'battery discharge', 'temperature rise']
      }
    ],
    ownerType: 'global',
    schoolId: null,
    teacherId: null,
    authorName: 'KCSE National Examinations Board (Curriculum Directorate)',
    status: 'published'
  },
  {
    id: 'exp-chem-qualitative-03',
    subject: 'chemistry',
    title: 'Qualitative Analysis: Identification of Cations and Anions in Solid Q',
    kcsePaper: '233/3 (KCSE Chemistry Practical Paper 3 - Q2)',
    topic: 'Salts & Qualitative Chemical Analysis',
    objectives: [
      'Dissolve solid sample in distilled water and partition into multiple clean test tubes',
      'Test for specific cations using 2M Sodium Hydroxide (NaOH) dropwise until in excess',
      'Test for confirming ions using Aqueous Ammonia (NH3) dropwise and excess',
      'Perform precipitation tests with Barium Nitrate [Ba(NO3)2] followed by dilute HCl',
      'Formulate accurate observations and chemical inferences in standardized KCSE table format'
    ],
    estimatedDurationMinutes: 40,
    apparatus: [
      { id: 'app-rack', name: 'Test Tube Rack with 6 Test Tubes', subject: 'chemistry', icon: 'Pipette' },
      { id: 'app-spatula', name: 'Nickel Spatula', subject: 'chemistry', icon: 'Wrench' },
      { id: 'app-sample-q', name: 'Sample Bottle: Solid Q (Unknown salt)', subject: 'chemistry', icon: 'Container' },
      { id: 'app-naoh-bottle', name: '2.0 M Sodium Hydroxide Reagent Dropper', subject: 'chemistry', icon: 'Droplet' },
      { id: 'app-nh3-bottle', name: '2.0 M Aqueous Ammonia Reagent Dropper', subject: 'chemistry', icon: 'Droplet' },
      { id: 'app-bano3-bottle', name: 'Aqueous Barium Nitrate Reagent Dropper', subject: 'chemistry', icon: 'Droplet' },
      { id: 'app-hcl-bottle', name: '2.0 M Dilute Hydrochloric Acid Dropper', subject: 'chemistry', icon: 'Droplet' },
      { id: 'app-water', name: 'Distilled Water Wash Bottle', subject: 'chemistry', icon: 'Droplets' }
    ],
    steps: [
      {
        id: 1,
        instruction: 'Scoop one spatula end of Solid Q into a clean boiling tube. Add about 10 cm³ of distilled water and shake thoroughly until all solid dissolves to form Solution Q.',
        validationType: 'apparatus_placed',
        validationDetail: 'Solid Q dissolved in water',
        marks: 1,
        hint: 'Solid Q readily dissolves forming a pale green aqueous solution.',
        allowForcePush: true
      },
      {
        id: 2,
        instruction: 'Divide Solution Q into three equal portions in clean test tubes labeled Portion 1, 2, and 3.',
        validationType: 'apparatus_placed',
        validationDetail: 'Solution partitioned into test tubes',
        marks: 1,
        hint: 'Use the test tube rack to organize your portions.',
        allowForcePush: true
      },
      {
        id: 3,
        instruction: 'To Portion 1: Add 2-3 drops of 2M Sodium Hydroxide, then continue adding until in excess. Observe precipitate formation and solubility.',
        validationType: 'reagent_added',
        validationDetail: 'NaOH added to portion 1',
        marks: 2,
        hint: 'Watch for a dirty green gelatinous precipitate that is insoluble in excess NaOH.',
        allowForcePush: true
      },
      {
        id: 4,
        instruction: 'To Portion 2: Add aqueous Barium Nitrate solution dropwise, followed by 2-3 drops of dilute Hydrochloric acid.',
        validationType: 'reagent_added',
        validationDetail: 'Ba(NO3)2 followed by HCl added to portion 2',
        marks: 2,
        hint: 'A dense white precipitate forms which remains insoluble upon adding dilute HCl.',
        allowForcePush: true
      }
    ],
    simulationType: 'qualitative',
    simulationConfig: {
      unknownSolidName: 'Solid Q (Iron(II) Sulphate Hydrate)',
      cation: 'Fe2+',
      anion: 'SO4(2-)'
    },
    answerSheet: [
      {
        id: 'q-obs-naoh',
        type: 'observation_inference',
        prompt: 'Portion 1: Test with Sodium Hydroxide (NaOH) dropwise then excess',
        maxMarks: 4,
        observationAcceptedKeywords: ['green precipitate', 'dirty green ppt', 'insoluble in excess', 'green ppt insoluble'],
        inferenceAcceptedKeywords: ['fe2+ ions present', 'iron ii ions', 'fe2+ present']
      },
      {
        id: 'q-obs-bano3',
        type: 'observation_inference',
        prompt: 'Portion 2: Test with aqueous Barium Nitrate followed by dilute HCl',
        maxMarks: 4,
        observationAcceptedKeywords: ['white precipitate', 'white ppt formed', 'insoluble in dilute hcl', 'ppt persists'],
        inferenceAcceptedKeywords: ['so42- ions present', 'sulphate ions present', 'so4 2-']
      },
      {
        id: 'q-identity-q',
        type: 'short_answer',
        prompt: 'Deduce the complete chemical name and formula of Solid Q based on your tests.',
        maxMarks: 2,
        observationAcceptedKeywords: ['iron(ii) sulphate', 'iron ii sulfate', 'feso4']
      }
    ],
    ownerType: 'global',
    schoolId: null,
    teacherId: null,
    authorName: 'KCSE National Examinations Board (Curriculum Directorate)',
    status: 'published'
  },
  {
    id: 'exp-bio-food-tests-04',
    subject: 'biology',
    title: 'Food Tests: Identification of Food Nutrients in Solution X',
    kcsePaper: '231/3 (KCSE Biology Practical Paper 3 - Q1)',
    topic: 'Nutrition in Animals & Biochemical Testing',
    objectives: [
      'Carry out Benedict\'s test for reducing sugars with hot water bath heating',
      'Perform the Biuret test for proteins using sodium hydroxide and copper(II) sulphate',
      'Test for starch using standard Iodine solution',
      'Record observations and deductions in KCSE standard tabulated format'
    ],
    estimatedDurationMinutes: 35,
    apparatus: [
      { id: 'app-bio-rack', name: 'Test Tube Rack with 4 Boiling Tubes', subject: 'biology', icon: 'Pipette' },
      { id: 'app-water-bath', name: 'Thermostatic Boiling Water Bath (95°C)', subject: 'biology', icon: 'Flame' },
      { id: 'app-benedicts', name: 'Benedict\'s Reagent Solution', subject: 'biology', icon: 'Droplet' },
      { id: 'app-biuret-a', name: 'Biuret Reagent (NaOH + dilute CuSO4)', subject: 'biology', icon: 'Droplet' },
      { id: 'app-iodine', name: 'Iodine in Potassium Iodide Solution', subject: 'biology', icon: 'Droplet' },
      { id: 'app-sample-x', name: 'Extract Solution X', subject: 'biology', icon: 'Beaker' }
    ],
    steps: [
      {
        id: 1,
        instruction: 'Add 2 cm³ of Solution X into test tube 1. Add equal volume of Benedict\'s solution, shake, and place into the hot water bath for 3 minutes.',
        validationType: 'reagent_added',
        validationDetail: 'Benedicts test heated',
        marks: 2,
        hint: 'Observe color transition: Blue -> Green -> Yellow -> Orange -> Brick-red precipitate.',
        allowForcePush: true
      },
      {
        id: 2,
        instruction: 'Add 2 cm³ of Solution X into test tube 2. Add 1 cm³ of Biuret reagent (NaOH + CuSO4) and shake thoroughly without heating.',
        validationType: 'reagent_added',
        validationDetail: 'Biuret test performed',
        marks: 2,
        hint: 'Notice color change to violet or purple indicating presence of peptide bonds in proteins.',
        allowForcePush: true
      },
      {
        id: 3,
        instruction: 'To test tube 3, add 2 cm³ of Solution X followed by 2 drops of Iodine solution.',
        validationType: 'reagent_added',
        validationDetail: 'Iodine test performed',
        marks: 2,
        hint: 'Observe whether solution turns blue-black or retains yellow-brown iodine color.',
        allowForcePush: true
      }
    ],
    simulationType: 'food_test',
    simulationConfig: {
      sampleName: 'Food Extract X',
      nutrientsPresent: ['Reducing Sugars (High)', 'Proteins (Moderate)', 'Starch (Absent)']
    },
    answerSheet: [
      {
        id: 'q-bio-benedicts',
        type: 'observation_inference',
        prompt: 'Benedict\'s Test for Reducing Sugars',
        maxMarks: 3,
        observationAcceptedKeywords: ['orange precipitate', 'brick red precipitate', 'brick-red ppt', 'yellow to red'],
        inferenceAcceptedKeywords: ['reducing sugars present', 'reducing sugar present']
      },
      {
        id: 'q-bio-biuret',
        type: 'observation_inference',
        prompt: 'Biuret Test for Proteins',
        maxMarks: 3,
        observationAcceptedKeywords: ['purple colour', 'violet colour', 'purple/violet', 'violet solution'],
        inferenceAcceptedKeywords: ['proteins present', 'peptide bonds present']
      },
      {
        id: 'q-bio-iodine',
        type: 'observation_inference',
        prompt: 'Iodine Test for Starch',
        maxMarks: 3,
        observationAcceptedKeywords: ['brown colour remained', 'yellow-brown colour persists', 'no colour change', 'brown solution'],
        inferenceAcceptedKeywords: ['starch absent', 'no starch']
      }
    ],
    ownerType: 'global',
    schoolId: null,
    teacherId: null,
    authorName: 'KCSE National Examinations Board (Curriculum Directorate)',
    status: 'published'
  },
  {
    id: 'exp-phys-hookes-05',
    subject: 'physics',
    title: "Hooke's Law: Elastic Properties of a Spiral Spring",
    kcsePaper: '232/3 (KCSE Physics Practical Paper 3 - Q2)',
    topic: 'Mechanics: Forces & Elasticity',
    objectives: [
      'Set up spiral spring suspended vertically alongside a vertical metre rule',
      'Determine the unloaded pointer position (initial length L0)',
      'Load the hanger progressively with 50g, 100g, 150g, 200g, 250g masses and measure extension e',
      'Verify Hooke\'s Law (F = ke) and determine the spring constant k in N/m'
    ],
    estimatedDurationMinutes: 35,
    apparatus: [
      { id: 'app-stand-phys', name: 'Heavy Retort Stand and Clamp', subject: 'physics', icon: 'Clamp' },
      { id: 'app-spring', name: 'Steel Helical Spring with Pointer', subject: 'physics', icon: 'Maximize2' },
      { id: 'app-rule', name: 'Vertical 100cm Metre Rule', subject: 'physics', icon: 'Ruler' },
      { id: 'app-masses', name: 'Mass Hanger & 50g Slotted Masses (0 - 300g)', subject: 'physics', icon: 'Weight' }
    ],
    steps: [
      {
        id: 1,
        instruction: 'Clamp the spring firmly on the retort stand. Note the initial reading on the metre rule indicated by the horizontal pointer (L0 = 20.0 cm).',
        validationType: 'apparatus_placed',
        validationDetail: 'Spring and metre rule placed',
        marks: 1,
        hint: 'Ensure your eye is level with the pointer to avoid parallax error.',
        allowForcePush: true
      },
      {
        id: 2,
        instruction: 'Suspend the mass hanger (50g = 0.5N). Record new pointer reading L and calculate extension e = L - L0.',
        validationType: 'reading_recorded',
        validationDetail: '50g extension recorded',
        marks: 2,
        hint: 'Extension increases linearly with added weight.',
        allowForcePush: true
      },
      {
        id: 3,
        instruction: 'Add further 50g masses one at a time up to 250g, recording pointer readings and corresponding extensions.',
        validationType: 'reading_recorded',
        validationDetail: 'All masses loaded and extensions logged',
        marks: 2,
        hint: 'Check that the spring does not exceed its elastic limit.',
        allowForcePush: false
      }
    ],
    simulationType: 'hookes_law',
    simulationConfig: {
      emfVoltage: 0,
      resistorValues: [0.5, 1.0, 1.5, 2.0, 2.5]
    },
    answerSheet: [
      {
        id: 'q-hooke-table',
        type: 'data_table',
        prompt: 'Table 3: Mass, Weight (F = mg) and Extension (e) of Spring',
        maxMarks: 5,
        tableHeaders: ['Mass (g)', 'Weight F (N)', 'Pointer Reading L (cm)', 'Extension e (cm)'],
        tableRows: [
          { label: 'Mass 50g', simulatedValue: 2.5, tolerance: 0.2 },
          { label: 'Mass 100g', simulatedValue: 5.0, tolerance: 0.2 },
          { label: 'Mass 150g', simulatedValue: 7.5, tolerance: 0.2 },
          { label: 'Mass 200g', simulatedValue: 10.0, tolerance: 0.2 },
          { label: 'Mass 250g', simulatedValue: 12.5, tolerance: 0.2 }
        ]
      },
      {
        id: 'q-spring-constant',
        type: 'calculation',
        prompt: 'Determine the spring constant k = Force / Extension (in N/m).',
        maxMarks: 3,
        correctNumericValue: 20.0,
        tolerance: 1.0,
        unit: 'N/m',
        formulaHint: 'k = ΔF (N) / Δe (m)'
      }
    ],
    ownerType: 'global',
    schoolId: null,
    teacherId: null,
    authorName: 'KCSE National Examinations Board (Curriculum Directorate)',
    status: 'published'
  }
];
