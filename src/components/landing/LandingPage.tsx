import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Play, 
  ArrowRight
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

  const [activeTab, setActiveTab] = useState<'titration' | 'circuits' | 'qualitative' | 'food_test'>('titration');

  const handleGoToAuth = (mode: 'login' | 'register_student') => {
    setAuthMode(mode);
    setCurrentView('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchExperimentDirectly = (simType: string) => {
    const exp = experiments.find(e => e.simulationType === simType) || experiments[0];
    if (!currentUser) {
      const demoStudent = users.find(u => u.role === 'student') || users[0];
      login(demoStudent);
    }
    startExperiment(exp, null, 'practice');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      
      {/* Notice bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 px-4 text-xs text-slate-600 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span>Curriculum practicals calibrated for Chemistry (233/3), Physics (232/3), and Biology (231/3).</span>
          <button
            onClick={() => handleGoToAuth('login')}
            className="text-slate-900 dark:text-slate-100 font-medium hover:underline hidden sm:inline"
          >
            Sign in
          </button>
        </div>
      </div>

      {/* Hero Section - Left aligned, clean typography */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Virtual science practicals for secondary schools
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Standardized laboratory simulations for Paper 3 practicals. Run acid-base titrations, electrical circuits, qualitative inorganic reactions, and biochemical tests with procedural validation and teacher grading.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleGoToAuth('login')}
                className="px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-medium transition-colors shadow-sm"
              >
                Sign in to lab
              </button>

              <button
                onClick={() => handleGoToAuth('register_student')}
                className="px-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors shadow-sm"
              >
                Register student account
              </button>

              {currentUser && (
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="px-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium transition-colors inline-flex items-center gap-1"
                >
                  <span>Go to dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Core subjects */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Subjects covered</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Standardized modules matching secondary national syllabi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">Chemistry (233/3)</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Volumetric titration, molarity calculations, titre concordance check within ±0.20 cm³, and systematic qualitative inorganic identification tests.
              </p>
            </div>

            <div className="p-4 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">Physics (232/3)</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Current-voltage circuit wiring, rheostat resistance variations, Ohm's law slope plotting, and spring mechanics validation.
              </p>
            </div>

            <div className="p-4 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">Biology (231/3)</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Biochemical qualitative food testing for reducing sugars (Benedict's), proteins (Biuret), starch (iodine), and enzyme temperature rate curves.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive practical modules preview */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Simulated practical modules</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Interactive instruments with step-by-step measurement recording and validation.
              </p>
            </div>

            {/* Clean segmented tab switcher */}
            <div className="flex items-center space-x-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setActiveTab('titration')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === 'titration'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Titration
              </button>
              <button
                onClick={() => setActiveTab('circuits')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === 'circuits'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Electricity
              </button>
              <button
                onClick={() => setActiveTab('qualitative')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === 'qualitative'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Qualitative
              </button>
              <button
                onClick={() => setActiveTab('food_test')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === 'food_test'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Biochemical
              </button>
            </div>
          </div>

          <div className="p-5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            {activeTab === 'titration' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2 space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                    Volumetric acid-base titration
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Operate a 50.0 cm³ burette to titrate standard hydrochloric acid into sodium hydroxide solution. Add indicator, control stopcock flow drop-by-drop, and record consecutive titre values into an auto-checked answer table.
                  </p>
                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-1">
                    <div>· Apparatus: 50.0 cm³ burette, 25.0 cm³ pipette, conical flask, white tile</div>
                    <div>· Chemistry Paper: 233/3 Question 1</div>
                  </div>
                </div>

                <div className="text-right">
                  <button
                    onClick={() => handleLaunchExperimentDirectly('titration')}
                    className="w-full sm:w-auto px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-medium transition-colors shadow-sm inline-flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Launch practical</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'circuits' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2 space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                    Ohm&apos;s law & circuit analysis
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Connect an ammeter in series, voltmeter across a constantan wire resistor, and variable rheostat. Toggle the switch to measure current and potential difference across 5 increments.
                  </p>
                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-1">
                    <div>· Apparatus: DC cells, ammeter, voltmeter, rheostat, switch, connecting leads</div>
                    <div>· Physics Paper: 232/3 Question 1</div>
                  </div>
                </div>

                <div className="text-right">
                  <button
                    onClick={() => handleLaunchExperimentDirectly('ohms_law')}
                    className="w-full sm:w-auto px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-medium transition-colors shadow-sm inline-flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Launch practical</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'qualitative' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2 space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                    Qualitative inorganic analysis
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Test an unknown solid salt for cations and anions. Add aqueous sodium hydroxide and ammonia dropwise until in excess to identify metal hydroxides by color and solubility.
                  </p>
                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-1">
                    <div>· Apparatus: Boiling tubes, dropper, NaOH(aq), NH₃(aq), Ba(NO₃)₂, litmus papers</div>
                    <div>· Chemistry Paper: 233/3 Question 2</div>
                  </div>
                </div>

                <div className="text-right">
                  <button
                    onClick={() => handleLaunchExperimentDirectly('qualitative_analysis')}
                    className="w-full sm:w-auto px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-medium transition-colors shadow-sm inline-flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Launch practical</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'food_test' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2 space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                    Food nutrient qualitative testing
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Determine food nutrients in solution. Conduct Benedict&apos;s test in a water bath for reducing sugars, Biuret test for proteins, and iodine for starch.
                  </p>
                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-1">
                    <div>· Apparatus: Test tubes, water bath, Benedict&apos;s solution, 10% NaOH, 1% CuSO₄, iodine</div>
                    <div>· Biology Paper: 231/3 Question 1</div>
                  </div>
                </div>

                <div className="text-right">
                  <button
                    onClick={() => handleLaunchExperimentDirectly('food_test')}
                    className="w-full sm:w-auto px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-medium transition-colors shadow-sm inline-flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Launch practical</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Experiment catalog list */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Standard practical repository</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Official practical specifications available in the platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {experiments.slice(0, 6).map(exp => (
              <div key={exp.id} className="p-4 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {exp.subject} · {exp.kcsePaper.split(' ')[0]}
                  </span>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mt-1">{exp.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{exp.topic}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{exp.steps.length} steps</span>
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        const demoStudent = users.find(u => u.role === 'student') || users[0];
                        login(demoStudent);
                      }
                      startExperiment(exp, null, 'practice');
                    }}
                    className="font-medium text-slate-900 dark:text-slate-100 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Try practical</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

    </div>
  );
};
