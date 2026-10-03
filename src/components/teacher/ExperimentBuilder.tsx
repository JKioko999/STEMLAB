import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, 
  FlaskConical, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle, 
  Sparkles, 
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
  Award
} from 'lucide-react';
import { ExperimentSpec, SubjectType, SimulationType, ExperimentStep, ApparatusItem } from '../../types';

// Pre-stocked KCSE Standard Apparatus Catalog
const APPARATUS_CATALOG: Omit<ApparatusItem, 'id'>[] = [
  // Chemistry
  { name: '50cm³ Burette with Teflon Tap', subject: 'chemistry', icon: 'Burette' },
  { name: '250cm³ Conical Flask', subject: 'chemistry', icon: 'FlaskConical' },
  { name: '25.0cm³ Pipette & Safety Filler', subject: 'chemistry', icon: 'Pipette' },
  { name: 'Retort Stand & Burette Clamp', subject: 'chemistry', icon: 'Clamp' },
  { name: '50cm³ Measuring Cylinder', subject: 'chemistry', icon: 'Cylinder' },
  { name: '100cm³ Measuring Cylinder', subject: 'chemistry', icon: 'Cylinder' },
  { name: 'White Ceramic Inspection Tile', subject: 'chemistry', icon: 'Square' },
  { name: 'Wooden Test Tube Rack (6 Holes)', subject: 'chemistry', icon: 'Layers' },
  { name: 'Boiling Tubes (Pyrex Glass)', subject: 'chemistry', icon: 'TestTube' },
  { name: 'Phenolphthalein Indicator Dropper', subject: 'chemistry', icon: 'Droplets' },
  { name: 'Methyl Orange Indicator Dropper', subject: 'chemistry', icon: 'Droplets' },
  { name: 'Solution A: Dilute HCl (0.10M)', subject: 'chemistry', icon: 'Beaker' },
  { name: 'Solution B: Standard NaOH (0.10M)', subject: 'chemistry', icon: 'Beaker' },
  { name: '2.0M Sodium Hydroxide Reagent', subject: 'chemistry', icon: 'Beaker' },
  { name: '2.0M Aqueous Ammonia Reagent', subject: 'chemistry', icon: 'Beaker' },
  { name: '0.5M Barium Nitrate Solution', subject: 'chemistry', icon: 'Beaker' },
  { name: 'Plastic Cup Calorimeter with Lid', subject: 'chemistry', icon: 'Beaker' },
  { name: '0 - 50°C Precision Thermometer', subject: 'chemistry', icon: 'Activity' },
  { name: 'Bunsen Burner & Wire Gauze', subject: 'chemistry', icon: 'Flame' },
  { name: 'Tripod Stand', subject: 'chemistry', icon: 'Layers' },
  
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
  steps: ExperimentStep[];
  expectedTableValue: number;
  tableTolerance: number;
  calculationPrompt: string;
  correctCalculationValue: number;
  calculationTolerance: number;
  calculationUnit: string;
  formulaHint: string;
  observationKeywords: string;
  inferenceKeywords: string;
}

export const ExperimentBuilder: React.FC = () => {
  const { currentUser, createExperiment, updateExperiment, editingExperiment, setCurrentView } = useApp();

  const [builderStep, setBuilderStep] = useState<number>(1);
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [catalogSubjectFilter, setCatalogSubjectFilter] = useState<'all' | 'chemistry' | 'physics' | 'biology'>('all');
  
  // Custom apparatus form
  const [customApparatusName, setCustomApparatusName] = useState<string>('');
  const [customIsDistractor, setCustomIsDistractor] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Helper to extract form data from an existing experiment spec
  const buildFormDataFromSpec = (exp: ExperimentSpec | null): BuilderFormData => {
    if (exp) {
      const tableQ = exp.answerSheet?.find(q => q.type === 'data_table');
      const calcQ = exp.answerSheet?.find(q => q.type === 'calculation');
      const obsQ = exp.answerSheet?.find(q => q.type === 'observation_inference');

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
        steps: exp.steps ? (JSON.parse(JSON.stringify(exp.steps)) as ExperimentStep[]) : [],
        expectedTableValue: tableQ?.tableRows?.[0]?.simulatedValue || exp.simulationConfig?.equivalencePointCm3 || 24.50,
        tableTolerance: tableQ?.tableRows?.[0]?.tolerance || 0.20,
        calculationPrompt: calcQ?.prompt || 'Calculate the concentration of the unknown solution.',
        correctCalculationValue: calcQ?.correctNumericValue || 0.10,
        calculationTolerance: calcQ?.tolerance || 0.005,
        calculationUnit: calcQ?.unit || 'mol/L (M)',
        formulaHint: calcQ?.formulaHint || '',
        observationKeywords: obsQ?.observationAcceptedKeywords ? obsQ.observationAcceptedKeywords.join(', ') : 'pink to colourless, permanent clear',
        inferenceKeywords: obsQ?.inferenceAcceptedKeywords ? obsQ.inferenceAcceptedKeywords.join(', ') : 'neutralisation, equivalence point'
      };
    }

    return {
      title: 'Standardization of Hydrochloric Acid with 0.10M Sodium Hydroxide',
      subject: 'chemistry' as SubjectType,
      kcsePaper: '233/3 (KCSE Chemistry Practical)',
      topic: 'Acids, Bases & Volumetric Titration',
      objectives: 'Determine the exact molar concentration of hydrochloric acid using phenolphthalein indicator and 0.10M standard NaOH.',
      durationMinutes: 45,
      simulationType: 'titration' as SimulationType,
      visibility: 'teacher' as 'teacher' | 'school',
      apparatus: [
        { id: 'app-burette', name: '50cm³ Burette with Teflon Tap', subject: 'chemistry', icon: 'Burette' },
        { id: 'app-flask', name: '250cm³ Conical Flask', subject: 'chemistry', icon: 'FlaskConical' },
        { id: 'app-pipette', name: '25.0cm³ Pipette & Safety Filler', subject: 'chemistry', icon: 'Pipette' },
        { id: 'app-stand', name: 'Retort Stand & Burette Clamp', subject: 'chemistry', icon: 'Clamp' },
        { id: 'app-white-tile', name: 'White Ceramic Inspection Tile', subject: 'chemistry', icon: 'Square' },
        { id: 'app-indicator-phen', name: 'Phenolphthalein Indicator Dropper', subject: 'chemistry', icon: 'Droplets' },
        { id: 'app-reagent-naoh', name: 'Solution B: Standard NaOH (0.10M)', subject: 'chemistry', icon: 'Beaker' },
        { id: 'app-reagent-hcl', name: 'Solution A: Dilute HCl (0.10M)', subject: 'chemistry', icon: 'Beaker' },
        { id: 'app-distractor-burner', name: 'Bunsen Burner (Not Required)', subject: 'chemistry', icon: 'Flame', isDistractor: true }
      ],
      steps: [
        {
          id: 1,
          instruction: 'Mount the burette onto the retort stand and charge it with Solution A (Hydrochloric acid) up to the 0.00 cm³ mark, checking that no air bubble remains in the tip.',
          validationType: 'apparatus_placed' as const,
          validationDetail: 'Burette filled and clamped',
          marks: 1,
          hint: 'Use the fill tap or funnel to charge the burette with Solution A.',
          allowForcePush: true
        },
        {
          id: 2,
          instruction: 'Pipette exactly 25.0 cm³ of Solution B (Sodium hydroxide) into the clean conical flask resting upon the white ceramic tile.',
          validationType: 'volume_set' as const,
          validationDetail: '25.0 cm³ Solution B in flask',
          marks: 2,
          hint: 'Ensure bottom of meniscus aligns with graduation mark.',
          allowForcePush: true
        },
        {
          id: 3,
          instruction: 'Add 2 drops of phenolphthalein indicator into the flask and swirl gently. Titrate with Solution A until the pink color permanently disappears.',
          validationType: 'reagent_added' as const,
          validationDetail: 'End point reached',
          marks: 2,
          hint: 'Deliver micro-drops near the 24.50 cm³ equivalence mark.',
          allowForcePush: false
        }
      ],
      expectedTableValue: 24.50,
      tableTolerance: 0.20,
      calculationPrompt: 'Calculate the concentration of the Hydrochloric acid in moles per litre (mol/L).',
      correctCalculationValue: 0.102,
      calculationTolerance: 0.005,
      calculationUnit: 'mol/L (M)',
      formulaHint: 'M_A = (0.10 * 25.0) / V_average',
      observationKeywords: 'pink to colourless, permanent clear, pink disappears',
      inferenceKeywords: 'neutralisation, equivalence point, strong acid strong base'
    };
  };

  // Form State for experiment
  const [formData, setFormData] = useState<BuilderFormData>(() => buildFormDataFromSpec(editingExperiment));

  // Sync when editingExperiment changes
  useEffect(() => {
    setFormData(buildFormDataFromSpec(editingExperiment));
  }, [editingExperiment]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
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

  // Step handlers
  const handleAddStep = () => {
    const nextId = formData.steps.length + 1;
    const newStep: ExperimentStep = {
      id: nextId,
      instruction: `Step ${nextId}: Describe the laboratory task for students here...`,
      validationType: 'apparatus_placed',
      marks: 1,
      hint: '',
      allowForcePush: true
    };
    setFormData({ ...formData, steps: [...formData.steps, newStep] });
  };

  const handleUpdateStep = (index: number, field: keyof ExperimentStep, value: any) => {
    const updated = [...formData.steps];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, steps: updated });
  };

  const handleDeleteStep = (index: number) => {
    const updated = formData.steps.filter((_, i) => i !== index).map((st, i) => ({ ...st, id: i + 1 }));
    setFormData({ ...formData, steps: updated });
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

    const isExistingTeacherExp = Boolean(
      editingExperiment && 
      (editingExperiment.ownerType === 'teacher' || editingExperiment.id.startsWith('exp-custom-') || editingExperiment.id.startsWith('exp-cloned-') || editingExperiment.id.startsWith('exp-teacher-'))
    );

    const targetId = isExistingTeacherExp && editingExperiment ? editingExperiment.id : `exp-teacher-${Date.now().toString(36)}`;

    const targetSpec: ExperimentSpec = {
      id: targetId,
      subject: formData.subject,
      title: formData.title,
      kcsePaper: formData.kcsePaper,
      topic: formData.topic,
      objectives: formData.objectives.split('\n').filter(Boolean),
      estimatedDurationMinutes: Number(formData.durationMinutes),
      apparatus: formData.apparatus,
      steps: formData.steps,
      simulationType: formData.simulationType,
      simulationConfig: {
        ...(editingExperiment?.simulationConfig || {}),
        acidConcentrationM: 0.10,
        baseVolumeCm3: 25.0,
        equivalencePointCm3: formData.expectedTableValue,
        emfVoltage: 3.0,
        resistorValues: [2, 4, 6, 8, 10]
      },
      answerSheet: [
        {
          id: 'q-table-main',
          type: 'data_table',
          prompt: `Table 1: Experimental Readings & Concordancy Test for ${formData.title}`,
          maxMarks: 5,
          tableHeaders: ['Trial Number', 'Final Reading', 'Initial Reading', 'Volume / Quantity Used'],
          tableRows: [
            { label: 'Titre I (Trial)', simulatedValue: formData.expectedTableValue, tolerance: formData.tableTolerance },
            { label: 'Titre II (Accurate)', simulatedValue: formData.expectedTableValue, tolerance: formData.tableTolerance },
            { label: 'Titre III (Accurate)', simulatedValue: formData.expectedTableValue - 0.1, tolerance: formData.tableTolerance }
          ]
        },
        {
          id: 'q-calc-main',
          type: 'calculation',
          prompt: formData.calculationPrompt,
          maxMarks: 3,
          correctNumericValue: formData.correctCalculationValue,
          tolerance: formData.calculationTolerance,
          unit: formData.calculationUnit,
          formulaHint: formData.formulaHint
        },
        {
          id: 'q-obs-main',
          type: 'observation_inference',
          prompt: 'Record your detailed observation and provide the corresponding scientific inference.',
          maxMarks: 2,
          observationAcceptedKeywords: formData.observationKeywords.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
          inferenceAcceptedKeywords: formData.inferenceKeywords.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
        }
      ],
      ownerType: formData.visibility === 'school' ? 'school' : 'teacher',
      schoolId: currentUser?.schoolId,
      teacherId: currentUser?.id,
      authorName: currentUser?.name || 'Science Teacher',
      status: 'published'
    };

    if (isExistingTeacherExp) {
      updateExperiment(targetSpec);
      showNotification(`Saved modifications to "${targetSpec.title}" successfully!`);
    } else {
      createExperiment(targetSpec);
      showNotification(`Published customized practical "${targetSpec.title}"!`);
    }

    setTimeout(() => {
      setCurrentView('dashboard');
    }, 1200);
  };

  // Filter catalog
  const filteredCatalog = APPARATUS_CATALOG.filter(item => {
    const matchesSubject = catalogSubjectFilter === 'all' || item.subject === catalogSubjectFilter;
    const matchesSearch = item.name.toLowerCase().includes(catalogSearch.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Teacher Dashboard</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
            KCSE Custom Practical Creator
          </span>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Editing Banner */}
      {editingExperiment && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-300 text-sm block">
                Editing Practical: {editingExperiment.title}
              </span>
              <span className="text-[11px] text-amber-200/90">
                You have full control to modify apparatus items, add or rewrite procedure steps, change marks, update hints, and adjust simulation parameters before assigning to your class.
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30 whitespace-nowrap self-start sm:self-auto">
            Teacher Customization Mode
          </span>
        </div>
      )}

      <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-6">
        
        <div>
          <h1 className="text-2xl font-black text-white">Design & Customize KCSE Practical</h1>
          <p className="text-xs text-slate-400 mt-1">
            Pick your own apparatus, choose the calculation engine, write instructions, and set the reference answer marking scheme.
          </p>
        </div>

        {/* 4 Step Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-slate-700 pb-4 text-xs font-bold">
          <button
            onClick={() => setBuilderStep(1)}
            className={`p-2.5 rounded-xl border text-center transition ${
              builderStep === 1 ? 'bg-amber-600 text-white border-amber-500 shadow' : 'bg-slate-900 border-slate-750 text-slate-400'
            }`}
          >
            1. Title & Subject
          </button>
          <button
            onClick={() => setBuilderStep(2)}
            className={`p-2.5 rounded-xl border text-center transition ${
              builderStep === 2 ? 'bg-amber-600 text-white border-amber-500 shadow' : 'bg-slate-900 border-slate-750 text-slate-400'
            }`}
          >
            2. Apparatus & Bench ({formData.apparatus.length})
          </button>
          <button
            onClick={() => setBuilderStep(3)}
            className={`p-2.5 rounded-xl border text-center transition ${
              builderStep === 3 ? 'bg-amber-600 text-white border-amber-500 shadow' : 'bg-slate-900 border-slate-750 text-slate-400'
            }`}
          >
            3. Guided Steps ({formData.steps.length})
          </button>
          <button
            onClick={() => setBuilderStep(4)}
            className={`p-2.5 rounded-xl border text-center transition ${
              builderStep === 4 ? 'bg-amber-600 text-white border-amber-500 shadow' : 'bg-slate-900 border-slate-750 text-slate-400'
            }`}
          >
            4. Answer Key & Publish
          </button>
        </div>

        {/* ================= STEP 1: IDENTITY ================= */}
        {builderStep === 1 && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Experiment Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Volumetric Analysis of Dibasic Acid using 0.1M NaOH"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subject</label>
                <select
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="chemistry">Chemistry</option>
                  <option value="physics">Physics</option>
                  <option value="biology">Biology</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">KCSE Paper Code</label>
                <input
                  type="text"
                  value={formData.kcsePaper}
                  onChange={e => setFormData({ ...formData, kcsePaper: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Estimated Duration (Mins)</label>
                <input
                  type="number"
                  value={formData.durationMinutes}
                  onChange={e => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Curriculum Topic / Strand</label>
              <input
                type="text"
                value={formData.topic}
                onChange={e => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g. Volumetric Analysis or Current Electricity"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Learning Objectives</label>
              <textarea
                rows={3}
                value={formData.objectives}
                onChange={e => setFormData({ ...formData, objectives: e.target.value })}
                placeholder="What practical skills will the candidate master?"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Visibility Scope</label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.visibility === 'teacher'}
                    onChange={() => setFormData({ ...formData, visibility: 'teacher' })}
                  />
                  <span>Private to my assigned class streams</span>
                </label>
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.visibility === 'school'}
                    onChange={() => setFormData({ ...formData, visibility: 'school' })}
                  />
                  <span>Publish school-wide for all teachers at my institution</span>
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setBuilderStep(2)}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
              >
                Proceed to Apparatus & Bench Engine →
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: APPARATUS & BENCH ================= */}
        {builderStep === 2 && (
          <div className="space-y-6 text-xs">
            
            {/* Simulation Engine Explanation Card */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Info className="w-4 h-4 text-amber-400" />
                <span>What is a Simulation Engine?</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                The <strong>Simulation Engine</strong> is the mathematical and physics calculator running behind the screen. It decides how the bench behaves—for example, calculating titration neutralization curves (M₁V₁ = M₂V₂), ammeter needle deflections in circuits (V = IR), or boiling water bath color transitions in food tests.
              </p>
              
              <div className="pt-2">
                <label className="block text-slate-200 font-bold mb-1.5">
                  Select the Workbench Engine for this practical:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div 
                    onClick={() => setFormData({ ...formData, simulationType: 'titration' })}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      formData.simulationType === 'titration'
                        ? 'bg-amber-950/60 border-amber-400 text-white shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 text-xs text-amber-300">
                      <FlaskConical className="w-4 h-4" />
                      <span>Volumetric Titration Engine</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Models burette meniscus, dropwise flow, endpoint color changes & over-titration.
                    </p>
                  </div>

                  <div 
                    onClick={() => setFormData({ ...formData, simulationType: 'circuit' })}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      formData.simulationType === 'circuit'
                        ? 'bg-amber-950/60 border-amber-400 text-white shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 text-xs text-cyan-300">
                      <Zap className="w-4 h-4" />
                      <span>Ohm's Law & Circuit Engine</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Computes current, voltage, short circuits, polarity checks & rheostat sliding.
                    </p>
                  </div>

                  <div 
                    onClick={() => setFormData({ ...formData, simulationType: 'qualitative' })}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      formData.simulationType === 'qualitative'
                        ? 'bg-amber-950/60 border-amber-400 text-white shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 text-xs text-teal-300">
                      <Sparkles className="w-4 h-4" />
                      <span>Qualitative Analysis Engine</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Precipitate formation, solubility in excess reagent & white ceramic spot tiles.
                    </p>
                  </div>

                  <div 
                    onClick={() => setFormData({ ...formData, simulationType: 'food_test' })}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      formData.simulationType === 'food_test'
                        ? 'bg-amber-950/60 border-amber-400 text-white shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 text-xs text-rose-300">
                      <Flame className="w-4 h-4" />
                      <span>Biochemical Food Tests Engine</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      95°C water bath heating, Benedict's color gradient, Biuret peptide & iodine.
                    </p>
                  </div>

                  <div 
                    onClick={() => setFormData({ ...formData, simulationType: 'hookes_law' })}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      formData.simulationType === 'hookes_law'
                        ? 'bg-amber-950/60 border-amber-400 text-white shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 text-xs text-emerald-300">
                      <Scale className="w-4 h-4" />
                      <span>Hooke's Law Mechanics Engine</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Helical spring elasticity, slotted weights, eye-level parallax & elastic limit.
                    </p>
                  </div>

                  <div 
                    onClick={() => setFormData({ ...formData, simulationType: 'general' })}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      formData.simulationType === 'general'
                        ? 'bg-amber-950/60 border-amber-400 text-white shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 text-xs text-violet-300">
                      <Layers className="w-4 h-4" />
                      <span>Universal Multi-Purpose Lab Bench</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Works for ANY other practical (Thermochemistry, Optics, Pendulum, Rates of Reaction, Ecology, Osmosis).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Apparatus for this Experiment */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Apparatus Selected for Students ({formData.apparatus.length})</span>
                    <span className="text-[11px] font-normal text-slate-400">
                      (These items appear in the student's apparatus locker)
                    </span>
                  </h3>
                </div>
              </div>

              {formData.apparatus.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-slate-900 border border-dashed border-slate-700 text-slate-400">
                  No apparatus selected yet. Pick items from the catalog below or add your own custom item.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {formData.apparatus.map(item => (
                    <div 
                      key={item.id} 
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                        item.isDistractor 
                          ? 'bg-rose-950/20 border-rose-500/40 text-rose-200' 
                          : 'bg-slate-900 border-slate-750 text-white'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-semibold text-xs truncate">{item.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <button
                            type="button"
                            onClick={() => handleToggleDistractor(item.id)}
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                              item.isDistractor
                                ? 'bg-rose-600 text-white border-rose-500'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                            }`}
                            title="Distractor items test if student selects the correct apparatus"
                          >
                            {item.isDistractor ? 'Distractor (Not Needed)' : 'Required Item'}
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveApparatus(item.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Remove apparatus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Custom Apparatus Box */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-750 space-y-3">
              <span className="font-bold text-white text-xs block">
                Add Any Custom Apparatus / Chemical
              </span>
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <input
                  type="text"
                  value={customApparatusName}
                  onChange={e => setCustomApparatusName(e.target.value)}
                  placeholder="e.g. 0.25M Oxalic Acid Solution, Platinum Wire Loop, or Calorimeter Cup"
                  className="flex-1 w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-750 text-white text-xs focus:outline-none focus:border-amber-500"
                />

                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={customIsDistractor}
                    onChange={e => setCustomIsDistractor(e.target.checked)}
                  />
                  <span>Mark as Distractor</span>
                </label>

                <button
                  type="button"
                  onClick={handleCreateCustomApparatus}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Apparatus</span>
                </button>
              </div>
            </div>

            {/* Browse KCSE Apparatus Catalog */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-bold text-white text-xs">
                  Pick from Stocked KCSE Practical Catalog
                </span>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={e => setCatalogSearch(e.target.value)}
                    placeholder="Search apparatus..."
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                  <select
                    value={catalogSubjectFilter}
                    onChange={e => setCatalogSubjectFilter(e.target.value as any)}
                    className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                  >
                    <option value="all">All Subjects</option>
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
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 opacity-60'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500 hover:text-white'
                      }`}
                    >
                      <span className="truncate">{item.name}</span>
                      {isAdded ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex justify-between border-t border-slate-800">
              <button
                onClick={() => setBuilderStep(1)}
                className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 font-semibold"
              >
                ← Back to Title
              </button>
              <button
                onClick={() => setBuilderStep(3)}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
              >
                Proceed to Guided Steps →
              </button>
            </div>

          </div>
        )}

        {/* ================= STEP 3: GUIDED STEPS ================= */}
        {builderStep === 3 && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Define Step-by-Step Practical Sequence</h3>
                <p className="text-slate-400 text-xs">Each step provides an instruction, validation trigger, marks, and optional hint.</p>
              </div>

              <button
                onClick={handleAddStep}
                className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-650 text-white font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.steps.map((st, idx) => (
                <div key={st.id} className="p-4 rounded-xl bg-slate-900 border border-slate-750 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400">Step {st.id}</span>
                    <button
                      onClick={() => handleDeleteStep(idx)}
                      className="text-rose-400 hover:text-rose-300"
                      title="Delete step"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Instruction Text</label>
                    <textarea
                      rows={2}
                      value={st.instruction}
                      onChange={e => handleUpdateStep(idx, 'instruction', e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-950 border border-slate-750 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Validation Action</label>
                      <select
                        value={st.validationType}
                        onChange={e => handleUpdateStep(idx, 'validationType', e.target.value)}
                        className="w-full p-1.5 rounded-lg bg-slate-950 border border-slate-750 text-white"
                      >
                        <option value="apparatus_placed">Apparatus Placed on Bench</option>
                        <option value="connection_made">Electrical Connection Made</option>
                        <option value="volume_set">Liquid Volume Pipetted/Measured</option>
                        <option value="reagent_added">Chemical Reagent Added</option>
                        <option value="reading_recorded">Meter/Burette Reading Taken</option>
                        <option value="run_simulation">Run Simulation Test</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Step Marks (KCSE)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={st.marks}
                        onChange={e => handleUpdateStep(idx, 'marks', Number(e.target.value))}
                        className="w-full p-1.5 rounded-lg bg-slate-950 border border-slate-750 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Allow Force-Push (Override)?</label>
                      <label className="flex items-center space-x-2 pt-1 text-slate-300">
                        <input
                          type="checkbox"
                          checked={st.allowForcePush}
                          onChange={e => handleUpdateStep(idx, 'allowForcePush', e.target.checked)}
                        />
                        <span>Allow student override</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Practice Mode Hint (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Deliver micro-drops slowly when approaching the endpoint..."
                      value={st.hint || ''}
                      onChange={e => handleUpdateStep(idx, 'hint', e.target.value)}
                      className="w-full p-1.5 rounded-lg bg-slate-950 border border-slate-750 text-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between">
              <button
                onClick={() => setBuilderStep(2)}
                className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 font-semibold"
              >
                ← Back to Apparatus
              </button>
              <button
                onClick={() => setBuilderStep(4)}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
              >
                Set Answer Scheme & Marking Key →
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: ANSWER SCHEME & PUBLISH ================= */}
        {builderStep === 4 && (
          <div className="space-y-5 text-xs">
            
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-750 space-y-4">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Reference Answer Key & Auto-Grading Standards</span>
              </div>
              <p className="text-slate-400 text-xs">
                Define the expected theoretical answers and tolerance margins. The system will use these to grade student answer sheets automatically.
              </p>

              {/* Data Table expected answer */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-bold text-white text-xs block">
                  1. Data Table 1 Expected Readings
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Expected Standard Reading</label>
                    <input
                      type="number"
                      step="0.05"
                      value={formData.expectedTableValue}
                      onChange={e => setFormData({ ...formData, expectedTableValue: Number(e.target.value) })}
                      placeholder="e.g. 24.50"
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Accepted KNEC Concordancy Tolerance (±)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={formData.tableTolerance}
                      onChange={e => setFormData({ ...formData, tableTolerance: Number(e.target.value) })}
                      placeholder="e.g. 0.20"
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Calculation Question expected answer */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-bold text-white text-xs block">
                  2. Calculation Question & Formula
                </span>
                <div>
                  <label className="block text-slate-400 mb-1">Calculation Prompt</label>
                  <input
                    type="text"
                    value={formData.calculationPrompt}
                    onChange={e => setFormData({ ...formData, calculationPrompt: e.target.value })}
                    className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Expected Numeric Result</label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.correctCalculationValue}
                      onChange={e => setFormData({ ...formData, correctCalculationValue: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Accepted Error Margin (±)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.calculationTolerance}
                      onChange={e => setFormData({ ...formData, calculationTolerance: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Result Unit</label>
                    <input
                      type="text"
                      value={formData.calculationUnit}
                      onChange={e => setFormData({ ...formData, calculationUnit: e.target.value })}
                      placeholder="e.g. mol/L or Ω or Joules"
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Marking Formula Hint</label>
                  <input
                    type="text"
                    value={formData.formulaHint}
                    onChange={e => setFormData({ ...formData, formulaHint: e.target.value })}
                    className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Observation & Inference keywords */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-bold text-white text-xs block">
                  3. Observation & Inference Marking Scheme
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Expected Observation Keywords (comma separated)</label>
                    <input
                      type="text"
                      value={formData.observationKeywords}
                      onChange={e => setFormData({ ...formData, observationKeywords: e.target.value })}
                      placeholder="e.g. pink to colourless, clear solution"
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Expected Inference Keywords (comma separated)</label>
                    <input
                      type="text"
                      value={formData.inferenceKeywords}
                      onChange={e => setFormData({ ...formData, inferenceKeywords: e.target.value })}
                      placeholder="e.g. neutralisation, equivalence point"
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-[11px]"
                    />
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-4 flex justify-between border-t border-slate-700">
              <button
                onClick={() => setBuilderStep(3)}
                className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 font-semibold"
              >
                ← Back to Steps
              </button>
              <button
                onClick={handlePublish}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold flex items-center space-x-2 shadow-xl shadow-emerald-600/30 text-sm"
              >
                <Save className="w-4 h-4" />
                <span>{editingExperiment ? 'Save Modifications & Update Practical' : 'Publish Custom Practical to Catalog'}</span>
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
