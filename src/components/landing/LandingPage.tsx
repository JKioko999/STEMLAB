import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FlaskConical, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  LogIn, 
  UserPlus, 
  Award, 
  ShieldCheck, 
  Zap, 
  Flame, 
  Scale, 
  BookOpen, 
  GraduationCap, 
  Users, 
  School as SchoolIcon, 
  ChevronRight, 
  HelpCircle,
  Clock,
  Coins,
  Cpu,
  BarChart3,
  Layers,
  HeartHandshake
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { 
    currentUser, 
    setCurrentView, 
    setAuthMode, 
    users, 
    login, 
    experiments, 
    startExperiment 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'titration' | 'circuits' | 'qualitative' | 'food_test' | 'hookes_law'>('titration');

  const handleGoToAuth = (mode: 'login' | 'register_student') => {
    setAuthMode(mode);
    setCurrentView('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickDemoLogin = (userRole: 'student' | 'teacher' | 'school_admin' | 'super_admin') => {
    const target = users.find(u => u.role === userRole);
    if (target) {
      login(target);
      setCurrentView('dashboard');
    }
  };

  const handleLaunchExperimentDirectly = (simType: string) => {
    const exp = experiments.find(e => e.simulationType === simType) || experiments[0];
    if (!currentUser) {
      // Log in as student demo
      const demoStudent = users.find(u => u.role === 'student') || users[0];
      login(demoStudent);
    }
    startExperiment(exp, null, 'practice');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 py-2 px-4 text-center text-xs font-semibold text-white tracking-wide shadow-md">
        <span className="inline-flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-300" />
          <span>KENYA NATIONAL EXAMINATIONS COUNCIL (KNEC) KCSE PRACTICAL SYLLABUS CALIBRATED</span>
          <span className="hidden md:inline text-emerald-200">• Chemistry (233/3) • Physics (232/3) • Biology (231/3)</span>
        </span>
      </div>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-800">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>STEM Spark Lab • Virtual Science Laboratory Ecosystem</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
              Hands-On Science Practicals for Every Kenyan Student,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Anytime & Anywhere.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
              Eliminate expensive chemical refills and broken glassware. Master volumetric titrations, electricity circuits, qualitative inorganic tests, and biochemical assays with authentic lab behavior, realistic error penalties, and auto-marked KNEC answer sheets.
            </p>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => handleGoToAuth('register_student')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5"
              >
                <UserPlus className="w-5 h-5 text-slate-950" />
                <span>Register as Student</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>

              <button
                onClick={() => handleGoToAuth('login')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base border border-slate-700 shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5 text-emerald-400" />
                <span>Sign In to Lab Portal</span>
              </button>

              {currentUser && (
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>Return to My Dashboard</span>
                </button>
              )}
            </div>

            {/* Metrics Bar */}
            <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow">
                <div className="text-2xl lg:text-3xl font-black text-emerald-400">100%</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">KNEC KCSE Paper 3 Aligned</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow">
                <div className="text-2xl lg:text-3xl font-black text-cyan-400">KES 0</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">Chemical & Glassware Breakage</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow">
                <div className="text-2xl lg:text-3xl font-black text-amber-400">50+</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">Practice Runs per Candidate</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow">
                <div className="text-2xl lg:text-3xl font-black text-violet-400">47</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">Kenyan Counties Accessible</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. "WHAT WE DO" - VIRTUAL LABORATORY SIMULATIONS */}
      <section className="py-16 lg:py-24 bg-slate-900/50 border-b border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-center gap-1.5">
              <FlaskConical className="w-4 h-4" />
              <span>What We Do • The Simulated Practicals</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Genuine Laboratory Mechanics, Not Static Video Clips
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Students operate physical apparatus directly: turn burette stopcocks to deliver micro-drops, clamp apparatus to retort stands, wire circuit terminals with positive-to-negative polarity, and observe real precipitation reactions.
            </p>
          </div>

          {/* Interactive Lab Showcase Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setActiveTab('titration')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeTab === 'titration'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60'
              }`}
            >
              <FlaskConical className="w-4 h-4 text-cyan-300" />
              <span>Volumetric Titration (233/3)</span>
            </button>

            <button
              onClick={() => setActiveTab('circuits')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeTab === 'circuits'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Ohm's Law Circuits (232/3)</span>
            </button>

            <button
              onClick={() => setActiveTab('qualitative')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeTab === 'qualitative'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-teal-300" />
              <span>Qualitative Analysis (233/3)</span>
            </button>

            <button
              onClick={() => setActiveTab('food_test')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeTab === 'food_test'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60'
              }`}
            >
              <Flame className="w-4 h-4 text-rose-300" />
              <span>Biochemical Food Tests (231/3)</span>
            </button>

            <button
              onClick={() => setActiveTab('hookes_law')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeTab === 'hookes_law'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60'
              }`}
            >
              <Scale className="w-4 h-4 text-cyan-300" />
              <span>Hooke's Law Mechanics (232/3)</span>
            </button>
          </div>

          {/* Active Tab Showcase Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl">
            {activeTab === 'titration' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-semibold">
                    KCSE Chemistry Paper 3 • Practical Question 1 (233/3)
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    Acid-Base Volumetric Titration with Real Meniscus Physics
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Standardize hydrochloric acid using 0.1M sodium hydroxide. Students mount the burette to a retort stand, position the conical flask on a white ceramic tile, pipette 25.0 cm³ of base, add indicator, and control the stopcock tap for 0.05 cm³ micro-drops.
                  </p>
                  
                  <div className="space-y-2 pt-2">
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Real Over-Titration Penalties:</strong> Adding acid beyond the 24.50 cm³ equivalence point discolors the solution into deep acid red/clear and penalizes the answer sheet.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Multiple Indicators:</strong> Experience both Phenolphthalein (pink to colourless) and Methyl Orange (yellow to orange endpoint).</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Movable Apparatus:</strong> Freely drag and position retort stand, burette, tile, and flask across the lab workbench.</span>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center gap-3">
                    <button
                      onClick={() => handleLaunchExperimentDirectly('titration')}
                      className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition flex items-center gap-2 shadow"
                    >
                      <FlaskConical className="w-4 h-4" />
                      <span>Launch Interactive Titration Bench</span>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-4">
                  <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                    SIMULATION PREVIEW
                  </div>
                  <div className="h-48 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center relative overflow-hidden">
                    <div className="w-3.5 h-36 bg-slate-400 rounded-t relative">
                      <div className="absolute top-8 left-4 w-6 h-28 border-x-2 border-cyan-400/50 bg-cyan-500/20">
                        <div className="w-full h-14 bg-cyan-400/40 absolute bottom-0" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-10 border-2 border-slate-400 bg-pink-500/30 rounded-b-xl flex items-center justify-center">
                      <span className="text-[9px] font-mono text-pink-200">25.0 cm³</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    Burette readings automatically populate KNEC Table 1 on the Digital Answer Sheet.
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'circuits' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-xs font-semibold">
                    KCSE Physics Paper 3 • Practical Question 1 (232/3)
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    Ohm's Law & Internal Resistance Circuit Assembly
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Connect real lead-wire banana plugs from positive to negative terminals across dry cells, knife switches, analog ammeters, analog voltmeters, rheostats, and constantan resistance wires.
                  </p>
                  
                  <div className="space-y-2 pt-2">
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Short Circuit Modeling:</strong> Connecting battery terminals directly triggers fire hazard and heating alerts.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Polarity & Series Meter Errors:</strong> Connecting a voltmeter in series or ammeter in reverse polarity produces accurate circuit choking and negative needle deflection.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Sliding Rheostat:</strong> Adjust sliding contact in real time to observe concurrent Voltage ($V$) and Current ($I$) changes.</span>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center gap-3">
                    <button
                      onClick={() => handleLaunchExperimentDirectly('circuit')}
                      className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition flex items-center gap-2 shadow"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Launch Interactive Circuit Bench</span>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-4">
                  <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                    CIRCUIT DIAGNOSTICS PREVIEW
                  </div>
                  <div className="h-48 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-around p-4 relative">
                    <div className="w-16 h-20 rounded-xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center">
                      <span className="text-[10px] text-amber-400 font-bold">AMMETER</span>
                      <span className="text-sm font-mono text-white font-extrabold">0.45 A</span>
                    </div>
                    <div className="w-16 h-20 rounded-xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center">
                      <span className="text-[10px] text-cyan-400 font-bold">VOLTMETER</span>
                      <span className="text-sm font-mono text-white font-extrabold">2.25 V</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    Live ammeter and voltmeter needles deflect continuously as resistance is dialed.
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'qualitative' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950 text-teal-400 border border-teal-800 text-xs font-semibold">
                    KCSE Chemistry Paper 3 • Practical Question 2 (233/3)
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    Qualitative Inorganic Analysis & Precipitation
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Identify unknown Solid Q through dissolution, dropwise and excess reagent testing with 2.0M Sodium Hydroxide, Aqueous Ammonia, Barium Nitrate, and Dilute Hydrochloric Acid.
                  </p>
                  
                  <div className="space-y-2 pt-2">
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Green Dirty Fe²⁺ Precipitate:</strong> Formation of dirty green gelatinous iron(II) hydroxide, insoluble in excess NaOH.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>White BaSO₄ Precipitate:</strong> Confirmatory sulphate ion (SO₄²⁻) precipitate insoluble in dilute acid.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Ceramic Spot Tile:</strong> Drag tubes onto the ceramic tile to inspect clarity and precipitate formation.</span>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center gap-3">
                    <button
                      onClick={() => handleLaunchExperimentDirectly('qualitative')}
                      className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition flex items-center gap-2 shadow"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Launch Qualitative Analysis Bench</span>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-4">
                  <div className="text-xs font-mono text-teal-400 font-bold uppercase tracking-wider">
                    TEST TUBES & PRECIPITATE PREVIEW
                  </div>
                  <div className="h-48 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-around p-4 relative">
                    <div className="w-12 h-36 rounded-b-2xl border border-slate-600 bg-white/5 relative overflow-hidden flex flex-col justify-end">
                      <div className="h-20 bg-emerald-700/60 border-t border-emerald-400 rounded-b-xl flex items-center justify-center">
                        <span className="text-[7px] text-white font-bold">Fe(OH)₂</span>
                      </div>
                    </div>
                    <div className="w-12 h-36 rounded-b-2xl border border-slate-600 bg-white/5 relative overflow-hidden flex flex-col justify-end">
                      <div className="h-16 bg-slate-100/70 border-t border-white rounded-b-xl flex items-center justify-center">
                        <span className="text-[7px] text-slate-950 font-bold">BaSO₄</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    Accurate observation logging matches official KNEC marking key rubrics.
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'food_test' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950 text-rose-400 border border-rose-800 text-xs font-semibold">
                    KCSE Biology Paper 3 • Practical Question 1 (231/3)
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    Biochemical Food Nutrient Testing & 95°C Water Bath
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Test food extract Solution X for reducing sugars, proteins, and starch using Benedict's solution, Biuret reagent (NaOH + CuSO₄), and Iodine solution.
                  </p>
                  
                  <div className="space-y-2 pt-2">
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Water Bath Immersion:</strong> Drag test tubes directly into the 95°C boiling water bath to observe reducing sugar color shifts (blue to green to yellow to brick-red).</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Inaccurate Procedure Warnings:</strong> Boiling the Biuret test triggers examiner alerts explaining that heat denatures peptides.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Graduated Syringe:</strong> Dispense customizable doses of food extract Solution X.</span>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center gap-3">
                    <button
                      onClick={() => handleLaunchExperimentDirectly('food_test')}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center gap-2 shadow"
                    >
                      <Flame className="w-4 h-4" />
                      <span>Launch Food Testing Bench</span>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-4">
                  <div className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider">
                    WATER BATH HEATING PREVIEW
                  </div>
                  <div className="h-48 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-4 relative">
                    <div className="w-32 h-36 border-2 border-cyan-400/40 rounded-b-2xl bg-cyan-950/20 flex flex-col justify-end p-2 relative">
                      <div className="w-full h-24 bg-cyan-500/20 border-t border-cyan-300 rounded-b-xl flex items-center justify-center">
                        <Flame className="w-6 h-6 text-rose-500 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    Tubes heated in the water bath show gradual color transitions.
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hookes_law' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-semibold">
                    KCSE Physics Paper 3 • Practical Question 2 (232/3)
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    Hooke's Law Helical Spring Mechanics & Parallax Modeling
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Suspend slotted masses onto the spring hanger, measure pointer extensions against a vertical metre rule, and observe Hooke's Law ($F = ke$) elasticity.
                  </p>
                  
                  <div className="space-y-2 pt-2">
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Elastic Limit Overload:</strong> Exceeding 350g breaks the spring's elasticity, causing permanent plastic elongation and straight-line graph distortion.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Eye-Level Parallax Toggle:</strong> Switch between eye-level, high-angle (+0.6cm), and low-angle (-0.6cm) viewing to understand systematic measurement error.</span>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center gap-3">
                    <button
                      onClick={() => handleLaunchExperimentDirectly('hookes_law')}
                      className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition flex items-center gap-2 shadow"
                    >
                      <Scale className="w-4 h-4" />
                      <span>Launch Hooke's Law Bench</span>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-4">
                  <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                    SPRING EXTENSION PREVIEW
                  </div>
                  <div className="h-48 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-around p-4 relative">
                    <div className="w-8 h-40 bg-amber-100 rounded border border-amber-300 flex flex-col justify-between py-1">
                      <span className="text-[7px] text-slate-950 font-mono">0cm</span>
                      <span className="text-[7px] text-slate-950 font-mono">50cm</span>
                      <span className="text-[7px] text-slate-950 font-mono">100cm</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-1 h-24 bg-slate-400" />
                      <div className="w-8 h-2 bg-amber-600 rounded" />
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    Pointer reading $L$ and extension $e$ update dynamically.
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 4. "HOW THIS HELPS" - EDUCATIONAL IMPACT & BENEFITS */}
      <section className="py-16 lg:py-24 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-center gap-1.5">
              <HeartHandshake className="w-4 h-4" />
              <span>How STEM Spark Lab Helps • Solving Kenya's Practical Crisis</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Bridging the Science Practical Divide Across Secondary Schools
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              For decades, science practicals in Kenya have suffered from inadequate laboratory facilities, depleted reagents, and high student-to-apparatus ratios. Here is how STEM Spark Lab transforms the experience:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Zero Chemical Costs */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 hover:border-emerald-500/50 transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Coins className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Eliminates Consumable Costs
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Secondary schools spend hundreds of thousands of KES on chemicals, indicator solutions, and glassware replacements each term. STEM Spark Lab costs zero shillings in reagents and never breaks a single burette.
              </p>
            </div>

            {/* Card 2: 1-to-1 Practical Practice */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 hover:border-cyan-500/50 transition">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                1-on-1 Practice for Every Student
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                In overcrowded school labs, 8 to 12 students crowd around a single retort stand while one student handles the stopcock. On STEM Spark Lab, every candidate performs all practical steps independently.
              </p>
            </div>

            {/* Card 3: Instant KNEC Auto-Grading */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 hover:border-amber-500/50 transition">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Instant Marking & Examiner Rubrics
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Teachers receive auto-marked observation sheets with KNEC accuracy ranges (±0.1 cm³ concordancy), error diagnostic penalties, and real-time class submission analytics.
              </p>
            </div>

            {/* Card 4: Equal Opportunity for All Counties */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 hover:border-violet-500/50 transition">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <SchoolIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                County & Sub-County Lab Equity
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Day secondary and sub-county schools gain access to the same calibrated laboratory apparatus, indicators, and instruments as prestigious national schools across Kenya.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 5. QUICK 1-CLICK PERSONA TEST DRIVE */}
      <section className="py-16 bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Instant Test Drive • No Password Required
              </span>
              <h3 className="text-2xl font-bold text-white mt-1">
                Explore as Any Persona in the Kenyan Lab System
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Click any profile below to experience the platform from a Student, Teacher, Principal, or Platform Admin perspective:
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleGoToAuth('login')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold border border-slate-700 transition"
              >
                Go to Sign In
              </button>
              <button
                onClick={() => handleGoToAuth('register_student')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
              >
                Register as Student
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Student Demo */}
            <div 
              onClick={() => handleQuickDemoLogin('student')}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-violet-500/60 transition cursor-pointer group shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800">
                  Student Persona
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition" />
              </div>
              <div className="font-bold text-white text-sm">Faith Wanjiku</div>
              <div className="text-xs text-slate-400 mt-0.5">Form 3 East • Nairobi Girls' High</div>
              <div className="text-[11px] text-violet-400 mt-3 font-semibold flex items-center gap-1">
                <span>Enter Student Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Teacher Demo */}
            <div 
              onClick={() => handleQuickDemoLogin('teacher')}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/60 transition cursor-pointer group shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  Teacher Persona
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
              </div>
              <div className="font-bold text-white text-sm">Mr. Peter Kamau</div>
              <div className="text-xs text-slate-400 mt-0.5">HOD Chemistry • Nairobi Girls' High</div>
              <div className="text-[11px] text-amber-400 mt-3 font-semibold flex items-center gap-1">
                <span>Enter Teacher Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* School Admin Demo */}
            <div 
              onClick={() => handleQuickDemoLogin('school_admin')}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/60 transition cursor-pointer group shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  Principal Persona
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition" />
              </div>
              <div className="font-bold text-white text-sm">Mr. Kenneth Ngigi</div>
              <div className="text-xs text-slate-400 mt-0.5">Principal • Nairobi School</div>
              <div className="text-[11px] text-blue-400 mt-3 font-semibold flex items-center gap-1">
                <span>Enter School Admin View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Super Admin Demo */}
            <div 
              onClick={() => handleQuickDemoLogin('super_admin')}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/60 transition cursor-pointer group shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Platform Owner
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
              </div>
              <div className="font-bold text-white text-sm">Platform Director</div>
              <div className="text-xs text-slate-400 mt-0.5">jkioko999@gmail.com</div>
              <div className="text-[11px] text-emerald-400 mt-3 font-semibold flex items-center gap-1">
                <span>Manage Institutional Schools</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. CALL TO ACTION FOOTER BANNER */}
      <section className="py-16 lg:py-20 relative overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6 relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-xl">
            <FlaskConical className="w-8 h-8" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Ready to Revolutionize Your KCSE Practical Results?
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Join hundreds of secondary students and educators across Kenya mastering volumetric analysis, electricity circuits, and food tests on STEM Spark Lab.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => handleGoToAuth('register_student')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5 text-slate-950" />
              <span>Create Free Student Account</span>
            </button>

            <button
              onClick={() => handleGoToAuth('login')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5 text-emerald-400" />
              <span>Sign In with Existing Account</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
