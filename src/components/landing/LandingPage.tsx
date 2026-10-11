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
  Download,
  FileText
} from 'lucide-react';
import labBannerImg from '../../assets/images/science_lab_banner_1791271184391.jpg';
import titrationBenchImg from '../../assets/images/titration_bench_1791271199117.jpg';
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
    startExperiment 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'chemistry' | 'physics' | 'biology'>('chemistry');
  const [selectedWorkflowStep, setSelectedWorkflowStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const workflowSteps = [
    {
      id: 'teacher-studio',
      badge: 'Workflow A: Creation',
      title: 'Teacher AI Experiment Creation Studio',
      subtitle: 'Natural language parsing of raw instructions with automated apparatus disambiguation.',
      image: teacherStudioImg,
      description: 'The teacher inputs raw instructions (e.g. "Fill burrete with Solution N, Pippete 25cm3 of sodium hydrotide M..."). The AI parser cleans typographic errors, isolates glassware (50ml Burette, 25ml Pipette, Conical Flask, Methyl Orange), and synthesizes a live simulation preview with auto-calculated rubric parameters.',
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
      a: "STEM Spark Lab is a virtual science practicals platform purpose-built for secondary school students and teachers. It provides interactive, curriculum-calibrated laboratory simulations for Chemistry (233/3), Physics (232/3), and Biology (231/3) practical examinations. Students can operate apparatus like burettes, pipettes, circuits, and test tubes with zero risk, zero reagent waste, and instant feedback."
    },
    {
      q: "Can I use STEM Spark Lab on my phone or tablet?",
      a: "Yes! STEM Spark Lab works on modern smartphones, tablets, Chromebooks, laptops, and computer lab desktops without installing any special software or plugins."
    },
    {
      q: "How does the digital answer sheet and grading work?",
      a: "As you conduct practical experiments, you enter your observations, meniscus readings, titre values, and calculations into a digital exam answer sheet. The system checks your readings with realistic laboratory tolerances (such as ±0.20 cm³ for concordant titration titres) and scores your working according to official marking schemes."
    },
    {
      q: "Can I practice as many times as I want?",
      a: "Absolutely! Unlike physical school laboratories where chemicals are scarce and glassware can break, STEM Spark Lab allows unlimited practice attempts with realistic variables so you can achieve complete mastery before exam day."
    },
    {
      q: "How do students register and join their school?",
      a: "Click 'Register student account' at the top of the page. Enter your full name, email address, select your registered secondary school and your class stream, set your password, and you will be immediately enrolled into your science class."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white py-2 px-4 text-xs font-medium shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase">National Syllabus</span>
            <span className="truncate">Calibrated for Paper 3 Practicals: Chemistry (233/3), Physics (232/3), & Biology (231/3)</span>
          </div>
          <div className="flex items-center space-x-4 shrink-0">
            <button
              onClick={() => handleGoToAuth('login')}
              className="hover:underline font-semibold text-white hidden sm:inline"
            >
              Sign in
            </button>
            <button
              onClick={() => handleGoToAuth('register_student')}
              className="bg-white text-emerald-700 px-2.5 py-0.5 rounded font-bold hover:bg-emerald-50 transition-colors shadow-2xs text-[11px]"
            >
              Register student account
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 pt-12 pb-16 lg:py-20">
        <div className="absolute inset-0 bg-radial from-emerald-50/60 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading and CTAs */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>The Virtual Science Laboratory for Secondary Schools</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Master Science Practicals with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Virtual Hands-On Labs</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Experience real laboratory simulations from your screen. Perform volumetric titrations drop-by-drop, assemble electrical circuits, conduct qualitative salt tests, and fill digital answer sheets graded to official KCSE standards.
              </p>

              {/* Only Two Actions: Sign in and Register student account */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleGoToAuth('register_student')}
                  className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Register student account</span>
                </button>

                <button
                  onClick={() => handleGoToAuth('login')}
                  className="px-6 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-all shadow-sm flex items-center gap-2"
                >
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {currentUser && (
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="px-4 py-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Back to Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Feature Badges */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Paper 3 (233/3, 232/3, 231/3)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Digital KCSE Answer Sheets</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited Repeat Practice</span>
                </div>
              </div>

            </div>

            {/* Right Column: Hero Visual Graphic */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 group">
                <img 
                  src={labBannerImg} 
                  alt="STEM Spark Virtual Science Laboratory" 
                  className="w-full h-[360px] object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />

                {/* Floating Info Badges */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md border border-white/50 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-900">Virtual Lab Online</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-100 shadow-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <FlaskConical className="w-4 h-4 text-indigo-600" />
                      Active Practical Engine
                    </span>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      Interactive
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Burettes, measuring cylinders, circuit components, and observation tables ready for hands-on simulation.
                  </p>
                </div>
              </div>

              {/* Decorative background glow */}
              <div className="absolute -bottom-6 -right-6 w-56 h-56 bg-emerald-200/50 rounded-full blur-3xl -z-10" />
              <div className="absolute -top-6 -left-6 w-56 h-56 bg-indigo-200/50 rounded-full blur-3xl -z-10" />
            </div>

          </div>
        </div>
      </section>

      {/* SECTION: What is STEM Spark Lab All About? */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100/80 text-teal-800 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              <span>Everything You Need to Know</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">
              What is STEM Spark Lab all about?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              In secondary schools across Kenya, Science Practical examinations (Paper 3) determine up to 40% of the candidate's final science grade. Yet many schools face equipment shortages, broken burettes, or expensive reagents that students only touch once or twice.
            </p>
            <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <strong>STEM Spark Lab changes this completely:</strong> It brings the full chemistry, physics, and biology laboratory into an interactive virtual simulator accessible on any computer, tablet, or phone. Students gain confidence, master step-by-step procedures, and eliminate exam anxiety.
            </p>
          </div>

          {/* 4 Core Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pillar 1 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                <FlaskConical className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                1. Realistic Apparatus
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Operate 50.0 cm³ burettes with stopcock control, 25.0 cm³ pipettes with safety fillers, measuring cylinders, Bunsen burners, and digital multimeters with realistic physics equations.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                2. Step-by-Step Validation
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Universal engine automatically recognizes your actions: filling solutions, pipetting, adding 5 cm³ sulphuric acid with measuring cylinder, heating to 60°C, and titrating to pale pink.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                3. Digital Answer Sheets
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Record consecutive trials in examination data tables, calculate average titre volumes, test concordancy within ±0.20 cm³, and solve molarity equations with instant auto-marking.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                4. Zero Risk & 100% Free Practice
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No shattered glassware, no toxic chemical exposure, and zero consumable costs. Practice as many times as needed from school, home, or the library until procedures become second nature.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION: End-to-End System Workflows & Step Screenshots (BRD / DRD Walkthrough) */}
      <section className="py-16 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-semibold">
                <FileText className="w-3.5 h-3.5" />
                <span>Corporate BRD / DRD Workflow Specification</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                End-to-End Lab Process & Step Demonstrations
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Visualizing each operational phase of the virtual laboratory platform—from teacher AI experiment parsing and apparatus disambiguation to student volumetric titration, color endpoint transition, and automated grading.
              </p>
            </div>
          </div>

          {/* Workflow Step Selection Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {workflowSteps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setSelectedWorkflowStep(idx)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedWorkflowStep === idx
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider text-blue-400 mb-1">
                  {step.badge}
                </div>
                <div className="text-xs font-semibold line-clamp-2 leading-tight">
                  {step.title}
                </div>
              </button>
            ))}
          </div>

          {/* Featured Active Step Showcase */}
          {(() => {
            const step = workflowSteps[selectedWorkflowStep];
            return (
              <div className="bg-slate-800/90 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-0">
                {/* Left/Top: Image Display with Realistic Frame */}
                <div className="lg:col-span-7 bg-slate-950 p-4 sm:p-6 flex flex-col justify-center items-center relative group">
                  <div className="w-full relative rounded-xl overflow-hidden border border-slate-800 shadow-xl bg-slate-900">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-auto object-cover aspect-video hover:scale-[1.01] transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono text-blue-300 border border-slate-700">
                      Step {selectedWorkflowStep + 1} of {workflowSteps.length}
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-400 text-center italic">
                    {step.subtitle}
                  </p>
                </div>

                {/* Right/Bottom: Step Details & Scientific Explanation */}
                <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="inline-block px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-semibold">
                      {step.badge}
                    </div>

                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {step.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Key Technical Highlights */}
                    <div className="pt-2 space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Apparatus & Technical Capabilities:
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {step.highlights.map((h, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 text-xs text-slate-200"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                            <span className="truncate">{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Navigation controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700/80 text-xs">
                    <button
                      onClick={() => setSelectedWorkflowStep(prev => Math.max(0, prev - 1))}
                      disabled={selectedWorkflowStep === 0}
                      className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition cursor-pointer"
                    >
                      ← Previous Step
                    </button>

                    <div className="text-slate-400 font-mono text-[11px]">
                      {selectedWorkflowStep + 1} / {workflowSteps.length}
                    </div>

                    <button
                      onClick={() => setSelectedWorkflowStep(prev => Math.min(workflowSteps.length - 1, prev + 1))}
                      disabled={selectedWorkflowStep === workflowSteps.length - 1}
                      className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition cursor-pointer"
                    >
                      Next Step →
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>
      </section>

      {/* SECTION: Subject Modules (Chemistry, Physics, Biology) */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Curriculum Practicals</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Explore Subjects Covered
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Calibrated to the secondary national examination syllabus for Form 3 & Form 4 candidates.
              </p>
            </div>

            {/* Subject Tabs */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                onClick={() => setActiveTab('chemistry')}
                className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'chemistry'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Chemistry (233/3)</span>
              </button>

              <button
                onClick={() => setActiveTab('physics')}
                className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'physics'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Physics (232/3)</span>
              </button>

              <button
                onClick={() => setActiveTab('biology')}
                className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'biology'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Dna className="w-3.5 h-3.5" />
                <span>Biology (231/3)</span>
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
            
            {/* CHEMISTRY */}
            {activeTab === 'chemistry' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-block px-2.5 py-1 rounded bg-indigo-100 text-indigo-800 text-xs font-bold">
                    Chemistry Practical · Paper 233/3 Question 1 & 2
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    Volumetric Titration & Qualitative Inorganic Analysis
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Operate the 50.0 cm³ burette to titrate standard acid against alkali or redox oxidants like potassium manganate (VII). Use pipettes, measuring cylinders for adding auxiliary reagents, and observe precise color changes from pale pink to colorless.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-900 block">Procedure I & II Support:</span>
                      <span className="text-slate-600">Standard titration followed by dilution, heating, and secondary titration.</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-900 block">Concordancy Scoring:</span>
                      <span className="text-slate-600">Auto-evaluates titre values within ±0.20 cm³ with decimal reading consistency.</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleLaunchExperimentDirectly('titration')}
                      className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-2"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Launch Titration Practical</span>
                    </button>
                    <button
                      onClick={() => handleLaunchExperimentDirectly('qualitative_analysis')}
                      className="px-5 py-2.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 text-xs font-bold transition-colors shadow-2xs flex items-center gap-2"
                    >
                      <Beaker className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Launch Qualitative Analysis</span>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="rounded-xl overflow-hidden border-2 border-slate-200 shadow-md">
                    <img 
                      src={titrationBenchImg} 
                      alt="Chemistry Titration Apparatus Bench"
                      className="w-full h-64 object-cover object-center" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PHYSICS */}
            {activeTab === 'physics' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-block px-2.5 py-1 rounded bg-sky-100 text-sky-800 text-xs font-bold">
                    Physics Practical · Paper 232/3 Question 1
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    Current Electricity, Ohm&apos;s Law & Circuit Analysis
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Wire dry cells in series with an ammeter, voltmeter, switch, and variable rheostat. Drag the rheostat slider to alter circuit resistance across 5 increments, read analog and digital meters, and plot voltage-current graphs to deduce internal resistance and electromotive force.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-900 block">Interactive Wiring:</span>
                      <span className="text-slate-600">Connect lead clips between voltmeter, ammeter, and resistance wires without short circuits.</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-900 block">V-I Curve Plotting:</span>
                      <span className="text-slate-600">Calculate gradient slope (V/I = R) with real-time mathematical validation.</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleLaunchExperimentDirectly('ohms_law')}
                      className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-2"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Launch Ohm&apos;s Law Practical</span>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-100">
                    <span>Circuit Specifications</span>
                    <span className="text-sky-600">DC Voltage Mode</span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Power Source:</span>
                      <span className="font-mono font-bold text-slate-800">2 × 1.5V Dry Cells (3.0V total)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Voltmeter Range:</span>
                      <span className="font-mono font-bold text-slate-800">0.0 – 5.0 V (±0.05V accuracy)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ammeter Range:</span>
                      <span className="font-mono font-bold text-slate-800">0.0 – 2.5 A (±0.02A accuracy)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rheostat:</span>
                      <span className="font-mono font-bold text-slate-800">0 – 50 Ω continuous slider</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BIOLOGY */}
            {activeTab === 'biology' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-block px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
                    Biology Practical · Paper 231/3 Question 1
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    Qualitative Biochemical Food Nutrient Testing
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Identify unknown nutrients in food substance solution. Carry out Benedict&apos;s test for reducing sugars in a boiling water bath, Biuret test (10% NaOH + 1% CuSO₄) for proteins, Iodine test for starch, and DCPIP test for vitamin C with observation and inference tables.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-900 block">Color Transition Engine:</span>
                      <span className="text-slate-600">Observes green → yellow → orange → brick-red precipitate dynamically.</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-900 block">Observation & Inference Table:</span>
                      <span className="text-slate-600">Matches student scientific deductions with KNEC biology marking schemes.</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleLaunchExperimentDirectly('food_test')}
                      className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-2"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Launch Food Nutrient Practical</span>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-100">
                    <span>Reagents & Positive Indicators</span>
                    <span className="text-emerald-600">Biochemical Suite</span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between items-center">
                      <span>Reducing Sugar:</span>
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold text-[11px]">Brick-red ppt</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Protein (Biuret):</span>
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold text-[11px]">Purple / Violet</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Starch (Iodine):</span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold text-[11px]">Blue-black</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Vitamin C (DCPIP):</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold text-[11px]">Decolorization</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* SECTION: 3 Steps for Students */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              How It Works for Students
            </h2>
            <p className="text-sm text-slate-600">
              Getting started takes less than one minute. Follow these three simple steps:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3 relative">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base">Register Student Account</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click register, select your secondary school and your class stream, and create your student account.
              </p>
              <button
                onClick={() => handleGoToAuth('register_student')}
                className="text-xs text-emerald-600 font-bold hover:underline inline-flex items-center gap-1 pt-1"
              >
                <span>Register now</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3 relative">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base">Perform Practical Steps</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Open your assigned experiment or practice module. Follow guided steps, pour reagents, control stopcocks, and wire circuits.
              </p>
              <span className="text-xs text-indigo-600 font-bold inline-flex items-center gap-1 pt-1">
                <span>Guided interactive apparatus</span>
              </span>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3 relative">
              <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base">Fill & Submit Answers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your trial readings into the digital answer sheet. Submit to receive instant scoring, concordancy checks, and teacher feedback.
              </p>
              <span className="text-xs text-teal-600 font-bold inline-flex items-center gap-1 pt-1">
                <span>Instant KCSE mark breakdown</span>
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION: Standard Practicals Available */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Featured Practicals in the Repository
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Standardized practical papers available for immediate practice right now.
              </p>
            </div>

            <button
              onClick={() => handleGoToAuth('login')}
              className="text-xs font-bold text-slate-900 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Sign in to access all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {experiments.slice(0, 6).map(exp => (
              <div 
                key={exp.id} 
                className="bg-slate-50 hover:bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      {exp.subject}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {exp.kcsePaper}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                    {exp.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {exp.topic}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span>{exp.steps?.length || 4} Guided Steps</span>
                  <button
                    onClick={() => startExperiment(exp, null, 'practice')}
                    className="font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                  >
                    <span>Try practical</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION: Frequently Asked Questions */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 text-slate-700 text-xs font-semibold">
              <HelpCircle className="w-3.5 h-3.5 text-slate-600" />
              <span>Questions & Answers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Have a question about using STEM Spark Lab? Here are the most common answers.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 text-sm hover:bg-slate-50/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION: Call To Action Footer Banner */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start Your Science Lab Journey Today</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Excel in Secondary Science Practicals?
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Join secondary school students and teachers already using STEM Spark Lab to build practical laboratory mastery.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleGoToAuth('register_student')}
              className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Register student account</span>
            </button>

            <button
              onClick={() => handleGoToAuth('login')}
              className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all border border-white/20 flex items-center gap-2"
            >
              <span>Sign in</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Decorative backdrop elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

    </div>
  );
};
