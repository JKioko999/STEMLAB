var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/data/experimentSpecs.ts
var INITIAL_EXPERIMENTS;
var init_experimentSpecs = __esm({
  "src/data/experimentSpecs.ts"() {
    INITIAL_EXPERIMENTS = [
      {
        id: "exp-chem-solubility-01",
        subject: "chemistry",
        title: "Solubility of Solid A & Determination of Relative Molecular Mass (R.M.M.)",
        kcsePaper: "233/3 (KCSE Chemistry Practical Paper 3 - Q1)",
        topic: "Solubility Curves, Thermochemistry & Volumetric Titration",
        objectives: [
          "Fill the burette with distilled water and measure accurate volume increments into a boiling tube",
          "Dissolve 6.0g of Solid A (organic acid) by controlled heating with a Bunsen burner while stirring with a thermometer",
          "Cool in a cold water bath while stirring and detect the exact temperature at which crystals first appear",
          "Complete Table I of volume of water, calculated solubility (g/100g water), and crystallization temperature",
          "Plot a smooth solubility curve on the millimeter examination graph grid provided",
          "Titrate against Solution B (0.20M NaOH) to calculate the Relative Molecular Mass (R.M.M.) of the acid"
        ],
        estimatedDurationMinutes: 60,
        apparatus: [
          { id: "app-burette-water", name: "50cm\xB3 Burette with Teflon Tap (Distilled Water)", subject: "chemistry", icon: "Burette" },
          { id: "app-boiling-tube", name: "Pyrex Boiling Tube", subject: "chemistry", icon: "TestTube" },
          { id: "app-solid-a", name: "Solid A: 6.0g Organic Acid", subject: "chemistry", icon: "Layers" },
          { id: "app-thermometer", name: "0 - 100\xB0C Laboratory Thermometer", subject: "chemistry", icon: "Activity" },
          { id: "app-burner", name: "Bunsen Burner, Tripod & Wire Gauze", subject: "chemistry", icon: "Flame" },
          { id: "app-beaker-cold", name: "250cm\xB3 Beaker containing Cold Water Bath", subject: "chemistry", icon: "Beaker" },
          { id: "app-reagent-naoh", name: "Solution B: 0.20M Sodium Hydroxide", subject: "chemistry", icon: "Beaker" },
          { id: "app-conical-flask", name: "250cm\xB3 Conical Flask", subject: "chemistry", icon: "FlaskConical" },
          { id: "app-pipette-25", name: "25.0cm\xB3 Pipette & Safety Filler", subject: "chemistry", icon: "Pipette" },
          { id: "app-phenolphthalein", name: "Phenolphthalein Indicator Bottle", subject: "chemistry", icon: "Droplets" }
        ],
        simulationType: "solubility",
        simulationConfig: {
          acidConcentrationM: 0.098,
          baseVolumeCm3: 25,
          equivalencePointCm3: 24.5,
          indicator: "Phenolphthalein",
          colorBefore: "Colourless",
          colorAfter: "Pale Pink"
        },
        procedures: [
          {
            id: "proc-1",
            number: 1,
            title: "Procedure I: Solubility of Solid A & Crystallization Curve",
            description: "Fill burette with distilled water. Transfer water portions to boiling tube containing Solid A, heat until dissolved, and cool in water bath to record crystallization temperature.",
            steps: [
              {
                id: 1,
                instruction: "Fill the burette with distilled water up to the 0.00 cm\xB3 mark, ensuring no air bubbles in the jet.",
                validationType: "apparatus_placed",
                validationDetail: "Burette filled with distilled water",
                marks: 1,
                hint: 'Click "Refill 0.00 cm\xB3" to charge the burette with distilled water.',
                allowForcePush: true,
                procedureNumber: 1
              },
              {
                id: 2,
                instruction: "Place Solid A (6.0g of organic acid) into the clean boiling tube.",
                validationType: "reagent_added",
                validationDetail: "6.0g Solid A placed in boiling tube",
                marks: 1,
                hint: 'Click "Place Solid A (6.0g) in Tube".',
                allowForcePush: true,
                procedureNumber: 1
              },
              {
                id: 3,
                instruction: "Transfer 4.0 cm\xB3 of distilled water from the burette into the boiling tube containing Solid A. Heat the mixture while stirring carefully with thermometer until all the solid dissolves.",
                validationType: "heated",
                validationDetail: "Transferred 4.0 cm\xB3 water and heated until all solid dissolves",
                marks: 2,
                hint: 'Click "Transfer 4.0 cm\xB3" then click "Heat & Stir until Dissolved".',
                allowForcePush: true,
                procedureNumber: 1
              },
              {
                id: 4,
                instruction: "Cool the solution by dipping it in the provided beaker containing cold water while stirring with the thermometer. Record the temperature at which crystals start to form in Table I below.",
                validationType: "reading_recorded",
                validationDetail: "Crystallization temperature recorded (~68.0\xB0C)",
                marks: 2,
                hint: 'Click "Cool in Water Bath (Detect Crystals)". Note the temperature when crystals appear.',
                allowForcePush: true,
                procedureNumber: 1
              },
              {
                id: 5,
                instruction: "Add a further 1.0 cm\xB3 of distilled water from the burette to the mixture (total 5.0 cm\xB3). Repeat heating and cooling, and record the crystallization temperature (~59.0\xB0C).",
                validationType: "volume_set",
                validationDetail: "Added further 1.0 cm\xB3 water (total 5.0 cm\xB3)",
                marks: 2,
                hint: 'Click "+ Add Further 1.0 cm\xB3 Water" then heat and cool again.',
                allowForcePush: true,
                procedureNumber: 1
              },
              {
                id: 6,
                instruction: "Repeat procedure by adding further 1.0 cm\xB3 portions of water (6.0, 7.0, and 8.0 cm\xB3), heating to dissolve and cooling to record crystallization temperatures to complete Table I.",
                validationType: "observation_made",
                validationDetail: "Completed trials for 6.0 cm\xB3 (52\xB0C), 7.0 cm\xB3 (45\xB0C), and 8.0 cm\xB3 (39\xB0C)",
                marks: 2,
                hint: "Continue adding water increments and record each crystallization temperature in Table I.",
                allowForcePush: true,
                procedureNumber: 1
              }
            ]
          },
          {
            id: "proc-2",
            number: 2,
            title: "Procedure II: Volumetric Titration with Solution B (0.20M NaOH)",
            description: "Titrate solution containing dissolved organic acid against 0.20M Sodium Hydroxide using phenolphthalein indicator to determine the Relative Molecular Mass (R.M.M.).",
            steps: [
              {
                id: 7,
                instruction: "Mount the burette and fill it with Solution B (0.20M Sodium Hydroxide) to the 0.00 cm\xB3 mark.",
                validationType: "apparatus_placed",
                validationDetail: "Burette filled with Solution B",
                marks: 1,
                hint: "Switch to Procedure II tab and refill burette with Solution B.",
                allowForcePush: true,
                procedureNumber: 2
              },
              {
                id: 8,
                instruction: "Pipette exactly 25.0 cm\xB3 of the prepared acid solution into a 250 cm\xB3 conical flask.",
                validationType: "volume_set",
                validationDetail: "25.0 cm\xB3 acid in conical flask",
                marks: 1,
                hint: 'Click "Pipette 25.0 cm\xB3 into Flask".',
                allowForcePush: true,
                procedureNumber: 2
              },
              {
                id: 9,
                instruction: "Add 2 to 3 drops of phenolphthalein indicator to the conical flask.",
                validationType: "reagent_added",
                validationDetail: "Phenolphthalein indicator added",
                marks: 1,
                hint: 'Click "Add Phenolphthalein Drops".',
                allowForcePush: true,
                procedureNumber: 2
              },
              {
                id: 10,
                instruction: "Titrate the solution using Solution B until a permanent pale pink colour just appears. Record final burette reading.",
                validationType: "reading_recorded",
                validationDetail: "Titration end-point reached (~24.50 cm\xB3)",
                marks: 2,
                hint: 'Click "Titrate Dropwise" until permanent pale pink color persists.',
                allowForcePush: true,
                procedureNumber: 2
              }
            ]
          }
        ],
        steps: [
          {
            id: 1,
            instruction: "Fill the burette with distilled water up to the 0.00 cm\xB3 mark, ensuring no air bubbles in the jet.",
            validationType: "apparatus_placed",
            validationDetail: "Burette filled with distilled water",
            marks: 1,
            hint: 'Click "Refill 0.00 cm\xB3" to charge the burette with distilled water.',
            allowForcePush: true,
            procedureNumber: 1
          },
          {
            id: 2,
            instruction: "Place Solid A (6.0g of organic acid) into the clean boiling tube.",
            validationType: "reagent_added",
            validationDetail: "6.0g Solid A placed in boiling tube",
            marks: 1,
            hint: 'Click "Place Solid A (6.0g) in Tube".',
            allowForcePush: true,
            procedureNumber: 1
          },
          {
            id: 3,
            instruction: "Transfer 4.0 cm\xB3 of distilled water from the burette into the boiling tube containing Solid A. Heat the mixture while stirring carefully with thermometer until all the solid dissolves.",
            validationType: "heated",
            validationDetail: "Transferred 4.0 cm\xB3 water and heated until all solid dissolves",
            marks: 2,
            hint: 'Click "Transfer 4.0 cm\xB3" then click "Heat & Stir until Dissolved".',
            allowForcePush: true,
            procedureNumber: 1
          },
          {
            id: 4,
            instruction: "Cool the solution by dipping it in the provided beaker containing cold water while stirring with the thermometer. Record the temperature at which crystals start to form in Table I below.",
            validationType: "reading_recorded",
            validationDetail: "Crystallization temperature recorded (~68.0\xB0C)",
            marks: 2,
            hint: 'Click "Cool in Water Bath (Detect Crystals)". Note the temperature when crystals appear.',
            allowForcePush: true,
            procedureNumber: 1
          },
          {
            id: 5,
            instruction: "Add a further 1.0 cm\xB3 of distilled water from the burette to the mixture (total 5.0 cm\xB3). Repeat heating and cooling, and record the crystallization temperature (~59.0\xB0C).",
            validationType: "volume_set",
            validationDetail: "Added further 1.0 cm\xB3 water (total 5.0 cm\xB3)",
            marks: 2,
            hint: 'Click "+ Add Further 1.0 cm\xB3 Water" then heat and cool again.',
            allowForcePush: true,
            procedureNumber: 1
          },
          {
            id: 6,
            instruction: "Repeat procedure by adding further 1.0 cm\xB3 portions of water (6.0, 7.0, and 8.0 cm\xB3), heating to dissolve and cooling to record crystallization temperatures to complete Table I.",
            validationType: "observation_made",
            validationDetail: "Completed trials for 6.0 cm\xB3 (52\xB0C), 7.0 cm\xB3 (45\xB0C), and 8.0 cm\xB3 (39\xB0C)",
            marks: 2,
            hint: "Continue adding water increments and record each crystallization temperature in Table I.",
            allowForcePush: true,
            procedureNumber: 1
          },
          {
            id: 7,
            instruction: "Mount the burette and fill it with Solution B (0.20M Sodium Hydroxide) to the 0.00 cm\xB3 mark.",
            validationType: "apparatus_placed",
            validationDetail: "Burette filled with Solution B",
            marks: 1,
            hint: "Switch to Procedure II tab and refill burette with Solution B.",
            allowForcePush: true,
            procedureNumber: 2
          },
          {
            id: 8,
            instruction: "Pipette exactly 25.0 cm\xB3 of the prepared acid solution into a 250 cm\xB3 conical flask.",
            validationType: "volume_set",
            validationDetail: "25.0 cm\xB3 acid in conical flask",
            marks: 1,
            hint: 'Click "Pipette 25.0 cm\xB3 into Flask".',
            allowForcePush: true,
            procedureNumber: 2
          },
          {
            id: 9,
            instruction: "Add 2 to 3 drops of phenolphthalein indicator to the conical flask.",
            validationType: "reagent_added",
            validationDetail: "Phenolphthalein indicator added",
            marks: 1,
            hint: 'Click "Add Phenolphthalein Drops".',
            allowForcePush: true,
            procedureNumber: 2
          },
          {
            id: 10,
            instruction: "Titrate the solution using Solution B until a permanent pale pink colour just appears. Record final burette reading.",
            validationType: "reading_recorded",
            validationDetail: "Titration end-point reached (~24.50 cm\xB3)",
            marks: 2,
            hint: 'Click "Titrate Dropwise" until permanent pale pink color persists.',
            allowForcePush: true,
            procedureNumber: 2
          }
        ],
        answerSheet: [
          {
            id: "q-table-solubility",
            type: "data_table",
            prompt: "Complete Table I below by recording the volumes of distilled water added, calculated solubility of solid A, and the crystallization temperatures.",
            maxMarks: 5,
            procedureNumber: 1,
            tableType: "solubility",
            tableHeaders: [
              "Volume of distilled water added (cm\xB3)",
              "Solubility of solid A (g / 100g water)",
              "Crystallization temperature (\xB0C)"
            ],
            tableRows: [
              { label: "4.0 cm\xB3 water", simulatedValue: 68, tolerance: 2 },
              { label: "5.0 cm\xB3 water", simulatedValue: 59, tolerance: 2 },
              { label: "6.0 cm\xB3 water", simulatedValue: 52, tolerance: 2 },
              { label: "7.0 cm\xB3 water", simulatedValue: 45, tolerance: 2 },
              { label: "8.0 cm\xB3 water", simulatedValue: 39, tolerance: 2 }
            ]
          },
          {
            id: "q-graph-solubility",
            type: "graph",
            prompt: "a) On the grid provided, plot a graph of solubility of solid A (y-axis) against crystallization temperature (x-axis). (3 marks)",
            maxMarks: 3,
            procedureNumber: 1,
            graphConfig: {
              xLabel: "Crystallization temperature (\xB0C)",
              yLabel: "Solubility of solid A (g / 100g of water)",
              xMin: 20,
              xMax: 80,
              xStep: 10,
              yMin: 0,
              yMax: 160,
              yStep: 20,
              curveType: "smooth_curve",
              expectedPoints: [
                { x: 68, y: 150 },
                { x: 59, y: 120 },
                { x: 52, y: 100 },
                { x: 45, y: 85.7 },
                { x: 39, y: 75 }
              ]
            }
          },
          {
            id: "q-calc-solubility-temp",
            type: "calculation",
            prompt: "b) From your graph, determine the solubility of solid A at 55.0\xB0C. (1 mark)",
            maxMarks: 1,
            procedureNumber: 1,
            correctNumericValue: 110,
            tolerance: 4,
            unit: "g / 100g of water",
            formulaHint: "Read off the y-axis coordinate corresponding to 55\xB0C on the plotted curve."
          },
          {
            id: "q-calc-rmm",
            type: "calculation",
            prompt: "c) Using the titration results from Procedure II (where 25.0 cm\xB3 of the acid reacted with 24.50 cm\xB3 of 0.20M NaOH in a 1:2 mole ratio), calculate the Relative Molecular Mass (R.M.M.) of organic acid solid A. (2 marks)",
            maxMarks: 2,
            procedureNumber: 2,
            correctNumericValue: 126,
            tolerance: 3,
            unit: "g/mol",
            formulaHint: "Moles NaOH = (0.20 \xD7 24.50) / 1000 = 0.0049 mol; Moles acid in 25cm\xB3 = 0.0049 / 2 = 0.00245 mol; Moles in 250cm\xB3 = 0.0245 mol; RMM = 6.0g / 0.0245 = 126 g/mol (Ethanedioic acid dihydrate H\u2082C\u2082O\u2084\xB72H\u2082O)"
          }
        ],
        ownerType: "global",
        authorName: "KNEC Chief Examiner",
        status: "published"
      },
      {
        id: "exp-chem-titration-01",
        subject: "chemistry",
        title: "Acid-Base Titration: Standardization of Hydrochloric Acid",
        kcsePaper: "233/3 (KCSE Chemistry Practical Paper 3 - Q1)",
        topic: "Acids, Bases & Volumetric Analysis",
        objectives: [
          "Accurately fill and read the burette to two decimal places (ending in .00 or .50 cm\xB3)",
          "Pipette exactly 25.0 cm\xB3 of 0.10 M Sodium Hydroxide (Solution B) into a conical flask",
          "Add phenolphthalein indicator and observe characteristic pink coloration in alkaline medium",
          "Titrate with Solution A (dilute HCl) dropwise to determine the precise equivalence end-point",
          "Obtain three consistent titration readings within \xB10.20 cm\xB3 and calculate the molarity of the acid"
        ],
        estimatedDurationMinutes: 45,
        apparatus: [
          { id: "app-burette", name: "50cm\xB3 Burette with Teflon Tap", subject: "chemistry", icon: "Burette" },
          { id: "app-flask", name: "250cm\xB3 Conical Flask", subject: "chemistry", icon: "FlaskConical" },
          { id: "app-pipette", name: "25.0cm\xB3 Pipette & Safety Filler", subject: "chemistry", icon: "Pipette" },
          { id: "app-stand", name: "Retort Stand & Burette Clamp", subject: "chemistry", icon: "Clamp" },
          { id: "app-cylinder", name: "50cm\xB3 Measuring Cylinder", subject: "chemistry", icon: "Cylinder" },
          { id: "app-indicator-phen", name: "Phenolphthalein Indicator Bottle", subject: "chemistry", icon: "Droplets" },
          { id: "app-reagent-naoh", name: "Solution B: 0.10M NaOH (Standard)", subject: "chemistry", icon: "Beaker" },
          { id: "app-reagent-hcl", name: "Solution A: Dilute HCl (Unknown)", subject: "chemistry", icon: "Beaker" },
          { id: "app-white-tile", name: "White Ceramic Tile", subject: "chemistry", icon: "Square" },
          // Distractor apparatus
          { id: "app-distractor-burner", name: "Bunsen Burner (Not Required)", subject: "chemistry", icon: "Flame", isDistractor: true }
        ],
        steps: [
          {
            id: 1,
            instruction: "Mount the burette onto the retort stand and fill it with Solution A (Hydrochloric Acid) up to the 0.00 cm\xB3 mark, ensuring no air bubbles are trapped in the jet tip.",
            validationType: "apparatus_placed",
            validationDetail: "Burette filled and mounted",
            marks: 1,
            hint: "Use the fill tap or funnel to charge the burette with Solution A to the zero mark.",
            allowForcePush: true
          },
          {
            id: 2,
            instruction: "Using the pipette and pipette filler, transfer exactly 25.0 cm\xB3 of Solution B (0.10M Sodium Hydroxide) into the clean 250 cm\xB3 conical flask.",
            validationType: "volume_set",
            validationDetail: "25.0 cm\xB3 Solution B in conical flask",
            marks: 2,
            hint: "Deliver Solution B from the pipette into the conical flask until the bottom of the meniscus touches the mark.",
            allowForcePush: true
          },
          {
            id: 3,
            instruction: "Add 2 to 3 drops of phenolphthalein indicator into the conical flask and swirl gently. Notice the intense pink color indicating alkaline conditions.",
            validationType: "reagent_added",
            validationDetail: "Phenolphthalein added to flask",
            marks: 1,
            hint: "Click the indicator dropper to introduce drops into the conical flask.",
            allowForcePush: true
          },
          {
            id: 4,
            instruction: "Place the conical flask on the white tile under the burette. Open the tap to titrate with Solution A while swirling continuously until the pink colour permanently discharges to colourless.",
            validationType: "run_simulation",
            validationDetail: "Titration reached neutral equivalence point",
            marks: 2,
            hint: "Use dropwise mode as you approach the expected titre volume around 24.50 cm\xB3.",
            allowForcePush: true
          },
          {
            id: 5,
            instruction: "Record the initial and final burette readings in Table 1 for Titre I, II, and III. Complete calculations for average volume and acid molarity.",
            validationType: "reading_recorded",
            validationDetail: "Data table completed",
            marks: 2,
            hint: "Consistent titres should be within \xB10.20 cm\xB3 of each other in accordance with KNEC KCSE rules.",
            allowForcePush: false
          }
        ],
        simulationType: "titration",
        simulationConfig: {
          acidConcentrationM: 0.102,
          // calculated target
          baseVolumeCm3: 25,
          unknownMolarity: 0.102,
          indicator: "Phenolphthalein",
          equivalencePointCm3: 24.5,
          colorBefore: "#f43f5e",
          // vivid pink
          colorAfter: "#f8fafc"
          // crystal clear
        },
        answerSheet: [
          {
            id: "q-table-1",
            type: "data_table",
            prompt: "Table 1: Titration of 25.0 cm\xB3 of Solution B (0.10M NaOH) against Solution A (HCl)",
            maxMarks: 5,
            tableHeaders: ["Titre Number", "Final Burette Reading (cm\xB3)", "Initial Burette Reading (cm\xB3)", "Volume of Solution A Used (cm\xB3)"],
            tableRows: [
              { label: "Titre I (Trial)", simulatedValue: 24.5, tolerance: 0.2 },
              { label: "Titre II (Accurate)", simulatedValue: 24.5, tolerance: 0.1 },
              { label: "Titre III (Accurate)", simulatedValue: 24.4, tolerance: 0.1 }
            ]
          },
          {
            id: "q-avg-volume",
            type: "calculation",
            prompt: "Calculate the average volume of Solution A used from your consistent titration readings (showing selected titres).",
            maxMarks: 2,
            correctNumericValue: 24.45,
            tolerance: 0.15,
            unit: "cm\xB3",
            formulaHint: "V_avg = (Titre II + Titre III) / 2"
          },
          {
            id: "q-molarity-calc",
            type: "calculation",
            prompt: "Calculate the concentration of the Hydrochloric acid (Solution A) in moles per litre (Molarity), given the mole ratio of HCl:NaOH is 1:1.",
            maxMarks: 3,
            correctNumericValue: 0.102,
            tolerance: 5e-3,
            unit: "mol/L (M)",
            formulaHint: "M_A * V_A = M_B * V_B  =>  M_A = (0.10 * 25.0) / V_avg"
          },
          {
            id: "q-color-obs",
            type: "observation_inference",
            prompt: "State the color change observed at the end-point of this titration and explain why this indicator is appropriate.",
            maxMarks: 2,
            observationAcceptedKeywords: ["pink to colourless", "pink to clear", "permanent colourless"],
            inferenceAcceptedKeywords: ["neutralisation", "equivalence point", "strong acid strong base", "ph change"]
          }
        ],
        ownerType: "global",
        schoolId: null,
        teacherId: null,
        authorName: "KCSE National Examinations Board (Curriculum Directorate)",
        status: "published"
      },
      {
        id: "exp-phys-ohms-law-02",
        subject: "physics",
        title: "Ohm's Law and Determination of Internal Resistance",
        kcsePaper: "232/3 (KCSE Physics Practical Paper 3 - Q1)",
        topic: "Current Electricity & Circuits",
        objectives: [
          "Correctly set up a series circuit consisting of cells, switch, ammeter, rheostat, and fixed resistor",
          "Connect a voltmeter in parallel across the variable resistor/terminals",
          "Read and log corresponding current (I in Amperes) and potential difference (V in Volts)",
          "Verify the relationship V = IR and understand the effect of internal resistance (E = V + Ir)",
          "Plot a graph of Potential Difference (V) against Current (I) and deduce internal resistance from slope"
        ],
        estimatedDurationMinutes: 40,
        apparatus: [
          { id: "app-battery", name: "Dry Cells Power Source (3.0 V)", subject: "physics", icon: "BatteryCharging" },
          { id: "app-ammeter", name: "Analogue DC Ammeter (0 - 1.0 A)", subject: "physics", icon: "Gauge" },
          { id: "app-voltmeter", name: "Analogue DC Voltmeter (0 - 3.0 V)", subject: "physics", icon: "Activity" },
          { id: "app-rheostat", name: "Variable Resistor (Rheostat 0-50 \u03A9)", subject: "physics", icon: "Sliders" },
          { id: "app-switch", name: "One-Way Contact Switch", subject: "physics", icon: "ToggleLeft" },
          { id: "app-wires", name: "Set of Connecting Wires with Crocodile Clips", subject: "physics", icon: "Zap" },
          { id: "app-resistor-fixed", name: "Carbon Resistor (4.0 \u03A9)", subject: "physics", icon: "Cpu" },
          // Distractor
          { id: "app-prism", name: "Glass Triangular Prism (Not Required)", subject: "physics", icon: "Triangle", isDistractor: true }
        ],
        steps: [
          {
            id: 1,
            instruction: "Place the 3.0V DC cell pack into the circuit workspace and ensure the key switch is initially OPEN for safety.",
            validationType: "apparatus_placed",
            validationDetail: "Battery and switch placed in series",
            marks: 1,
            hint: "Drag the power source and switch onto the circuit layout board.",
            allowForcePush: true
          },
          {
            id: 2,
            instruction: "Connect the positive terminal of the cell to the positive terminal of the DC Ammeter in series.",
            validationType: "connection_made",
            validationDetail: "Battery (+) connected to Ammeter (+)",
            marks: 2,
            hint: "Connect the red terminal of the cell to the ammeter entry terminal.",
            allowForcePush: true
          },
          {
            id: 3,
            instruction: "Connect the negative terminal of the ammeter to the variable rheostat, and complete the circuit loop back through the switch to the negative cell terminal.",
            validationType: "connection_made",
            validationDetail: "Series circuit closed with rheostat",
            marks: 2,
            hint: "Ensure all components form an unbroken series loop.",
            allowForcePush: true
          },
          {
            id: 4,
            instruction: "Connect the Voltmeter in PARALLEL across the resistor terminals.",
            validationType: "connection_made",
            validationDetail: "Voltmeter connected across resistor",
            marks: 2,
            hint: "Voltmeters must always be connected across components in parallel, never in series.",
            allowForcePush: true
          },
          {
            id: 5,
            instruction: "Close the switch. Adjust the rheostat slider to obtain at least 4 distinct current readings (0.10A, 0.20A, 0.30A, 0.40A) and record corresponding voltages.",
            validationType: "reading_recorded",
            validationDetail: "Readings recorded in answer sheet",
            marks: 3,
            hint: "Observe the deflected needle positions on both analogue meters.",
            allowForcePush: false
          }
        ],
        simulationType: "circuit",
        simulationConfig: {
          emfVoltage: 3,
          internalResistance: 0.6,
          resistorValues: [2, 4, 6, 8, 10]
        },
        answerSheet: [
          {
            id: "q-circuit-table",
            type: "data_table",
            prompt: "Table 2: Potential Difference (V) versus Current (I) readings",
            maxMarks: 5,
            tableHeaders: ["Trial", "Current I (A)", "Voltage V (V)", "Resistance R = V/I (\u03A9)"],
            tableRows: [
              { label: "Setting 1 (High R)", simulatedValue: 0.15, tolerance: 0.05 },
              { label: "Setting 2 (Med-High R)", simulatedValue: 0.25, tolerance: 0.05 },
              { label: "Setting 3 (Medium R)", simulatedValue: 0.35, tolerance: 0.05 },
              { label: "Setting 4 (Low R)", simulatedValue: 0.45, tolerance: 0.05 }
            ]
          },
          {
            id: "q-slope-resistance",
            type: "calculation",
            prompt: "From the recorded readings, calculate the gradient / resistance R = \u0394V / \u0394I.",
            maxMarks: 3,
            correctNumericValue: 4.8,
            tolerance: 0.4,
            unit: "\u03A9",
            formulaHint: "Slope = (V2 - V1) / (I2 - I1)"
          },
          {
            id: "q-circuit-inference",
            type: "short_answer",
            prompt: "State why the switch should be opened between readings during a physical KCSE physics practical.",
            maxMarks: 2,
            observationAcceptedKeywords: ["prevent heating", "prevent cell run down", "internal resistance change", "battery discharge", "temperature rise"]
          }
        ],
        ownerType: "global",
        schoolId: null,
        teacherId: null,
        authorName: "KCSE National Examinations Board (Curriculum Directorate)",
        status: "published"
      },
      {
        id: "exp-chem-qualitative-03",
        subject: "chemistry",
        title: "Qualitative Analysis: Identification of Cations and Anions in Solid Q",
        kcsePaper: "233/3 (KCSE Chemistry Practical Paper 3 - Q2)",
        topic: "Salts & Qualitative Chemical Analysis",
        objectives: [
          "Dissolve solid sample in distilled water and partition into multiple clean test tubes",
          "Test for specific cations using 2M Sodium Hydroxide (NaOH) dropwise until in excess",
          "Test for confirming ions using Aqueous Ammonia (NH3) dropwise and excess",
          "Perform precipitation tests with Barium Nitrate [Ba(NO3)2] followed by dilute HCl",
          "Formulate accurate observations and chemical inferences in standardized KCSE table format"
        ],
        estimatedDurationMinutes: 40,
        apparatus: [
          { id: "app-rack", name: "Test Tube Rack with 6 Test Tubes", subject: "chemistry", icon: "Pipette" },
          { id: "app-spatula", name: "Nickel Spatula", subject: "chemistry", icon: "Wrench" },
          { id: "app-sample-q", name: "Sample Bottle: Solid Q (Unknown salt)", subject: "chemistry", icon: "Container" },
          { id: "app-naoh-bottle", name: "2.0 M Sodium Hydroxide Reagent Dropper", subject: "chemistry", icon: "Droplet" },
          { id: "app-nh3-bottle", name: "2.0 M Aqueous Ammonia Reagent Dropper", subject: "chemistry", icon: "Droplet" },
          { id: "app-bano3-bottle", name: "Aqueous Barium Nitrate Reagent Dropper", subject: "chemistry", icon: "Droplet" },
          { id: "app-hcl-bottle", name: "2.0 M Dilute Hydrochloric Acid Dropper", subject: "chemistry", icon: "Droplet" },
          { id: "app-water", name: "Distilled Water Wash Bottle", subject: "chemistry", icon: "Droplets" }
        ],
        steps: [
          {
            id: 1,
            instruction: "Scoop one spatula end of Solid Q into a clean boiling tube. Add about 10 cm\xB3 of distilled water and shake thoroughly until all solid dissolves to form Solution Q.",
            validationType: "apparatus_placed",
            validationDetail: "Solid Q dissolved in water",
            marks: 1,
            hint: "Solid Q readily dissolves forming a pale green aqueous solution.",
            allowForcePush: true
          },
          {
            id: 2,
            instruction: "Divide Solution Q into three equal portions in clean test tubes labeled Portion 1, 2, and 3.",
            validationType: "apparatus_placed",
            validationDetail: "Solution partitioned into test tubes",
            marks: 1,
            hint: "Use the test tube rack to organize your portions.",
            allowForcePush: true
          },
          {
            id: 3,
            instruction: "To Portion 1: Add 2-3 drops of 2M Sodium Hydroxide, then continue adding until in excess. Observe precipitate formation and solubility.",
            validationType: "reagent_added",
            validationDetail: "NaOH added to portion 1",
            marks: 2,
            hint: "Watch for a dirty green gelatinous precipitate that is insoluble in excess NaOH.",
            allowForcePush: true
          },
          {
            id: 4,
            instruction: "To Portion 2: Add aqueous Barium Nitrate solution dropwise, followed by 2-3 drops of dilute Hydrochloric acid.",
            validationType: "reagent_added",
            validationDetail: "Ba(NO3)2 followed by HCl added to portion 2",
            marks: 2,
            hint: "A dense white precipitate forms which remains insoluble upon adding dilute HCl.",
            allowForcePush: true
          }
        ],
        simulationType: "qualitative",
        simulationConfig: {
          unknownSolidName: "Solid Q (Iron(II) Sulphate Hydrate)",
          cation: "Fe2+",
          anion: "SO4(2-)"
        },
        answerSheet: [
          {
            id: "q-obs-naoh",
            type: "observation_inference",
            prompt: "Portion 1: Test with Sodium Hydroxide (NaOH) dropwise then excess",
            maxMarks: 4,
            observationAcceptedKeywords: ["green precipitate", "dirty green ppt", "insoluble in excess", "green ppt insoluble"],
            inferenceAcceptedKeywords: ["fe2+ ions present", "iron ii ions", "fe2+ present"]
          },
          {
            id: "q-obs-bano3",
            type: "observation_inference",
            prompt: "Portion 2: Test with aqueous Barium Nitrate followed by dilute HCl",
            maxMarks: 4,
            observationAcceptedKeywords: ["white precipitate", "white ppt formed", "insoluble in dilute hcl", "ppt persists"],
            inferenceAcceptedKeywords: ["so42- ions present", "sulphate ions present", "so4 2-"]
          },
          {
            id: "q-identity-q",
            type: "short_answer",
            prompt: "Deduce the complete chemical name and formula of Solid Q based on your tests.",
            maxMarks: 2,
            observationAcceptedKeywords: ["iron(ii) sulphate", "iron ii sulfate", "feso4"]
          }
        ],
        ownerType: "global",
        schoolId: null,
        teacherId: null,
        authorName: "KCSE National Examinations Board (Curriculum Directorate)",
        status: "published"
      },
      {
        id: "exp-bio-food-tests-04",
        subject: "biology",
        title: "Food Tests: Identification of Food Nutrients in Solution X",
        kcsePaper: "231/3 (KCSE Biology Practical Paper 3 - Q1)",
        topic: "Nutrition in Animals & Biochemical Testing",
        objectives: [
          "Carry out Benedict's test for reducing sugars with hot water bath heating",
          "Perform the Biuret test for proteins using sodium hydroxide and copper(II) sulphate",
          "Test for starch using standard Iodine solution",
          "Record observations and deductions in KCSE standard tabulated format"
        ],
        estimatedDurationMinutes: 35,
        apparatus: [
          { id: "app-bio-rack", name: "Test Tube Rack with 4 Boiling Tubes", subject: "biology", icon: "Pipette" },
          { id: "app-water-bath", name: "Thermostatic Boiling Water Bath (95\xB0C)", subject: "biology", icon: "Flame" },
          { id: "app-benedicts", name: "Benedict's Reagent Solution", subject: "biology", icon: "Droplet" },
          { id: "app-biuret-a", name: "Biuret Reagent (NaOH + dilute CuSO4)", subject: "biology", icon: "Droplet" },
          { id: "app-iodine", name: "Iodine in Potassium Iodide Solution", subject: "biology", icon: "Droplet" },
          { id: "app-sample-x", name: "Extract Solution X", subject: "biology", icon: "Beaker" }
        ],
        steps: [
          {
            id: 1,
            instruction: "Add 2 cm\xB3 of Solution X into test tube 1. Add equal volume of Benedict's solution, shake, and place into the hot water bath for 3 minutes.",
            validationType: "reagent_added",
            validationDetail: "Benedicts test heated",
            marks: 2,
            hint: "Observe color transition: Blue -> Green -> Yellow -> Orange -> Brick-red precipitate.",
            allowForcePush: true
          },
          {
            id: 2,
            instruction: "Add 2 cm\xB3 of Solution X into test tube 2. Add 1 cm\xB3 of Biuret reagent (NaOH + CuSO4) and shake thoroughly without heating.",
            validationType: "reagent_added",
            validationDetail: "Biuret test performed",
            marks: 2,
            hint: "Notice color change to violet or purple indicating presence of peptide bonds in proteins.",
            allowForcePush: true
          },
          {
            id: 3,
            instruction: "To test tube 3, add 2 cm\xB3 of Solution X followed by 2 drops of Iodine solution.",
            validationType: "reagent_added",
            validationDetail: "Iodine test performed",
            marks: 2,
            hint: "Observe whether solution turns blue-black or retains yellow-brown iodine color.",
            allowForcePush: true
          }
        ],
        simulationType: "food_test",
        simulationConfig: {
          sampleName: "Food Extract X",
          nutrientsPresent: ["Reducing Sugars (High)", "Proteins (Moderate)", "Starch (Absent)"]
        },
        answerSheet: [
          {
            id: "q-bio-benedicts",
            type: "observation_inference",
            prompt: "Benedict's Test for Reducing Sugars",
            maxMarks: 3,
            observationAcceptedKeywords: ["orange precipitate", "brick red precipitate", "brick-red ppt", "yellow to red"],
            inferenceAcceptedKeywords: ["reducing sugars present", "reducing sugar present"]
          },
          {
            id: "q-bio-biuret",
            type: "observation_inference",
            prompt: "Biuret Test for Proteins",
            maxMarks: 3,
            observationAcceptedKeywords: ["purple colour", "violet colour", "purple/violet", "violet solution"],
            inferenceAcceptedKeywords: ["proteins present", "peptide bonds present"]
          },
          {
            id: "q-bio-iodine",
            type: "observation_inference",
            prompt: "Iodine Test for Starch",
            maxMarks: 3,
            observationAcceptedKeywords: ["brown colour remained", "yellow-brown colour persists", "no colour change", "brown solution"],
            inferenceAcceptedKeywords: ["starch absent", "no starch"]
          }
        ],
        ownerType: "global",
        schoolId: null,
        teacherId: null,
        authorName: "KCSE National Examinations Board (Curriculum Directorate)",
        status: "published"
      },
      {
        id: "exp-phys-hookes-05",
        subject: "physics",
        title: "Hooke's Law: Elastic Properties of a Spiral Spring",
        kcsePaper: "232/3 (KCSE Physics Practical Paper 3 - Q2)",
        topic: "Mechanics: Forces & Elasticity",
        objectives: [
          "Set up spiral spring suspended vertically alongside a vertical metre rule",
          "Determine the unloaded pointer position (initial length L0)",
          "Load the hanger progressively with 50g, 100g, 150g, 200g, 250g masses and measure extension e",
          "Verify Hooke's Law (F = ke) and determine the spring constant k in N/m"
        ],
        estimatedDurationMinutes: 35,
        apparatus: [
          { id: "app-stand-phys", name: "Heavy Retort Stand and Clamp", subject: "physics", icon: "Clamp" },
          { id: "app-spring", name: "Steel Helical Spring with Pointer", subject: "physics", icon: "Maximize2" },
          { id: "app-rule", name: "Vertical 100cm Metre Rule", subject: "physics", icon: "Ruler" },
          { id: "app-masses", name: "Mass Hanger & 50g Slotted Masses (0 - 300g)", subject: "physics", icon: "Weight" }
        ],
        steps: [
          {
            id: 1,
            instruction: "Clamp the spring firmly on the retort stand. Note the initial reading on the metre rule indicated by the horizontal pointer (L0 = 20.0 cm).",
            validationType: "apparatus_placed",
            validationDetail: "Spring and metre rule placed",
            marks: 1,
            hint: "Ensure your eye is level with the pointer to avoid parallax error.",
            allowForcePush: true
          },
          {
            id: 2,
            instruction: "Suspend the mass hanger (50g = 0.5N). Record new pointer reading L and calculate extension e = L - L0.",
            validationType: "reading_recorded",
            validationDetail: "50g extension recorded",
            marks: 2,
            hint: "Extension increases linearly with added weight.",
            allowForcePush: true
          },
          {
            id: 3,
            instruction: "Add further 50g masses one at a time up to 250g, recording pointer readings and corresponding extensions.",
            validationType: "reading_recorded",
            validationDetail: "All masses loaded and extensions logged",
            marks: 2,
            hint: "Check that the spring does not exceed its elastic limit.",
            allowForcePush: false
          }
        ],
        simulationType: "hookes_law",
        simulationConfig: {
          emfVoltage: 0,
          resistorValues: [0.5, 1, 1.5, 2, 2.5]
        },
        answerSheet: [
          {
            id: "q-hooke-table",
            type: "data_table",
            prompt: "Table 3: Mass, Weight (F = mg) and Extension (e) of Spring",
            maxMarks: 5,
            tableHeaders: ["Mass (g)", "Weight F (N)", "Pointer Reading L (cm)", "Extension e (cm)"],
            tableRows: [
              { label: "Mass 50g", simulatedValue: 2.5, tolerance: 0.2 },
              { label: "Mass 100g", simulatedValue: 5, tolerance: 0.2 },
              { label: "Mass 150g", simulatedValue: 7.5, tolerance: 0.2 },
              { label: "Mass 200g", simulatedValue: 10, tolerance: 0.2 },
              { label: "Mass 250g", simulatedValue: 12.5, tolerance: 0.2 }
            ]
          },
          {
            id: "q-spring-constant",
            type: "calculation",
            prompt: "Determine the spring constant k = Force / Extension (in N/m).",
            maxMarks: 3,
            correctNumericValue: 20,
            tolerance: 1,
            unit: "N/m",
            formulaHint: "k = \u0394F (N) / \u0394e (m)"
          }
        ],
        ownerType: "global",
        schoolId: null,
        teacherId: null,
        authorName: "KCSE National Examinations Board (Curriculum Directorate)",
        status: "published"
      },
      {
        id: "exp-chem-redox-knec-233-3",
        subject: "chemistry",
        title: "Standardization and Volumetric Analysis Practical (233/3)",
        kcsePaper: "233/3 (KCSE Chemistry Practical Paper 3 - Q1)",
        topic: "Acids, Bases & Redox Volumetric Analysis",
        objectives: [
          "Fill the burette with Solution B and zero to the 0.00 cm\xB3 mark",
          "Accurately pipette 25.0 cm\xB3 of Solution C into a clean conical flask",
          "Measure 5.0 cm\xB3 of 1M sulphuric(VI) acid using a measuring cylinder into the flask",
          "Titrate Solution C against Solution B until a permanent pale pink colour just appears",
          "Determine the reaction stoichiometry, average volume, and write balanced ionic equations"
        ],
        estimatedDurationMinutes: 45,
        apparatus: [
          { id: "app-burette", name: "50cm\xB3 Burette with Teflon Tap", subject: "chemistry", icon: "Burette" },
          { id: "app-flask", name: "250cm\xB3 Conical Flask", subject: "chemistry", icon: "FlaskConical" },
          { id: "app-pipette", name: "25.0cm\xB3 Pipette & Safety Filler", subject: "chemistry", icon: "Pipette" },
          { id: "app-stand", name: "Retort Stand & Burette Clamp", subject: "chemistry", icon: "Clamp" },
          { id: "app-cylinder", name: "10cm\xB3 Measuring Cylinder", subject: "chemistry", icon: "Cylinder" },
          { id: "app-white-tile", name: "White Ceramic Inspection Tile", subject: "chemistry", icon: "Square" },
          { id: "app-sol-b", name: "Solution B: Aqueous Potassium Manganate(VII)", subject: "chemistry", icon: "Beaker" },
          { id: "app-sol-c", name: "Solution C: 0.1M Ammonium Iron(II) Sulphate", subject: "chemistry", icon: "Beaker" },
          { id: "app-acid", name: "1.0M Sulphuric(VI) Acid", subject: "chemistry", icon: "Beaker" },
          { id: "app-burner", name: "Bunsen Burner & Wire Gauze", subject: "chemistry", icon: "Flame" }
        ],
        procedures: [
          {
            id: "proc-1",
            number: 1,
            title: "Procedure I: Standardization of Solution B with Solution C",
            description: "Volumetric titration using Solution B in burette and acidified Solution C in conical flask.",
            steps: [
              {
                id: 1,
                instruction: "Fill the burette with solution B up to the 0.00 cm\xB3 mark.",
                validationType: "apparatus_placed",
                validationDetail: "Burette filled with Solution B",
                marks: 1,
                hint: "Mount the burette and fill with Solution B using a funnel or tap.",
                allowForcePush: true,
                procedureNumber: 1
              },
              {
                id: 2,
                instruction: "Pipette 25cm\xB3 of solution C into a conical flask.",
                validationType: "volume_set",
                validationDetail: "25.0 cm\xB3 Solution C in conical flask",
                marks: 1,
                hint: "Use the pipette filler to deliver exactly 25.0 cm\xB3 of Solution C.",
                allowForcePush: true,
                procedureNumber: 1
              },
              {
                id: 3,
                instruction: "Add 5cm\xB3 of 1M sulphuric (VI) acid using a measuring cylinder into the conical flask.",
                validationType: "reagent_added",
                validationDetail: "5.0 cm\xB3 1M H\u2082SO\u2084 added via measuring cylinder",
                marks: 1,
                hint: "Use the measuring cylinder to measure 5.0 cm\xB3 of 1M H\u2082SO\u2084 and pour into the flask.",
                allowForcePush: true,
                procedureNumber: 1
              },
              {
                id: 4,
                instruction: "Titrate solution C using solution B until a permanent pale pink colour just appears.",
                validationType: "run_simulation",
                validationDetail: "Titrated to permanent pale pink endpoint",
                marks: 1,
                hint: "Deliver Solution B dropwise until the pale pink colour remains on swirling.",
                allowForcePush: true,
                procedureNumber: 1
              }
            ]
          },
          {
            id: "proc-2",
            number: 2,
            title: "Procedure II: Quantitative Determination with Dilution & Heating",
            description: "Dilution of Solution A, acidification, heating to 60\xB0C, and titration against Solution B.",
            steps: [
              {
                id: 5,
                instruction: "Measure 2.0 cm\xB3 of Solution A and dilute by adding 75 cm\xB3 of distilled water to make Solution D.",
                validationType: "diluted",
                validationDetail: "Solution D prepared by dilution",
                marks: 1,
                hint: "Use the dilution station to prepare Solution D.",
                allowForcePush: true,
                procedureNumber: 2
              },
              {
                id: 6,
                instruction: "Pipette 25.0 cm\xB3 of Solution D into a conical flask and add 5.0 cm\xB3 of 1M sulphuric acid.",
                validationType: "volume_set",
                validationDetail: "25.0 cm\xB3 Solution D + 5cm\xB3 H\u2082SO\u2084 in flask",
                marks: 1,
                hint: "Transfer Solution D and acidify with 5.0 cm\xB3 1M sulphuric acid using measuring cylinder.",
                allowForcePush: true,
                procedureNumber: 2
              },
              {
                id: 7,
                instruction: "Heat the mixture in the conical flask to about 60\xB0C using a Bunsen burner or water bath.",
                validationType: "heated",
                validationDetail: "Conical flask heated to 60\xB0C",
                marks: 1,
                hint: "Activate heat source and monitor thermometer until 60\xB0C is reached.",
                allowForcePush: true,
                procedureNumber: 2
              },
              {
                id: 8,
                instruction: "Titrate while hot against Solution B until a permanent pale pink colour appears.",
                validationType: "run_simulation",
                validationDetail: "Hot mixture titrated to pale pink endpoint",
                marks: 1,
                hint: "Titrate while hot with Solution B until pale pink endpoint.",
                allowForcePush: true,
                procedureNumber: 2
              }
            ]
          }
        ],
        steps: [
          {
            id: 1,
            instruction: "Fill the burette with solution B up to the 0.00 cm\xB3 mark.",
            validationType: "apparatus_placed",
            validationDetail: "Burette filled with Solution B",
            marks: 1,
            hint: "Mount the burette and fill with Solution B using a funnel or tap.",
            allowForcePush: true,
            procedureNumber: 1
          },
          {
            id: 2,
            instruction: "Pipette 25cm\xB3 of solution C into a conical flask.",
            validationType: "volume_set",
            validationDetail: "25.0 cm\xB3 Solution C in conical flask",
            marks: 1,
            hint: "Use the pipette filler to deliver exactly 25.0 cm\xB3 of Solution C.",
            allowForcePush: true,
            procedureNumber: 1
          },
          {
            id: 3,
            instruction: "Add 5cm\xB3 of 1M sulphuric (VI) acid using a measuring cylinder into the conical flask.",
            validationType: "reagent_added",
            validationDetail: "5.0 cm\xB3 1M H\u2082SO\u2084 added via measuring cylinder",
            marks: 1,
            hint: "Use the measuring cylinder to measure 5.0 cm\xB3 of 1M H\u2082SO\u2084 and pour into the flask.",
            allowForcePush: true,
            procedureNumber: 1
          },
          {
            id: 4,
            instruction: "Titrate solution C using solution B until a permanent pale pink colour just appears.",
            validationType: "run_simulation",
            validationDetail: "Titrated to permanent pale pink endpoint",
            marks: 1,
            hint: "Deliver Solution B dropwise until the pale pink colour remains on swirling.",
            allowForcePush: true,
            procedureNumber: 1
          },
          {
            id: 5,
            instruction: "Measure 2.0 cm\xB3 of Solution A and dilute by adding 75 cm\xB3 of distilled water to make Solution D.",
            validationType: "diluted",
            validationDetail: "Solution D prepared by dilution",
            marks: 1,
            hint: "Use the dilution station to prepare Solution D.",
            allowForcePush: true,
            procedureNumber: 2
          },
          {
            id: 6,
            instruction: "Pipette 25.0 cm\xB3 of Solution D into a conical flask and add 5.0 cm\xB3 of 1M sulphuric acid.",
            validationType: "volume_set",
            validationDetail: "25.0 cm\xB3 Solution D + 5cm\xB3 H\u2082SO\u2084 in flask",
            marks: 1,
            hint: "Transfer Solution D and acidify with 5.0 cm\xB3 1M sulphuric acid using measuring cylinder.",
            allowForcePush: true,
            procedureNumber: 2
          },
          {
            id: 7,
            instruction: "Heat the mixture in the conical flask to about 60\xB0C using a Bunsen burner or water bath.",
            validationType: "heated",
            validationDetail: "Conical flask heated to 60\xB0C",
            marks: 1,
            hint: "Activate heat source and monitor thermometer until 60\xB0C is reached.",
            allowForcePush: true,
            procedureNumber: 2
          },
          {
            id: 8,
            instruction: "Titrate while hot against Solution B until a permanent pale pink colour appears.",
            validationType: "run_simulation",
            validationDetail: "Hot mixture titrated to pale pink endpoint",
            marks: 1,
            hint: "Titrate while hot with Solution B until pale pink endpoint.",
            allowForcePush: true,
            procedureNumber: 2
          }
        ],
        simulationType: "titration",
        simulationConfig: {
          acidConcentrationM: 0.02,
          baseVolumeCm3: 25,
          unknownMolarity: 0.1,
          indicator: "Potassium Permanganate (Self-Indicating)",
          equivalencePointCm3: 24.5,
          colorBefore: "#f1f5f9",
          colorAfter: "#fbcfe8"
        },
        answerSheet: [
          {
            id: "q-table-a",
            type: "data_table",
            prompt: "Table A: Titration of 25.0 cm\xB3 Solution C against Solution B",
            maxMarks: 4,
            procedureNumber: 1,
            tableType: "titration",
            tableHeaders: ["Titre Number", "Final burette reading (cm\xB3)", "Initial burette reading (cm\xB3)", "Volume of Solution B used (cm\xB3)"],
            tableRows: [
              { label: "Titre I (Trial)", simulatedValue: 24.5, tolerance: 0.2 },
              { label: "Titre II (Accurate)", simulatedValue: 24.5, tolerance: 0.1 },
              { label: "Titre III (Accurate)", simulatedValue: 24.4, tolerance: 0.1 }
            ]
          },
          {
            id: "q-calc-avg-b",
            type: "calculation",
            prompt: "(a) Calculate the average volume of Solution B used.",
            maxMarks: 1,
            procedureNumber: 1,
            correctNumericValue: 24.45,
            tolerance: 0.1,
            unit: "cm\xB3",
            formulaHint: "(Titre II + Titre III) / 2"
          },
          {
            id: "q-writing-ionic-eq",
            type: "short_answer",
            prompt: "(b) Write the balanced ionic equation for the reaction between Solution B (MnO\u2084\u207B) and Solution C (Fe\xB2\u207A) in acidic medium.",
            maxMarks: 2,
            procedureNumber: 1,
            writingType: "multi_line",
            modelAnswer: "MnO\u2084\u207B(aq) + 5Fe\xB2\u207A(aq) + 8H\u207A(aq) -> Mn\xB2\u207A(aq) + 5Fe\xB3\u207A(aq) + 4H\u2082O(l) (Award 1 mark for correct balancing, 1 mark for state symbols).",
            acceptedKeywords: ["MnO4-", "Fe2+", "H+", "Mn2+", "Fe3+", "H2O", "balanced"]
          },
          {
            id: "q-table-b",
            type: "data_table",
            prompt: "Table B: Titration of 25.0 cm\xB3 of diluted Solution D against Solution B (Hot)",
            maxMarks: 4,
            procedureNumber: 2,
            tableType: "titration",
            tableHeaders: ["Titre Number", "Final burette reading (cm\xB3)", "Initial burette reading (cm\xB3)", "Volume of Solution B used (cm\xB3)"],
            tableRows: [
              { label: "Titre I (Trial)", simulatedValue: 22.8, tolerance: 0.2 },
              { label: "Titre II (Accurate)", simulatedValue: 22.8, tolerance: 0.1 },
              { label: "Titre III (Accurate)", simulatedValue: 22.7, tolerance: 0.1 }
            ]
          },
          {
            id: "q-writing-acid-role",
            type: "short_answer",
            prompt: "(c) Explain the role of the 5.0 cm\xB3 1M sulphuric(VI) acid added using the measuring cylinder in Step 3.",
            maxMarks: 1,
            procedureNumber: 1,
            writingType: "multi_line",
            modelAnswer: "Provides hydrogen ions (H\u207A) required for the reduction of manganate(VII) ions to manganese(II) ions, and prevents formation of brown manganese(IV) oxide precipitate.",
            acceptedKeywords: ["acidic medium", "H+ ions", "prevent MnO2", "reduction of MnO4-"]
          }
        ],
        ownerType: "global",
        schoolId: null,
        teacherId: null,
        authorName: "KCSE National Examinations Board (Curriculum Directorate)",
        status: "published"
      }
    ];
  }
});

// server/db/supabase.ts
var supabase_exports = {};
__export(supabase_exports, {
  assignmentFromDb: () => assignmentFromDb,
  assignmentToDb: () => assignmentToDb,
  attemptFromDb: () => attemptFromDb,
  attemptToDb: () => attemptToDb,
  classFromDb: () => classFromDb,
  classToDb: () => classToDb,
  emailFromDb: () => emailFromDb,
  emailToDb: () => emailToDb,
  ensureExperimentsInSupabase: () => ensureExperimentsInSupabase,
  experimentFromDb: () => experimentFromDb,
  experimentToDb: () => experimentToDb,
  getSupabaseClient: () => getSupabaseClient,
  getSupabaseConfig: () => getSupabaseConfig,
  isSupabaseConfigured: () => isSupabaseConfigured,
  schoolFromDb: () => schoolFromDb,
  schoolToDb: () => schoolToDb,
  userFromDb: () => userFromDb,
  userToDb: () => userToDb
});
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
var getSupabaseConfig, supabaseClient, isSupabaseConfigured, getSupabaseClient, schoolFromDb, schoolToDb, userFromDb, userToDb, classFromDb, classToDb, experimentFromDb, experimentToDb, assignmentFromDb, assignmentToDb, attemptFromDb, attemptToDb, emailFromDb, emailToDb, ensureExperimentsInSupabase;
var init_supabase = __esm({
  "server/db/supabase.ts"() {
    init_experimentSpecs();
    dotenv.config();
    getSupabaseConfig = () => {
      const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
      return { url, key };
    };
    supabaseClient = null;
    isSupabaseConfigured = () => {
      const { url, key } = getSupabaseConfig();
      return Boolean(
        url && url.startsWith("https://") && key && !url.includes("your-project-id") && !key.includes("your-anon-key")
      );
    };
    getSupabaseClient = () => {
      if (!isSupabaseConfigured()) {
        return null;
      }
      if (!supabaseClient) {
        const { url, key } = getSupabaseConfig();
        try {
          supabaseClient = createClient(url, key, {
            auth: {
              persistSession: false,
              autoRefreshToken: false
            }
          });
          console.log(" [SUPABASE] Connected to live Supabase database at:", url);
        } catch (err) {
          console.error(" [SUPABASE] Failed to initialize Supabase client:", err);
          return null;
        }
      }
      return supabaseClient;
    };
    schoolFromDb = (row) => ({
      id: row.id,
      name: row.name,
      registrationNumber: row.registration_number || "",
      county: row.county,
      subCounty: row.sub_county || "",
      category: row.category,
      subscriptionPlan: row.subscription_plan,
      adminName: row.admin_name,
      adminEmail: row.admin_email,
      phone: row.phone || "",
      totalStudents: Number(row.total_students || 0),
      totalTeachers: Number(row.total_teachers || 0),
      createdAt: row.created_at ? new Date(row.created_at).toISOString().split("T")[0] : (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      status: row.status || "active"
    });
    schoolToDb = (s) => ({
      id: s.id,
      name: s.name,
      registration_number: s.registrationNumber,
      county: s.county,
      sub_county: s.subCounty,
      category: s.category,
      subscription_plan: s.subscriptionPlan,
      admin_name: s.adminName,
      admin_email: s.adminEmail,
      phone: s.phone,
      total_students: s.totalStudents ?? 0,
      total_teachers: s.totalTeachers ?? 0,
      status: s.status || "active"
    });
    userFromDb = (row) => ({
      id: row.id,
      schoolId: row.school_id,
      name: row.name,
      email: row.email,
      role: row.role,
      admissionNumber: row.admission_number,
      subjectSpecialization: row.subject_specialization,
      classId: row.class_id,
      className: row.class_name,
      teacherId: row.teacher_id,
      teacherName: row.teacher_name,
      avatarColor: row.avatar_color,
      mustChangePassword: Boolean(row.must_change_password),
      tempPassword: row.temp_password,
      password: row.password || void 0
    });
    userToDb = (u) => {
      const row = {
        id: u.id,
        school_id: u.schoolId,
        name: u.name,
        email: u.email,
        role: u.role,
        admission_number: u.admissionNumber,
        subject_specialization: u.subjectSpecialization,
        class_id: u.classId,
        class_name: u.className,
        teacher_id: u.teacherId,
        teacher_name: u.teacherName,
        avatar_color: u.avatarColor,
        must_change_password: u.mustChangePassword ?? false,
        temp_password: u.tempPassword
      };
      if (u.password !== void 0) {
        row.password = u.password;
      }
      return row;
    };
    classFromDb = (row) => ({
      id: row.id,
      schoolId: row.school_id,
      name: row.name,
      formYear: Number(row.form_year),
      teacherId: row.teacher_id,
      teacherName: row.teacher_name,
      subject: row.subject,
      studentCount: Number(row.student_count || 0)
    });
    classToDb = (c) => ({
      id: c.id,
      school_id: c.schoolId,
      name: c.name,
      form_year: c.formYear,
      teacher_id: c.teacherId,
      teacher_name: c.teacherName,
      subject: c.subject,
      student_count: c.studentCount ?? 0
    });
    experimentFromDb = (row) => ({
      id: row.id,
      subject: row.subject,
      title: row.title,
      kcsePaper: row.kcse_paper,
      topic: row.topic,
      objectives: Array.isArray(row.objectives) ? row.objectives : [],
      estimatedDurationMinutes: Number(row.estimated_duration_minutes || 45),
      apparatus: Array.isArray(row.apparatus) ? row.apparatus : [],
      steps: Array.isArray(row.steps) ? row.steps : [],
      procedures: Array.isArray(row.simulation_config?.procedures) ? row.simulation_config.procedures : void 0,
      simulationType: row.simulation_type,
      simulationConfig: row.simulation_config || {},
      answerSheet: Array.isArray(row.answer_sheet) ? row.answer_sheet : [],
      ownerType: row.owner_type,
      schoolId: row.school_id,
      teacherId: row.teacher_id,
      authorName: row.author_name,
      status: row.status || "published",
      clonedFrom: row.cloned_from
    });
    experimentToDb = (e) => ({
      id: e.id,
      subject: e.subject,
      title: e.title,
      kcse_paper: e.kcsePaper,
      topic: e.topic,
      objectives: e.objectives || [],
      estimated_duration_minutes: e.estimatedDurationMinutes || 45,
      apparatus: e.apparatus || [],
      steps: e.steps || [],
      simulation_type: e.simulationType,
      simulation_config: {
        ...e.simulationConfig || {},
        ...e.procedures ? { procedures: e.procedures } : {}
      },
      answer_sheet: e.answerSheet || [],
      owner_type: e.ownerType || "global",
      school_id: e.schoolId,
      teacher_id: e.teacherId,
      author_name: e.authorName || "KCSE National Science Curriculum",
      status: e.status || "published",
      cloned_from: e.clonedFrom
    });
    assignmentFromDb = (row) => ({
      id: row.id,
      schoolId: row.school_id,
      teacherId: row.teacher_id,
      teacherName: row.teacher_name,
      classId: row.class_id,
      className: row.class_name,
      experimentId: row.experiment_id,
      experimentTitle: row.experiment_title,
      subject: row.subject,
      kcsePaper: row.kcse_paper,
      mode: row.mode,
      deadline: row.deadline,
      timeLimitMinutes: row.time_limit_minutes,
      assignedAt: row.assigned_at,
      totalEnrolledStudents: Number(row.total_enrolled_students || 0),
      submittedCount: Number(row.submitted_count || 0)
    });
    assignmentToDb = (a) => ({
      id: a.id,
      school_id: a.schoolId,
      teacher_id: a.teacherId,
      teacher_name: a.teacherName,
      class_id: a.classId,
      class_name: a.className,
      experiment_id: a.experimentId,
      experiment_title: a.experimentTitle,
      subject: a.subject,
      kcse_paper: a.kcsePaper,
      mode: a.mode,
      deadline: a.deadline,
      time_limit_minutes: a.timeLimitMinutes,
      total_enrolled_students: a.totalEnrolledStudents ?? 0,
      submitted_count: a.submittedCount ?? 0
    });
    attemptFromDb = (row) => ({
      id: row.id,
      schoolId: row.school_id,
      assignmentId: row.assignment_id,
      isPracticeOpenLab: Boolean(row.is_practice_open_lab),
      experimentId: row.experiment_id,
      experimentTitle: row.experiment_title,
      subject: row.subject,
      studentId: row.student_id,
      studentName: row.student_name,
      studentAdmission: row.student_admission,
      teacherId: row.teacher_id,
      teacherName: row.teacher_name,
      classId: row.class_id,
      className: row.class_name,
      mode: row.mode,
      startedAt: row.started_at,
      submittedAt: row.submitted_at,
      status: row.status,
      stepLogs: Array.isArray(row.step_logs) ? row.step_logs : [],
      answers: Array.isArray(row.answers) ? row.answers : [],
      totalScore: Number(row.total_score || 0),
      maxScore: Number(row.max_score || 20),
      percentage: Number(row.percentage || 0),
      teacherComments: row.teacher_comments,
      teacherFeedbackReleased: Boolean(row.teacher_feedback_released)
    });
    attemptToDb = (att) => ({
      id: att.id,
      school_id: att.schoolId,
      assignment_id: att.assignmentId,
      is_practice_open_lab: att.isPracticeOpenLab ?? false,
      experiment_id: att.experimentId,
      experiment_title: att.experimentTitle,
      subject: att.subject,
      student_id: att.studentId,
      student_name: att.studentName,
      student_admission: att.studentAdmission,
      teacher_id: att.teacherId,
      teacher_name: att.teacherName,
      class_id: att.classId,
      class_name: att.className,
      mode: att.mode,
      started_at: att.startedAt,
      submitted_at: att.submittedAt,
      status: att.status || "submitted",
      step_logs: att.stepLogs || [],
      answers: att.answers || [],
      total_score: att.totalScore ?? 0,
      max_score: att.maxScore ?? 20,
      percentage: att.percentage ?? 0,
      teacher_comments: att.teacherComments,
      teacher_feedback_released: att.teacherFeedbackReleased ?? false
    });
    emailFromDb = (row) => ({
      id: row.id,
      senderEmail: row.sender_email || "intellicaautomationgroup@gmail.com",
      recipientEmail: row.recipient_email,
      recipientName: row.recipient_name,
      recipientRole: row.recipient_role,
      subject: row.subject,
      tempPassword: row.temp_password,
      sentAt: row.sent_at,
      schoolName: row.school_name,
      messageBody: row.message_body
    });
    emailToDb = (e) => ({
      id: e.id,
      sender_email: e.senderEmail || "intellicaautomationgroup@gmail.com",
      recipient_email: e.recipientEmail,
      recipient_name: e.recipientName,
      recipient_role: e.recipientRole,
      subject: e.subject,
      temp_password: e.tempPassword,
      sent_at: e.sentAt,
      school_name: e.schoolName,
      message_body: e.messageBody
    });
    ensureExperimentsInSupabase = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) return;
      try {
        const { count, error } = await supabase.from("experiments").select("*", { count: "exact", head: true });
        if (!error && (count === 0 || count === null)) {
          console.log(" [SUPABASE] Initializing standard KCSE experiments in Supabase...");
          const records = INITIAL_EXPERIMENTS.map(experimentToDb);
          const { error: insertErr } = await supabase.from("experiments").insert(records);
          if (insertErr) {
            console.warn(" [SUPABASE] Auto-seed experiments notice:", insertErr.message);
          } else {
            console.log(` [SUPABASE] Seeded ${records.length} standard experiments to Supabase successfully.`);
          }
        }
      } catch (err) {
        console.warn(" [SUPABASE] Check on experiments table:", err);
      }
    };
  }
});

// server/services/mailer.ts
var mailer_exports = {};
__export(mailer_exports, {
  COMPANY_EMAIL: () => COMPANY_EMAIL,
  COMPANY_NAME: () => COMPANY_NAME,
  checkMailerStatus: () => checkMailerStatus,
  getMailerCredentials: () => getMailerCredentials,
  sendEmail: () => sendEmail
});
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
function getMailerCredentials() {
  let user = process.env.GMAIL_USER || process.env.SMTP_USER || COMPANY_EMAIL;
  let pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
  if (!pass) {
    try {
      const envPath = path.resolve(process.cwd(), ".env");
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, "utf8");
        const passMatch = envContent.match(/^GMAIL_APP_PASSWORD=["']?([^"'\r\n]+)["']?/m) || envContent.match(/^SMTP_PASS=["']?([^"'\r\n]+)["']?/m) || envContent.match(/^EMAIL_PASSWORD=["']?([^"'\r\n]+)["']?/m);
        if (passMatch && passMatch[1]) {
          pass = passMatch[1].trim();
        }
        const userMatch = envContent.match(/^GMAIL_USER=["']?([^"'\r\n]+)["']?/m) || envContent.match(/^SMTP_USER=["']?([^"'\r\n]+)["']?/m);
        if (userMatch && userMatch[1]) {
          user = userMatch[1].trim();
        }
      }
    } catch (e) {
    }
  }
  return {
    user: user || COMPANY_EMAIL,
    pass: pass ? pass.trim().replace(/\s+/g, "") : null
  };
}
function checkMailerStatus() {
  const { user, pass } = getMailerCredentials();
  return {
    configured: !!pass,
    senderEmail: COMPANY_EMAIL,
    authAccount: user,
    deliveryMode: pass ? "live_smtp" : "simulation_pending_credentials",
    instructions: pass ? `Live SMTP transmission enabled from ${COMPANY_EMAIL}.` : `To transmit real emails directly to internet inboxes from ${COMPANY_EMAIL}, configure GMAIL_APP_PASSWORD in your .env file with a 16-character Google App Password from https://myaccount.google.com/apppasswords.`
  };
}
function createTransporter() {
  const { user, pass } = getMailerCredentials();
  if (!pass) {
    return null;
  }
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST.trim(),
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT) === 465,
      auth: {
        user,
        pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}
function buildBrandedHtml(title, bodyText, otpOrPassword) {
  const formattedBody = bodyText.split("\n\n").map((p) => `<p style="margin: 0 0 14px 0; line-height: 1.6; color: #334155;">${p.replace(/\n/g, "<br/>")}</p>`).join("");
  const codeBox = otpOrPassword ? `
    <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
      <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">
        Verification Credential / Code
      </span>
      <span style="font-family: monospace; font-size: 26px; font-weight: 700; color: #0f172a; letter-spacing: 0.25em;">
        ${otpOrPassword}
      </span>
    </div>` : "";
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
    <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      
      <!-- Brand Header -->
      <div style="background-color: #0f172a; padding: 22px 28px; border-bottom: 3px solid #10b981;">
        <h1 style="margin: 0; font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: 0.03em;">
          STEM-SPARK-LAB KENYA
        </h1>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">
          Powered by ${COMPANY_NAME}
        </p>
      </div>

      <!-- Main Body -->
      <div style="padding: 28px;">
        <h2 style="margin: 0 0 16px 0; font-size: 17px; font-weight: 600; color: #0f172a;">
          ${title}
        </h2>

        ${formattedBody}

        ${codeBox}
      </div>

      <!-- Footer -->
      <div style="background-color: #f8fafc; padding: 18px 28px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.5;">
        <p style="margin: 0 0 6px 0;">
          <strong>Sent from:</strong> ${COMPANY_NAME} &lt;<a href="mailto:${COMPANY_EMAIL}" style="color: #0284c7; text-decoration: none;">${COMPANY_EMAIL}</a>&gt;
        </p>
        <p style="margin: 0 0 6px 0;">
          Science & Technology Park, Nairobi, Kenya \u2022 Official STEM Practical Laboratory Support
        </p>
        <p style="margin: 0; color: #94a3b8;">
          \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} ${COMPANY_NAME}. All rights reserved.
        </p>
      </div>

    </div>
  </body>
  </html>`;
}
async function sendEmail(options) {
  const { to, toName, subject, text, tempPassword } = options;
  const recipient = toName ? `"${toName}" <${to}>` : to;
  const fromAddress = `"${COMPANY_NAME}" <${COMPANY_EMAIL}>`;
  const html = options.html || buildBrandedHtml(subject, text, tempPassword);
  const transporter = createTransporter();
  if (!transporter) {
    console.info(`
======================================================`);
    console.info(`[MAILER] \u{1F4E7} Outgoing Email Prepared:`);
    console.info(`  FROM:    ${fromAddress}`);
    console.info(`  TO:      ${recipient}`);
    console.info(`  SUBJECT: ${subject}`);
    if (tempPassword) {
      console.info(`  OTP/CREDENTIAL: ${tempPassword}`);
    }
    console.info(`  NOTE: Live SMTP transmission requires GMAIL_APP_PASSWORD in .env.`);
    console.info(`  Get 16-character Google App Password at: https://myaccount.google.com/apppasswords`);
    console.info(`======================================================
`);
    return {
      success: true,
      simulated: true,
      infoMessage: `Email queued from ${COMPANY_EMAIL}. (To deliver live internet emails to inboxes, add GMAIL_APP_PASSWORD to your .env)`
    };
  }
  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: recipient,
      replyTo: COMPANY_EMAIL,
      envelope: {
        from: COMPANY_EMAIL,
        to: [to]
      },
      subject,
      text,
      html
    });
    console.info(`[MAILER] \u2705 Real email delivered to ${to} via Gmail SMTP (Message ID: ${info.messageId})`);
    return {
      success: true,
      simulated: false,
      messageId: info.messageId,
      infoMessage: `Email sent to ${to} from ${COMPANY_EMAIL}`
    };
  } catch (err) {
    const rawMsg = err.message || "";
    console.error(`[MAILER] \u274C Error sending email to ${to} via SMTP:`, rawMsg);
    let friendlyError = `Failed to deliver email via Gmail SMTP: ${rawMsg}`;
    if (rawMsg.includes("534-5.7.9") || rawMsg.includes("Application-specific password required") || rawMsg.includes("Invalid login") || err.code === "EAUTH") {
      friendlyError = `Google rejected the SMTP login (error 534-5.7.9): An Application-specific password is required for ${COMPANY_EMAIL}. Normal Google account passwords cannot be used for third-party email transmission. Please generate a 16-character App Password at https://myaccount.google.com/apppasswords (with 2-Step Verification ON) and set it in your .env file as GMAIL_APP_PASSWORD.`;
    }
    return {
      success: false,
      simulated: false,
      error: friendlyError
    };
  }
}
var COMPANY_EMAIL, COMPANY_NAME;
var init_mailer = __esm({
  "server/services/mailer.ts"() {
    COMPANY_EMAIL = "intellicaautomationgroup@gmail.com";
    COMPANY_NAME = "Intellica Automation Group";
  }
});

// api/index.ts
import dotenv2 from "dotenv";
import express from "express";

// server/routes/index.ts
import { Router as Router8 } from "express";
import fs2 from "fs";
import path2 from "path";

// server/routes/schools.ts
import { Router } from "express";

// server/db/store.ts
init_experimentSpecs();
var BackendDataStore = class {
  constructor() {
    this.schools = [];
    this.users = [];
    this.classes = [];
    this.experiments = [...INITIAL_EXPERIMENTS];
    this.assignments = [];
    this.attempts = [];
    this.emails = [];
    this.resetOtpSessions = /* @__PURE__ */ new Map();
  }
  // Reset helper
  resetToDefaults() {
    this.schools = [];
    this.users = [];
    this.classes = [];
    this.experiments = [...INITIAL_EXPERIMENTS];
    this.assignments = [];
    this.attempts = [];
    this.emails = [];
    this.resetOtpSessions.clear();
  }
};
var store = new BackendDataStore();

// server/routes/schools.ts
init_supabase();
init_mailer();
var router = Router();
router.get("/", async (req, res) => {
  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from("schools").select("*").order("created_at", { ascending: false });
        if (!error && data) {
          return res.json(data.map(schoolFromDb));
        }
      }
    }
    return res.json(store.schools);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to fetch schools" });
  }
});
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: sch, error } = await supabase.from("schools").select("*").eq("id", id).maybeSingle();
        if (!error && sch) {
          const { data: teachers } = await supabase.from("users").select("*").eq("school_id", id).eq("role", "teacher");
          const { data: classes } = await supabase.from("classes").select("*").eq("school_id", id);
          const { count: studentCount } = await supabase.from("users").select("*", { count: "exact", head: true }).eq("school_id", id).eq("role", "student");
          return res.json({
            school: schoolFromDb(sch),
            teachers: (teachers || []).map(userFromDb),
            classes: (classes || []).map(classFromDb),
            studentCount: studentCount || 0
          });
        }
      }
    }
    const school = store.schools.find((s) => s.id === id);
    if (!school) {
      return res.status(404).json({ error: "School not found" });
    }
    const schoolTeachers = store.users.filter((u) => u.schoolId === id && u.role === "teacher");
    const schoolClasses = store.classes.filter((c) => c.schoolId === id);
    const schoolStudents = store.users.filter((u) => u.schoolId === id && u.role === "student");
    return res.json({
      school,
      teachers: schoolTeachers,
      classes: schoolClasses,
      studentCount: schoolStudents.length
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router.post("/", async (req, res) => {
  try {
    const { schoolData, adminPassword, schoolId: passedSchoolId, adminUserId: passedAdminUserId } = req.body;
    if (!schoolData || !schoolData.name || !schoolData.adminEmail) {
      return res.status(400).json({ error: "Missing required school name or admin email" });
    }
    const schoolId = schoolData.id || passedSchoolId || `sch-${Date.now().toString(36)}`;
    const adminUserId = passedAdminUserId || `usr-admin-${Date.now().toString(36)}`;
    const tempPassword = adminPassword || `Kcse${Math.floor(1e3 + Math.random() * 9e3)}!`;
    const newSchool = {
      ...schoolData,
      id: schoolId,
      totalStudents: 0,
      totalTeachers: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      status: "active"
    };
    const adminUser = {
      id: adminUserId,
      schoolId,
      name: schoolData.adminName,
      email: schoolData.adminEmail,
      role: "school_admin",
      mustChangePassword: true,
      tempPassword,
      avatarColor: "bg-blue-600"
    };
    const emailDispatch = {
      id: `email-${Date.now().toString(36)}`,
      senderEmail: "intellicaautomationgroup@gmail.com",
      recipientEmail: schoolData.adminEmail,
      recipientName: schoolData.adminName,
      recipientRole: "school_admin",
      subject: `STEM-SPARK-LAB Portal Credentials: ${schoolData.name}`,
      tempPassword,
      sentAt: (/* @__PURE__ */ new Date()).toISOString(),
      schoolName: schoolData.name,
      messageBody: `Dear Principal ${schoolData.adminName},

Your school ${schoolData.name} has been enrolled into the STEM-SPARK-LAB KCSE Virtual Science Laboratory platform by Intellica Automation Group.

From: Intellica Automation Group <intellicaautomationgroup@gmail.com>
Support: intellicaautomationgroup@gmail.com`
    };
    store.schools.unshift(newSchool);
    store.users.unshift(adminUser);
    store.emails.unshift(emailDispatch);
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from("schools").upsert(schoolToDb(newSchool), { onConflict: "id" });
        await supabase.from("users").upsert(userToDb(adminUser), { onConflict: "email" });
        await supabase.from("dispatched_emails").insert([emailToDb(emailDispatch)]);
      }
    }
    const mailResult = await sendEmail({
      to: schoolData.adminEmail,
      toName: schoolData.adminName,
      subject: emailDispatch.subject,
      text: emailDispatch.messageBody,
      tempPassword
    });
    console.info(`[MAILER] School registration email dispatched to ${schoolData.adminEmail}:`, mailResult);
    return res.status(201).json({ school: newSchool, adminUser, emailDispatch, mailResult });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to create school" });
  }
});
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    store.schools = store.schools.filter((s) => s.id !== id);
    store.users = store.users.filter((u) => u.schoolId !== id);
    store.classes = store.classes.filter((c) => c.schoolId !== id);
    store.assignments = store.assignments.filter((a) => a.schoolId !== id);
    store.experiments = store.experiments.filter((e) => e.schoolId !== id);
    store.attempts = store.attempts.filter((a) => a.schoolId !== id);
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from("schools").delete().eq("id", id);
      }
    }
    return res.json({ success: true, deletedSchoolId: id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
var schools_default = router;

// server/routes/users.ts
import { Router as Router2 } from "express";
init_supabase();
init_mailer();
var router2 = Router2();
router2.get("/", async (req, res) => {
  try {
    const { schoolId, role, email } = req.query;
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        let query = supabase.from("users").select("*");
        if (schoolId) query = query.eq("school_id", schoolId);
        if (role) query = query.eq("role", role);
        if (email) query = query.ilike("email", String(email).trim());
        const { data, error } = await query;
        if (!error && data) {
          return res.json(data.map(userFromDb));
        }
      }
    }
    let results = [...store.users];
    if (schoolId) {
      results = results.filter((u) => u.schoolId === schoolId);
    }
    if (role) {
      results = results.filter((u) => u.role === role);
    }
    if (email) {
      results = results.filter((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());
    }
    return res.json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router2.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Please enter both your email address and password." });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();
    let targetUser = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data, error } = await supabase.from("users").select("*").eq("email", normalizedEmail).maybeSingle();
          if (!error && data) {
            const dbUser = userFromDb(data);
            store.users = store.users.filter((u) => u.email.toLowerCase() !== normalizedEmail);
            store.users.unshift(dbUser);
            targetUser = dbUser;
          } else if (error) {
            console.warn("[LOGIN] Supabase query error:", error.message);
          }
        }
      } catch (dbErr) {
        console.warn("[LOGIN] Supabase catch:", dbErr?.message);
      }
    }
    if (!targetUser) {
      return res.status(401).json({
        error: "Invalid credentials. No registered account found with that email address. Please register your school, student, or platform administrator account first."
      });
    }
    const hasPermanentPassword = Boolean(targetUser.password && targetUser.password.trim().length > 0);
    const expectedPassword = hasPermanentPassword ? targetUser.password : targetUser.tempPassword;
    const isMatch = Boolean(expectedPassword && expectedPassword.trim() === cleanPassword);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Incorrect password. Please verify your credentials or use "Forgot password" to reset your password.'
      });
    }
    return res.json({
      success: true,
      user: targetUser,
      message: "Authentication successful"
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Login failed" });
  }
});
router2.post("/admin", async (req, res) => {
  try {
    const { id, name, email, password } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Missing required admin name or email" });
    }
    const adminId = id || `usr-super-${Date.now().toString(36)}`;
    const newAdmin = {
      id: adminId,
      schoolId: null,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: "super_admin",
      avatarColor: "bg-slate-900",
      mustChangePassword: false,
      password: password ? String(password).trim() : void 0,
      tempPassword: password ? String(password).trim() : void 0
    };
    store.users = store.users.filter((u) => u.email.toLowerCase() !== newAdmin.email);
    store.users.unshift(newAdmin);
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error: upsertErr } = await supabase.from("users").upsert(userToDb(newAdmin), { onConflict: "email" });
        if (upsertErr) {
          console.error("[SUPABASE] Admin upsert error:", upsertErr);
        }
      }
    }
    return res.status(201).json(newAdmin);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router2.post("/student", async (req, res) => {
  try {
    const { id, name, email, schoolId, classId, admissionNumber } = req.body;
    if (!name || !email || !schoolId || !classId) {
      return res.status(400).json({ error: "Missing required student registration fields" });
    }
    const studentId = id || `usr-student-${Date.now().toString(36)}`;
    let targetClass = store.classes.find((c) => c.id === classId);
    if (!targetClass && isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: clsData } = await supabase.from("classes").select("*").eq("id", classId).maybeSingle();
        if (clsData) targetClass = classFromDb(clsData);
      }
    }
    const newStudentUser = {
      id: studentId,
      schoolId,
      name,
      email: email.trim().toLowerCase(),
      role: "student",
      admissionNumber: admissionNumber || `ADM-${Math.floor(1e3 + Math.random() * 9e3)}`,
      classId,
      className: targetClass?.name || "Class Stream",
      teacherId: targetClass?.teacherId,
      teacherName: targetClass?.teacherName,
      avatarColor: "bg-emerald-600"
    };
    store.users.unshift(newStudentUser);
    store.classes = store.classes.map((c) => c.id === classId ? { ...c, studentCount: c.studentCount + 1 } : c);
    store.schools = store.schools.map((s) => s.id === schoolId ? { ...s, totalStudents: s.totalStudents + 1 } : s);
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error: insErr } = await supabase.from("users").upsert(userToDb(newStudentUser), { onConflict: "email" });
        if (insErr) {
          console.error("[SUPABASE] Student registration error:", insErr);
        }
        const { count: clsCount } = await supabase.from("users").select("*", { count: "exact", head: true }).eq("class_id", classId).eq("role", "student");
        if (clsCount !== null) {
          await supabase.from("classes").update({ student_count: clsCount }).eq("id", classId);
        }
        const { count: schCount } = await supabase.from("users").select("*", { count: "exact", head: true }).eq("school_id", schoolId).eq("role", "student");
        if (schCount !== null) {
          await supabase.from("schools").update({ total_students: schCount }).eq("id", schoolId);
        }
      }
    }
    return res.status(201).json(newStudentUser);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router2.post("/teacher", async (req, res) => {
  try {
    const { id, name, email, schoolId, subjectSpecialization, tempPassword: passedTempPassword } = req.body;
    if (!name || !email || !schoolId) {
      return res.status(400).json({ error: "Missing required teacher fields" });
    }
    const teacherId = id || `usr-teacher-${Date.now().toString(36)}`;
    const tempPassword = passedTempPassword || `Tchr${Math.floor(1e3 + Math.random() * 9e3)}!`;
    let targetSchool = store.schools.find((s) => s.id === schoolId);
    if (!targetSchool && isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: schData } = await supabase.from("schools").select("*").eq("id", schoolId).maybeSingle();
        if (schData) targetSchool = schoolFromDb(schData);
      }
    }
    const newTeacher = {
      id: teacherId,
      schoolId,
      name,
      email: email.trim().toLowerCase(),
      role: "teacher",
      subjectSpecialization: subjectSpecialization || "Chemistry & Biology",
      mustChangePassword: true,
      tempPassword,
      avatarColor: "bg-amber-600"
    };
    const emailDispatch = {
      id: `email-${Date.now().toString(36)}`,
      senderEmail: "intellicaautomationgroup@gmail.com",
      recipientEmail: email,
      recipientName: name,
      recipientRole: "teacher",
      subject: `STEM-SPARK-LAB Faculty Appointment: ${targetSchool?.name || "Secondary School"}`,
      tempPassword,
      sentAt: (/* @__PURE__ */ new Date()).toISOString(),
      schoolName: targetSchool?.name,
      messageBody: `Dear Teacher ${name},

You have been registered as a Science Teacher (${newTeacher.subjectSpecialization}) at ${targetSchool?.name || "your institution"} on STEM-SPARK-LAB by Intellica Automation Group.

Your temporary password: ${tempPassword}
Please update your password on initial sign in.

From: Intellica Automation Group <intellicaautomationgroup@gmail.com>
Support: intellicaautomationgroup@gmail.com`
    };
    store.users = store.users.filter((u) => u.email.toLowerCase() !== newTeacher.email);
    store.users.unshift(newTeacher);
    store.emails.unshift(emailDispatch);
    store.schools = store.schools.map((s) => s.id === schoolId ? { ...s, totalTeachers: s.totalTeachers + 1 } : s);
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error: tchrErr } = await supabase.from("users").upsert(userToDb(newTeacher), { onConflict: "email" });
        if (tchrErr) {
          console.error("[SUPABASE] Teacher registration error:", tchrErr);
        }
        await supabase.from("dispatched_emails").insert([emailToDb(emailDispatch)]);
        const { count: tchrCount } = await supabase.from("users").select("*", { count: "exact", head: true }).eq("school_id", schoolId).eq("role", "teacher");
        if (tchrCount !== null) {
          await supabase.from("schools").update({ total_teachers: tchrCount }).eq("id", schoolId);
        }
      }
    }
    const mailResult = await sendEmail({
      to: email,
      toName: name,
      subject: emailDispatch.subject,
      text: emailDispatch.messageBody,
      tempPassword
    });
    console.info(`[MAILER] Teacher registration email dispatched to ${email}:`, mailResult);
    return res.status(201).json({ teacher: newTeacher, emailDispatch, mailResult });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router2.delete("/teacher/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const teacher = store.users.find((u) => u.id === id);
    const schoolId = teacher?.schoolId;
    if (schoolId) {
      store.schools = store.schools.map((s) => s.id === schoolId ? { ...s, totalTeachers: Math.max(0, s.totalTeachers - 1) } : s);
    }
    store.users = store.users.filter((u) => u.id !== id);
    store.classes = store.classes.map((c) => c.teacherId === id ? { ...c, teacherId: "", teacherName: "Unassigned" } : c);
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from("users").delete().eq("id", id);
        await supabase.from("classes").update({ teacher_id: null, teacher_name: "Unassigned" }).eq("teacher_id", id);
        if (schoolId) {
          const { count: tchrCount } = await supabase.from("users").select("*", { count: "exact", head: true }).eq("school_id", schoolId).eq("role", "teacher");
          if (tchrCount !== null) {
            await supabase.from("schools").update({ total_teachers: tchrCount }).eq("id", schoolId);
          }
        }
      }
    }
    return res.json({ success: true, deletedTeacherId: id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router2.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = store.users.find((u) => u.id === id);
    const schoolId = user?.schoolId;
    if (user?.role === "teacher" && schoolId) {
      store.schools = store.schools.map((s) => s.id === schoolId ? { ...s, totalTeachers: Math.max(0, s.totalTeachers - 1) } : s);
      store.classes = store.classes.map((c) => c.teacherId === id ? { ...c, teacherId: "", teacherName: "Unassigned" } : c);
    } else if (user?.role === "student" && schoolId) {
      store.schools = store.schools.map((s) => s.id === schoolId ? { ...s, totalStudents: Math.max(0, s.totalStudents - 1) } : s);
    }
    store.users = store.users.filter((u) => u.id !== id);
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from("users").delete().eq("id", id);
        if (user?.role === "teacher") {
          await supabase.from("classes").update({ teacher_id: null, teacher_name: "Unassigned" }).eq("teacher_id", id);
          if (schoolId) {
            const { count: tchrCount } = await supabase.from("users").select("*", { count: "exact", head: true }).eq("school_id", schoolId).eq("role", "teacher");
            if (tchrCount !== null) {
              await supabase.from("schools").update({ total_teachers: tchrCount }).eq("id", schoolId);
            }
          }
        } else if (user?.role === "student" && schoolId) {
          const { count: stdCount } = await supabase.from("users").select("*", { count: "exact", head: true }).eq("school_id", schoolId).eq("role", "student");
          if (stdCount !== null) {
            await supabase.from("schools").update({ total_students: stdCount }).eq("id", schoolId);
          }
        }
      }
    }
    return res.json({ success: true, deletedUserId: id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router2.post("/change-password", async (req, res) => {
  try {
    const { userId, email, newPassword } = req.body;
    if (!userId && !email || !newPassword) {
      return res.status(400).json({ error: "Missing userId/email or newPassword" });
    }
    const normalizedEmail = email ? String(email).trim().toLowerCase() : null;
    store.users = store.users.map((u) => {
      const match = userId && u.id === userId || normalizedEmail && u.email.toLowerCase() === normalizedEmail;
      if (match) {
        return {
          ...u,
          mustChangePassword: false,
          tempPassword: void 0,
          password: newPassword
        };
      }
      return u;
    });
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        let q = supabase.from("users").update({
          must_change_password: false,
          temp_password: null,
          password: newPassword
        });
        if (userId) {
          await q.eq("id", userId);
        } else if (normalizedEmail) {
          await q.eq("email", normalizedEmail);
        }
      }
    }
    const changedUser = store.users.find((u) => userId && u.id === userId || normalizedEmail && u.email.toLowerCase() === normalizedEmail);
    if (changedUser) {
      const securityDispatch = {
        id: `email-pwd-${Date.now().toString(36)}`,
        senderEmail: "intellicaautomationgroup@gmail.com",
        recipientEmail: changedUser.email,
        recipientName: changedUser.name,
        recipientRole: changedUser.role,
        subject: "Security Alert: Password Updated - STEM-SPARK-LAB",
        messageBody: `Dear ${changedUser.name},

Your password for STEM-SPARK-LAB Kenya was successfully updated.

If you made this change, no further action is required.
If you did not authorize this change, please contact Intellica Automation Group immediately at intellicaautomationgroup@gmail.com.

From: Intellica Automation Group <intellicaautomationgroup@gmail.com>
Regards,
Intellica Automation Group Security Directorate`,
        sentAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      store.emails.unshift(securityDispatch);
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient();
        if (supabase) {
          try {
            await supabase.from("dispatched_emails").insert([emailToDb(securityDispatch)]);
          } catch (e) {
          }
        }
      }
      sendEmail({
        to: changedUser.email,
        toName: changedUser.name,
        subject: securityDispatch.subject,
        text: securityDispatch.messageBody
      }).catch((err) => console.warn("[MAILER] Password change notice error:", err));
    }
    return res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router2.post("/request-reset-otp", async (req, res) => {
  try {
    const { email, name, role, schoolId, user } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    let targetUser = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!targetUser && isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data } = await supabase.from("users").select("*").eq("email", normalizedEmail).maybeSingle();
        if (data) {
          targetUser = userFromDb(data);
          store.users.unshift(targetUser);
        }
      }
    }
    if (!targetUser && (name || user)) {
      const restoredUser = {
        id: user && user.id || `usr-${Date.now().toString(36)}`,
        name: name || user && user.name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        role: role || user && user.role || "student",
        schoolId: schoolId || user && user.schoolId || null
      };
      targetUser = restoredUser;
      store.users.unshift(restoredUser);
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient();
        if (supabase) {
          try {
            await supabase.from("users").upsert(userToDb(restoredUser), { onConflict: "email" });
          } catch (e) {
          }
        }
      }
    }
    if (!targetUser) {
      return res.status(404).json({
        error: `No registered account found with email "${email}". Password reset is only available for registered school administrators, teachers, and students.`
      });
    }
    const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
    const expiresAt = Date.now() + 10 * 60 * 1e3;
    store.resetOtpSessions.set(normalizedEmail, { otp, expiresAt, user: targetUser });
    const subject = `Password Reset Verification Code: ${otp} - Intellica Automation Group`;
    const messageBody = `Dear ${targetUser.name},

You requested a password reset for your STEM-SPARK-LAB Kenya registered account (${targetUser.email}).

Your One-Time Password (OTP) verification code is:

${otp}

\u2022 Validity: 10 minutes
\u2022 Enter this 6-digit OTP code on the verification screen to verify your identity and set a new password.
\u2022 If you did not request this verification code, please ignore this email or contact support at intellicaautomationgroup@gmail.com.

From: Intellica Automation Group <intellicaautomationgroup@gmail.com>
Regards,
Intellica Automation Group Security Team
STEM-SPARK-LAB Kenya Directorate`;
    const emailDispatch = {
      id: `email-otp-${Date.now().toString(36)}`,
      senderEmail: "intellicaautomationgroup@gmail.com",
      recipientEmail: targetUser.email,
      recipientName: targetUser.name,
      recipientRole: targetUser.role,
      subject,
      tempPassword: otp,
      messageBody,
      sentAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    store.emails.unshift(emailDispatch);
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from("dispatched_emails").insert([emailToDb(emailDispatch)]);
      }
    }
    const mailResult = await sendEmail({
      to: targetUser.email,
      toName: targetUser.name,
      subject,
      text: messageBody,
      tempPassword: otp
    });
    if (!mailResult.success) {
      return res.status(400).json({
        error: mailResult.error || "Failed to dispatch email via Gmail SMTP.",
        targetUser: { id: targetUser.id, name: targetUser.name, email: targetUser.email, role: targetUser.role }
      });
    }
    return res.json({
      success: true,
      message: mailResult.simulated ? `Verification code dispatched from intellicaautomationgroup@gmail.com.` : `Verification code sent to ${targetUser.email} from intellicaautomationgroup@gmail.com.`,
      simulated: mailResult.simulated,
      targetUser: { id: targetUser.id, name: targetUser.name, email: targetUser.email, role: targetUser.role }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router2.post("/verify-reset-otp", (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP code are required" });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const cleanOtp = String(otp).trim();
    const session = store.resetOtpSessions.get(normalizedEmail);
    if (!session) {
      return res.status(400).json({ error: "No active OTP verification session found for this email. Please request a new code." });
    }
    if (Date.now() > session.expiresAt) {
      store.resetOtpSessions.delete(normalizedEmail);
      return res.status(400).json({ error: "The verification code has expired (10-minute limit). Please request a new code." });
    }
    const isValid = session.otp === cleanOtp;
    if (!isValid) {
      return res.status(400).json({ error: "Invalid verification code. Please check the 6-digit OTP code sent to your email." });
    }
    return res.json({ success: true, message: "Identity verified successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
var users_default = router2;

// server/routes/classes.ts
import { Router as Router3 } from "express";
init_supabase();
var router3 = Router3();
router3.get("/", async (req, res) => {
  try {
    const { schoolId, teacherId } = req.query;
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        let query = supabase.from("classes").select("*").order("form_year", { ascending: true });
        if (schoolId) query = query.eq("school_id", schoolId);
        if (teacherId) query = query.eq("teacher_id", teacherId);
        const { data, error } = await query;
        if (!error && data) {
          return res.json(data.map(classFromDb));
        }
      }
    }
    let results = [...store.classes];
    if (schoolId) {
      results = results.filter((c) => c.schoolId === schoolId);
    }
    if (teacherId) {
      results = results.filter((c) => c.teacherId === teacherId);
    }
    return res.json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router3.post("/", async (req, res) => {
  try {
    const classData = req.body;
    if (!classData.name || !classData.schoolId) {
      return res.status(400).json({ error: "Missing class name or schoolId" });
    }
    const studentCount = classData.studentCount !== void 0 ? Number(classData.studentCount) : 0;
    const newClass = {
      ...classData,
      id: `cls-${Date.now().toString(36)}`,
      studentCount
    };
    store.classes.unshift(newClass);
    store.schools = store.schools.map((s) => s.id === classData.schoolId ? { ...s, totalStudents: s.totalStudents + studentCount } : s);
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from("classes").insert([classToDb(newClass)]);
        if (studentCount > 0) {
          const { count } = await supabase.from("users").select("*", { count: "exact", head: true }).eq("school_id", classData.schoolId).eq("role", "student");
          if (count !== null) {
            await supabase.from("schools").update({ total_students: count }).eq("id", classData.schoolId);
          }
        }
      }
    }
    return res.status(201).json(newClass);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
var classes_default = router3;

// server/routes/experiments.ts
import { Router as Router4 } from "express";
init_supabase();
var router4 = Router4();
router4.get("/", async (req, res) => {
  try {
    const { subject, tier, schoolId, teacherId } = req.query;
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await ensureExperimentsInSupabase();
        let query = supabase.from("experiments").select("*");
        if (subject) query = query.eq("subject", subject);
        if (tier) query = query.eq("owner_type", tier);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return res.json(data.map(experimentFromDb));
        }
      }
    }
    let results = [...store.experiments];
    if (subject) {
      results = results.filter((e) => e.subject === subject);
    }
    if (tier) {
      results = results.filter((e) => e.ownerType === tier);
    }
    if (schoolId) {
      results = results.filter((e) => e.ownerType === "global" || e.schoolId === schoolId);
    }
    if (teacherId) {
      results = results.filter((e) => e.ownerType === "global" || e.teacherId === teacherId);
    }
    return res.json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router4.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from("experiments").select("*").eq("id", id).maybeSingle();
        if (!error && data) {
          return res.json(experimentFromDb(data));
        }
      }
    }
    const exp = store.experiments.find((e) => e.id === id);
    if (!exp) {
      return res.status(404).json({ error: "Experiment specification not found" });
    }
    return res.json(exp);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router4.post("/", async (req, res) => {
  try {
    const specData = req.body;
    if (!specData.title || !specData.subject) {
      return res.status(400).json({ error: "Missing required experiment title or subject" });
    }
    const newSpec = {
      ...specData,
      id: specData.id || `exp-custom-${Date.now().toString(36)}`,
      status: "published"
    };
    store.experiments.unshift(newSpec);
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from("experiments").insert([experimentToDb(newSpec)]);
      }
    }
    return res.status(201).json(newSpec);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router4.put("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedSpec = req.body;
    let found = false;
    store.experiments = store.experiments.map((e) => {
      if (e.id === id) {
        found = true;
        return { ...updatedSpec, id };
      }
      return e;
    });
    if (!found) {
      store.experiments.unshift({ ...updatedSpec, id });
    }
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from("experiments").upsert([experimentToDb({ ...updatedSpec, id })]);
      }
    }
    return res.json({ success: true, experiment: updatedSpec });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router4.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    store.experiments = store.experiments.filter((e) => e.id !== id);
    store.assignments = store.assignments.filter((a) => a.experimentId !== id);
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from("experiments").delete().eq("id", id);
      }
    }
    return res.json({ success: true, deletedExperimentId: id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router4.post("/parse-ai", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Please provide experiment text or prompt to parse." });
    }
    const trimmed = text.trim();
    let parsedResult = null;
    let engineSource = "smart-scientific-nlp";
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({});
        const systemPrompt = `You are an expert KCSE (Kenya Certificate of Secondary Education) Senior Science Examiner and Virtual Laboratory Architect.
A teacher provides raw practical examination instructions, procedures, questions, or teacher notes.
Your task is to autonomously read, parse, and structure this into a complete virtual experiment specification JSON.

The JSON schema must adhere to:
{
  "title": string (concise descriptive title),
  "subject": "chemistry" | "physics" | "biology",
  "kcsePaper": string (e.g. "233/3 (KCSE Chemistry Practical)"),
  "topic": string (concise curriculum topic),
  "objectives": string[],
  "estimatedDurationMinutes": number,
  "simulationType": "solubility" | "titration" | "circuit" | "qualitative" | "food_test" | "hookes_law" | "thermochemistry" | "universal",
  "apparatus": [
    {
      "name": string (EXACT apparatus or chemical name, e.g. "Graduated Burette (50 cm\xB3)", "Pipette (25.0 cm\xB3) & Filler Bulb", "Conical Flask (250 cm\xB3)", "Solution M: 0.2 M sodium hydroxide"),
      "subject": "chemistry" | "physics" | "biology",
      "icon": "Burette" | "FlaskConical" | "Pipette" | "Clamp" | "Cylinder" | "TestTube" | "Beaker" | "Activity" | "Flame" | "Layers" | "Droplets" | "Square" | "Scale" | "Zap" | "Gauge" | "Clock" | "Sliders" | "Search",
      "isDistractor": boolean
    }
  ],
  "procedures": [
    {
      "number": number,
      "title": string,
      "description": string,
      "steps": [
        {
          "id": number,
          "instruction": string (clean step instruction, without leading numbers or bullets),
          "validationType": "apparatus_placed" | "volume_set" | "reagent_added" | "heated" | "reading_recorded" | "observation_made" | "diluted" | "run_simulation" | "connection_made",
          "validationDetail": string,
          "marks": number,
          "hint": string,
          "allowForcePush": true,
          "procedureNumber": number,
          "expectedResult": string (teacher's exact expected observation or outcome for this step)
        }
      ]
    }
  ],
  "answerSheet": [
    {
      "id": string,
      "type": "data_table" | "calculation" | "graph" | "short_answer" | "observation_inference",
      "prompt": string,
      "maxMarks": number,
      "procedureNumber": number,
      "tableHeaders": string[],
      "tableRows": [ { "label": string, "simulatedValue": number, "tolerance": number } ],
      "graphConfig": { "xLabel": string, "yLabel": string, "xMin": number, "xMax": number, "yMin": number, "yMax": number },
      "correctNumericValue": number,
      "tolerance": number,
      "unit": string,
      "formulaHint": string,
      "modelAnswer": string,
      "acceptedKeywords": string[]
    }
  ],
  "simulationConfig": {
    "colorBefore": string (initial liquid color e.g. "Yellow", "Colourless", "Pink", "Brown"),
    "colorAfter": string (expected final liquid color or precipitate e.g. "Orange", "Colourless", "Pink", "Yellow precipitate"),
    "colorHexBefore": string (CSS hex e.g. "#eab308", "#e0f2fe", "#f472b6"),
    "colorHexAfter": string (CSS hex e.g. "#f97316", "#f8fafc", "#facc15"),
    "expectedObservation": string (teacher's exact expected observation and reaction description),
    "expectedGas": string (e.g. "Hydrogen", "Carbon dioxide", "Oxygen", "None"),
    "initialTemperature": number,
    "finalTemperature": number,
    "maxTemperature": number
  }
}

MANDATORY INSTRUCTIONS:
1. EXHAUSTIVE APPARATUS SCANNING:
   - Thoroughly read BOTH the "You are provided with" / Requirements section AND the "Procedure" / Steps.
   - Any apparatus, glassware, or instruments mentioned or required in the procedures MUST be included in "apparatus".
   - If the teacher writes "Fill the burrete with dilute Hydrochloric acid" and "Pippete 25cm3 of sodium hydroxide into a conical flask", you MUST include:
     * Graduated Burette (50 cm\xB3) [icon: "Burette"]
     * Pipette (25.0 cm\xB3) & Filler Bulb [icon: "Pipette"]
     * Conical Flask (250 cm\xB3) [icon: "FlaskConical"]
     * Retort Stand & Clamp [icon: "Clamp"]
     * White Tile [icon: "Square"]
   - Be resilient to common student/teacher typos: "burrete", "burrette" -> Burette; "pippete", "pipet" -> Pipette; "sodium hydrotide" -> Sodium hydroxide.
2. STRICTLY NO UNNEEDED CHEMICALS:
   - ONLY include chemicals and reagents mentioned by the teacher (e.g. Solution M, Solution N, Solid X, Methyl Orange indicator).
   - NEVER add extraneous chemicals (do NOT add Solution A, Solution B, Solution K, Solid A, phenolphthalein, etc. unless explicitly provided in the teacher's text).
3. ACCURATE SIMULATION TYPE:
   - If the experiment involves titration (burette, pipette, titration to endpoint), set "simulationType": "titration".
4. ACCURATE WORKBENCH RESULTS & COLOR CHANGES:
   - Expected results and observations MUST match what the teacher gave or standard chemical reality for the experiment:
   - If Methyl Orange indicator is added to alkali (e.g. Solution M) and titrated with acid (Solution N):
     * colorBefore: "Yellow", colorHexBefore: "#eab308"
     * colorAfter: "Orange / Pink", colorHexAfter: "#f97316"
     * expectedObservation: "Solution turns from yellow to orange/pink at equivalence end-point."
   - If Phenolphthalein is used: colorBefore: "Pink" (#f472b6), colorAfter: "Colourless" (#f8fafc).
   - If the teacher explicitly specified an expected result or observation in their text, use that EXACT statement.
5. Return ONLY valid JSON without markdown fences.`;
        const withTimeout = (promise, ms = 4500) => Promise.race([
          promise,
          new Promise((_, reject) => setTimeout(() => reject(new Error(`AI generation timed out after ${ms}ms`)), ms))
        ]);
        let rawText = "";
        try {
          const response = await withTimeout(
            ai.models.generateContent({
              model: "gemini-3.1-flash-lite",
              contents: `${systemPrompt}

USER EXPERIMENT INPUT TEXT:
${trimmed}`,
              config: { responseMimeType: "application/json" }
            }),
            4e3
          );
          rawText = response.text?.trim() || "";
          engineSource = "gemini-3.1-flash-lite";
        } catch (liteErr) {
          console.warn("gemini-3.1-flash-lite failed or timed out, trying gemini-3.8-flash:", liteErr?.message);
          try {
            const response = await withTimeout(
              ai.models.generateContent({
                model: "gemini-3.8-flash",
                contents: `${systemPrompt}

USER EXPERIMENT INPUT TEXT:
${trimmed}`,
                config: { responseMimeType: "application/json" }
              }),
              4e3
            );
            rawText = response.text?.trim() || "";
            engineSource = "gemini-3.8-flash";
          } catch (flashErr) {
            console.warn("Gemini calls failed, falling back immediately to smart heuristics:", flashErr?.message);
          }
        }
        if (rawText) {
          const match = rawText.match(/\{[\s\S]*\}/);
          if (match) {
            parsedResult = JSON.parse(match[0]);
          } else {
            parsedResult = JSON.parse(rawText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim());
          }
          if (parsedResult && Array.isArray(parsedResult.apparatus)) {
            parsedResult.apparatus = parsedResult.apparatus.filter((a) => !a.isDistractor);
          }
          const lowText = trimmed.toLowerCase();
          if (/(?:burette|burrete|burrette|buret)/i.test(lowText)) {
            if (!parsedResult.apparatus.some((a) => /(?:burette|burrete|burrette|buret)/i.test(a.name))) {
              parsedResult.apparatus.unshift({
                name: "Graduated Burette (50 cm\xB3)",
                subject: "chemistry",
                icon: "Burette",
                isDistractor: false
              });
            }
            parsedResult.simulationType = "titration";
          }
          if (/(?:pipette|pippete|pipet)/i.test(lowText)) {
            if (!parsedResult.apparatus.some((a) => /(?:pipette|pippete|pipet)/i.test(a.name))) {
              parsedResult.apparatus.push({
                name: "Pipette (25.0 cm\xB3) & Filler Bulb",
                subject: "chemistry",
                icon: "Pipette",
                isDistractor: false
              });
            }
          }
          if (/(?:conical\s*flask|flask)/i.test(lowText)) {
            if (!parsedResult.apparatus.some((a) => /(?:flask)/i.test(a.name))) {
              parsedResult.apparatus.push({
                name: "Conical Flask (250 cm\xB3)",
                subject: "chemistry",
                icon: "FlaskConical",
                isDistractor: false
              });
            }
          }
          if (/(?:methyl\s*orange)/i.test(lowText)) {
            if (!parsedResult.apparatus.some((a) => /(?:methyl\s*orange)/i.test(a.name))) {
              parsedResult.apparatus.push({
                name: "Methyl Orange Indicator",
                subject: "chemistry",
                icon: "Droplets",
                isDistractor: false
              });
            }
            if (!parsedResult.simulationConfig) parsedResult.simulationConfig = {};
            if (!parsedResult.simulationConfig.colorBefore) parsedResult.simulationConfig.colorBefore = "Yellow";
            if (!parsedResult.simulationConfig.colorHexBefore) parsedResult.simulationConfig.colorHexBefore = "#eab308";
            if (!parsedResult.simulationConfig.colorAfter) parsedResult.simulationConfig.colorAfter = "Orange / Pink";
            if (!parsedResult.simulationConfig.colorHexAfter) parsedResult.simulationConfig.colorHexAfter = "#f97316";
            if (!parsedResult.simulationConfig.expectedObservation) {
              parsedResult.simulationConfig.expectedObservation = "Solution changes from yellow to orange/pink at equivalence end-point.";
            }
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini experiment parsing failed, falling back to smart rule parser:", geminiErr?.message || geminiErr);
      }
    }
    if (!parsedResult || !parsedResult.procedures || parsedResult.procedures.length === 0 || !parsedResult.apparatus || parsedResult.apparatus.length === 0) {
      parsedResult = parseExperimentWithHeuristics(trimmed);
      engineSource = "smart-scientific-nlp";
    }
    return res.json({
      success: true,
      source: engineSource,
      experiment: parsedResult
    });
  } catch (err) {
    console.error("Error parsing experiment text:", err);
    return res.status(500).json({ error: err.message || "Failed to parse experiment text" });
  }
});
function parseExperimentWithHeuristics(rawInput) {
  const normalized = rawInput.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lower = normalized.toLowerCase();
  const allLines = normalized.split("\n").map((l) => l.trim()).filter(Boolean);
  const isPhysics = lower.includes("physics") || lower.includes("current") || lower.includes("voltage") || lower.includes("ammeter") || lower.includes("voltmeter") || lower.includes("resistance") || lower.includes("resistor") || lower.includes("rheostat") || lower.includes("spring") || lower.includes("hooke") || lower.includes("pendulum") || lower.includes("metre rule") || lower.includes("stopwatch") || lower.includes("refraction") || lower.includes("prism") || lower.includes("optical pin") || lower.includes("incident ray") || lower.includes("focal length") || lower.includes("micrometer") || lower.includes("vernier");
  const isBiology = lower.includes("biology") || lower.includes("food test") || lower.includes("benedict") || lower.includes("biuret") || lower.includes("iodine") || lower.includes("reducing sugar") || lower.includes("starch") || lower.includes("protein") || lower.includes("enzyme") || lower.includes("osmosis") || lower.includes("transverse section") || lower.includes("dcpip") || lower.includes("sucrose") || lower.includes("potato cylinder") || lower.includes("salivary amylase") || lower.includes("specimen");
  const detectedSubject = isPhysics ? "physics" : isBiology ? "biology" : "chemistry";
  const providedRegex = /(?:you\s+are\s+provided\s+with|materials|apparatus\s+and\s+reagents|requirements)[:\s]*([\s\S]*?)(?=(?:you\s+are\s+required|procedure|method|aim|investigation|$))/i;
  const providedMatch = normalized.match(providedRegex);
  const providedSectionText = providedMatch ? providedMatch[1] : "";
  const requiredRegex = /(?:you\s+are\s+required\s+to|aim|objective)[:\s]*([\s\S]*?)(?=(?:procedure|method|table|questions|$))/i;
  const requiredMatch = normalized.match(requiredRegex);
  const requiredSectionText = requiredMatch ? requiredMatch[1].trim() : "";
  const apparatusFound = [];
  const addApp = (name, subject, icon) => {
    const cleanName = name.replace(/^[•*\-\s]+/, "").replace(/^(?:\d+[\.)]|[a-h]\)|[ivx]+\))\s+/i, "").trim();
    if (cleanName.length < 2) return;
    if (!apparatusFound.some((a) => a.name.toLowerCase() === cleanName.toLowerCase())) {
      apparatusFound.push({ name: cleanName, subject, icon, isDistractor: false });
    }
  };
  const getIconForName = (itemText) => {
    const it = itemText.toLowerCase();
    if (it.includes("burette") || it.includes("burrete") || it.includes("burrette") || it.includes("buret")) return "Burette";
    if (it.includes("pipette") || it.includes("pippete") || it.includes("pipet")) return "Pipette";
    if (it.includes("conical flask") || it.includes("flask")) return "FlaskConical";
    if (it.includes("boiling tube") || it.includes("test tube") || it.includes("tube rack") || it.includes("tube")) return "TestTube";
    if (it.includes("cylinder")) return "Cylinder";
    if (it.includes("beaker") || it.includes("water bath")) return "Beaker";
    if (it.includes("thermometer") || it.includes("temp")) return "Activity";
    if (it.includes("burner") || it.includes("flame") || it.includes("heat") || it.includes("tripod")) return "Flame";
    if (it.includes("stopwatch") || it.includes("stop watch") || it.includes("timer") || it.includes("clock")) return "Clock";
    if (it.includes("balance") || it.includes("scale") || it.includes("mass") || it.includes("weight")) return "Scale";
    if (it.includes("ammeter") || it.includes("voltmeter") || it.includes("meter")) return "Gauge";
    if (it.includes("rheostat") || it.includes("resistor")) return "Sliders";
    if (it.includes("wire") || it.includes("cell") || it.includes("switch") || it.includes("circuit")) return "Zap";
    if (it.includes("solid") || it.includes("ribbon") || it.includes("metal") || it.includes("zinc") || it.includes("powder") || it.includes("chips") || it.includes("crystals") || it.includes("specimen")) return "Layers";
    if (it.includes("prism") || it.includes("pin") || it.includes("board") || it.includes("paper") || it.includes("tile") || it.includes("ruler")) return "Square";
    if (it.includes("indicator") || it.includes("water") || it.includes("acid") || it.includes("solution") || it.includes("liquid") || it.includes("extract") || it.includes("reagent")) return "Droplets";
    return "Droplets";
  };
  if (providedSectionText) {
    const providedLines = providedSectionText.split("\n").map((l) => l.trim()).filter(Boolean);
    for (const pl of providedLines) {
      const cleaned = pl.replace(/^[•*\-\s]+/, "").replace(/^\d+[\.)]\s+/, "").replace(/^(?:[a-z]\)|[ivx]+\))\s+/i, "").replace(/–/g, "-").trim();
      if (cleaned.length > 2 && !cleaned.toLowerCase().startsWith("you are required") && !cleaned.toLowerCase().startsWith("you are provided") && !cleaned.toLowerCase().startsWith("the following") && !cleaned.toLowerCase().startsWith("procedure") && !cleaned.toLowerCase().startsWith("method") && !cleaned.toLowerCase().startsWith("table") && !cleaned.toLowerCase().startsWith("questions")) {
        addApp(cleaned, detectedSubject, getIconForName(cleaned));
      }
    }
  }
  if (/(?:burette|burrete|burrette|buret)/i.test(lower)) {
    addApp("Graduated Burette (50 cm\xB3)", "chemistry", "Burette");
    addApp("Retort Stand & Clamp", "chemistry", "Clamp");
  }
  if (/(?:pipette|pippete|pipet)/i.test(lower)) {
    addApp("Pipette (25.0 cm\xB3) & Filler Bulb", "chemistry", "Pipette");
  }
  if (/(?:conical\s*flask|flask)/i.test(lower)) {
    addApp("Conical Flask (250 cm\xB3)", "chemistry", "FlaskConical");
  }
  if (/(?:white\s*tile|tile)/i.test(lower) || /(?:burette|burrete|titrat)/i.test(lower)) {
    addApp("White Tile", "chemistry", "Square");
  }
  if (/(?:methyl\s*orange)/i.test(lower)) {
    addApp("Methyl Orange Indicator", "chemistry", "Droplets");
  }
  if (/(?:phenolphthalein)/i.test(lower)) {
    addApp("Phenolphthalein Indicator", "chemistry", "Droplets");
  }
  if (/(?:universal\s*indicator)/i.test(lower)) {
    addApp("Universal Indicator", "chemistry", "Droplets");
  }
  if (/(?:litmus)/i.test(lower)) {
    addApp("Litmus Indicator Solution", "chemistry", "Droplets");
  }
  if (/(?:starch\s*indicator|starch\s*solution)/i.test(lower)) {
    addApp("Starch Indicator Solution", "chemistry", "Droplets");
  }
  if (/(?:beaker)/i.test(lower)) {
    addApp("Beaker (250 cm\xB3)", detectedSubject, "Beaker");
  }
  if (/(?:measuring\s*cylinder|graduated\s*cylinder)/i.test(lower)) {
    addApp("Measuring Cylinder (50 cm\xB3)", detectedSubject, "Cylinder");
  }
  if (/(?:boiling\s*tube)/i.test(lower)) {
    addApp("Pyrex Boiling Tube", detectedSubject, "TestTube");
  }
  if (/(?:test\s*tube)/i.test(lower) && !/(?:boiling\s*tube)/i.test(lower)) {
    addApp("Test Tube", detectedSubject, "TestTube");
  }
  if (/(?:thermometer)/i.test(lower)) {
    addApp("Laboratory Thermometer (-10 to 110\xB0C)", detectedSubject, "Activity");
  }
  if (/(?:bunsen|burner)/i.test(lower)) {
    addApp("Bunsen Burner & Tripod Stand", detectedSubject, "Flame");
  }
  if (/(?:stopwatch|stop\s*watch)/i.test(lower)) {
    addApp("Stopwatch", detectedSubject, "Clock");
  }
  if (/(?:electronic\s*balance|weighing\s*scale|balance)/i.test(lower)) {
    addApp("Electronic Balance", detectedSubject, "Scale");
  }
  if (/(?:spatula)/i.test(lower)) {
    addApp("Laboratory Spatula", detectedSubject, "Sliders");
  }
  if (/(?:filter\s*funnel|filter\s*paper)/i.test(lower)) {
    addApp("Filter Funnel & Filter Paper", detectedSubject, "Search");
  }
  if (/(?:wash\s*bottle|distilled\s*water)/i.test(lower)) {
    addApp("Wash Bottle (Distilled Water)", detectedSubject, "Droplets");
  }
  if (/(?:prism)/i.test(lower)) {
    addApp("Glass Prism", "physics", "Square");
  }
  if (/(?:optical\s*pin|pins)/i.test(lower)) {
    addApp("Optical Pins & Board", "physics", "Square");
  }
  if (/(?:ammeter)/i.test(lower)) {
    addApp("DC Ammeter (0 - 3A)", "physics", "Gauge");
  }
  if (/(?:voltmeter)/i.test(lower)) {
    addApp("DC Voltmeter (0 - 5V)", "physics", "Gauge");
  }
  if (/(?:rheostat)/i.test(lower)) {
    addApp("Variable Rheostat", "physics", "Sliders");
  }
  const namedSolMatches = normalized.match(/(?:solution|reagent)\s+[a-z\d](?:\s*[:\-–]\s*[^\n,;.]+)?/gi);
  if (namedSolMatches) {
    for (const m of namedSolMatches) {
      addApp(m.trim(), detectedSubject, "Droplets");
    }
  }
  const procedureSplitRegex = /(?:^|\n)(PROCEDURE\s*(?:[I|V|X]+|\d+|A|B)?|PART\s*[A-Z\d]|METHOD)[\s:–-]*/gi;
  const procMatches = [...normalized.matchAll(procedureSplitRegex)];
  const procBlocks = [];
  if (procMatches.length > 0) {
    for (let i = 0; i < procMatches.length; i++) {
      const currentMatch = procMatches[i];
      const startIndex = currentMatch.index + currentMatch[0].length;
      const endIndex = i + 1 < procMatches.length ? procMatches[i + 1].index : normalized.length;
      const blockText = normalized.substring(startIndex, endIndex);
      const procHeader = currentMatch[1].trim();
      procBlocks.push({
        title: procHeader.toUpperCase(),
        text: blockText,
        number: i + 1
      });
    }
  } else {
    const afterIntro = normalized.replace(providedRegex, "").replace(requiredRegex, "");
    procBlocks.push({
      title: "PROCEDURE I: Practical Investigation",
      text: afterIntro,
      number: 1
    });
  }
  const parsedProcedures = procBlocks.map((pb, pIdx) => {
    const pLines = pb.text.split("\n").map((l) => l.trim()).filter(Boolean);
    const stepLines = [];
    for (const line of pLines) {
      if (/^complete\s+table/i.test(line) || /^table\s+[ivx\d]/i.test(line) || /^questions/i.test(line) || /^record\s+(?:your\s+)?results\s+in\s+table/i.test(line)) {
        continue;
      }
      const isNumberedStep = /^((?:step\s*)?\(?[ivx\d]+\)?[\.:\)\-]?|[a-h]\)|\([a-h]\)|\d+[\.:\)\-]|[•*\-])\s+/i.test(line);
      const isActionVerb = /^(measure|transfer|place|put|fill|add|heat|cool|record|titrate|observe|shake|insert|start|stop|connect|divide|dip|stir|erect|weigh|dilute|mix|pour|take|set\s+up|prepare|adjust|read|note|tabulate|clamp|attach|cut|filter|ignite|drop|allow|leave|switch|use|determine)\b/i.test(line);
      const isProceduralLine = line.length > 20 && !line.toLowerCase().startsWith("you are") && !line.toLowerCase().includes("marks");
      if (isNumberedStep || isActionVerb || isProceduralLine) {
        stepLines.push(line);
      }
    }
    const steps = (stepLines.length > 0 ? stepLines : [
      "Set up the provided apparatus and reaction vessel carefully.",
      "Measure the designated volume of solution and place into the reaction container.",
      "Add the reagent / specimen and immediately record the starting measurement.",
      "Record the experimental observations and readings at regular intervals."
    ]).map((sl, sIdx) => {
      const cleanInstruction = sl.replace(/^((?:step\s*)?\(?[ivx\d]+\)?[\.:\)\-]?|[a-h]\)|\([a-h]\)|\d+[\.:\)\-]|[•*\-])\s+/i, "").trim();
      const sLower = cleanInstruction.toLowerCase();
      let vType = "observation_made";
      if (sLower.includes("heat") || sLower.includes("flame") || sLower.includes("burner") || sLower.includes("boil")) {
        vType = "heated";
      } else if (sLower.includes("transfer") || sLower.includes("measure") || sLower.includes("pipette") || sLower.includes("fill") || sLower.includes("cylinder") || sLower.includes("burette") || sLower.includes("water from the burette")) {
        vType = "volume_set";
      } else if (sLower.includes("place") || sLower.includes("add") || sLower.includes("insert") || sLower.includes("drop") || sLower.includes("mix")) {
        vType = "reagent_added";
      } else if (sLower.includes("record") || sLower.includes("reading") || sLower.includes("note") || sLower.includes("temperature") || sLower.includes("time")) {
        vType = "reading_recorded";
      } else if (sLower.includes("connect") || sLower.includes("switch") || sLower.includes("wire") || sLower.includes("pins")) {
        vType = "connection_made";
      } else if (sLower.includes("titrate") || sLower.includes("stopwatch") || sLower.includes("repeat")) {
        vType = "run_simulation";
      }
      return {
        id: pIdx * 10 + sIdx + 1,
        instruction: cleanInstruction,
        validationType: vType,
        validationDetail: `Step ${sIdx + 1} completed`,
        marks: 1,
        hint: `Follow the step closely: ${cleanInstruction.substring(0, 60)}...`,
        allowForcePush: true,
        procedureNumber: pb.number
      };
    });
    return {
      number: pb.number,
      title: pb.title.includes(":") ? pb.title : `${pb.title}: Experimental Investigation`,
      description: `Follow the step-by-step instructions for ${pb.title.toLowerCase()}.`,
      steps
    };
  });
  let detectedTitle = "";
  if (requiredSectionText) {
    const cleanedReq = requiredSectionText.replace(/\n+/g, " ").replace(/\(i\)/gi, "").replace(/\(ii\)/gi, "&").replace(/\(a\)/gi, "").trim();
    if (cleanedReq.toLowerCase().startsWith("the rate of reaction")) {
      detectedTitle = `Determination of ${cleanedReq.replace(/^(the\s+)/i, "")}`;
    } else if (cleanedReq.toLowerCase().includes("solubility") && cleanedReq.toLowerCase().includes("r.m.m")) {
      detectedTitle = "Determination of Solubility of Solid A & Relative Molecular Mass (R.M.M.)";
    } else {
      detectedTitle = `Determination of ${cleanedReq.replace(/^(the\s+)/i, "")}`;
    }
  } else {
    const firstLine = allLines[0] || "";
    if (!firstLine.toLowerCase().includes("you are provided with") && !firstLine.toLowerCase().includes("question") && firstLine.length > 5 && firstLine.length < 80) {
      detectedTitle = firstLine;
    } else if (lower.includes("rate of reaction") || lower.includes("magnesium") && lower.includes("hydrochloric")) {
      detectedTitle = "Rate of Reaction Between Magnesium Ribbon and Hydrochloric Acid";
    } else if (lower.includes("solubility") || lower.includes("crystalliz")) {
      detectedTitle = "Solubility of Solid A & Relative Molecular Mass (R.M.M.) Determination";
    } else if (lower.includes("prism") || lower.includes("refraction")) {
      detectedTitle = "Investigation of Refraction of Light Through a Triangular Glass Prism";
    } else if (lower.includes("hooke") || lower.includes("spring")) {
      detectedTitle = "Investigation of Hooke's Law & Determination of Spring Constant";
    } else if (lower.includes("food test") || lower.includes("benedict")) {
      detectedTitle = "Qualitative Biochemical Food Tests on Food Solution Extract";
    } else {
      detectedTitle = `${detectedSubject.charAt(0).toUpperCase() + detectedSubject.slice(1)} Practical Laboratory Investigation`;
    }
  }
  detectedTitle = detectedTitle.replace(/^Determination of determination of/i, "Determination of").trim();
  let simulationType = "universal";
  if (lower.includes("solubility") && lower.includes("crystalliz")) {
    simulationType = "solubility";
  } else if (lower.includes("titrat") || /(?:burette|burrete|burrette|buret)/i.test(lower) || /(?:pipette|pippete|pipet)/i.test(lower) || lower.includes("standardize")) {
    simulationType = "titration";
  } else if (lower.includes("ammeter") && lower.includes("voltmeter") && (lower.includes("ohm") || lower.includes("resistance"))) {
    simulationType = "circuit";
  } else if (lower.includes("qualitative") && (lower.includes("portion") || lower.includes("cation") || lower.includes("precipitate"))) {
    simulationType = "qualitative";
  } else if (lower.includes("food test") || lower.includes("benedict") && lower.includes("biuret")) {
    simulationType = "food_test";
  } else if (lower.includes("hooke") || lower.includes("spring") && lower.includes("extension")) {
    simulationType = "hookes_law";
  } else if (lower.includes("enthalpy") || lower.includes("heat of neutral") || lower.includes("calorimeter")) {
    simulationType = "thermochemistry";
  } else {
    simulationType = "universal";
  }
  const answerSheet = [];
  if (lower.includes("magnesium") && lower.includes("hydrochloric") || lower.includes("rate of reaction") || (lower.includes("every 30 seconds") || lower.includes("stopwatch"))) {
    answerSheet.push({
      id: "q-table-rate",
      type: "data_table",
      prompt: "Table 1: Temperature of reaction mixture recorded every 30 seconds:",
      maxMarks: 6,
      procedureNumber: 1,
      tableHeaders: ["Time (seconds)", "Temperature (\xB0C)", "Observations (Effervescence / Reaction Progress)"],
      tableRows: [
        { label: "0 seconds (Initial)", simulatedValue: 22, tolerance: 0.5 },
        { label: "30 seconds", simulatedValue: 26.5, tolerance: 1 },
        { label: "60 seconds", simulatedValue: 33, tolerance: 1 },
        { label: "90 seconds", simulatedValue: 41.5, tolerance: 1.5 },
        { label: "120 seconds", simulatedValue: 47, tolerance: 1.5 },
        { label: "150 seconds (Maximum)", simulatedValue: 49.5, tolerance: 1.5 },
        { label: "180 seconds", simulatedValue: 48, tolerance: 1.5 }
      ]
    });
    answerSheet.push({
      id: "q-graph-rate",
      type: "graph",
      prompt: "Plot a graph of temperature (\xB0C, vertical axis) against time (seconds, horizontal axis).",
      maxMarks: 3,
      procedureNumber: 1,
      graphConfig: {
        xLabel: "Time (seconds)",
        yLabel: "Temperature (\xB0C)",
        xMin: 0,
        xMax: 180,
        yMin: 20,
        yMax: 55
      }
    });
    answerSheet.push({
      id: "q-calc-rate",
      type: "calculation",
      prompt: "(a) Determine the rate of temperature rise during the first 60 seconds (\u0394T / \u0394t):",
      maxMarks: 2,
      procedureNumber: 1,
      correctNumericValue: 0.18,
      tolerance: 0.04,
      unit: "\xB0C / s",
      formulaHint: "Rate = (Temperature at 60s - Temperature at 0s) / 60 seconds"
    });
    answerSheet.push({
      id: "q-obs-reaction",
      type: "short_answer",
      prompt: "(b) State the observation made when magnesium ribbon was added to Solution K, and identify the gas evolved.",
      maxMarks: 2,
      procedureNumber: 1,
      modelAnswer: "Rapid effervescence / bubbling of a colorless, odorless gas (Hydrogen gas). The mixture becomes hot.",
      acceptedKeywords: ["effervescence", "bubbles", "hydrogen", "h2", "hot", "exothermic", "magnesium dissolves"]
    });
  } else if (simulationType === "titration") {
    answerSheet.push({
      id: "q-table-titration-main",
      type: "data_table",
      prompt: "Table I: Titration readings (Titration of base against acid titrant):",
      maxMarks: 5,
      procedureNumber: 1,
      tableHeaders: ["Titre Number", "Final burette reading (cm\xB3)", "Initial burette reading (cm\xB3)", "Volume of acid used (cm\xB3)"],
      tableRows: [
        { label: "Titre I (Trial)", simulatedValue: 24.6, tolerance: 0.2 },
        { label: "Titre II (Accurate)", simulatedValue: 24.5, tolerance: 0.1 },
        { label: "Titre III (Accurate)", simulatedValue: 24.5, tolerance: 0.1 }
      ]
    });
    answerSheet.push({
      id: "q-calc-average-titre",
      type: "calculation",
      prompt: "(a) Calculate the average volume of acid used from your consistent accurate titres:",
      maxMarks: 2,
      procedureNumber: 1,
      correctNumericValue: 24.5,
      tolerance: 0.1,
      unit: "cm\xB3",
      formulaHint: "Average Volume = (Titre II + Titre III) / 2"
    });
    if (lower.includes("ram") || lower.includes("relative atomic mass") || lower.includes("f2co3") || lower.includes("solid x")) {
      answerSheet.push({
        id: "q-calc-ram",
        type: "calculation",
        prompt: "(b) Determine the Relative Atomic Mass (RAM) of F in F2CO3:",
        maxMarks: 3,
        procedureNumber: 1,
        correctNumericValue: 23,
        tolerance: 1,
        unit: "g/mol",
        formulaHint: "Moles = (Molarity \xD7 Volume) / 1000; Mass = Moles \xD7 Molar Mass"
      });
    } else {
      answerSheet.push({
        id: "q-calc-concentration",
        type: "calculation",
        prompt: "(b) Calculate the concentration of the solution standardized from the titration results:",
        maxMarks: 2,
        procedureNumber: 1,
        correctNumericValue: 0.2,
        tolerance: 0.05,
        unit: "mol/dm\xB3",
        formulaHint: "M1 \xD7 V1 = M2 \xD7 V2"
      });
    }
    answerSheet.push({
      id: "q-obs-titration",
      type: "short_answer",
      prompt: "(c) State the observation and color change observed at the end-point of the titration.",
      maxMarks: 2,
      procedureNumber: 1,
      modelAnswer: lower.includes("methyl orange") ? "Solution changes permanently from yellow to orange/pink at the end-point." : lower.includes("phenolphthalein") ? "Solution changes permanently from pink to colourless at the end-point." : "Permanent end-point color change persisted on swirling.",
      acceptedKeywords: lower.includes("methyl orange") ? ["yellow", "orange", "pink"] : ["pink", "colourless", "colorless"]
    });
  } else if (simulationType === "solubility") {
    answerSheet.push({
      id: "q-table-solubility",
      type: "data_table",
      prompt: "Table I: Volume of distilled water added, calculated solubility of Solid A, and crystallization temperature (\xB0C):",
      maxMarks: 6,
      procedureNumber: 1,
      tableHeaders: ["Volume of water added (cm\xB3)", "Solubility of Solid A (g / 100g water)", "Crystallization temperature (\xB0C)"],
      tableRows: [
        { label: "4.0 cm\xB3 water", simulatedValue: 68, tolerance: 1.5 },
        { label: "5.0 cm\xB3 water", simulatedValue: 59, tolerance: 1.5 },
        { label: "6.0 cm\xB3 water", simulatedValue: 52, tolerance: 1.5 },
        { label: "7.0 cm\xB3 water", simulatedValue: 45, tolerance: 1.5 },
        { label: "8.0 cm\xB3 water", simulatedValue: 39, tolerance: 1.5 }
      ]
    });
    answerSheet.push({
      id: "q-graph-solubility",
      type: "graph",
      prompt: "Plot a smooth solubility curve of solubility of Solid A (g/100g water) against crystallization temperature (\xB0C).",
      maxMarks: 3,
      procedureNumber: 1,
      graphConfig: { xLabel: "Temperature (\xB0C)", yLabel: "Solubility (g/100g water)", xMin: 30, xMax: 80, yMin: 60, yMax: 160 }
    });
    if (parsedProcedures.length > 1 || lower.includes("titrat") || lower.includes("r.m.m") || lower.includes("solution b")) {
      answerSheet.push({
        id: "q-table-titration",
        type: "data_table",
        prompt: "Table II: Titration of organic acid against Solution B (0.20M NaOH):",
        maxMarks: 4,
        procedureNumber: 2,
        tableHeaders: ["Titre Number", "Final burette reading (cm\xB3)", "Initial burette reading (cm\xB3)", "Volume used (cm\xB3)"],
        tableRows: [
          { label: "Titre I (Trial)", simulatedValue: 24.6, tolerance: 0.2 },
          { label: "Titre II (Accurate)", simulatedValue: 24.5, tolerance: 0.1 },
          { label: "Titre III (Accurate)", simulatedValue: 24.5, tolerance: 0.1 }
        ]
      });
      answerSheet.push({
        id: "q-rmm-calc",
        type: "calculation",
        prompt: "Calculate the Relative Molecular Mass (R.M.M.) of Solid A:",
        maxMarks: 2,
        procedureNumber: 2,
        correctNumericValue: 126,
        tolerance: 3,
        unit: "g/mol",
        formulaHint: "R.M.M. = Mass / Moles"
      });
    }
  } else if (lower.includes("prism") || lower.includes("refraction")) {
    answerSheet.push({
      id: "q-table-optics",
      type: "data_table",
      prompt: "Table 1: Angle of incidence i (\xB0), angle of refraction r (\xB0), sin i, and sin r:",
      maxMarks: 6,
      procedureNumber: 1,
      tableHeaders: ["Angle of incidence i (\xB0)", "Angle of refraction r (\xB0)", "sin i", "sin r"],
      tableRows: [
        { label: "Trial 1 (i = 30\xB0)", simulatedValue: 19.5, tolerance: 0.5 },
        { label: "Trial 2 (i = 40\xB0)", simulatedValue: 25.4, tolerance: 0.5 },
        { label: "Trial 3 (i = 50\xB0)", simulatedValue: 30.7, tolerance: 0.5 },
        { label: "Trial 4 (i = 60\xB0)", simulatedValue: 35.3, tolerance: 0.5 }
      ]
    });
    answerSheet.push({
      id: "q-calc-refractive-index",
      type: "calculation",
      prompt: "Calculate the refractive index n of the glass prism from your readings (n = sin i / sin r):",
      maxMarks: 2,
      procedureNumber: 1,
      correctNumericValue: 1.5,
      tolerance: 0.05,
      unit: "",
      formulaHint: "n = sin(i) / sin(r)"
    });
  } else {
    answerSheet.push({
      id: "q-table-universal",
      type: "data_table",
      prompt: "Table 1: Experimental Observations, Measurements and Results:",
      maxMarks: 5,
      procedureNumber: 1,
      tableHeaders: ["Trial / Step", "Reading / Measurement", "Observation / Chemical State"],
      tableRows: [
        { label: "Trial 1", simulatedValue: 24.5, tolerance: 1 },
        { label: "Trial 2", simulatedValue: 32, tolerance: 1 },
        { label: "Trial 3", simulatedValue: 40.5, tolerance: 1 }
      ]
    });
    answerSheet.push({
      id: "q-deduction-universal",
      type: "short_answer",
      prompt: "(a) State your deductions and conclusions based on the practical results obtained.",
      maxMarks: 2,
      procedureNumber: 1,
      modelAnswer: "Accurate scientific deduction recorded consistent with observations and theoretical curriculum principles.",
      acceptedKeywords: ["observed", "reaction", "result", "deduction", "conclusion", "increases", "decreases"]
    });
  }
  let expectedObservation = "";
  let colorBefore = "Colourless";
  let colorAfter = "";
  let colorHexBefore = "#e0f2fe";
  let colorHexAfter = "#e0f2fe";
  let expectedGas = "None";
  let precipitateName = "";
  const explicitObsMatch = normalized.match(/(?:expected\s+(?:observation|result|colour|outcome)|observation|inference|expected\s+change)[:\s]+([^\n\r]+)/i);
  if (explicitObsMatch && explicitObsMatch[1].trim().length > 3) {
    expectedObservation = explicitObsMatch[1].trim();
  }
  const textToScanForColors = (expectedObservation + " " + normalized).toLowerCase();
  if (textToScanForColors.includes("methyl orange")) {
    colorBefore = "Yellow";
    colorHexBefore = "#eab308";
    colorAfter = "Orange / Pink";
    colorHexAfter = "#f97316";
    if (!expectedObservation) expectedObservation = "Solution turns from yellow to orange/pink at equivalence end-point.";
  } else if (textToScanForColors.includes("phenolphthalein")) {
    colorBefore = "Pink";
    colorHexBefore = "#f472b6";
    colorAfter = "Colourless";
    colorHexAfter = "#f8fafc";
    if (!expectedObservation) expectedObservation = "Solution turns from pink to colourless at end-point.";
  } else if (textToScanForColors.includes("yellow precipitate") || textToScanForColors.includes("lead iodide") || textToScanForColors.includes("yellow ppt") || textToScanForColors.includes("lead(ii) iodide")) {
    colorAfter = "Bright yellow precipitate";
    colorHexAfter = "#facc15";
    precipitateName = "Yellow precipitate";
    if (!expectedObservation) expectedObservation = "Bright yellow precipitate formed.";
  } else if (textToScanForColors.includes("blue-black") || textToScanForColors.includes("blue black") || textToScanForColors.includes("starch") && textToScanForColors.includes("iodine")) {
    colorAfter = "Blue-black";
    colorHexAfter = "#1e1b4b";
    if (!expectedObservation) expectedObservation = "Solution turns blue-black.";
  } else if (textToScanForColors.includes("brick-red") || textToScanForColors.includes("brick red") || textToScanForColors.includes("benedict") && textToScanForColors.includes("reducing sugar")) {
    colorAfter = "Brick-red precipitate";
    colorHexAfter = "#dc2626";
    precipitateName = "Brick-red precipitate";
    if (!expectedObservation) expectedObservation = "Colour change to brick-red precipitate.";
  } else if (textToScanForColors.includes("pale pink") || textToScanForColors.includes("permanent pink") || textToScanForColors.includes("pink end-point")) {
    colorAfter = "Permanent pale pink";
    colorHexAfter = "#f472b6";
    if (!expectedObservation) expectedObservation = "Permanent pale pink endpoint reached.";
  } else if (textToScanForColors.includes("purple") || textToScanForColors.includes("violet") || textToScanForColors.includes("biuret") && textToScanForColors.includes("protein")) {
    colorAfter = "Purple / Violet";
    colorHexAfter = "#9333ea";
    if (!expectedObservation) expectedObservation = "Solution turns purple (positive test for proteins).";
  } else if (textToScanForColors.includes("brown precipitate") || textToScanForColors.includes("copper") && textToScanForColors.includes("zinc")) {
    colorAfter = "Brown precipitate";
    colorHexAfter = "#78350f";
    precipitateName = "Brown solid copper";
    if (!expectedObservation) expectedObservation = "Blue solution fades; brown solid deposited.";
  } else if (textToScanForColors.includes("white precipitate") || textToScanForColors.includes("cloudy") || textToScanForColors.includes("milky") || textToScanForColors.includes("thiosulphate")) {
    colorAfter = "Cloudy precipitate";
    colorHexAfter = "#fef08a";
    precipitateName = "Precipitate formed";
    if (!expectedObservation) expectedObservation = "Cloudy precipitate formed; solution turns turbid.";
  } else if (textToScanForColors.includes("green")) {
    colorAfter = "Green";
    colorHexAfter = "#16a34a";
    if (!expectedObservation) expectedObservation = "Solution turns green.";
  } else if (textToScanForColors.includes("orange")) {
    colorAfter = "Orange";
    colorHexAfter = "#ea580c";
    if (!expectedObservation) expectedObservation = "Solution turns orange.";
  } else if (textToScanForColors.includes("colourless") || textToScanForColors.includes("colorless") || textToScanForColors.includes("decolourize")) {
    colorAfter = "Colourless";
    colorHexAfter = "#f8fafc";
    if (!expectedObservation) expectedObservation = "Decolourization occurs / solution becomes colourless.";
  }
  if (textToScanForColors.includes("hydrogen") || textToScanForColors.includes("effervescence") && textToScanForColors.includes("magnesium")) {
    expectedGas = "Hydrogen (H\u2082)";
    if (!expectedObservation) expectedObservation = "Rapid effervescence of hydrogen gas; mixture becomes warm.";
  } else if (textToScanForColors.includes("carbon dioxide") || textToScanForColors.includes("co2") || textToScanForColors.includes("limewater")) {
    expectedGas = "Carbon dioxide (CO\u2082)";
    if (!expectedObservation) expectedObservation = "Effervescence of carbon dioxide gas.";
  } else if (textToScanForColors.includes("oxygen")) {
    expectedGas = "Oxygen (O\u2082)";
  } else if (textToScanForColors.includes("effervescence") || textToScanForColors.includes("bubbles")) {
    expectedGas = "Gas bubbles";
  }
  if (!expectedObservation) {
    if (detectedSubject === "chemistry") {
      expectedObservation = "Observations recorded accurately as per experimental procedure.";
      colorAfter = colorAfter || "Clear solution";
      colorHexAfter = colorHexAfter !== "#e0f2fe" ? colorHexAfter : "#e2e8f0";
    } else if (detectedSubject === "physics") {
      expectedObservation = "Readings and deflections recorded consistently.";
      colorAfter = "Normal apparatus state";
    } else {
      expectedObservation = "Biological specimen changes observed and tabulated.";
      colorAfter = "Specimen reaction";
    }
  }
  for (const proc of parsedProcedures) {
    for (const st of proc.steps) {
      const sLower = st.instruction.toLowerCase();
      if (sLower.includes("observe") || sLower.includes("observation") || sLower.includes("record") || sLower.includes("colour") || sLower.includes("precipitate")) {
        st.expectedResult = expectedObservation;
      }
    }
  }
  return {
    title: detectedTitle,
    subject: detectedSubject,
    kcsePaper: detectedSubject === "physics" ? "232/3 (KCSE Physics Practical)" : detectedSubject === "biology" ? "231/3 (KCSE Biology Practical)" : "233/3 (KCSE Chemistry Practical)",
    topic: detectedTitle,
    objectives: [
      `Conduct virtual laboratory investigation for ${detectedTitle}`,
      "Record accurate measurements and experimental observations on the virtual bench",
      "Analyze data, plot graphs, and answer standard KCSE examination questions"
    ],
    estimatedDurationMinutes: 45,
    simulationType,
    apparatus: apparatusFound,
    procedures: parsedProcedures,
    answerSheet,
    simulationConfig: {
      initialTemperature: 22,
      maxTemperature: 50,
      colorBefore,
      colorAfter: colorAfter || "Observed Reaction State",
      colorHexBefore,
      colorHexAfter: colorHexAfter || "#e0f2fe",
      expectedObservation,
      expectedGas,
      precipitateName
    }
  };
}
router4.post("/:id/clone", async (req, res) => {
  const { id } = req.params;
  const { authorTeacher } = req.body;
  try {
    const source = store.experiments.find((e) => e.id === id);
    if (!source) {
      return res.status(404).json({ error: "Source experiment not found" });
    }
    const cloned = {
      ...source,
      id: `exp-custom-${Date.now().toString(36)}`,
      title: `Copy of ${source.title}`,
      ownerType: "teacher",
      schoolId: authorTeacher?.schoolId || null,
      teacherId: authorTeacher?.id || null,
      authorName: authorTeacher?.name || "Science Teacher",
      clonedFrom: source.id,
      status: "draft"
    };
    store.experiments.unshift(cloned);
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from("experiments").insert([experimentToDb(cloned)]);
      }
    }
    return res.status(201).json(cloned);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router4.post("/:id/promote", async (req, res) => {
  const { id } = req.params;
  const { schoolId } = req.body;
  try {
    const exp = store.experiments.find((e) => e.id === id);
    if (!exp) return res.status(404).json({ error: "Experiment not found" });
    const schoolExp = {
      ...exp,
      id: `exp-school-${Date.now().toString(36)}`,
      ownerType: "school",
      schoolId,
      title: `[School Approved] ${exp.title}`,
      status: "published"
    };
    store.experiments.unshift(schoolExp);
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from("experiments").insert([experimentToDb(schoolExp)]);
      }
    }
    return res.status(201).json(schoolExp);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
var experiments_default = router4;

// server/routes/assignments.ts
import { Router as Router5 } from "express";
init_supabase();
var router5 = Router5();
router5.get("/", async (req, res) => {
  try {
    const { schoolId, teacherId, classId } = req.query;
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        let query = supabase.from("assignments").select("*").order("assigned_at", { ascending: false });
        if (schoolId) query = query.eq("school_id", schoolId);
        if (teacherId) query = query.eq("teacher_id", teacherId);
        if (classId) query = query.eq("class_id", classId);
        const { data, error } = await query;
        if (!error && data) {
          return res.json(data.map(assignmentFromDb));
        }
      }
    }
    let results = [...store.assignments];
    if (schoolId) results = results.filter((a) => a.schoolId === schoolId);
    if (teacherId) results = results.filter((a) => a.teacherId === teacherId);
    if (classId) results = results.filter((a) => a.classId === classId);
    return res.json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router5.post("/", async (req, res) => {
  try {
    const assignmentData = req.body;
    if (!assignmentData.experimentId || !assignmentData.classId || !assignmentData.schoolId) {
      return res.status(400).json({ error: "Missing required assignment fields" });
    }
    const newAssignment = {
      ...assignmentData,
      id: `asg-${Date.now().toString(36)}`,
      assignedAt: (/* @__PURE__ */ new Date()).toISOString(),
      submittedCount: 0
    };
    store.assignments.unshift(newAssignment);
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from("assignments").insert([assignmentToDb(newAssignment)]);
      }
    }
    return res.status(201).json(newAssignment);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
var assignments_default = router5;

// server/routes/attempts.ts
import { Router as Router6 } from "express";
init_supabase();
var router6 = Router6();
router6.get("/", async (req, res) => {
  try {
    const { assignmentId, studentId, schoolId } = req.query;
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        let query = supabase.from("attempts").select("*").order("started_at", { ascending: false });
        if (assignmentId) query = query.eq("assignment_id", assignmentId);
        if (studentId) query = query.eq("student_id", studentId);
        if (schoolId) query = query.eq("school_id", schoolId);
        const { data, error } = await query;
        if (!error && data) {
          return res.json(data.map(attemptFromDb));
        }
      }
    }
    let results = [...store.attempts];
    if (assignmentId) results = results.filter((a) => a.assignmentId === assignmentId);
    if (studentId) results = results.filter((a) => a.studentId === studentId);
    if (schoolId) results = results.filter((a) => a.schoolId === schoolId);
    return res.json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router6.post("/", async (req, res) => {
  try {
    const attemptData = req.body;
    if (!attemptData.experimentId) {
      return res.status(400).json({ error: "Missing experimentId" });
    }
    const newAttempt = {
      ...attemptData,
      id: `att-${Date.now().toString(36)}`,
      submittedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    store.attempts.unshift(newAttempt);
    if (newAttempt.assignmentId) {
      store.assignments = store.assignments.map(
        (a) => a.id === newAttempt.assignmentId ? { ...a, submittedCount: a.submittedCount + 1 } : a
      );
    }
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from("attempts").insert([attemptToDb(newAttempt)]);
        if (newAttempt.assignmentId) {
          const { count } = await supabase.from("attempts").select("*", { count: "exact", head: true }).eq("assignment_id", newAttempt.assignmentId);
          if (count !== null) {
            await supabase.from("assignments").update({ submitted_count: count }).eq("id", newAttempt.assignmentId);
          }
        }
      }
    }
    return res.status(201).json(newAttempt);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router6.patch("/:id/grade", async (req, res) => {
  const { id } = req.params;
  try {
    const { scoreUpdates, teacherComments } = req.body;
    let attempt = store.attempts.find((a) => a.id === id);
    if (!attempt && isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: attData } = await supabase.from("attempts").select("*").eq("id", id).maybeSingle();
        if (attData) attempt = attemptFromDb(attData);
      }
    }
    if (!attempt) {
      return res.status(404).json({ error: "Attempt not found" });
    }
    const updatedAnswers = attempt.answers.map((ans) => {
      const update = scoreUpdates?.find((u) => u.questionId === ans.questionId);
      if (update) {
        return {
          ...ans,
          teacherScore: update.teacherScore,
          feedback: update.feedback || ans.feedback
        };
      }
      return ans;
    });
    const questionMarks = updatedAnswers.reduce((acc, a) => acc + (a.teacherScore !== void 0 ? a.teacherScore : a.autoScore), 0);
    const proceduralMarks = attempt.stepLogs.reduce((acc, l) => acc + l.marksEarned, 0);
    const newTotal = questionMarks + proceduralMarks;
    const newPercentage = Math.round(newTotal / attempt.maxScore * 100);
    const updatedAttempt = {
      ...attempt,
      answers: updatedAnswers,
      totalScore: newTotal,
      percentage: newPercentage,
      teacherComments: teacherComments || attempt.teacherComments,
      status: "graded"
    };
    store.attempts = store.attempts.map((a) => a.id === id ? updatedAttempt : a);
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from("attempts").update({
          answers: updatedAttempt.answers,
          total_score: updatedAttempt.totalScore,
          percentage: updatedAttempt.percentage,
          teacher_comments: updatedAttempt.teacherComments,
          status: "graded"
        }).eq("id", id);
      }
    }
    return res.json(updatedAttempt);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router6.post("/release-grades", async (req, res) => {
  try {
    const { assignmentId } = req.body;
    if (!assignmentId) {
      return res.status(400).json({ error: "Missing assignmentId" });
    }
    store.attempts = store.attempts.map((a) => a.assignmentId === assignmentId ? { ...a, teacherFeedbackReleased: true } : a);
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from("attempts").update({ teacher_feedback_released: true }).eq("assignment_id", assignmentId);
      }
    }
    return res.json({ success: true, assignmentId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
var attempts_default = router6;

// server/routes/emails.ts
import { Router as Router7 } from "express";
init_supabase();
var router7 = Router7();
router7.get("/", async (req, res) => {
  try {
    const { schoolName } = req.query;
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        let query = supabase.from("dispatched_emails").select("*").order("sent_at", { ascending: false });
        if (schoolName) query = query.eq("school_name", schoolName);
        const { data, error } = await query;
        if (!error && data) {
          return res.json(data.map(emailFromDb));
        }
      }
    }
    let results = [...store.emails];
    if (schoolName) {
      results = results.filter((e) => e.schoolName === schoolName);
    }
    return res.json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router7.post("/send", async (req, res) => {
  try {
    const { to, toName, subject, message, recipientRole, tempPassword, schoolName } = req.body;
    if (!to || !subject || !message) {
      return res.status(400).json({ error: "Missing required fields: to, subject, message" });
    }
    const { sendEmail: sendEmail2 } = await Promise.resolve().then(() => (init_mailer(), mailer_exports));
    const emailDispatch = {
      id: `email-${Date.now().toString(36)}`,
      senderEmail: "intellicaautomationgroup@gmail.com",
      recipientEmail: String(to).trim(),
      recipientName: toName ? String(toName).trim() : String(to).trim(),
      recipientRole: recipientRole || "student",
      subject: String(subject).trim(),
      tempPassword: tempPassword ? String(tempPassword).trim() : void 0,
      messageBody: String(message).trim(),
      sentAt: (/* @__PURE__ */ new Date()).toISOString(),
      schoolName: schoolName ? String(schoolName).trim() : void 0
    };
    store.emails.unshift(emailDispatch);
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { emailToDb: emailToDb2 } = await Promise.resolve().then(() => (init_supabase(), supabase_exports));
        await supabase.from("dispatched_emails").insert([emailToDb2(emailDispatch)]);
      }
    }
    const mailResult = await sendEmail2({
      to: emailDispatch.recipientEmail,
      toName: emailDispatch.recipientName,
      subject: emailDispatch.subject,
      text: emailDispatch.messageBody,
      tempPassword: emailDispatch.tempPassword
    });
    if (!mailResult.success) {
      return res.status(400).json({
        error: mailResult.error || "Failed to deliver email via Gmail SMTP.",
        emailDispatch,
        mailResult
      });
    }
    return res.json({
      success: true,
      message: mailResult.simulated ? `Email queued from intellicaautomationgroup@gmail.com to ${to}.` : `Email successfully delivered to ${to} from intellicaautomationgroup@gmail.com.`,
      emailDispatch,
      mailResult
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to send email" });
  }
});
router7.get("/status", async (req, res) => {
  try {
    const { checkMailerStatus: checkMailerStatus2, COMPANY_EMAIL: COMPANY_EMAIL2, COMPANY_NAME: COMPANY_NAME2 } = await Promise.resolve().then(() => (init_mailer(), mailer_exports));
    const status = checkMailerStatus2();
    return res.json({
      success: true,
      senderName: COMPANY_NAME2,
      ...status
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router7.post("/test", async (req, res) => {
  try {
    const { to } = req.body;
    if (!to) {
      return res.status(400).json({ error: 'Target email "to" is required for test' });
    }
    const { sendEmail: sendEmail2, COMPANY_EMAIL: COMPANY_EMAIL2 } = await Promise.resolve().then(() => (init_mailer(), mailer_exports));
    const mailResult = await sendEmail2({
      to: String(to).trim(),
      toName: "Test Recipient",
      subject: "Test Email Transmission - STEM-SPARK-LAB Kenya",
      text: `Hello,

This is a verified test email sent from ${COMPANY_EMAIL2} via STEM-SPARK-LAB Kenya.

All automated emails (password resets, institution onboarding, and user communications) originate directly from ${COMPANY_EMAIL2}.

Regards,
Intellica Automation Group Technical Directorate`
    });
    return res.json({
      success: mailResult.success,
      simulated: mailResult.simulated,
      senderEmail: COMPANY_EMAIL2,
      message: mailResult.simulated ? `Test email simulated from ${COMPANY_EMAIL2}. Add GMAIL_APP_PASSWORD to .env for live internet delivery.` : `Test email successfully sent to ${to} from ${COMPANY_EMAIL2}.`,
      mailResult
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
var emails_default = router7;

// server/routes/index.ts
init_supabase();
var apiRouter = Router8();
apiRouter.get("/health", (req, res) => {
  return res.json({
    status: "healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    supabaseConnected: isSupabaseConfigured(),
    databaseMode: isSupabaseConfigured() ? "Supabase PostgreSQL" : "Local Fast In-Memory Seed Store",
    counts: {
      schools: store.schools.length,
      users: store.users.length,
      classes: store.classes.length,
      experiments: store.experiments.length,
      assignments: store.assignments.length,
      attempts: store.attempts.length,
      dispatchedEmails: store.emails.length
    }
  });
});
apiRouter.post("/reset", (req, res) => {
  store.resetToDefaults();
  return res.json({ success: true, message: "Database reset to initial KCSE curriculum defaults" });
});
apiRouter.get("/download-brd", (req, res) => {
  const filePath = path2.resolve("public", "STEM_SPARK_VIRTUAL_LAB_BRD_DRD_SPECIFICATION.docx");
  if (fs2.existsSync(filePath)) {
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", 'attachment; filename="STEM_SPARK_VIRTUAL_LAB_BRD_DRD_SPECIFICATION.docx"');
    return res.sendFile(filePath);
  } else {
    return res.status(404).json({ error: "Specification document not found on server" });
  }
});
apiRouter.use("/schools", schools_default);
apiRouter.use("/users", users_default);
apiRouter.use("/classes", classes_default);
apiRouter.use("/experiments", experiments_default);
apiRouter.use("/assignments", assignments_default);
apiRouter.use("/attempts", attempts_default);
apiRouter.use("/emails", emails_default);
var routes_default = apiRouter;

// api/index.ts
dotenv2.config();
var app = express();
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use((req, res, next) => {
  if (req.url.startsWith("/api/")) {
    req.url = req.url.slice(4);
  } else if (req.url === "/api") {
    req.url = "/";
  }
  next();
});
app.use("/", routes_default);
app.use("/api", routes_default);
app.use((req, res) => {
  return res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.url}` });
});
app.use((err, req, res, _next) => {
  console.error("[Vercel Serverless Error]:", err);
  return res.status(500).json({ error: err?.message || "Server error" });
});
function handler(req, res) {
  return app(req, res);
}
export {
  handler as default
};
