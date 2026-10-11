import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Play, 
  ArrowRight,
  FlaskConical,
  Zap,
  Dna,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  Award,
  HelpCircle,
  ChevronDown,
  Layers,
  ChevronRight,
  Clock,
  Eye,
  Beaker,
  Thermometer,
  Activity,
  FileText,
  Home,
  Building2,
  Droplets,
  Microscope,
  Check,
  ExternalLink,
  Info,
  Scale,
  Flame,
  ArrowUp,
  Mail,
  Phone,
  MapPin,
  Globe,
  Shield
} from 'lucide-react';
import labBannerImg from '../../assets/images/science_lab_banner_1791271184391.jpg';
import titrationBenchImg from '../../assets/images/titration_bench_1791271199117.jpg';
import physicsBenchImg from '../../assets/images/physics_circuit_bench_1791705834906.jpg';
import biologyBenchImg from '../../assets/images/biology_food_testing_1791705847555.jpg';
import teacherStudioImg from '../../assets/images/workflow_teacher_studio_1791560694991.jpg';
import pipettingStepImg from '../../assets/images/workflow_pipetting_step_1791560652846.jpg';
import buretteSetupImg from '../../assets/images/workflow_burette_setup_1791560633247.jpg';
import endpointColorImg from '../../assets/images/workflow_endpoint_color_1791560664497.jpg';
import resultsTableImg from '../../assets/images/workflow_results_table_1791560685872.jpg';
import teacherAnalyticsImg from '../../assets/images/workflow_teacher_analytics_1791560720875.jpg';

export const LandingPage: React.FC = () => {
  const { 
    currentUser, 
    setCurrentView, 
    setAuthMode, 
    experiments, 
    startExperiment,
    landingTab,
    setLandingTab
  } = useApp();

  // Internal tab state for subject explorer
  const [activeSubjectTab, setActiveSubjectTab] = useState<'chemistry' | 'physics' | 'biology'>('chemistry');
  const [selectedWorkflowStep, setSelectedWorkflowStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [legalModalContent, setLegalModalContent] = useState<{ title: string; text: string } | null>(null);

  // Interactive Mini-Workbench Sandbox Demo State (allows direct test-drive without logging in)
  const [sandboxVolume, setSandboxVolume] = useState<number>(0.0);
  const [sandboxIndicator, setSandboxIndicator] = useState<'none' | 'methyl_orange' | 'phenolphthalein'>('methyl_orange');
  const [sandboxSwirling, setSandboxSwirling] = useState<boolean>(false);
  const [sandboxIsPouring, setSandboxIsPouring] = useState<boolean>(false);

  // Derive sandbox color based on volume and indicator
  const getSandboxFlaskColor = () => {
    if (sandboxIndicator === 'none') return 'rgba(224, 242, 254, 0.4)';
    if (sandboxIndicator === 'phenolphthalein') {
      // Colorless in acid, turns pale pink at endpoint ~24.50 mL
      if (sandboxVolume >= 24.5) return 'rgba(244, 114, 182, 0.85)';
      if (sandboxVolume >= 24.0) return 'rgba(251, 207, 232, 0.5)';
      return 'rgba(241, 245, 249, 0.4)';
    }
    // Methyl Orange: Yellow in alkali, transitions to orange/pink at endpoint ~24.50 mL
    if (sandboxVolume >= 24.5) return 'rgba(244, 63, 94, 0.85)'; // pink/orange endpoint
    if (sandboxVolume >= 23.5) return 'rgba(251, 146, 60, 0.8)'; // transition orange
    return 'rgba(250, 204, 21, 0.85)'; // alkaline yellow
  };

  const handleSandboxPourStep = () => {
    setSandboxIsPouring(true);
    setSandboxSwirling(true);
    setTimeout(() => {
      setSandboxVolume(prev => Math.min(25.0, +(prev + 5.0).toFixed(2)));
      setSandboxIsPouring(false);
      setTimeout(() => setSandboxSwirling(false), 500);
    }, 400);
  };

  const handleSandboxReset = () => {
    setSandboxVolume(0.0);
    setSandboxIsPouring(false);
    setSandboxSwirling(false);
  };

  const workflowSteps = [
    {
      id: 'teacher-studio',
      badge: 'Workflow A: Creation',
      title: 'Teacher AI Experiment Creation Studio',
      subtitle: 'Natural language parsing of raw instructions with automated apparatus disambiguation.',
      image: teacherStudioImg,
      description: 'The teacher inputs raw instructions (e.g. "Fill burrete with Solution N, Pippete 25cm3 of sodium hydroxide M..."). The AI parser cleans typographic errors, isolates glassware (50ml Burette, 25ml Pipette, Conical Flask, Methyl Orange), and synthesizes a live simulation preview with auto-calculated rubric parameters.',
      highlights: ['Apparatus Auto-Detection', 'Spelling Disambiguation', 'Simulation Workbench Synthesis', 'Rubric Blueprinting']
    },
    {
      id: 'step-pipetting',
      badge: 'Workflow B: Step 1 & 2',
      title: 'Volumetric Pipetting & Indicator Preparation',
      subtitle: 'Accurate dispensing of 25.0 cm³ of Solution M (0.2M NaOH) into the conical flask.',
      image: pipettingStepImg,
      description: 'The student manipulates the 25.0 cm³ bulb pipette with a safety filler bulb to transfer exactly 25.0 mL of Solution M into a 250ml conical flask. The student then adds 2-3 drops of Methyl Orange indicator from the dropper bottle, turning the alkaline solution a vibrant yellow.',
      highlights: ['25.0 cm³ Bulb Pipette', 'Safety Filler Operation', 'Methyl Orange Indicator', 'Yellow Alkaline Solution']
    },
    {
      id: 'step-burette',
      badge: 'Workflow B: Step 3 & 4',
      title: '50ml Burette Stand Assembly & Meniscus Priming',
      subtitle: 'Retort stand clamping, Solution N (HCl) filling, and stopcock flow controls.',
      image: buretteSetupImg,
      description: 'A 50.0 cm³ calibrated glass burette is mounted on an iron retort stand and filled with dilute hydrochloric acid (Solution N) up to the 0.00 cm³ meniscus mark. The conical flask rests on a white ceramic tile under the burette jet. The student operates digital flow controls (Off, Slow, Dropwise, Fast).',
      highlights: ['50.0 cm³ Calibrated Burette', 'Iron Retort Stand Clamp', 'White Ceramic Tile Base', 'Dropwise Stopcock Flow']
    },
    {
      id: 'step-endpoint',
      badge: 'Workflow B: Step 5 & 6',
      title: 'Titration Execution & Stoichiometric Endpoint Shift',
      subtitle: 'Observing the sharp color transition from yellow to orange/pink at 24.50 cm³.',
      image: endpointColorImg,
      description: 'As titrant is added dropwise with gentle flask swirling, the student observes the instantaneous stoichiometric equivalence point at 24.50 cm³. The solution shifts permanently from yellow to orange/salmon pink. Real-time telemetry records the volume and displays the titration curve.',
      highlights: ['Equivalence Point: 24.50 cm³', 'Yellow to Pink Color Shift', 'Real-Time pH Telemetry Curve', 'Over-Titration Detection']
    },
    {
      id: 'step-results',
      badge: 'Workflow B: Step 7 & 8',
      title: 'Table I Multi-Trial Recording & RAM Determination',
      subtitle: 'Concordancy verification (±0.10 cm³) and step-by-step chemical equations.',
      image: resultsTableImg,
      description: 'The student completes 3 consecutive trials in Table I (24.50, 24.60, 24.40 cm³) and computes the average titre (24.50 cm³). The student calculates moles of base, concentration of acid N (0.102 M), and solves for the Relative Atomic Mass of element F in carbonate F₂CO₃ (RAM = 23.0, identifying Sodium).',
      highlights: ['3-Trial Titration Table I', 'Concordancy within ±0.20 cm³', 'Concentration of Acid N', 'RAM of F in F₂CO₃ = 23.0 (Na)']
    },
    {
      id: 'step-analytics',
      badge: 'Workflow C: Assessment',
      title: 'Automated Algorithmic Marking & Teacher Gradebook',
      subtitle: 'Instant rubric grading (94/100 Grade A), concordancy scoring, and class telemetry.',
      image: teacherAnalyticsImg,
      description: 'The automated grading engine evaluates the student submission against national marking schemes: procedure accuracy, titre concordancy, arithmetic steps, and units. The teacher dashboard visualizes individual rubrics, class performance distribution, and error diagnostic metrics.',
      highlights: ['Instant Auto-Grading (94/100)', 'Procedure & Concordancy 20/20', 'Calculation Working 30/30', 'Class Telemetry & Distribution']
    }
  ];

  const handleGoToAuth = (mode: 'login' | 'register_student') => {
    setAuthMode(mode);
    setCurrentView('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchExperimentDirectly = (simType: string) => {
    const exp = experiments.find(e => e.simulationType === simType) || experiments[0];
    if (exp) {
      startExperiment(exp, null, 'practice');
    }
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq(prev => prev === idx ? null : idx);
  };

  const faqs = [
    {
      q: "What is STEM Spark Lab all about?",
      a: "STEM Spark Lab is a virtual science practicals platform purpose-built for secondary school students and teachers. It provides interactive, curriculum-calibrated laboratory simulations for Chemistry (233/3), Physics (232/3), and Biology (231/3) practical examinations. Students operate apparatus like burettes, pipettes, circuits, and test tubes with zero risk, zero reagent waste, and instant feedback."
    },
    {
      q: "Can I use STEM Spark Lab on my smartphone or low-spec computer?",
      a: "Yes! STEM Spark Lab is engineered as a lightweight web application that runs smoothly on standard smartphones, tablets, Chromebooks, and computer lab desktops without requiring heavy plugins or graphics cards."
    },
    {
      q: "How does the digital answer sheet and grading work?",
      a: "As students conduct experiments, they record meniscus readings, titre values, meter currents, and observations into digital exam answer sheets. The system evaluates their readings using realistic laboratory tolerances (such as ±0.20 cm³ for concordant titration titres) and marks their work according to official national examination rubrics."
    },
    {
      q: "Can students practice repeatedly without cost or reagent limits?",
      a: "Yes! Unlike physical school laboratories where expensive chemicals (like potassium permanganate or sodium hydroxide) and fragile glassware are rationed, STEM Spark Lab allows unlimited practice attempts with realistic variables so students master procedures with complete confidence."
    },
    {
      q: "How do schools and teachers onboard their science classes?",
      a: "School administrators register their secondary school, create class streams (e.g., Form 3 East, Form 4 West), and invite teachers. Science teachers can immediately dispatch standard national practicals or use our AI Experiment Studio to convert their own typed instructions into interactive virtual workbenches."
    },
    {
      q: "How are student results protected against exam collusion?",
      a: "In examination mode, each student receives randomized initial meniscus offsets and slight reagent molarity variations. Submissions are timestamped, validated with telemetry logs, and directly delivered to the teacher's gradebook."
    }
  ];

  const primaryTabs = [
    { id: 'home', label: 'Home', icon: Home, desc: 'Overview & interactive demo' },
    { id: 'about', label: 'About', icon: Info, desc: 'Mission, pedagogy & impact' },
    { id: 'subjects', label: 'Subjects', icon: Layers, desc: 'Chemistry, Physics & Biology' },
    { id: 'workbenches', label: 'Workbenches', icon: Sparkles, desc: 'Simulated apparatus & physics' },
    { id: 'curriculum', label: 'KCSE Standards', icon: Award, desc: 'Paper 3 criteria & rubrics' },
    { id: 'schools', label: 'Institutions', icon: Building2, desc: 'School administration & pricing' },
    { id: 'faq', label: 'FAQ', icon: HelpCircle, desc: 'Frequently asked questions' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">

      {/* ================= PRIMARY NAVIGATION TAB BAR ================= */}
      <div className="sticky top-14 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto py-2.5 no-scrollbar gap-1 sm:gap-2">
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {primaryTabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = landingTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setLandingTab(tab.id as any);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400 dark:text-emerald-600' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-800 shrink-0">
              <button
                onClick={() => handleLaunchExperimentDirectly('titration')}
                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3 h-3 text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400" />
                <span>Test-Drive Workbench</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= TAB 1: HOME ================= */}
      {landingTab === 'home' && (
        <>
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-10 pb-14 lg:py-16">
            <div className="absolute inset-0 bg-radial from-emerald-50/50 dark:from-emerald-950/20 via-transparent to-transparent pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                
                {/* Left Column: Heading and CTAs */}
                <div className="lg:col-span-7 space-y-6">
                  
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Kenya & East Africa Secondary Virtual Science Laboratory</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                    Master Science Practicals with <span className="text-emerald-600 dark:text-emerald-400">Virtual Hands-On Labs</span>
                  </h1>

                  <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                    Experience real laboratory simulations from any phone, tablet, or desktop. Perform volumetric titrations with calibrated burettes and pipettes, wire electrical circuits, conduct salt tests, and fill digital answer sheets calibrated to national Paper 3 standards.
                  </p>

                  {/* Actions */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleGoToAuth('register_student')}
                      className="px-5 py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-sm hover:shadow flex items-center gap-2 cursor-pointer"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Register student account</span>
                    </button>

                    <button
                      onClick={() => handleGoToAuth('login')}
                      className="px-5 py-2.5 rounded-md bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                      <span>Sign in</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleLaunchExperimentDirectly('titration')}
                      className="px-4 py-2.5 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold transition-colors inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400" />
                      <span>Launch Live Demo</span>
                    </button>
                  </div>

                  {/* Metrics Row (Anti-pill: Clean unboxed metadata) */}
                  <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">100%</div>
                      <div className="text-slate-500 dark:text-slate-400 mt-0.5 text-xs">Syllabus Calibrated</div>
                    </div>
                    <div>
                      <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">0 KES</div>
                      <div className="text-slate-500 dark:text-slate-400 mt-0.5 text-xs">Glassware Breakage</div>
                    </div>
                    <div>
                      <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">±0.20 cm³</div>
                      <div className="text-slate-500 dark:text-slate-400 mt-0.5 text-xs">Concordancy Check</div>
                    </div>
                    <div>
                      <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">Unlimited</div>
                      <div className="text-slate-500 dark:text-slate-400 mt-0.5 text-xs">Repeat Practice</div>
                    </div>
                  </div>

                </div>

                {/* Right Column: Hero Visual Stage with Mini Interactive Sandbox */}
                <div className="lg:col-span-5 relative">
                  <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-xl text-white space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold text-slate-200">Interactive Burette Sandbox</span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80">
                        {sandboxVolume.toFixed(2)} cm³ Titrant
                      </span>
                    </div>

                    {/* Interactive mini canvas */}
                    <div className="relative h-56 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                      {/* Stand and burette diagram */}
                      <div className="absolute left-12 top-4 bottom-4 w-1 bg-slate-700 rounded-full" />
                      <div className="absolute left-8 bottom-4 w-16 h-2 bg-slate-600 rounded" />
                      
                      {/* Burette Tube */}
                      <div className="absolute left-20 top-6 w-5 h-36 border border-slate-600 bg-slate-900/60 rounded-xs flex flex-col justify-end overflow-hidden">
                        <div 
                          className="w-full bg-emerald-500/70 transition-all duration-300"
                          style={{ height: `${Math.max(10, 100 - (sandboxVolume / 25) * 80)}%` }}
                        />
                      </div>

                      {/* Liquid Stream during pouring */}
                      {sandboxIsPouring && (
                        <div className="absolute left-[88px] top-42 w-0.5 h-12 bg-emerald-400 animate-pulse shadow-xs shadow-emerald-400" />
                      )}

                      {/* Conical Flask */}
                      <div className={`relative flex flex-col items-center transition-transform ${sandboxSwirling ? 'animate-bounce' : ''}`}>
                        <div className="w-4 h-6 border-x border-slate-500 bg-transparent" />
                        <div className="relative w-24 h-20 border border-slate-400 rounded-b-2xl overflow-hidden flex items-end justify-center bg-slate-800/30">
                          {/* Flask liquid with reactive color */}
                          <div 
                            className="w-full transition-all duration-500 rounded-b-xl"
                            style={{ 
                              height: `${25 + (sandboxVolume / 25) * 45}%`,
                              backgroundColor: getSandboxFlaskColor()
                            }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-2 font-mono">
                          {sandboxVolume >= 24.5 ? 'Endpoint Reached (Pink)' : 'Conical Flask (Alkaline)'}
                        </div>
                      </div>

                      {/* Calibrated Telemetry Badge */}
                      <div className="absolute top-3 right-3 text-right">
                        <span className="text-[10px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80 inline-flex items-center gap-1 font-mono">
                          <Droplets className="w-3 h-3" /> Calibrated Volumetric Simulation
                        </span>
                      </div>
                    </div>

                    {/* Quick Sandbox Controls */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Direct apparatus interaction:</span>
                        <button 
                          onClick={handleSandboxReset}
                          className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" /> Reset
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={handleSandboxPourStep}
                          disabled={sandboxVolume >= 25}
                          className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Droplets className="w-3.5 h-3.5" />
                          <span>Dispense +5.0 cm³ Titrant</span>
                        </button>

                        <button
                          onClick={() => setSandboxSwirling(true)}
                          className="px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
                        >
                          <Activity className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Swirl Flask</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Authentic calibrated apparatus & official KNEC tables</span>
                      <button
                        onClick={() => handleLaunchExperimentDirectly('titration')}
                        className="text-emerald-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        Launch Full Lab <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Core Pillars Grid */}
          <section className="py-14 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              <div className="text-center max-w-3xl mx-auto space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
                  Built for Secondary Science
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Why Secondary Schools Choose STEM Spark Lab
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Paper 3 practicals carry up to 40% of the candidate's final science grade in KCSE examinations. We remove the barriers of broken glassware and expensive chemicals.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">1. Realistic Physical Apparatus</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Operate 50.0 cm³ burettes, 25.0 cm³ bulb pipettes with safety fillers, iron retort stands, multimeters, and test-tubes with real fluid equations.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">2. Guided Procedure Sequences</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Interactive procedure checklists guide students through accurate reagent measurement, meniscus leveling, indicator drops, and reaction observation.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">3. Digital Exam Answer Sheets</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Complete multi-trial titration tables, compute average titres, test concordancy within ±0.20 cm³, and solve chemical arithmetic with instant auto-grading.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">4. Zero Chemical Danger</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Zero acid splashes, zero toxic gas inhalation, and zero glassware replacement costs. Students can repeat experiments 50 times until full mastery.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Workflow Step Showcase */}
          <section className="py-14 bg-slate-900 text-white border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="space-y-1">
                <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                  Full Practical Architecture
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Step-by-Step Practical Procedure & Assessment
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Follow the exact operational pipeline from teacher instruction parsing to volumetric endpoint detection.
                </p>
              </div>

              {/* Step Selector Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {workflowSteps.map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => setSelectedWorkflowStep(idx)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      selectedWorkflowStep === idx
                        ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-xs'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 mb-0.5 font-mono">
                      {step.badge}
                    </div>
                    <div className="text-xs font-semibold line-clamp-2 leading-tight">
                      {step.title}
                    </div>
                  </button>
                ))}
              </div>

              {/* Active Step Showcase */}
              {(() => {
                const step = workflowSteps[selectedWorkflowStep];
                return (
                  <div className="bg-slate-800/90 rounded-xl border border-slate-700 overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12">
                    <div className="lg:col-span-7 bg-slate-950 p-4 sm:p-6 flex flex-col justify-center items-center relative">
                      <div className="w-full relative rounded-lg overflow-hidden border border-slate-800 shadow-xl bg-slate-900">
                        <img
                          src={step.image}
                          alt={step.title}
                          className="w-full h-auto object-cover aspect-video"
                        />
                        <div className="absolute top-3 left-3 bg-slate-900/90 px-2.5 py-1 rounded text-[11px] font-mono text-emerald-300 border border-slate-700">
                          Step {selectedWorkflowStep + 1} of {workflowSteps.length}
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-slate-400 text-center italic">
                        {step.subtitle}
                      </p>
                    </div>

                    <div className="lg:col-span-5 p-6 sm:p-7 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="text-xs font-mono text-emerald-400 uppercase font-semibold">
                          {step.badge}
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                          {step.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {step.description}
                        </p>
                        <div className="pt-2 grid grid-cols-2 gap-1.5 text-xs">
                          {step.highlights.map((h, i) => (
                            <div key={i} className="flex items-center gap-1.5 p-1.5 rounded bg-slate-900/80 border border-slate-700/60 text-slate-300 text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                              <span className="truncate">{h}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-700/80 text-xs">
                        <button
                          onClick={() => setSelectedWorkflowStep(prev => Math.max(0, prev - 1))}
                          disabled={selectedWorkflowStep === 0}
                          className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white font-medium transition cursor-pointer"
                        >
                          ← Previous
                        </button>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {selectedWorkflowStep + 1} / {workflowSteps.length}
                        </span>
                        <button
                          onClick={() => setSelectedWorkflowStep(prev => Math.min(workflowSteps.length - 1, prev + 1))}
                          disabled={selectedWorkflowStep === workflowSteps.length - 1}
                          className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-medium transition cursor-pointer shadow-xs"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </section>

          {/* Quick Subject Teaser Card */}
          <section className="py-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Explore Laboratory Subjects
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Select a subject to view full syllabus practicals and interactive modules.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setLandingTab('subjects');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View all subjects</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div 
                  onClick={() => {
                    setActiveSubjectTab('chemistry');
                    setLandingTab('subjects');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-800 transition cursor-pointer overflow-hidden group shadow-2xs hover:shadow-xs flex flex-col"
                >
                  <div className="h-36 w-full overflow-hidden relative">
                    <img src={titrationBenchImg} alt="Chemistry Titration Workbench" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono rounded font-semibold">Paper 233/3</span>
                  </div>
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-2">
                        <FlaskConical className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Chemistry Practicals</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                        Volumetric titrations, qualitative inorganic salt analysis, thermochemistry, and reaction rates.
                      </p>
                    </div>
                    <div className="pt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Explore Chemistry</span> <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => {
                    setActiveSubjectTab('physics');
                    setLandingTab('subjects');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-800 transition cursor-pointer overflow-hidden group shadow-2xs hover:shadow-xs flex flex-col"
                >
                  <div className="h-36 w-full overflow-hidden relative">
                    <img src={physicsBenchImg} alt="Physics Circuit Workbench" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono rounded font-semibold">Paper 232/3</span>
                  </div>
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-2">
                        <Zap className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Physics Practicals</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                        Current electricity, Ohm&apos;s Law, Hooke&apos;s Law spring constant, optics, and simple pendulums.
                      </p>
                    </div>
                    <div className="pt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Explore Physics</span> <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => {
                    setActiveSubjectTab('biology');
                    setLandingTab('subjects');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-800 transition cursor-pointer overflow-hidden group shadow-2xs hover:shadow-xs flex flex-col"
                >
                  <div className="h-36 w-full overflow-hidden relative">
                    <img src={biologyBenchImg} alt="Biology Food Testing Workbench" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono rounded font-semibold">Paper 231/3</span>
                  </div>
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-2">
                        <Dna className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Biology Practicals</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                        Biochemical food tests, enzyme kinetics, plant transpiration, and microscopic specimen drawings.
                      </p>
                    </div>
                    <div className="pt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Explore Biology</span> <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ================= TAB 2: ABOUT ================= */}
      {landingTab === 'about' && (
        <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Institutional Mission & Vision
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Democratizing Science Practicals Across Secondary Schools
              </h1>
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                STEM Spark Lab was founded to bridge the acute practical science gap in secondary education. Every student, regardless of their school&apos;s laboratory budget, deserves access to world-class scientific inquiry.
              </p>
            </div>

            {/* Institutional Laboratory Hero Image */}
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
              <img 
                src={labBannerImg} 
                alt="Kenyan Secondary School Science Laboratory" 
                className="w-full h-64 sm:h-80 object-cover"
              />
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Standard secondary school science laboratory preparation space</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Calibrated to KNEC Paper 3</span>
              </div>
            </div>

            {/* The Practical Crisis vs Virtual Solution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-3">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <span>The Secondary School Challenge</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span><strong>Glassware & Reagent Rationing:</strong> In over 65% of secondary schools, students only touch a burette or pipette once or twice due to fear of breakages.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span><strong>40% of National Marks:</strong> Paper 3 examinations constitute 40% of the final KCSE science grade. Practice deficiency directly causes low national grades.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span><strong>High Chemical Costs:</strong> Reagents like Silver Nitrate, Potassium Permanganate, and pure acids cost thousands of shillings every term.</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span>The STEM Spark Lab Solution</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Zero-Risk Unlimited Trials:</strong> Students can repeat volumetric titrations 50 times until meniscus reading and concordancy become muscle memory.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Instant KNEC Marking Schemes:</strong> Automated rubric engines verify concordancy within ±0.20 cm³ and mark working steps instantaneously.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Teacher Empowerment Studio:</strong> Science teachers can type instructions in natural English and generate live interactive workbenches in seconds.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* CBC & National Syllabus Alignment */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Curriculum Integration: CBC & 8-4-4 Alignment
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                STEM Spark Lab is built to meet both the Competency-Based Curriculum (CBC) senior school pathways and the traditional KCSE 8-4-4 Paper 3 examination guidelines. Students develop core competencies in scientific investigation, data handling, digital literacy, and critical problem solving.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block">Form 1 & 2 Foundations</span>
                  <span className="text-slate-500 dark:text-slate-400 mt-1 block">Apparatus identification, measuring cylinder meniscus, safety rules, Bunsen burner flame adjustment.</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block">Form 3 Skill Building</span>
                  <span className="text-slate-500 dark:text-slate-400 mt-1 block">Acid-base volumetric titration, indicator color shifts, Ohm&apos;s Law V-I curves, biochemical food testing.</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block">Form 4 Exam Mastery</span>
                  <span className="text-slate-500 dark:text-slate-400 mt-1 block">Redox titrations, concordancy verification, qualitative salt inferences, timed CAT practical exams.</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={() => handleGoToAuth('register_student')}
                className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Join STEM Spark Lab Today</span>
              </button>
            </div>

          </div>
        </section>
      )}

      {/* ================= TAB 3: SUBJECTS ================= */}
      {landingTab === 'subjects' && (
        <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Secondary Practical Syllabus
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
                  Subjects & Practical Examination Modules
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  Calibrated to the secondary national syllabus for Form 3 & Form 4 candidates.
                </p>
              </div>

              {/* Sub-tab switcher */}
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setActiveSubjectTab('chemistry')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeSubjectTab === 'chemistry'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Chemistry</span>
                </button>
                <button
                  onClick={() => setActiveSubjectTab('physics')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeSubjectTab === 'physics'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Physics</span>
                </button>
                <button
                  onClick={() => setActiveSubjectTab('biology')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeSubjectTab === 'biology'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Dna className="w-3.5 h-3.5" />
                  <span>Biology</span>
                </button>
              </div>
            </div>

            {/* CHEMISTRY SUBJECT VIEW */}
            {activeSubjectTab === 'chemistry' && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-4">
                    <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 uppercase">
                      KCSE Paper 233/3 · Questions 1 & 2
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      Volumetric Titration & Qualitative Inorganic Analysis
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Manipulate 50.0 cm³ burettes, 25.0 cm³ pipettes, conical flasks, white ceramic tiles, and indicators. Observe instantaneous color transitions from alkaline yellow to endpoint orange/pink with Methyl Orange, or colorless to pale pink with Phenolphthalein.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="font-bold text-slate-900 dark:text-white block">Table I Titre Concordancy</span>
                        <span className="text-slate-500 dark:text-slate-400">Verifies that at least two trials agree within ±0.20 cm³ for full examination credit.</span>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="font-bold text-slate-900 dark:text-white block">Stoichiometric Arithmetic</span>
                        <span className="text-slate-500 dark:text-slate-400">Moles of base, molarity of acid, Relative Atomic Mass (RAM), and water of crystallization.</span>
                      </div>
                    </div>
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => handleLaunchExperimentDirectly('titration')}
                        className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5" /> Launch Volumetric Titration
                      </button>
                      <button
                        onClick={() => handleLaunchExperimentDirectly('qualitative_analysis')}
                        className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition flex items-center gap-2 cursor-pointer"
                      >
                        <Beaker className="w-3.5 h-3.5 text-indigo-500" /> Launch Qualitative Salt Analysis
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                      <img src={titrationBenchImg} alt="Titration Workbench" className="w-full h-60 object-cover" referrerPolicy="no-referrer" />
                    </div>
                  </div>
                </div>

                {/* Chemistry Catalog List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="text-xs font-mono text-slate-500">Exp 233/3.1</div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Standard Acid-Base Titration</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Titrating 0.1M HCl (Solution N) against 0.2M NaOH (Solution M) using Methyl Orange indicator.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="text-xs font-mono text-slate-500">Exp 233/3.2</div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Redox Titration with KMnO₄</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Standardizing acidified Potassium Manganate (VII) against Hydrated Ammonium Iron(II) Sulphate.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="text-xs font-mono text-slate-500">Exp 233/3.3</div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Inorganic Qualitative Analysis</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Testing unknown Solid P for cations (Zn²⁺, Al³⁺, Pb²⁺) and anions (SO₄²⁻, CO₃²⁻, Cl⁻) with aqueous reagents.</p>
                  </div>
                </div>
              </div>
            )}

            {/* PHYSICS SUBJECT VIEW */}
            {activeSubjectTab === 'physics' && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-sky-50/40 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/60 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-4">
                    <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-300 uppercase">
                      KCSE Paper 232/3 · Questions 1 & 2
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      Current Electricity, Ohm&apos;s Law & Circuit Analysis
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Wire series and parallel circuits with dry cells, rheostat sliders, switches, analog/digital voltmeters, and ammeters. Drag the rheostat slider to alter resistance across 5 increments, plot voltage vs current, and deduce internal resistance (r) and EMF (E).
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="font-bold text-slate-900 dark:text-white block">V-I Slope Gradient</span>
                        <span className="text-slate-500 dark:text-slate-400">Mathematical linear regression calculating slope gradient with correct dimensional units.</span>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="font-bold text-slate-900 dark:text-white block">Interactive Breadboard</span>
                        <span className="text-slate-500 dark:text-slate-400">Interactive lead clip connectors preventing accidental short circuits.</span>
                      </div>
                    </div>
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => handleLaunchExperimentDirectly('ohms_law')}
                        className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5" /> Launch Ohm&apos;s Law Practical
                      </button>
                      <button
                        onClick={() => handleLaunchExperimentDirectly('hookes_law')}
                        className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition flex items-center gap-2 cursor-pointer"
                      >
                        <Scale className="w-3.5 h-3.5 text-sky-500" /> Launch Hooke&apos;s Law
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                      <img 
                        src={physicsBenchImg} 
                        alt="Physics Circuit Workbench" 
                        className="w-full h-60 object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>

                {/* Physics Catalog List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="text-xs font-mono text-slate-500">Exp 232/3.1</div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Ohm&apos;s Law & Internal Resistance</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Determining internal resistance and electromotive force using variable resistance and ammeter.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="text-xs font-mono text-slate-500">Exp 232/3.2</div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Hooke&apos;s Law Spring Constant</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Loading slotted masses (20g to 100g) on a spiral spring, measuring pointer extension.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="text-xs font-mono text-slate-500">Exp 232/3.3</div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Focal Length of Convex Lens</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Object-image distances on optical bench, plotting 1/u vs 1/v to determine lens focal length.</p>
                  </div>
                </div>
              </div>
            )}

            {/* BIOLOGY SUBJECT VIEW */}
            {activeSubjectTab === 'biology' && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-4">
                    <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                      KCSE Paper 231/3 · Questions 1 & 2
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      Biochemical Food Nutrient Testing & Specimen Analysis
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Identify unknown food solutions using chemical reagents. Perform Benedict&apos;s test for reducing sugars in a boiling water bath, Iodine test for starch, Biuret test for proteins, and DCPIP test for vitamin C. Record observations and deductions into standard KNEC observation tables.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="font-bold text-slate-900 dark:text-white block">Precipitate Color Shifts</span>
                        <span className="text-slate-500 dark:text-slate-400">Simulates green → yellow → orange → brick-red precipitate transitions with temperature.</span>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="font-bold text-slate-900 dark:text-white block">Observation & Deduction Rubric</span>
                        <span className="text-slate-500 dark:text-slate-400">Penalizes vague descriptions (e.g. &quot;Red color&quot; vs &quot;Brick-red precipitate&quot;) to match KNEC criteria.</span>
                      </div>
                    </div>
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => handleLaunchExperimentDirectly('food_test')}
                        className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5" /> Launch Biochemical Food Test
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                      <img 
                        src={biologyBenchImg} 
                        alt="Biology Food Testing Workbench" 
                        className="w-full h-60 object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>

                {/* Biology Catalog List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="text-xs font-mono text-slate-500">Exp 231/3.1</div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Qualitative Food Nutrient Tests</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Testing food extract X for reducing sugars, non-reducing sugars, starch, and proteins.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="text-xs font-mono text-slate-500">Exp 231/3.2</div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Enzyme Amylase Temperature Kinetics</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Rate of starch breakdown by salivary amylase at 10°C, 37°C, and 80°C in water baths.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="text-xs font-mono text-slate-500">Exp 231/3.3</div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Plant Transpiration with Potometer</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Measuring air bubble displacement across capillary tube under windy, sunny, and humid conditions.</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </section>
      )}

      {/* ================= TAB 4: WORKBENCHES ================= */}
      {landingTab === 'workbenches' && (
        <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Interactive Lab Engines
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Specialized Science Workbenches & Simulators
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Clean, distraction-free laboratory simulators engineered for national secondary school practical examinations. Students directly manipulate apparatus, collect concordant measurements, and complete KNEC-style structured tables.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  1. Volumetric Titration Workbench (233/3)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  50 cm³ precision glass burette with zero-meniscus leveling, 25.0 cm³ volumetric pipettes, conical flasks with magnetic swirling, and calibrated dropwise titration stopcock controls for concordant titres.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  2. Qualitative Analysis & Flame Tests
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Full systematic flowcharts for cation (Pb²⁺, Al³⁺, Zn²⁺, Fe²⁺, Fe³⁺, Cu²⁺) and anion detection with NaOH, aqueous NH₃, Ba(NO₃)₂, and HNO₃, including gas evolution tests with limewater and litmus.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  3. Electricity & Circuit Mechanics (232/3)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Interactive Ohm&apos;s Law breadboard with dry cells, rheostat sliders, keys, high-accuracy analogue ammeters (0–1.0A), and voltmeters (0–3.0V) for recording I vs V curves and internal resistance determination.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  4. Mechanics, Hooke&apos;s Law & Optics
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Helical springs with pointer scales, slotted masses (20g–200g), metre rules with knife edges for principle of moments, and triangular glass prisms with optical pins for angle of deviation.
                </p>
              </div>

            </div>

            <div className="p-6 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-base">Launch Interactive Workbench</h4>
                <p className="text-xs text-slate-400">Open the volumetric titration simulator or qualitative analysis bench to carry out practicals.</p>
              </div>
              <button
                onClick={() => handleLaunchExperimentDirectly('titration')}
                className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Launch Practical Lab</span>
              </button>
            </div>

          </div>
        </section>
      )}

      {/* ================= TAB 5: KCSE STANDARDS ================= */}
      {landingTab === 'curriculum' && (
        <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Examination Architecture & Rubrics
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                KCSE Paper 3 Practical Examination Standards
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                National examination candidates must follow strict laboratory protocols and answer recording rules. STEM Spark Lab is calibrated to official KNEC scoring rubrics.
              </p>
            </div>

            <div className="space-y-6">
              
              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    1. The Concordancy Criteria (±0.20 cm³)
                  </h3>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">Table I Rubric</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  In Chemistry Paper 3 (233/3), students record Initial and Final Burette readings across three trials. For marks to be awarded:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white block">Complete Table (1 Mark)</span>
                    <span className="text-slate-500 dark:text-slate-400">All 3 trials must have initial and final values recorded to 1 or 2 decimal places consistently.</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white block">Decimal Accuracy (1 Mark)</span>
                    <span className="text-slate-500 dark:text-slate-400">Readings must end in .0 or .5 (or .00) with zero arithmetic calculation discrepancies.</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white block">Concordancy (1 Mark)</span>
                    <span className="text-slate-500 dark:text-slate-400">Two selected titres must differ by no more than ±0.20 cm³ to calculate the average titre volume.</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    2. Qualitative Observations vs Deductions
                  </h3>
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">Paper 233/3 & 231/3</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Examiners strictly differentiate between physical observations and chemical inferences:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-rose-600 dark:text-rose-400 block">Penalized Common Mistakes</span>
                    <span className="text-slate-500 dark:text-slate-400 block mt-1">Writing &quot;Lead is present&quot; under observation, or writing &quot;Forms white solution&quot; instead of &quot;White precipitate soluble in excess&quot;.</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block">Correct KNEC Formula</span>
                    <span className="text-slate-500 dark:text-slate-400 block mt-1">Observations: &quot;White precipitate soluble in excess NaOH to form a colorless solution.&quot; Inferences: &quot;Pb²⁺, Zn²⁺, or Al³⁺ present.&quot;</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    3. Physics Graph Plotting & Dimensional Units
                  </h3>
                  <span className="text-xs font-mono text-sky-600 dark:text-sky-400 font-bold">Paper 232/3</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  In Physics Paper 3, candidates plot graph curves (e.g. Voltage vs Current or Extension vs Load). Marks are allocated across Scale (at least ½ page), Axes Labeling with units (V in Volts, I in Amperes), Plotting Points within ½ square, and Line of Best Fit.
                </p>
              </div>

            </div>

          </div>
        </section>
      )}

      {/* ================= TAB 6: SCHOOLS & INSTITUTIONS ================= */}
      {landingTab === 'schools' && (
        <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                School Leadership & Administration
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Empowering Secondary Schools with Zero Consumable Waste
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                STEM Spark Lab allows school principals, heads of science, and teachers to deploy an unlimited science laboratory for every stream with zero recurring chemical purchases.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">1. Multi-Tenant School Code</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Each school receives an isolated institutional tenant. Students register directly under their school and stream (e.g. Form 3 Red, Form 4 Blue).
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">2. AI Experiment Builder</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Science teachers can convert custom mock practicals or typed examination questions into functional simulations in under two minutes.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">3. Centralized Gradebook</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Review student submissions, concordancy accuracy, calculation steps, and class performance distribution in a real-time teacher analytics dashboard.
                </p>
              </div>
            </div>

            {/* Savings Calculator Card */}
            <div className="p-6 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Estimated School Laboratory Cost Reduction
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                A typical Kenyan secondary school with 200 Form 3 & Form 4 candidates spends between <strong>KES 150,000 and KES 350,000 annually</strong> on consumable chemicals, acids, indicators, and replacement glassware. STEM Spark Lab allows unlimited preparatory trials before exam day, reducing chemical expenditure by over 75%.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handleGoToAuth('register_student')}
                className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Register Student Account</span>
              </button>
              <button
                onClick={() => handleGoToAuth('login')}
                className="px-6 py-3 rounded-lg bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-sm transition flex items-center gap-2 cursor-pointer"
              >
                <span>Teacher & School Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </section>
      )}

      {/* ================= TAB 7: FAQ ================= */}
      {landingTab === 'faq' && (
        <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Help & Answers
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Frequently Asked Questions
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Everything you need to know about using STEM Spark Virtual Science Lab.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 dark:text-white text-sm hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ================= COMPREHENSIVE PLATFORM FOOTER ================= */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 font-sans">
        {/* Main Footer Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Col 1: Brand & Curriculum Badge */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black shadow-sm">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-white text-lg tracking-tight block">
                    STEM Spark Lab
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 block -mt-0.5">
                    Secondary Science Practical Simulator
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
                Empowering secondary school students and teachers with syllabus-aligned, interactive virtual science practicals. Master calibrated equipment handling, empirical data logging, and rigorous KNEC examinations.
              </p>

              <div className="pt-1 flex flex-wrap gap-2 text-[11px] font-mono">
                <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  KCSE 233/3 Chemistry
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  KCSE 232/3 Physics
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  KCSE 231/3 Biology
                </span>
              </div>

              <div className="pt-2 text-xs text-slate-400 space-y-1.5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Science & Technology Park, Nairobi, Kenya</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <a href="mailto:support@stemsparklab.edu" className="hover:text-emerald-400 transition-colors">support@stemsparklab.edu</a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>+254 (0) 700 890 120 / +254 (0) 20 523 440</span>
                </div>
              </div>
            </div>

            {/* Col 2: Practicals & Subjects */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                Curriculum Subjects
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button 
                    onClick={() => {
                      setActiveSubjectTab('chemistry');
                      setLandingTab('subjects');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Volumetric Titration</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setActiveSubjectTab('chemistry');
                      setLandingTab('subjects');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <Beaker className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Qualitative Salt Analysis</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setActiveSubjectTab('physics');
                      setLandingTab('subjects');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <Zap className="w-3.5 h-3.5 text-sky-400" />
                    <span>Ohm&apos;s Law & Circuits</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setActiveSubjectTab('physics');
                      setLandingTab('subjects');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <Scale className="w-3.5 h-3.5 text-sky-400" />
                    <span>Hooke&apos;s Law Elasticity</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setActiveSubjectTab('biology');
                      setLandingTab('subjects');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <Dna className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Biochemical Food Testing</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setActiveSubjectTab('biology');
                      setLandingTab('subjects');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Enzyme Kinetics</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Platform Navigation */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                Platform Navigation
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button 
                    onClick={() => {
                      setLandingTab('home');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Home className="w-3.5 h-3.5 text-slate-500" />
                    <span>Home & Overview</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setLandingTab('about');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5 text-slate-500" />
                    <span>About the Mission</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setLandingTab('workbenches');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                    <span>Virtual Workbenches & Simulators</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setLandingTab('schools');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>School Administration & Access</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setLandingTab('curriculum');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    <span>Apparatus & Reagent Catalog</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setLandingTab('faq');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                    <span>Frequently Asked Questions</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleGoToAuth('login')}
                    className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                    <span>Sign In Portal</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Resources & Guides */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                Resources & Syllabi
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button 
                    onClick={() => {
                      setLandingTab('curriculum');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    <span>KCSE Examination Syllabi</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setLandingTab('workbenches');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Virtual Lab Workbenches</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setLandingTab('schools');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>School Institutional Portal</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setLandingTab('faq');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Safety Guidelines & FAQs</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Secondary Divider & Trust Badges */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                KNEC Observation Rubrics
              </span>
              <span className="text-slate-700 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                Instant Concordance Checking
              </span>
              <span className="text-slate-700 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                Secondary Science Verified
              </span>
            </div>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Copyright & Legal Strip */}
        <div className="bg-black/60 border-t border-slate-900 py-5 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-center sm:text-left text-slate-400">
              © {new Date().getFullYear()} STEM Spark Lab. All rights reserved. Built for Kenyan Secondary School Science Education.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
              <button 
                onClick={() => setLegalModalContent({
                  title: 'Privacy Policy',
                  text: 'STEM Spark Lab protects student laboratory logs, assessment scores, and teacher records in strict compliance with education data privacy standards. No student personal information is sold or shared with external third parties.'
                })} 
                className="hover:text-slate-300 transition cursor-pointer"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button 
                onClick={() => setLegalModalContent({
                  title: 'Terms of Service',
                  text: 'STEM Spark Lab is licensed for academic instruction, laboratory skill training, and preparation for secondary national examinations. All simulated materials and interactive mark schemes are aligned to national syllabus standards.'
                })} 
                className="hover:text-slate-300 transition cursor-pointer"
              >
                Terms of Service
              </button>
              <span>•</span>
              <button 
                onClick={() => setLegalModalContent({
                  title: 'Laboratory Safety Compliance',
                  text: 'Our virtual simulator reinforces genuine laboratory safety disciplines, including personal protective equipment (goggles, lab coats), chemical hazard symbols, proper fume handling, and safe reagent disposal procedures.'
                })} 
                className="hover:text-slate-300 transition cursor-pointer"
              >
                Lab Safety Compliance
              </button>
              <span>•</span>
              <button 
                onClick={() => setLegalModalContent({
                  title: 'Academic Integrity & Rigor',
                  text: 'All simulated volumetric titrations, electrical circuit measurements, and biochemical reactions incorporate authentic physics and stoichiometric mathematics with realistic experimental uncertainties (±0.05 cm³ burette reading, analog scale parallax).'
                })} 
                className="hover:text-slate-300 transition cursor-pointer"
              >
                Academic Integrity
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Accessible Policy & Legal Info Modal */}
      {legalModalContent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>{legalModalContent.title}</span>
              </h3>
              <button 
                onClick={() => setLegalModalContent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {legalModalContent.text}
            </p>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setLegalModalContent(null)}
                className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer transition shadow-xs"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
