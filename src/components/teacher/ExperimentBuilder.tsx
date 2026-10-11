import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, 
  FlaskConical, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Layers, 
  FileText,
  Sliders,
  Check,
  Zap,
  Flame,
  Scale,
  Search,
  AlertCircle,
  HelpCircle,
  Cpu,
  Info,
  Beaker,
  Eye,
  Award,
  Table as TableIcon,
  Calculator,
  PenTool,
  MoveUp,
  MoveDown,
  Copy,
  Sparkles,
  Bot,
  Loader2,
  Wand2
} from 'lucide-react';
import { 
  ExperimentSpec, 
  SubjectType, 
  SimulationType, 
  ExperimentStep, 
  ApparatusItem, 
  ProcedureSpec, 
  AnswerSheetQuestion 
} from '../../types';
import { api } from '../../services/api';

// Pre-stocked KCSE Standard Apparatus Catalog
const APPARATUS_CATALOG: Omit<ApparatusItem, 'id'>[] = [
  // Chemistry
  { name: '50cm³ Burette with Teflon Tap', subject: 'chemistry', icon: 'Burette' },
  { name: '50cm³ Burette with Distilled Water', subject: 'chemistry', icon: 'Burette' },
  { name: '250cm³ Conical Flask', subject: 'chemistry', icon: 'FlaskConical' },
  { name: '25.0cm³ Pipette & Safety Filler', subject: 'chemistry', icon: 'Pipette' },
  { name: 'Retort Stand & Burette Clamp', subject: 'chemistry', icon: 'Clamp' },
  { name: '10cm³ Measuring Cylinder', subject: 'chemistry', icon: 'Cylinder' },
  { name: '50cm³ Measuring Cylinder', subject: 'chemistry', icon: 'Cylinder' },
  { name: '100cm³ Measuring Cylinder', subject: 'chemistry', icon: 'Cylinder' },
  { name: 'White Ceramic Inspection Tile', subject: 'chemistry', icon: 'Square' },
  { name: 'Wooden Test Tube Rack (6 Holes)', subject: 'chemistry', icon: 'Layers' },
  { name: 'Pyrex Boiling Tube (Hard Glass Tube)', subject: 'chemistry', icon: 'TestTube' },
  { name: '250cm³ Beaker containing Cold Water Bath (Cooling)', subject: 'chemistry', icon: 'Beaker' },
  { name: 'Solid A: 6.0g Organic Acid Crystals', subject: 'chemistry', icon: 'Layers' },
  { name: 'Solution B: 0.20M Sodium Hydroxide Reagent', subject: 'chemistry', icon: 'Beaker' },
  { name: '0 - 100°C Laboratory Thermometer (0.5°C Graduations)', subject: 'chemistry', icon: 'Activity' },
  { name: 'Bunsen Burner, Tripod Stand & Wire Gauze', subject: 'chemistry', icon: 'Flame' },
  { name: 'Phenolphthalein Indicator Dropper Bottle', subject: 'chemistry', icon: 'Droplets' },
  { name: 'Methyl Orange Indicator Dropper Bottle', subject: 'chemistry', icon: 'Droplets' },
  { name: 'Solution A: Dilute HCl (0.10M)', subject: 'chemistry', icon: 'Beaker' },
  { name: 'Solution B: Aqueous Potassium Manganate(VII)', subject: 'chemistry', icon: 'Beaker' },
  { name: 'Solution C: 0.1M Ammonium Iron(II) Sulphate', subject: 'chemistry', icon: 'Beaker' },
  { name: 'Solution D: Diluted Solution', subject: 'chemistry', icon: 'Beaker' },
  { name: '1.0M Sulphuric(VI) Acid', subject: 'chemistry', icon: 'Beaker' },
  { name: '2.0M Sodium Hydroxide Reagent', subject: 'chemistry', icon: 'Beaker' },
  { name: '2.0M Aqueous Ammonia Reagent', subject: 'chemistry', icon: 'Beaker' },
  { name: '0.5M Barium Nitrate Solution', subject: 'chemistry', icon: 'Beaker' },
  { name: 'Solid G: Unknown Salt Specimen', subject: 'chemistry', icon: 'Layers' },
  { name: 'Liquid F: Organic Specimen', subject: 'chemistry', icon: 'Beaker' },
  { name: 'Distilled Water Wash Bottle (500ml)', subject: 'chemistry', icon: 'Droplets' },
  { name: 'Test Tube Holder & Crucible Tongs', subject: 'chemistry', icon: 'Clamp' },
  { name: 'Electronic Top-Pan Balance (0.01g Precision)', subject: 'chemistry', icon: 'Scale' },
  { name: 'Millimeter Examination Graph Sheet Grid', subject: 'chemistry', icon: 'Square' },
  { name: 'Stirring Glass Rod with Rubber Policeman', subject: 'chemistry', icon: 'Activity' },
  
  // Physics
  { name: 'Dry Cells Power Source (3.0 V)', subject: 'physics', icon: 'BatteryCharging' },
  { name: 'Analogue DC Ammeter (0 - 1.0 A)', subject: 'physics', icon: 'Gauge' },
  { name: 'Analogue DC Voltmeter (0 - 3.0 V)', subject: 'physics', icon: 'Activity' },
  { name: 'Variable Resistor (Rheostat 0-50 Ω)', subject: 'physics', icon: 'Sliders' },
  { name: 'One-Way Contact Knife Switch', subject: 'physics', icon: 'ToggleLeft' },
  { name: 'Set of Connecting Lead Wires', subject: 'physics', icon: 'Zap' },
  { name: 'Carbon Resistor (4.0 Ω)', subject: 'physics', icon: 'Cpu' },
  { name: 'Constantan Resistance Wire (1.0m on Metre Rule)', subject: 'physics', icon: 'Scale' },
  { name: 'Helical Steel Spring with Pointer', subject: 'physics', icon: 'Scale' },
  { name: 'Set of 50g Slotted Masses (0 - 300g)', subject: 'physics', icon: 'Layers' },
  { name: '100cm Vertical Metre Rule', subject: 'physics', icon: 'Ruler' },
  { name: 'Digital Stopwatch (0.01s Precision)', subject: 'physics', icon: 'Clock' },
  { name: 'Micrometer Screw Gauge (0 - 25mm)', subject: 'physics', icon: 'Gauge' },
  
  // Biology
  { name: 'Boiling Water Bath (95°C Electric)', subject: 'biology', icon: 'Flame' },
  { name: 'Wooden Test Tube Rack', subject: 'biology', icon: 'Layers' },
  { name: 'Solution X (Food Extract Specimen)', subject: 'biology', icon: 'Beaker' },
  { name: 'Benedict\'s Reagent Dropper Bottle', subject: 'biology', icon: 'Droplets' },
  { name: 'Biuret Reagent (NaOH + CuSO₄)', subject: 'biology', icon: 'Droplets' },
  { name: 'Iodine Solution Dropper Bottle', subject: 'biology', icon: 'Droplets' },
  { name: '10ml Graduated Dispenser Syringe', subject: 'biology', icon: 'Syringe' },
  { name: 'White Ceramic Dissection Tile', subject: 'biology', icon: 'Square' },
  { name: 'Magnifying Hand Lens (10x)', subject: 'biology', icon: 'Search' }
];

interface BuilderFormData {
  title: string;
  subject: SubjectType;
  kcsePaper: string;
  topic: string;
  objectives: string;
  durationMinutes: number;
  simulationType: SimulationType;
  visibility: 'teacher' | 'school';
  apparatus: ApparatusItem[];
  procedures: ProcedureSpec[];
  steps: ExperimentStep[];
  answerSheet: AnswerSheetQuestion[];
  simulationConfig: any;
}

export const ExperimentBuilder: React.FC = () => {
  const { currentUser, experiments, createExperiment, updateExperiment, editingExperiment, setCurrentView } = useApp();

  const [builderStep, setBuilderStep] = useState<number>(1);
  const [activeProcedureTab, setActiveProcedureTab] = useState<number>(0);
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [catalogSubjectFilter, setCatalogSubjectFilter] = useState<'all' | 'chemistry' | 'physics' | 'biology'>('all');
  
  // Custom apparatus form
  const [customApparatusName, setCustomApparatusName] = useState<string>('');
  const [customIsDistractor, setCustomIsDistractor] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Copy Existing Experiment Modal State
  const [isCopyModalOpen, setIsCopyModalOpen] = useState<boolean>(false);

  // Autonomous AI Ingestion State
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiInputText, setAiInputText] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccessSummary, setAiSuccessSummary] = useState<string | null>(null);

  // Helper to extract form data from an existing experiment spec or create fresh
  const buildFormDataFromSpec = (exp: ExperimentSpec | null): BuilderFormData => {
    if (exp) {
      let procedures: ProcedureSpec[] = [];

      if (exp.procedures && exp.procedures.length > 0) {
        procedures = JSON.parse(JSON.stringify(exp.procedures));
      } else if (exp.steps && exp.steps.length > 0) {
        // Group steps by procedureNumber if present, or create Procedure I
        const hasProcNumbers = exp.steps.some(s => s.procedureNumber !== undefined);
        if (hasProcNumbers) {
          const procMap: Record<number, ExperimentStep[]> = {};
          exp.steps.forEach(s => {
            const num = s.procedureNumber || 1;
            if (!procMap[num]) procMap[num] = [];
            procMap[num].push(s);
          });
          procedures = Object.keys(procMap).map(numStr => {
            const num = Number(numStr);
            const roman = num === 1 ? 'I' : num === 2 ? 'II' : num === 3 ? 'III' : `${num}`;
            const firstStepTitle = procMap[num][0]?.procedureTitle;
            return {
              id: `proc-${num}`,
              number: num,
              title: firstStepTitle || `Procedure ${roman}`,
              steps: procMap[num]
            };
          });
        } else {
          procedures = [
            {
              id: 'proc-1',
              number: 1,
              title: 'Procedure I',
              description: 'Standard procedure instructions',
              steps: JSON.parse(JSON.stringify(exp.steps))
            }
          ];
        }
      }

      return {
        title: exp.title,
        subject: exp.subject,
        kcsePaper: exp.kcsePaper,
        topic: exp.topic,
        objectives: Array.isArray(exp.objectives) ? exp.objectives.join('\n') : (exp.objectives || ''),
        durationMinutes: exp.estimatedDurationMinutes || 45,
        simulationType: exp.simulationType,
        visibility: (exp.ownerType === 'school' ? 'school' : 'teacher') as 'teacher' | 'school',
        apparatus: exp.apparatus ? (JSON.parse(JSON.stringify(exp.apparatus)) as ApparatusItem[]) : [],
        procedures: procedures.length > 0 ? procedures : [
          { id: 'proc-1', number: 1, title: 'Procedure I', steps: [] }
        ],
        steps: exp.steps ? (JSON.parse(JSON.stringify(exp.steps)) as ExperimentStep[]) : [],
        answerSheet: exp.answerSheet && exp.answerSheet.length > 0 
          ? JSON.parse(JSON.stringify(exp.answerSheet)) 
          : [
              {
                id: 'q-table-a',
                type: 'data_table',
                prompt: 'Table A: Titration readings (Final reading, Initial reading, Volume used)',
                maxMarks: 4,
                procedureNumber: 1,
                tableHeaders: ['Titre Number', 'Final burette reading (cm³)', 'Initial burette reading (cm³)', 'Volume used (cm³)'],
                tableRows: [
                  { label: 'Titre I (Trial)', simulatedValue: 24.50, tolerance: 0.20 },
                  { label: 'Titre II (Accurate)', simulatedValue: 24.50, tolerance: 0.10 },
                  { label: 'Titre III (Accurate)', simulatedValue: 24.40, tolerance: 0.10 }
                ]
              },
              {
                id: 'q-calc-avg',
                type: 'calculation',
                prompt: '(a) Calculate the average volume of solution used.',
                maxMarks: 1,
                procedureNumber: 1,
                correctNumericValue: 24.45,
                tolerance: 0.10,
                unit: 'cm³',
                formulaHint: '(Titre II + Titre III) / 2'
              }
            ],
        simulationConfig: exp.simulationConfig || {}
      };
    }

    // Default template (aligned with KCSE Series 1 Exams practical standard)
    return {
      title: 'Standardization and Volumetric Analysis Practical',
      subject: 'chemistry',
      kcsePaper: '233/3 (KCSE Chemistry Practical)',
      topic: 'Acids, Bases & Redox Volumetric Analysis',
      objectives: 'Standardize Solution B and determine the exact reaction stoichiometry and quantitative analysis.',
      durationMinutes: 45,
      simulationType: 'titration',
      visibility: 'teacher',
      apparatus: [
        { id: 'app-burette', name: '50cm³ Burette with Teflon Tap', subject: 'chemistry', icon: 'Burette' },
        { id: 'app-flask', name: '250cm³ Conical Flask', subject: 'chemistry', icon: 'FlaskConical' },
        { id: 'app-pipette', name: '25.0cm³ Pipette & Safety Filler', subject: 'chemistry', icon: 'Pipette' },
        { id: 'app-stand', name: 'Retort Stand & Burette Clamp', subject: 'chemistry', icon: 'Clamp' },
        { id: 'app-cylinder', name: '10cm³ Measuring Cylinder', subject: 'chemistry', icon: 'Cylinder' },
        { id: 'app-white-tile', name: 'White Ceramic Inspection Tile', subject: 'chemistry', icon: 'Square' },
        { id: 'app-sol-b', name: 'Solution B: Aqueous Potassium Manganate(VII)', subject: 'chemistry', icon: 'Beaker' },
        { id: 'app-sol-c', name: 'Solution C: 0.1M Ammonium Iron(II) Sulphate', subject: 'chemistry', icon: 'Beaker' },
        { id: 'app-acid', name: '1.0M Sulphuric(VI) Acid', subject: 'chemistry', icon: 'Beaker' }
      ],
      procedures: [
        {
          id: 'proc-1',
          number: 1,
          title: 'Procedure I: Standardization of Solution B with Solution C',
          description: 'Volumetric titration using Solution B in burette and acidified Solution C in flask.',
          steps: [
            {
              id: 1,
              instruction: 'Fill the burette with Solution B up to the 0.00 cm³ mark.',
              validationType: 'apparatus_placed',
              marks: 1,
              hint: 'Mount the burette and fill with Solution B using a funnel or fill tap.',
              allowForcePush: true,
              procedureNumber: 1
            },
            {
              id: 2,
              instruction: 'Pipette 25.0 cm³ of Solution C into a clean conical flask.',
              validationType: 'volume_set',
              marks: 1,
              hint: 'Use the pipette filler to deliver exactly 25.0 cm³ of Solution C.',
              allowForcePush: true,
              procedureNumber: 1
            },
            {
              id: 3,
              instruction: 'Add 5.0 cm³ of 1M sulphuric(VI) acid using a measuring cylinder into the conical flask.',
              validationType: 'reagent_added',
              marks: 1,
              hint: 'Measure 5.0 cm³ of 1M H₂SO₄ in the measuring cylinder and pour into the flask.',
              allowForcePush: true,
              procedureNumber: 1
            },
            {
              id: 4,
              instruction: 'Titrate Solution C using Solution B until a permanent pale pink colour just appears.',
              validationType: 'run_simulation',
              marks: 1,
              hint: 'Deliver Solution B dropwise until the pale pink colour remains on swirling.',
              allowForcePush: true,
              procedureNumber: 1
            }
          ]
        },
        {
          id: 'proc-2',
          number: 2,
          title: 'Procedure II: Quantitative Determination with Dilution & Heating',
          description: 'Dilution of Solution A, acidification, heating to 60°C, and titration against Solution B.',
          steps: [
            {
              id: 5,
              instruction: 'Measure 2.0 cm³ of Solution A and dilute by adding 75 cm³ of distilled water to make Solution D.',
              validationType: 'diluted',
              marks: 1,
              hint: 'Add distilled water to the solution in the flask to prepare Solution D.',
              allowForcePush: true,
              procedureNumber: 2
            },
            {
              id: 6,
              instruction: 'Pipette 25.0 cm³ of Solution D into a conical flask and add 5.0 cm³ of 1M sulphuric acid.',
              validationType: 'volume_set',
              marks: 1,
              hint: 'Transfer Solution D and acidify with 5.0 cm³ 1M sulphuric acid.',
              allowForcePush: true,
              procedureNumber: 2
            },
            {
              id: 7,
              instruction: 'Heat the solution to about 60°C and titrate while still hot with Solution B until a permanent pink colour just appears.',
              validationType: 'heated',
              marks: 2,
              hint: 'Use the burner to reach 60°C, then titrate hot solution with Solution B.',
              allowForcePush: true,
              procedureNumber: 2
            }
          ]
        }
      ],
      steps: [],
      answerSheet: [
        {
          id: 'q-table-a',
          type: 'data_table',
          prompt: 'Table A: Titration of 25.0 cm³ Solution C against Solution B',
          maxMarks: 4,
          procedureNumber: 1,
          tableHeaders: ['Titre Number', 'Final burette reading (cm³)', 'Initial burette reading (cm³)', 'Volume of B used (cm³)'],
          tableRows: [
            { label: 'Titre I (Trial)', simulatedValue: 24.50, tolerance: 0.20 },
            { label: 'Titre II (Accurate)', simulatedValue: 24.50, tolerance: 0.10 },
            { label: 'Titre III (Accurate)', simulatedValue: 24.40, tolerance: 0.10 }
          ]
        },
        {
          id: 'q-calc-avg-a',
          type: 'calculation',
          prompt: '(a) Calculate the average volume of solution B used in Table A.',
          maxMarks: 1,
          procedureNumber: 1,
          correctNumericValue: 24.45,
          tolerance: 0.10,
          unit: 'cm³',
          formulaHint: 'Average of consistent titres (Titre II & III)'
        },
        {
          id: 'q-calc-moles-c',
          type: 'calculation',
          prompt: '(b)(i) Calculate the number of moles of C used (25 cm³ of 0.1M).',
          maxMarks: 1,
          procedureNumber: 1,
          correctNumericValue: 0.0025,
          tolerance: 0.0001,
          unit: 'moles',
          formulaHint: '(25 * 0.1) / 1000'
        },
        {
          id: 'q-calc-moles-b',
          type: 'calculation',
          prompt: '(b)(ii) Calculate the number of moles of B used (mole ratio 1:5).',
          maxMarks: 1,
          procedureNumber: 1,
          correctNumericValue: 0.0005,
          tolerance: 0.00005,
          unit: 'moles',
          formulaHint: 'Moles of C / 5'
        },
        {
          id: 'q-table-b',
          type: 'data_table',
          prompt: 'Table B: Titration of Solution D against Solution B at 60°C',
          maxMarks: 4,
          procedureNumber: 2,
          tableHeaders: ['Titre Number', 'Final burette reading (cm³)', 'Initial burette reading (cm³)', 'Volume of B used (cm³)'],
          tableRows: [
            { label: 'Titre I (Trial)', simulatedValue: 20.20, tolerance: 0.20 },
            { label: 'Titre II (Accurate)', simulatedValue: 20.00, tolerance: 0.10 },
            { label: 'Titre III (Accurate)', simulatedValue: 20.00, tolerance: 0.10 }
          ]
        },
        {
          id: 'q-calc-avg-b',
          type: 'calculation',
          prompt: '(c)(i) Calculate the average volume of B used in Table B.',
          maxMarks: 1,
          procedureNumber: 2,
          correctNumericValue: 20.00,
          tolerance: 0.10,
          unit: 'cm³',
          formulaHint: '(Titre II + Titre III) / 2'
        }
      ],
      simulationConfig: {
        equivalencePointCm3: 24.50,
        acidConcentrationM: 0.10,
        baseVolumeCm3: 25.0
      }
    };
  };

  const [formData, setFormData] = useState<BuilderFormData>(() => buildFormDataFromSpec(editingExperiment));

  // Sync when editingExperiment changes
  useEffect(() => {
    setFormData(buildFormDataFromSpec(editingExperiment));
  }, [editingExperiment]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Autonomous Experiment AI Ingestion Handlers
  const handleLoadUserSamplePrompt = () => {
    setAiInputText(`You are provided with:
• Solid A – 6g of an organic acid.
• Solution B – 0.2M sodium hydroxide

You are required to determine:
(i) The solubility of solid A
(ii) The R.M.M. of solid A.

PROCEDURE I
i) Fill the burette with distilled water.
ii) Place solid A in the boiling tube.
iii) Transfer 4cm3 of distilled water from the burette into the boiling tube containing solid A. Heat the mixture while stirring carefully with thermometer until all the solid dissolves.
iv) Cool the solution by dipping it in the provided beaker containing cold water while stirring with the thermometer. Record the temperature at which crystals start to form in the Table I below.
v) Add a further 1cm3 of distilled water from the burette to the mixture. Repeat the procedure (iii) and (iv) above and record the crystallization temperature.
Complete Table I below by adding the volumes of distilled water as indicated.

PROCEDURE II
Titrate the prepared organic acid against Solution B (0.20M NaOH) using phenolphthalein indicator to determine the Relative Molecular Mass (R.M.M.) of Solid A.`);
  };

  const handleLoadRateOfReactionSample = () => {
    setAiInputText(`You are provided with:
• 2.0 M hydrochloric acid, Solution K
• 5 cm length of magnesium ribbon
• Measuring cylinder 50 ml
• Boiling tube
• Thermometer
• Stop watch

You are required to determine the rate of reaction between magnesium ribbon and hydrochloric acid.

PROCEDURE
1. Measure 20 cm³ of Solution K using a measuring cylinder and place it in a boiling tube.
2. Record the initial temperature of Solution K.
3. Place the 5 cm magnesium ribbon into the boiling tube and immediately start the stopwatch.
4. Record the temperature of the mixture every 30 seconds for 3 minutes in Table 1.`);
  };

  const handleLoadOpticsSample = () => {
    setAiInputText(`You are provided with:
• Triangular glass prism
• Four optical pins
• Soft board
• Plain sheet of paper and drawing pins
• Protractor and 30cm ruler

You are required to determine the refractive index of the glass prism.

PROCEDURE
1. Place the plain sheet of paper on the soft board using drawing pins.
2. Place the glass prism on the paper and draw its outline.
3. Draw a normal line to face AB and draw an incident ray at angle i = 30°.
4. Erect two optical pins P1 and P2 along the incident ray.
5. Looking through face AC, place pins P3 and P4 in line with the images of P1 and P2.
6. Remove prism and draw the emergent ray. Measure angle of refraction r.`);
  };

  const handleLoadThermochemistrySample = () => {
    setAiInputText(`You are provided with:
• Solid P (zinc powder)
• Solution Q (0.2 M copper(II) sulphate)
• Plastic beaker 250 cm³
• 0-100°C Laboratory thermometer

You are required to determine the enthalpy change of displacement reaction.

PROCEDURE
1. Place 50 cm³ of Solution Q into the plastic beaker.
2. Measure and record the initial temperature T1.
3. Add all of Solid P to the solution and stir carefully with the thermometer.
4. Record the highest temperature reached T2 in Table 1.`);
  };

  const handleLoadFoodTestSample = () => {
    setAiInputText(`You are provided with:
• Solution S (food extract)
• Iodine solution
• Benedict's solution
• 10% sodium hydroxide and 1% copper(II) sulphate solution
• Boiling water bath
• Test tubes and test tube rack

You are required to identify food substances present in Solution S.

PROCEDURE
1. Put 2 cm³ of Solution S into a test tube. Add 3 drops of iodine solution. Record observation and inference.
2. Put 2 cm³ of Solution S into a test tube. Add 2 cm³ of Benedict's solution and heat in boiling water bath for 5 minutes. Record observation.
3. Put 2 cm³ of Solution S into a test tube. Add 2 cm³ of sodium hydroxide followed by 3 drops of copper sulphate.`);
  };

  const handleCopyFromExisting = (sourceExpId: string) => {
    const sourceExp = experiments.find(e => e.id === sourceExpId);
    if (!sourceExp) return;
    const copiedForm = buildFormDataFromSpec(sourceExp);
    setFormData({
      ...copiedForm,
      title: `Copy of ${sourceExp.title}`,
      visibility: 'teacher'
    });
    setIsCopyModalOpen(false);
    showNotification(`Successfully copied practical: "${sourceExp.title}". You can now customize procedures, apparatus, and keys.`);
  };

  const handleRunAiParser = async () => {
    if (!aiInputText.trim()) {
      setAiError('Please enter or paste experiment questions/steps first.');
      return;
    }
    setIsAiLoading(true);
    setAiError(null);
    setAiSuccessSummary(null);
    try {
      const res = await api.experiments.parseAI(aiInputText.trim());
      if (res && res.experiment) {
        const exp = res.experiment;
        
        // Map apparatus: generate unique IDs for each
        const mappedApparatus: ApparatusItem[] = (exp.apparatus || []).map((app: any, idx: number) => ({
          id: app.id || `app-ai-${Date.now().toString(36)}-${idx}`,
          name: app.name,
          subject: app.subject || exp.subject || 'chemistry',
          icon: app.icon || 'Beaker',
          isDistractor: !!app.isDistractor
        }));

        // Procedures: ensure standard structure
        const mappedProcedures: ProcedureSpec[] = (exp.procedures || []).map((proc: any, pIdx: number) => ({
          id: proc.id || `proc-${proc.number || pIdx + 1}`,
          number: proc.number || pIdx + 1,
          title: proc.title || `Procedure ${proc.number || pIdx + 1}`,
          description: proc.description || '',
          steps: (proc.steps || []).map((st: any, sIdx: number) => ({
            id: st.id || (pIdx * 10 + sIdx + 1),
            instruction: st.instruction,
            validationType: st.validationType || 'observation_made',
            validationDetail: st.validationDetail || st.instruction,
            marks: st.marks || 1,
            hint: st.hint || '',
            allowForcePush: true,
            procedureNumber: proc.number || pIdx + 1,
            expectedResult: st.expectedResult || exp.simulationConfig?.expectedObservation || ''
          }))
        }));

        // Flat steps
        const flatSteps = mappedProcedures.flatMap(p => p.steps);

        // Answer sheet
        const mappedAnswerSheet: AnswerSheetQuestion[] = (exp.answerSheet || []).map((q: any, qIdx: number) => ({
          ...q,
          id: q.id || `q-ai-${qIdx + 1}`
        }));

        setFormData(prev => ({
          ...prev,
          title: exp.title || prev.title,
          subject: exp.subject || prev.subject,
          kcsePaper: exp.kcsePaper || prev.kcsePaper,
          topic: exp.topic || prev.topic,
          objectives: Array.isArray(exp.objectives) ? exp.objectives.join('\n') : (exp.objectives || prev.objectives),
          durationMinutes: exp.estimatedDurationMinutes || prev.durationMinutes,
          simulationType: exp.simulationType || (exp.title.toLowerCase().includes('solubility') ? 'solubility' : prev.simulationType),
          apparatus: mappedApparatus,
          procedures: mappedProcedures.length > 0 ? mappedProcedures : prev.procedures,
          steps: flatSteps,
          answerSheet: mappedAnswerSheet.length > 0 ? mappedAnswerSheet : prev.answerSheet,
          simulationConfig: {
            ...(prev.simulationConfig || {}),
            ...(exp.simulationConfig || {})
          }
        }));

        setAiSuccessSummary(`Successfully parsed experiment using ${res.source === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash AI' : 'Autonomous Scientific Engine'}: Loaded ${mappedProcedures.length} procedure(s), ${mappedApparatus.length} apparatus items, and ${mappedAnswerSheet.length} exam questions!`);
        showNotification('Experiment successfully auto-configured from instructions!');
        setIsAiModalOpen(false);
        setBuilderStep(3); // Take teacher directly to Procedures & Steps to review!
      } else {
        setAiError('Failed to parse experiment structure. Please check input text.');
      }
    } catch (err: any) {
      setAiError(err.message || 'Error occurred while contacting parser service.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Apparatus handlers
  const handleAddApparatusFromCatalog = (item: Omit<ApparatusItem, 'id'>) => {
    const isAlreadyAdded = formData.apparatus.some(a => a.name.toLowerCase() === item.name.toLowerCase());
    if (isAlreadyAdded) {
      showNotification(`"${item.name}" is already in your selected apparatus.`);
      return;
    }
    const newItem: ApparatusItem = {
      ...item,
      id: `app-custom-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`
    };
    setFormData(prev => ({
      ...prev,
      apparatus: [...prev.apparatus, newItem]
    }));
    showNotification(`Added "${item.name}" to apparatus list.`);
  };

  const handleCreateCustomApparatus = () => {
    if (!customApparatusName.trim()) return;
    const newItem: ApparatusItem = {
      id: `app-teacher-${Date.now().toString(36)}`,
      name: customApparatusName.trim(),
      subject: formData.subject,
      icon: 'Beaker',
      isDistractor: customIsDistractor
    };
    setFormData(prev => ({
      ...prev,
      apparatus: [...prev.apparatus, newItem]
    }));
    setCustomApparatusName('');
    setCustomIsDistractor(false);
    showNotification(`Created custom apparatus "${newItem.name}".`);
  };

  const handleRemoveApparatus = (id: string) => {
    setFormData(prev => ({
      ...prev,
      apparatus: prev.apparatus.filter(a => a.id !== id)
    }));
  };

  const handleToggleDistractor = (id: string) => {
    setFormData(prev => ({
      ...prev,
      apparatus: prev.apparatus.map(a => a.id === id ? { ...a, isDistractor: !a.isDistractor } : a)
    }));
  };

  // ================= PROCEDURE HANDLERS =================
  const handleSetProcedureCount = (count: number) => {
    const targetCount = Math.max(1, Math.min(5, count));
    const currentProcs = [...formData.procedures];

    if (targetCount > currentProcs.length) {
      const added: ProcedureSpec[] = [];
      for (let i = currentProcs.length + 1; i <= targetCount; i++) {
        const roman = i === 1 ? 'I' : i === 2 ? 'II' : i === 3 ? 'III' : i === 4 ? 'IV' : 'V';
        added.push({
          id: `proc-${i}-${Date.now().toString(36)}`,
          number: i,
          title: `Procedure ${roman}: Title & Instructions`,
          description: '',
          steps: [
            {
              id: (formData.procedures.flatMap(p => p.steps).length) + added.length + 1,
              instruction: `Step for Procedure ${roman}...`,
              validationType: 'apparatus_placed',
              marks: 1,
              hint: '',
              allowForcePush: true,
              procedureNumber: i
            }
          ]
        });
      }
      setFormData(prev => ({
        ...prev,
        procedures: [...currentProcs, ...added]
      }));
    } else if (targetCount < currentProcs.length) {
      setFormData(prev => ({
        ...prev,
        procedures: currentProcs.slice(0, targetCount)
      }));
      if (activeProcedureTab >= targetCount) {
        setActiveProcedureTab(targetCount - 1);
      }
    }
  };

  const handleAddProcedure = () => {
    const nextNum = formData.procedures.length + 1;
    const roman = nextNum === 1 ? 'I' : nextNum === 2 ? 'II' : nextNum === 3 ? 'III' : nextNum === 4 ? 'IV' : `${nextNum}`;
    const newProc: ProcedureSpec = {
      id: `proc-${nextNum}-${Date.now().toString(36)}`,
      number: nextNum,
      title: `Procedure ${roman}: Qualitative or Volumetric Phase`,
      description: '',
      steps: [
        {
          id: (formData.procedures.flatMap(p => p.steps).length) + 1,
          instruction: `Instruction 1 for Procedure ${roman}...`,
          validationType: 'apparatus_placed',
          marks: 1,
          hint: '',
          allowForcePush: true,
          procedureNumber: nextNum
        }
      ]
    };
    setFormData(prev => ({
      ...prev,
      procedures: [...prev.procedures, newProc]
    }));
    setActiveProcedureTab(formData.procedures.length);
  };

  const handleDeleteProcedure = (procIndex: number) => {
    if (formData.procedures.length <= 1) {
      showNotification('At least one procedure is required.');
      return;
    }
    const updated = formData.procedures.filter((_, idx) => idx !== procIndex).map((p, idx) => ({
      ...p,
      number: idx + 1
    }));
    setFormData(prev => ({ ...prev, procedures: updated }));
    setActiveProcedureTab(Math.max(0, procIndex - 1));
  };

  const handleUpdateProcedure = (procIndex: number, field: keyof ProcedureSpec, value: any) => {
    const updated = [...formData.procedures];
    updated[procIndex] = { ...updated[procIndex], [field]: value };
    setFormData(prev => ({ ...prev, procedures: updated }));
  };

  // Step handlers for active procedure
  const handleAddStepToProcedure = (procIndex: number) => {
    const proc = formData.procedures[procIndex];
    if (!proc) return;

    // Calculate sequential step ID
    const totalSteps = formData.procedures.flatMap(p => p.steps).length;
    const newStep: ExperimentStep = {
      id: totalSteps + 1,
      instruction: `Step ${proc.steps.length + 1}: Describe the task for Procedure ${proc.number}...`,
      validationType: 'apparatus_placed',
      marks: 1,
      hint: '',
      allowForcePush: true,
      procedureNumber: proc.number
    };

    const updatedProcs = [...formData.procedures];
    updatedProcs[procIndex] = {
      ...proc,
      steps: [...proc.steps, newStep]
    };

    setFormData(prev => ({ ...prev, procedures: updatedProcs }));
  };

  const handleUpdateProcedureStep = (procIndex: number, stepIndex: number, field: keyof ExperimentStep, value: any) => {
    const updatedProcs = [...formData.procedures];
    const proc = updatedProcs[procIndex];
    if (!proc) return;

    const updatedSteps = [...proc.steps];
    updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], [field]: value };
    updatedProcs[procIndex] = { ...proc, steps: updatedSteps };

    setFormData(prev => ({ ...prev, procedures: updatedProcs }));
  };

  const handleDeleteProcedureStep = (procIndex: number, stepIndex: number) => {
    const updatedProcs = [...formData.procedures];
    const proc = updatedProcs[procIndex];
    if (!proc) return;

    const updatedSteps = proc.steps.filter((_, idx) => idx !== stepIndex);
    updatedProcs[procIndex] = { ...proc, steps: updatedSteps };

    setFormData(prev => ({ ...prev, procedures: updatedProcs }));
  };

  // ================= ANSWER SHEET HANDLERS =================
  const handleAddQuestion = (type: AnswerSheetQuestion['type']) => {
    const nextQNum = formData.answerSheet.length + 1;
    let newQ: AnswerSheetQuestion;

    if (type === 'data_table') {
      newQ = {
        id: `q-table-${Date.now().toString(36)}`,
        type: 'data_table',
        prompt: `Table ${String.fromCharCode(64 + nextQNum)}: Experimental Readings & Concordancy Test`,
        maxMarks: 4,
        procedureNumber: activeProcedureTab + 1,
        tableHeaders: ['Titre Number', 'Final burette reading (cm³)', 'Initial burette reading (cm³)', 'Volume used (cm³)'],
        tableRows: [
          { label: 'Titre I (Trial)', simulatedValue: 24.50, tolerance: 0.20 },
          { label: 'Titre II (Accurate)', simulatedValue: 24.50, tolerance: 0.10 },
          { label: 'Titre III (Accurate)', simulatedValue: 24.40, tolerance: 0.10 }
        ]
      };
    } else if (type === 'observation_inference') {
      newQ = {
        id: `q-obs-${Date.now().toString(36)}`,
        type: 'observation_inference',
        prompt: `Question ${nextQNum}: Observation & Inference Test`,
        maxMarks: 2,
        procedureNumber: activeProcedureTab + 1,
        observationAcceptedKeywords: ['white precipitate', 'soluble in excess'],
        inferenceAcceptedKeywords: ['Zn2+', 'Al3+', 'Pb2+'],
        modelAnswer: 'Observation: White precipitate soluble in excess. Inference: Zn2+, Al3+, or Pb2+ present.'
      };
    } else if (type === 'calculation') {
      newQ = {
        id: `q-calc-${Date.now().toString(36)}`,
        type: 'calculation',
        prompt: `Calculate the concentration / quantity for Question ${nextQNum}.`,
        maxMarks: 1,
        procedureNumber: activeProcedureTab + 1,
        correctNumericValue: 0.10,
        tolerance: 0.01,
        unit: 'moles',
        formulaHint: 'M = (V * C) / 1000'
      };
    } else {
      newQ = {
        id: `q-short-${Date.now().toString(36)}`,
        type: 'short_answer',
        prompt: `Question ${nextQNum}: Explain the observation or write the balanced ionic equation.`,
        maxMarks: 1,
        procedureNumber: activeProcedureTab + 1,
        modelAnswer: 'Accept standard chemical explanation or balanced chemical equation.'
      };
    }

    setFormData(prev => ({
      ...prev,
      answerSheet: [...prev.answerSheet, newQ]
    }));
    showNotification(`Added new ${type.replace('_', ' ')} question to answer sheet.`);
  };

  const handleChangeQuestionType = (qIndex: number, newType: AnswerSheetQuestion['type']) => {
    const currentQ = formData.answerSheet[qIndex];
    if (!currentQ || currentQ.type === newType) return;

    const updates: Partial<AnswerSheetQuestion> = { type: newType };
    if (newType === 'data_table') {
      if (!currentQ.tableRows || currentQ.tableRows.length === 0) {
        updates.tableHeaders = ['Titre Number', 'Final burette reading (cm³)', 'Initial burette reading (cm³)', 'Volume used (cm³)'];
        updates.tableRows = [
          { label: 'Titre I (Trial)', simulatedValue: 24.50, tolerance: 0.20 },
          { label: 'Titre II (Accurate)', simulatedValue: 24.50, tolerance: 0.10 },
          { label: 'Titre III (Accurate)', simulatedValue: 24.40, tolerance: 0.10 }
        ];
        updates.tableType = 'titration';
      }
    } else if (newType === 'short_answer') {
      updates.writingType = 'multi_line';
      if (!currentQ.modelAnswer) {
        updates.modelAnswer = 'Accept standard scientific deduction or balanced chemical equation.';
      }
      updates.acceptedKeywords = currentQ.acceptedKeywords || [];
    } else if (newType === 'calculation') {
      if (currentQ.correctNumericValue === undefined) {
        updates.correctNumericValue = 24.45;
        updates.tolerance = 0.10;
        updates.unit = 'cm³';
      }
    } else if (newType === 'observation_inference') {
      updates.observationAcceptedKeywords = currentQ.observationAcceptedKeywords || ['pale pink', 'colourless'];
      updates.inferenceAcceptedKeywords = currentQ.inferenceAcceptedKeywords || ['neutralisation', 'endpoint'];
    }

    handleUpdateQuestion(qIndex, updates);
    showNotification(`Switched Question ${qIndex + 1} to ${newType === 'data_table' ? 'Table' : newType === 'short_answer' ? 'Writing' : newType.replace('_', ' ')} format.`);
  };

  const handleLoadKcseStandardChemistryTemplate = () => {
    setFormData(prev => ({
      ...prev,
      title: 'Volumetric Analysis & Quantitative Practical (233/3)',
      subject: 'chemistry',
      kcsePaper: '233/3 (KCSE Chemistry Practical)',
      topic: 'Acids, Bases & Redox Volumetric Analysis',
      objectives: 'Standardize Solution B with acidified Solution C and carry out dilution determination in Procedure II.',
      simulationType: 'titration',
      procedures: [
        {
          id: 'proc-1',
          number: 1,
          title: 'Procedure I: Titration of Solution C against Solution B',
          description: 'Standardization of Solution B using Solution C in acidic medium.',
          steps: [
            {
              id: 1,
              instruction: 'Fill the burette with solution B up to the 0.00 cm³ mark.',
              validationType: 'apparatus_placed',
              marks: 1,
              hint: 'Mount the burette and fill with Solution B using a funnel or tap.',
              allowForcePush: true,
              procedureNumber: 1
            },
            {
              id: 2,
              instruction: 'Pipette 25cm³ of solution C into a conical flask.',
              validationType: 'volume_set',
              marks: 1,
              hint: 'Use the pipette filler to deliver exactly 25.0 cm³ of Solution C.',
              allowForcePush: true,
              procedureNumber: 1
            },
            {
              id: 3,
              instruction: 'Add 5cm³ of 1M sulphuric (VI) acid using a measuring cylinder into the conical flask.',
              validationType: 'reagent_added',
              marks: 1,
              hint: 'Use the measuring cylinder to measure 5.0 cm³ of 1M H₂SO₄ and pour into the flask.',
              allowForcePush: true,
              procedureNumber: 1
            },
            {
              id: 4,
              instruction: 'Titrate solution C using solution B until a permanent pale pink colour just appears.',
              validationType: 'run_simulation',
              marks: 1,
              hint: 'Deliver Solution B dropwise until the pale pink colour remains on swirling.',
              allowForcePush: true,
              procedureNumber: 1
            }
          ]
        },
        {
          id: 'proc-2',
          number: 2,
          title: 'Procedure II: Quantitative Determination with Dilution & Heating',
          description: 'Dilution of Solution A, acidification, heating to 60°C, and titration against Solution B.',
          steps: [
            {
              id: 5,
              instruction: 'Measure 2.0 cm³ of Solution A and dilute by adding 75 cm³ of distilled water to make Solution D.',
              validationType: 'diluted',
              marks: 1,
              hint: 'Use the dilution station to prepare Solution D.',
              allowForcePush: true,
              procedureNumber: 2
            },
            {
              id: 6,
              instruction: 'Pipette 25.0 cm³ of Solution D into a conical flask and add 5.0 cm³ of 1M sulphuric acid.',
              validationType: 'volume_set',
              marks: 1,
              hint: 'Transfer Solution D and acidify with 5.0 cm³ 1M sulphuric acid using measuring cylinder.',
              allowForcePush: true,
              procedureNumber: 2
            },
            {
              id: 7,
              instruction: 'Heat the mixture in the conical flask to about 60°C using a Bunsen burner or water bath.',
              validationType: 'heated',
              marks: 1,
              hint: 'Activate heat source and monitor thermometer until 60°C is reached.',
              allowForcePush: true,
              procedureNumber: 2
            },
            {
              id: 8,
              instruction: 'Titrate while hot against Solution B until a permanent pale pink colour appears.',
              validationType: 'run_simulation',
              marks: 1,
              hint: 'Titrate while hot with Solution B until pale pink endpoint.',
              allowForcePush: true,
              procedureNumber: 2
            }
          ]
        }
      ],
      answerSheet: [
        {
          id: 'q-table-a',
          type: 'data_table',
          prompt: 'Table A: Titration of 25.0 cm³ Solution C against Solution B',
          maxMarks: 4,
          procedureNumber: 1,
          tableType: 'titration',
          tableHeaders: ['Titre Number', 'Final burette reading (cm³)', 'Initial burette reading (cm³)', 'Volume of Solution B used (cm³)'],
          tableRows: [
            { label: 'Titre I (Trial)', simulatedValue: 24.50, tolerance: 0.20 },
            { label: 'Titre II (Accurate)', simulatedValue: 24.50, tolerance: 0.10 },
            { label: 'Titre III (Accurate)', simulatedValue: 24.40, tolerance: 0.10 }
          ]
        },
        {
          id: 'q-calc-avg',
          type: 'calculation',
          prompt: '(a) Calculate the average volume of Solution B used.',
          maxMarks: 1,
          procedureNumber: 1,
          correctNumericValue: 24.45,
          tolerance: 0.10,
          unit: 'cm³',
          formulaHint: '(Titre II + Titre III) / 2'
        },
        {
          id: 'q-writing-ionic',
          type: 'short_answer',
          prompt: '(b) Write the balanced ionic equation for the reaction between Solution B (MnO₄⁻) and Solution C (Fe²⁺) in acidic medium.',
          maxMarks: 2,
          procedureNumber: 1,
          writingType: 'multi_line',
          modelAnswer: 'MnO₄⁻(aq) + 5Fe²⁺(aq) + 8H⁺(aq) -> Mn²⁺(aq) + 5Fe³⁺(aq) + 4H₂O(l) (Award 1 mark for correct formulas & balancing, 1 mark for state symbols).',
          acceptedKeywords: ['MnO4-', 'Fe2+', 'H+', 'Mn2+', 'Fe3+', 'H2O', 'balanced']
        },
        {
          id: 'q-table-b',
          type: 'data_table',
          prompt: 'Table B: Titration of 25.0 cm³ of diluted Solution D against Solution B (Hot)',
          maxMarks: 4,
          procedureNumber: 2,
          tableType: 'titration',
          tableHeaders: ['Titre Number', 'Final burette reading (cm³)', 'Initial burette reading (cm³)', 'Volume of Solution B used (cm³)'],
          tableRows: [
            { label: 'Titre I (Trial)', simulatedValue: 22.80, tolerance: 0.20 },
            { label: 'Titre II (Accurate)', simulatedValue: 22.80, tolerance: 0.10 },
            { label: 'Titre III (Accurate)', simulatedValue: 22.70, tolerance: 0.10 }
          ]
        },
        {
          id: 'q-writing-role-acid',
          type: 'short_answer',
          prompt: '(c) Explain the role of the 5.0 cm³ 1M sulphuric(VI) acid added using the measuring cylinder.',
          maxMarks: 1,
          procedureNumber: 1,
          writingType: 'multi_line',
          modelAnswer: 'Provides hydrogen ions (H⁺) required for the reduction of manganate(VII) ions to manganese(II) ions, and prevents formation of brown manganese(IV) oxide precipitate.',
          acceptedKeywords: ['acidic medium', 'H+ ions', 'prevent MnO2', 'reduction of MnO4-']
        }
      ]
    }));
    setActiveProcedureTab(0);
    showNotification('Loaded standard KCSE 2-Procedure practical project & marking scheme.');
  };

  const handleUpdateQuestion = (index: number, updates: Partial<AnswerSheetQuestion>) => {
    setFormData(prev => {
      const updated = [...prev.answerSheet];
      updated[index] = { ...updated[index], ...updates };
      return { ...prev, answerSheet: updated };
    });
  };

  const handleDeleteQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      answerSheet: prev.answerSheet.filter((_, idx) => idx !== index)
    }));
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= formData.answerSheet.length) return;

    setFormData(prev => {
      const updated = [...prev.answerSheet];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return { ...prev, answerSheet: updated };
    });
  };

  // Table rows handler for data_table questions
  const handleAddTableRow = (qIndex: number) => {
    const q = formData.answerSheet[qIndex];
    if (!q) return;
    const currentRows = q.tableRows || [];
    const nextRowLabel = `Titre ${currentRows.length + 1}`;
    const newRows = [...currentRows, { label: nextRowLabel, simulatedValue: 24.50, tolerance: 0.10 }];
    handleUpdateQuestion(qIndex, { tableRows: newRows });
  };

  const handleUpdateTableRow = (qIndex: number, rIndex: number, field: string, val: any) => {
    const q = formData.answerSheet[qIndex];
    if (!q || !q.tableRows) return;
    const updatedRows = [...q.tableRows];
    updatedRows[rIndex] = { ...updatedRows[rIndex], [field]: val };
    handleUpdateQuestion(qIndex, { tableRows: updatedRows });
  };

  const handleDeleteTableRow = (qIndex: number, rIndex: number) => {
    const q = formData.answerSheet[qIndex];
    if (!q || !q.tableRows || q.tableRows.length <= 1) return;
    const updatedRows = q.tableRows.filter((_, idx) => idx !== rIndex);
    handleUpdateQuestion(qIndex, { tableRows: updatedRows });
  };

  // Publish / Save Modifications
  const handlePublish = () => {
    if (!formData.title.trim()) {
      showNotification('Please provide an experiment title.');
      return;
    }
    if (formData.apparatus.length === 0) {
      showNotification('Please select at least one apparatus for this practical.');
      return;
    }
    if (formData.answerSheet.length === 0) {
      showNotification('Please add at least one question to the answer sheet.');
      return;
    }

    // Flatten all procedure steps sequentially
    let stepCounter = 1;
    const flattenedSteps: ExperimentStep[] = [];
    formData.procedures.forEach((proc, pIdx) => {
      proc.steps.forEach(st => {
        flattenedSteps.push({
          ...st,
          id: stepCounter++,
          procedureNumber: proc.number || (pIdx + 1),
          procedureTitle: proc.title
        });
      });
    });

    const isExistingTeacherExp = Boolean(
      editingExperiment && 
      (editingExperiment.ownerType === 'teacher' || editingExperiment.id.startsWith('exp-custom-') || editingExperiment.id.startsWith('exp-cloned-') || editingExperiment.id.startsWith('exp-teacher-'))
    );

    const targetId = isExistingTeacherExp && editingExperiment ? editingExperiment.id : `exp-teacher-${Date.now().toString(36)}`;

    const targetSpec: ExperimentSpec = {
      id: targetId,
      subject: formData.subject,
      title: formData.title.trim(),
      kcsePaper: formData.kcsePaper,
      topic: formData.topic.trim(),
      objectives: formData.objectives.split('\n').filter(Boolean),
      estimatedDurationMinutes: Number(formData.durationMinutes),
      apparatus: formData.apparatus,
      procedures: formData.procedures,
      steps: flattenedSteps,
      simulationType: formData.simulationType,
      simulationConfig: {
        ...(editingExperiment?.simulationConfig || {}),
        ...formData.simulationConfig,
        ...(formData.simulationType === 'titration' ? {
          equivalencePointCm3: 24.50,
          acidConcentrationM: 0.10,
          baseVolumeCm3: 25.0
        } : {})
      },
      answerSheet: formData.answerSheet,
      ownerType: formData.visibility,
      schoolId: currentUser?.schoolId || null,
      teacherId: currentUser?.id || null,
      authorName: currentUser?.name || 'Science Faculty',
      status: 'published'
    };

    if (isExistingTeacherExp) {
      updateExperiment(targetSpec);
      showNotification(`Saved modifications to "${targetSpec.title}".`);
    } else {
      createExperiment(targetSpec);
      showNotification(`Published new laboratory experiment "${targetSpec.title}".`);
    }

    setTimeout(() => {
      setCurrentView('dashboard');
    }, 1000);
  };

  const filteredCatalog = APPARATUS_CATALOG.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesSubject = catalogSubjectFilter === 'all' || item.subject === catalogSubjectFilter;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              {editingExperiment ? 'Edit laboratory practical' : 'Experiment project builder'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Design multi-procedure KCSE science practicals with custom apparatus, guided steps, and digital answer keys.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsCopyModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Copy Another Practical</span>
          </button>

          <button
            type="button"
            onClick={() => { setIsAiModalOpen(true); setAiError(null); }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>🤖 AI Auto-Build from Exam Paper</span>
          </button>

          <button
            onClick={handlePublish}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-medium transition-colors shadow-sm cursor-pointer"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{editingExperiment ? 'Save practical' : 'Publish practical'}</span>
          </button>
        </div>
      </div>

      {/* Copy From Existing Practical Modal */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-xl w-full p-6 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                    <Copy className="w-5 h-5" />
                  </span>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Copy from Existing Experiment
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Choose any standard or school practical to clone into the builder. All procedures, apparatus, steps, and question criteria will be duplicated for your edits.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCopyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {experiments.map(exp => (
                <div
                  key={exp.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-indigo-400 dark:hover:border-indigo-500 transition flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {exp.subject}
                      </span>
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {exp.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {exp.procedures?.length || 1} Procedure(s) · {exp.apparatus?.length || 0} Apparatus items · {exp.answerSheet?.length || 0} Questions
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyFromExisting(exp.id)}
                    className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 transition cursor-pointer"
                  >
                    Copy into Builder
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCopyModalOpen(false)}
                className="px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Success Summary Alert */}
      {aiSuccessSummary && (
        <div className="p-3.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{aiSuccessSummary}</span>
          </div>
          <button
            onClick={() => setAiSuccessSummary(null)}
            className="text-[11px] underline text-emerald-700 dark:text-emerald-300 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* ================= AI AUTONOMOUS EXPERIMENT INGESTOR MODAL ================= */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-2xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                    <Bot className="w-5 h-5" />
                  </span>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Autonomous AI Experiment Reader & Builder
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Paste any raw practical exam question, syllabus steps, or teacher instructions. The system will read the procedures, register required apparatus, and configure data tables, graphs, and simulation physics automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick Template Pill Buttons */}
            <div className="p-3 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block">
                Quick 1-Click KCSE Practical Exam Templates:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={handleLoadUserSamplePrompt}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-medium transition cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Solubility & R.M.M.</span>
                </button>

                <button
                  type="button"
                  onClick={handleLoadRateOfReactionSample}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 text-amber-900 dark:text-amber-200 text-[11px] font-medium transition cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Rate of Reaction (Mg + HCl)</span>
                </button>

                <button
                  type="button"
                  onClick={handleLoadThermochemistrySample}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-900 dark:text-rose-200 text-[11px] font-medium transition cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Enthalpy (Zinc + CuSO₄)</span>
                </button>

                <button
                  type="button"
                  onClick={handleLoadOpticsSample}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-sky-100 dark:bg-sky-950/60 hover:bg-sky-200 text-sky-900 dark:text-sky-200 text-[11px] font-medium transition cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Prism Refraction</span>
                </button>

                <button
                  type="button"
                  onClick={handleLoadFoodTestSample}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 text-emerald-900 dark:text-emerald-200 text-[11px] font-medium transition cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Food Tests (Biology)</span>
                </button>
              </div>
            </div>

            {/* Raw Input Box */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Paste question paper text or procedures:
              </label>
              <textarea
                rows={9}
                value={aiInputText}
                onChange={e => setAiInputText(e.target.value)}
                placeholder="Example:&#10;You are provided with:&#10;• Solid A – 6g of an organic acid.&#10;• Solution B – 0.2M sodium hydroxide&#10;&#10;PROCEDURE I&#10;i) Fill the burette with distilled water...&#10;ii) Place solid A in the boiling tube...&#10;iii) Transfer 4cm3 distilled water... Heat until dissolved...&#10;iv) Cool and record crystallization temperature..."
                className="w-full p-3 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
              />
            </div>

            {aiError && (
              <div className="p-3 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                disabled={isAiLoading}
                onClick={() => setIsAiModalOpen(false)}
                className="px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isAiLoading}
                onClick={handleRunAiParser}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing & Building Practical...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Auto-Build Experiment Spec</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Builder Step Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setBuilderStep(1)}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            builderStep === 1 
              ? 'border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px]">1</span>
          <span>General info</span>
        </button>

        <button
          onClick={() => setBuilderStep(2)}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            builderStep === 2 
              ? 'border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px]">2</span>
          <span>Apparatus & reagents ({formData.apparatus.length})</span>
        </button>

        <button
          onClick={() => setBuilderStep(3)}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            builderStep === 3 
              ? 'border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px]">3</span>
          <span>Procedures & steps ({formData.procedures.length} proc.)</span>
        </button>

        <button
          onClick={() => setBuilderStep(4)}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            builderStep === 4 
              ? 'border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px]">4</span>
          <span>Answer sheet & marking ({formData.answerSheet.length} Qs)</span>
        </button>
      </div>

      {/* Main Content Panels */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-6">
        
        {/* ================= STEP 1: GENERAL INFO ================= */}
        {builderStep === 1 && (
          <div className="space-y-4 max-w-2xl text-xs">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Curriculum metadata</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Experiment title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Quantitative Titration of Sodium Ethanedioate against KMnO4"
                  className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Subject</label>
                <select
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value as SubjectType })}
                  className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="chemistry">Chemistry</option>
                  <option value="physics">Physics</option>
                  <option value="biology">Biology</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">KCSE Paper code</label>
                <input
                  type="text"
                  value={formData.kcsePaper}
                  onChange={e => setFormData({ ...formData, kcsePaper: e.target.value })}
                  placeholder="e.g. 233/3 Chemistry Practical"
                  className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Syllabus topic</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={e => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g. Volumetric Analysis & Redox Reactions"
                  className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Simulation engine</label>
                <select
                  value={formData.simulationType}
                  onChange={e => setFormData({ ...formData, simulationType: e.target.value as SimulationType })}
                  className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="solubility">Solubility & Crystallization Temperature Engine</option>
                  <option value="titration">Volumetric Titration Engine</option>
                  <option value="qualitative">Qualitative Analysis Engine (Inorganic/Organic)</option>
                  <option value="circuit">Electricity & Circuits Engine (Ohm&apos;s Law)</option>
                  <option value="food_test">Biochemical Food Tests Engine</option>
                  <option value="hookes_law">Mechanics & Springs Engine (Hooke&apos;s Law)</option>
                  <option value="thermochemistry">Thermochemistry & Heat of Reaction Engine</option>
                  <option value="universal">Universal Multi-Apparatus Workbench</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Estimated duration (mins)</label>
                <input
                  type="number"
                  min="15"
                  max="180"
                  value={formData.durationMinutes}
                  onChange={e => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Educational objectives (one per line)</label>
                <textarea
                  rows={3}
                  value={formData.objectives}
                  onChange={e => setFormData({ ...formData, objectives: e.target.value })}
                  placeholder="Accurately pipette Solution C and titrate with Solution B&#10;Determine the concentration of potassium manganate(VII)&#10;Calculate the solubility of sodium ethanedioate"
                  className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setBuilderStep(2)}
                className="px-4 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium text-xs shadow-sm transition-colors"
              >
                Next: Apparatus & reagents →
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: APPARATUS & REAGENTS ================= */}
        {builderStep === 2 && (
          <div className="space-y-5 text-xs">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Lab equipment & chemicals</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Select tools, reagents, and distractor items for students to use during the simulation.
              </p>
            </div>

            {/* Selected Apparatus Pills */}
            <div className="space-y-2">
              <span className="font-medium text-slate-900 dark:text-slate-100 text-xs block">
                Selected for this experiment ({formData.apparatus.length})
              </span>

              {formData.apparatus.length === 0 ? (
                <div className="p-6 text-center rounded-md bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                  No apparatus selected yet. Add items from the catalog below.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {formData.apparatus.map(item => (
                    <div 
                      key={item.id} 
                      className="p-2.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="truncate">
                        <div className="font-medium text-slate-900 dark:text-slate-100 truncate">{item.name}</div>
                        <button
                          type="button"
                          onClick={() => handleToggleDistractor(item.id)}
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded mt-0.5 border ${
                            item.isDistractor
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {item.isDistractor ? 'Distractor item' : 'Required item'}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveApparatus(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove apparatus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Custom Apparatus Box */}
            <div className="p-3.5 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-medium text-slate-900 dark:text-slate-100 text-xs block">
                Add custom item / solution
              </span>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  value={customApparatusName}
                  onChange={e => setCustomApparatusName(e.target.value)}
                  placeholder="e.g. Solution C: 0.1M Ammonium Iron(II) Sulphate"
                  className="flex-1 w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />

                <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={customIsDistractor}
                    onChange={e => setCustomIsDistractor(e.target.checked)}
                  />
                  <span>Mark as distractor</span>
                </label>

                <button
                  type="button"
                  onClick={handleCreateCustomApparatus}
                  className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add item</span>
                </button>
              </div>
            </div>

            {/* Catalog */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-medium text-slate-900 dark:text-slate-100 text-xs">
                  Stocked apparatus catalog
                </span>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={e => setCatalogSearch(e.target.value)}
                    placeholder="Search apparatus..."
                    className="px-2.5 py-1 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
                  />
                  <select
                    value={catalogSubjectFilter}
                    onChange={e => setCatalogSubjectFilter(e.target.value as any)}
                    className="px-2 py-1 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
                  >
                    <option value="all">All subjects</option>
                    <option value="chemistry">Chemistry</option>
                    <option value="physics">Physics</option>
                    <option value="biology">Biology</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                {filteredCatalog.map((item, idx) => {
                  const isAdded = formData.apparatus.some(a => a.name.toLowerCase() === item.name.toLowerCase());
                  return (
                    <div
                      key={idx}
                      onClick={() => !isAdded && handleAddApparatusFromCatalog(item)}
                      className={`p-2 rounded-md border text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isAdded
                          ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
                          : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <span className="truncate">{item.name}</span>
                      {isAdded ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex justify-between border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setBuilderStep(1)}
                className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                ← Back
              </button>
              <button
                onClick={() => setBuilderStep(3)}
                className="px-4 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium text-xs shadow-sm transition-colors"
              >
                Next: Procedures & steps →
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: PROCEDURES & STEPS ================= */}
        {builderStep === 3 && (
          <div className="space-y-6 text-xs">
            
            {/* Procedure Count Selector Bar */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <span>Select Number of Procedures Before Adding Steps</span>
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                    KCSE Chemistry (233/3) practical projects typically have 2 Procedures (Procedure I: Titration + Procedure II: Dilution & Heating).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLoadKcseStandardChemistryTemplate}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto shrink-0 shadow-xs"
                  title="Auto-fill the KCSE 2-Procedure practical structure and steps"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>⚡ Load KCSE Standard Project Structure</span>
                </button>
              </div>

              {/* Procedure Count Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {[
                  { count: 1, label: '1 Procedure', desc: 'Single phase practical' },
                  { count: 2, label: '2 Procedures', desc: 'KCSE Practical standard', badge: 'Recommended' },
                  { count: 3, label: '3 Procedures', desc: 'Volumetric + Qualitative' },
                  { count: 4, label: '4 Procedures', desc: 'Multi-part examination' },
                  { count: 5, label: '5 Procedures', desc: 'Extended laboratory project' }
                ].map(item => {
                  const isSelected = formData.procedures.length === item.count;
                  return (
                    <button
                      key={item.count}
                      type="button"
                      onClick={() => handleSetProcedureCount(item.count)}
                      className={`p-3 rounded-lg border text-left transition flex flex-col justify-between relative ${
                        isSelected
                          ? 'bg-white dark:bg-slate-900 border-slate-900 dark:border-slate-100 shadow-sm ring-1 ring-slate-900 dark:ring-slate-100'
                          : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {item.badge && (
                        <span className="absolute -top-2 right-2 text-[9px] bg-cyan-600 text-white font-mono px-1.5 py-0.2 rounded-full font-bold">
                          {item.badge}
                        </span>
                      )}
                      <div>
                        <div className="flex items-center justify-between">
                          <span className={`font-bold text-xs ${isSelected ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>
                            {item.label}
                          </span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {item.count}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Procedure Switcher Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-200 dark:border-slate-800">
                {formData.procedures.map((proc, pIdx) => {
                  const roman = proc.number === 1 ? 'I' : proc.number === 2 ? 'II' : proc.number === 3 ? 'III' : proc.number === 4 ? 'IV' : `${proc.number}`;
                  const isActive = activeProcedureTab === pIdx;
                  return (
                    <button
                      key={proc.id}
                      type="button"
                      onClick={() => setActiveProcedureTab(pIdx)}
                      className={`px-3 py-1.5 rounded-md font-medium text-xs transition flex items-center gap-2 ${
                        isActive
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-semibold">Procedure {roman}</span>
                      <span className="text-[10px] px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                        {proc.steps.length} steps
                      </span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={handleAddProcedure}
                  className="px-2.5 py-1.5 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1 ml-auto shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Procedure</span>
                </button>
              </div>
            </div>

            {/* Active Procedure Editor */}
            {formData.procedures[activeProcedureTab] && (() => {
              const currentProc = formData.procedures[activeProcedureTab];
              const pIdx = activeProcedureTab;

              return (
                <div className="space-y-4">
                  {/* Procedure Details Card */}
                  <div className="p-4 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                        Procedure {currentProc.number === 1 ? 'I' : currentProc.number === 2 ? 'II' : currentProc.number === 3 ? 'III' : currentProc.number} Details
                      </span>
                      {formData.procedures.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteProcedure(pIdx)}
                          className="text-slate-400 hover:text-rose-600 text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete procedure</span>
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Procedure title / Heading</label>
                      <input
                        type="text"
                        value={currentProc.title}
                        onChange={e => handleUpdateProcedure(pIdx, 'title', e.target.value)}
                        placeholder="e.g. Procedure I: Titration of Solution C using Solution B"
                        className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Description / Notes (optional)</label>
                      <textarea
                        rows={2}
                        value={currentProc.description || ''}
                        onChange={e => handleUpdateProcedure(pIdx, 'description', e.target.value)}
                        placeholder="e.g. Standardize Solution B using acidified ammonium iron(II) sulphate."
                        className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </div>

                  {/* Steps for this procedure */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                        Steps for Procedure {currentProc.number === 1 ? 'I' : currentProc.number === 2 ? 'II' : currentProc.number} ({currentProc.steps.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddStepToProcedure(pIdx)}
                        className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium text-xs flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add step</span>
                      </button>
                    </div>

                    {currentProc.steps.map((st, sIdx) => (
                      <div key={st.id || sIdx} className="p-3.5 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                            Step {sIdx + 1} (Step ID: {st.id})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteProcedureStep(pIdx, sIdx)}
                            className="text-slate-400 hover:text-rose-600 p-0.5"
                            title="Delete step"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <label className="block text-slate-600 dark:text-slate-400 mb-1">Instruction text</label>
                          <textarea
                            rows={2}
                            value={st.instruction}
                            onChange={e => handleUpdateProcedureStep(pIdx, sIdx, 'instruction', e.target.value)}
                            placeholder="e.g. Add 5cm³ of 1M sulphuric(VI) acid using a measuring cylinder into the conical flask."
                            className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-slate-600 dark:text-slate-400 mb-1">Validation action</label>
                            <select
                              value={st.validationType}
                              onChange={e => handleUpdateProcedureStep(pIdx, sIdx, 'validationType', e.target.value)}
                              className="w-full px-2 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                            >
                              <option value="reagent_added">Measuring cylinder / Reagent added</option>
                              <option value="volume_set">Liquid volume pipetted/dispensed</option>
                              <option value="apparatus_placed">Burette / Apparatus placed or filled</option>
                              <option value="heated">Heated with Bunsen burner / water bath</option>
                              <option value="diluted">Diluted with distilled water</option>
                              <option value="run_simulation">Titrate to endpoint / Run test</option>
                              <option value="reading_recorded">Meter/burette reading recorded</option>
                              <option value="observation_made">Observation & inference recorded</option>
                              <option value="connection_made">Electrical connection made</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-600 dark:text-slate-400 mb-1">Marks awarded</label>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              value={st.marks}
                              onChange={e => handleUpdateProcedureStep(pIdx, sIdx, 'marks', Number(e.target.value))}
                              className="w-full px-2 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-600 dark:text-slate-400 mb-1">Override</label>
                            <label className="flex items-center space-x-1.5 pt-1 text-slate-700 dark:text-slate-300 text-xs cursor-pointer">
                              <input
                                type="checkbox"
                                checked={st.allowForcePush}
                                onChange={e => handleUpdateProcedureStep(pIdx, sIdx, 'allowForcePush', e.target.checked)}
                              />
                              <span>Allow manual validate</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-600 dark:text-slate-400 mb-1">Student hint (optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. Use the measuring cylinder from the bench tools..."
                            value={st.hint || ''}
                            onChange={e => handleUpdateProcedureStep(pIdx, sIdx, 'hint', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                            Expected step observation / result (displayed on workbench)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Dense bright yellow precipitate formed / Vigorous effervescence of gas"
                            value={st.expectedResult || ''}
                            onChange={e => handleUpdateProcedureStep(pIdx, sIdx, 'expectedResult', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Workbench Simulation & Expected Results Configuration Panel */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                    Workbench Expected Color Changes & Reaction Results
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500">
                  Controls the visual liquid, precipitate & observations on student workbenches
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                    Initial Liquid Color
                  </label>
                  <input
                    type="text"
                    value={formData.simulationConfig?.colorBefore || 'Colourless'}
                    onChange={e => setFormData({
                      ...formData,
                      simulationConfig: { ...formData.simulationConfig, colorBefore: e.target.value }
                    })}
                    placeholder="e.g. Colourless, Pale blue"
                    className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                    Expected Final Color / Outcome
                  </label>
                  <input
                    type="text"
                    value={formData.simulationConfig?.colorAfter || ''}
                    onChange={e => setFormData({
                      ...formData,
                      simulationConfig: { ...formData.simulationConfig, colorAfter: e.target.value }
                    })}
                    placeholder="e.g. Bright yellow precipitate, Blue-black, Pink"
                    className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                    Expected Gas (if any)
                  </label>
                  <input
                    type="text"
                    value={formData.simulationConfig?.expectedGas || ''}
                    onChange={e => setFormData({
                      ...formData,
                      simulationConfig: { ...formData.simulationConfig, expectedGas: e.target.value }
                    })}
                    placeholder="e.g. Hydrogen (H₂), Carbon dioxide, None"
                    className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                    Teacher's Exact Expected Observation Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.simulationConfig?.expectedObservation || ''}
                    onChange={e => setFormData({
                      ...formData,
                      simulationConfig: { ...formData.simulationConfig, expectedObservation: e.target.value }
                    })}
                    placeholder="e.g. A dense yellow precipitate of lead(II) iodide is formed upon mixing Solution A and Solution B."
                    className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>

                {/* Quick Color Swatches */}
                <div className="sm:col-span-3">
                  <span className="block text-slate-600 dark:text-slate-400 mb-1 text-[11px] font-medium">
                    Quick Color Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Yellow Precipitate', hex: '#facc15', text: 'Bright yellow precipitate' },
                      { label: 'Blue-Black', hex: '#1e1b4b', text: 'Blue-black coloration' },
                      { label: 'Pale Pink', hex: '#f472b6', text: 'Permanent pale pink endpoint' },
                      { label: 'Brick-Red', hex: '#dc2626', text: 'Brick-red precipitate' },
                      { label: 'Purple', hex: '#9333ea', text: 'Purple / Violet' },
                      { label: 'Cloudy White', hex: '#fef08a', text: 'Cloudy precipitate' },
                      { label: 'Brown Precipitate', hex: '#78350f', text: 'Brown precipitate' },
                      { label: 'Green', hex: '#16a34a', text: 'Green solution' },
                      { label: 'Clear / Colourless', hex: '#e2e8f0', text: 'Colourless clear solution' }
                    ].map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          simulationConfig: {
                            ...formData.simulationConfig,
                            colorAfter: preset.text,
                            colorHexAfter: preset.hex
                          }
                        })}
                        className="px-2 py-1 rounded border text-[11px] flex items-center gap-1.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400 cursor-pointer shadow-2xs"
                      >
                        <span className="w-2.5 h-2.5 rounded-full border border-slate-300 shadow-2xs" style={{ backgroundColor: preset.hex }} />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-between border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setBuilderStep(2)}
                className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                ← Back
              </button>
              <button
                onClick={() => setBuilderStep(4)}
                className="px-4 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium text-xs shadow-sm transition-colors"
              >
                Next: Answer sheet & marking →
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: ANSWER SHEET BUILDER ================= */}
        {builderStep === 4 && (
          <div className="space-y-6 text-xs">
            
            {/* Top Toolbar */}
            <div className="p-4 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Digital answer sheet & marking scheme
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                    Add tables (e.g. Table A, Table B, Observations & Inferences) or written / calculation questions for students to complete.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddQuestion('data_table')}
                    className="px-2.5 py-1.5 rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium flex items-center gap-1 hover:bg-slate-800 dark:hover:bg-slate-200 transition"
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>+ Data Table</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddQuestion('calculation')}
                    className="px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium flex items-center gap-1 transition"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>+ Calculation</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddQuestion('observation_inference')}
                    className="px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium flex items-center gap-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>+ Obs & Inference</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddQuestion('short_answer')}
                    className="px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium flex items-center gap-1 transition"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>+ Writing</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {formData.answerSheet.length === 0 ? (
                <div className="p-8 text-center rounded-md border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-500">
                  <p>No questions added to the answer sheet yet.</p>
                  <p className="text-[11px] mt-1">Click the buttons above to add Data Tables (e.g. Table A/B), Calculations, or Writing questions.</p>
                </div>
              ) : (
                formData.answerSheet.map((q, qIdx) => (
                  <div key={q.id || qIdx} className="p-4 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-3 shadow-xs">
                    
                    {/* Header Row */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                          Question {qIdx + 1}
                        </span>
                        <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border font-semibold ${
                          q.type === 'data_table'
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                            : q.type === 'calculation'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : q.type === 'observation_inference'
                            ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        }`}>
                          {q.type.replace('_', ' ')}
                        </span>
                        {q.procedureNumber && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            (Procedure {q.procedureNumber === 1 ? 'I' : q.procedureNumber === 2 ? 'II' : q.procedureNumber})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          disabled={qIdx === 0}
                          onClick={() => handleMoveQuestion(qIdx, 'up')}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                          title="Move Up"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={qIdx === formData.answerSheet.length - 1}
                          onClick={() => handleMoveQuestion(qIdx, 'down')}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                          title="Move Down"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(qIdx)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Common Fields: Prompt, Marks, Procedure Linkage */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-8">
                        <label className="block text-slate-600 dark:text-slate-400 mb-1">Question Prompt / Title *</label>
                        <input
                          type="text"
                          value={q.prompt}
                          onChange={e => handleUpdateQuestion(qIdx, { prompt: e.target.value })}
                          placeholder="e.g. Table A: Titration of 25cm³ Solution C against Solution B"
                          className="w-full px-3 py-1.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-slate-600 dark:text-slate-400 mb-1">Max Marks</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={q.maxMarks}
                          onChange={e => handleUpdateQuestion(qIdx, { maxMarks: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-slate-600 dark:text-slate-400 mb-1">Procedure</label>
                        <select
                          value={q.procedureNumber || 1}
                          onChange={e => handleUpdateQuestion(qIdx, { procedureNumber: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                        >
                          {formData.procedures.map((p, idx) => (
                            <option key={p.id} value={p.number || idx + 1}>
                              Procedure {p.number === 1 ? 'I' : p.number === 2 ? 'II' : p.number}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* FORMAT SELECTOR: Choose whether student sees a Table or Writing */}
                    <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Student View Format:
                        </span>
                        <span className="text-[10px] text-slate-500">
                          (Select how the student will respond to this question)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleChangeQuestionType(qIdx, 'data_table')}
                          className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
                            q.type === 'data_table'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <TableIcon className="w-3.5 h-3.5" />
                          <span>Table View</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleChangeQuestionType(qIdx, 'short_answer')}
                          className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
                            q.type === 'short_answer'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>Writing View</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleChangeQuestionType(qIdx, 'calculation')}
                          className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
                            q.type === 'calculation'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Calculator className="w-3.5 h-3.5" />
                          <span>Calculation</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleChangeQuestionType(qIdx, 'observation_inference')}
                          className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
                            q.type === 'observation_inference'
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Obs & Inference</span>
                        </button>
                      </div>
                    </div>

                    {/* TYPE 1: DATA TABLE CONFIGURATION & LIVE PREVIEW */}
                    {q.type === 'data_table' && (
                      <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                            <TableIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>Data Table Configuration & Teacher's Expected Values</span>
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                handleUpdateQuestion(qIdx, {
                                  tableHeaders: ['Titre Number', 'Final burette reading (cm³)', 'Initial burette reading (cm³)', 'Volume used (cm³)'],
                                  tableRows: [
                                    { label: 'Titre I (Trial)', simulatedValue: 24.50, tolerance: 0.20 },
                                    { label: 'Titre II (Accurate)', simulatedValue: 24.50, tolerance: 0.10 },
                                    { label: 'Titre III (Accurate)', simulatedValue: 24.40, tolerance: 0.10 }
                                  ]
                                });
                                showNotification('Applied standard KCSE Titration table preset.');
                              }}
                              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                            >
                              Preset: Titration Readings Table
                            </button>
                            <span className="text-slate-300 dark:text-slate-700">|</span>
                            <button
                              type="button"
                              onClick={() => handleAddTableRow(qIdx)}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Row</span>
                            </button>
                          </div>
                        </div>

                        {/* Column Headers */}
                        <div>
                          <label className="block text-slate-600 dark:text-slate-400 text-[11px] font-medium mb-1">
                            Column Headers (comma-separated for the student table):
                          </label>
                          <input
                            type="text"
                            value={(q.tableHeaders || []).join(', ')}
                            onChange={e => handleUpdateQuestion(qIdx, { 
                              tableHeaders: e.target.value.split(',').map(h => h.trim()).filter(Boolean) 
                            })}
                            placeholder="Titre Number, Final burette reading (cm³), Initial burette reading (cm³), Volume of Solution B used (cm³)"
                            className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 font-mono"
                          />
                        </div>

                        {/* Rows table editor */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                            Rows & Expected Marking Values (Expected Reading ± Accepted Tolerance):
                          </span>
                          <div className="space-y-1.5">
                            {(q.tableRows || []).map((row, rIdx) => (
                              <div key={rIdx} className="grid grid-cols-12 gap-2 items-center text-xs">
                                <div className="col-span-5">
                                  <label className="text-[10px] text-slate-400 block mb-0.5">Row Label</label>
                                  <input
                                    type="text"
                                    value={row.label}
                                    onChange={e => handleUpdateTableRow(qIdx, rIdx, 'label', e.target.value)}
                                    placeholder="e.g. Titre I (Accurate)"
                                    className="w-full px-2 py-1 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                                  />
                                </div>
                                <div className="col-span-3">
                                  <label className="text-[10px] text-slate-400 block mb-0.5">Expected Value (cm³)</label>
                                  <input
                                    type="number"
                                    step="0.05"
                                    value={row.simulatedValue}
                                    onChange={e => handleUpdateTableRow(qIdx, rIdx, 'simulatedValue', Number(e.target.value))}
                                    placeholder="24.50"
                                    className="w-full px-2 py-1 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 font-mono"
                                  />
                                </div>
                                <div className="col-span-3">
                                  <label className="text-[10px] text-slate-400 block mb-0.5">Tolerance (± margin)</label>
                                  <input
                                    type="number"
                                    step="0.05"
                                    value={row.tolerance}
                                    onChange={e => handleUpdateTableRow(qIdx, rIdx, 'tolerance', Number(e.target.value))}
                                    placeholder="0.10"
                                    className="w-full px-2 py-1 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 font-mono"
                                  />
                                </div>
                                <div className="col-span-1 text-right pt-3">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTableRow(qIdx, rIdx)}
                                    className="text-slate-400 hover:text-rose-600 p-0.5"
                                    title="Delete row"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Live Table Preview for Teacher */}
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                            Live Preview (What Student Will See on Answer Sheet):
                          </span>
                          <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
                            <table className="w-full text-[11px] text-left">
                              <thead className="bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                  {(q.tableHeaders && q.tableHeaders.length > 0 ? q.tableHeaders : ['Trial', 'Final reading', 'Initial reading', 'Volume used']).map((h, i) => (
                                    <th key={i} className="p-2 border-r border-slate-200 dark:border-slate-800 last:border-r-0">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {(q.tableRows || []).map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                    <td className="p-2 font-medium text-slate-900 dark:text-slate-100">{row.label}</td>
                                    <td className="p-2 font-mono text-cyan-600 dark:text-cyan-400">[Student input: ~{row.simulatedValue.toFixed(2)}]</td>
                                    <td className="p-2 font-mono text-slate-500">[0.00]</td>
                                    <td className="p-2 font-mono font-bold text-emerald-600 dark:text-emerald-400">{row.simulatedValue.toFixed(2)} cm³ (±{row.tolerance})</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TYPE 2: WRITING / SHORT ANSWER CONFIGURATION & TEACHER ANSWER KEY */}
                    {q.type === 'short_answer' && (
                      <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                            <PenTool className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Written Response Setup & Official Marking Scheme</span>
                          </span>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-500">Input box style:</span>
                            <select
                              value={q.writingType || 'multi_line'}
                              onChange={e => handleUpdateQuestion(qIdx, { writingType: e.target.value as any })}
                              className="px-2 py-0.5 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
                            >
                              <option value="multi_line">Multi-line Writing Area (Equations & Explanations)</option>
                              <option value="single_line">Single-line Short Text (Deductions & Formulas)</option>
                            </select>
                          </div>
                        </div>

                        {/* Model Answer / Answer Key */}
                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-semibold text-[11px] mb-1">
                            Official Model Answer & Marking Points *
                          </label>
                          <textarea
                            rows={3}
                            value={q.modelAnswer || ''}
                            onChange={e => handleUpdateQuestion(qIdx, { modelAnswer: e.target.value })}
                            placeholder="e.g. MnO₄⁻(aq) + 5Fe²⁺(aq) + 8H⁺(aq) -> Mn²⁺(aq) + 5Fe³⁺(aq) + 4H₂O(l) (Award 1 mark for correct balancing, 1 mark for state symbols)."
                            className="w-full p-2.5 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 font-mono leading-relaxed"
                          />
                          <p className="text-[10px] text-slate-500 mt-1">
                            This answer will be shown in the grading review interface and compared with the student's written response.
                          </p>
                        </div>

                        {/* Accepted Keywords for Automatic Scoring */}
                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-semibold text-[11px] mb-1">
                            Accepted Keywords / Phrases for Auto-Scoring (comma-separated):
                          </label>
                          <input
                            type="text"
                            value={(q.acceptedKeywords || []).join(', ')}
                            onChange={e => handleUpdateQuestion(qIdx, { 
                              acceptedKeywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) 
                            })}
                            placeholder="e.g. MnO4-, Fe2+, Fe3+, Mn2+, H2O, balanced, acidic medium, pale pink"
                            className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 font-mono"
                          />
                        </div>

                        {/* Live Writing Preview */}
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                            Live Student Writing Box Preview:
                          </span>
                          <div className="p-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 space-y-1.5">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {q.prompt || 'Question prompt...'}
                            </p>
                            <div className="w-full h-16 p-2 rounded border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 text-slate-400 text-xs select-none">
                              [Student writes response here. Supported: text, chemical equations, ionic charges, subscripts]
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TYPE 3: CALCULATION CONFIGURATION */}
                    {q.type === 'calculation' && (
                      <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">
                          Calculation Marking Standard
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-slate-500 text-[11px] mb-1">Correct Numeric Value *</label>
                            <input
                              type="number"
                              step="any"
                              value={q.correctNumericValue ?? ''}
                              onChange={e => handleUpdateQuestion(qIdx, { correctNumericValue: Number(e.target.value) })}
                              placeholder="e.g. 0.0025"
                              className="w-full px-2 py-1.5 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-500 text-[11px] mb-1">Accepted Error Margin (±)</label>
                            <input
                              type="number"
                              step="any"
                              value={q.tolerance ?? 0.0001}
                              onChange={e => handleUpdateQuestion(qIdx, { tolerance: Number(e.target.value) })}
                              placeholder="e.g. 0.0001"
                              className="w-full px-2 py-1.5 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-500 text-[11px] mb-1">Measurement Unit</label>
                            <input
                              type="text"
                              value={q.unit || ''}
                              onChange={e => handleUpdateQuestion(qIdx, { unit: e.target.value })}
                              placeholder="e.g. moles, mol/dm³, cm³"
                              className="w-full px-2 py-1.5 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-500 text-[11px] mb-1">Formula / Working Hint (for student review)</label>
                          <input
                            type="text"
                            value={q.formulaHint || ''}
                            onChange={e => handleUpdateQuestion(qIdx, { formulaHint: e.target.value })}
                            placeholder="e.g. Moles = (25 * 0.1) / 1000 = 0.0025 moles"
                            className="w-full px-2 py-1.5 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {/* TYPE 4: OBSERVATION & INFERENCE CONFIGURATION */}
                    {q.type === 'observation_inference' && (
                      <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">
                          Observation & Inference Marking Keywords
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-500 text-[11px] mb-1">Accepted Observation Keywords (comma-separated)</label>
                            <input
                              type="text"
                              value={(q.observationAcceptedKeywords || []).join(', ')}
                              onChange={e => handleUpdateQuestion(qIdx, {
                                observationAcceptedKeywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                              })}
                              placeholder="e.g. colourless liquid, white residue, pale pink"
                              className="w-full px-2 py-1.5 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-500 text-[11px] mb-1">Accepted Inference Keywords (comma-separated)</label>
                            <input
                              type="text"
                              value={(q.inferenceAcceptedKeywords || []).join(', ')}
                              onChange={e => handleUpdateQuestion(qIdx, {
                                inferenceAcceptedKeywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                              })}
                              placeholder="e.g. hydrated solid, OH-, neutralisation"
                              className="w-full px-2 py-1.5 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-500 text-[11px] mb-1">Model Answer / Marking Note</label>
                          <input
                            type="text"
                            value={q.modelAnswer || ''}
                            onChange={e => handleUpdateQuestion(qIdx, { modelAnswer: e.target.value })}
                            placeholder="e.g. Accept: colourless vapour condenses on cooler parts. Reject: liquid condensing."
                            className="w-full px-2 py-1.5 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                          />
                        </div>
                      </div>
                    )}

                  </div>
                ))
              )}
            </div>

            <div className="pt-4 flex justify-between border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setBuilderStep(3)}
                className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                ← Back to procedures
              </button>
              <button
                onClick={handlePublish}
                className="px-4 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium text-xs shadow-sm transition-colors flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{editingExperiment ? 'Save modifications' : 'Publish practical project'}</span>
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
