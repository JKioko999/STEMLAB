import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { InteractiveTitrationWorkbench } from './apparatus/InteractiveTitrationWorkbench';
import { InteractiveOhmsLawWorkbench } from './apparatus/InteractiveOhmsLawWorkbench';
import { InteractiveQualitativeWorkbench } from './apparatus/InteractiveQualitativeWorkbench';
import { InteractiveFoodTestWorkbench } from './apparatus/InteractiveFoodTestWorkbench';
import { InteractiveHookesLawWorkbench } from './apparatus/InteractiveHookesLawWorkbench';
import { InteractiveGeneralWorkbench } from './apparatus/InteractiveGeneralWorkbench';
import { DigitalAnswerSheet } from './DigitalAnswerSheet';
import { 
  FlaskConical, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft,
  ArrowLeft, 
  RotateCcw, 
  Award, 
  Sparkles, 
  Zap, 
  FileCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Maximize2
} from 'lucide-react';
import { StepLogEntry, StudentAnswer, Attempt } from '../../types';

export const LabWorkspace: React.FC = () => {
  const { 
    currentUser, 
    activeExperiment, 
    activeAssignment, 
    activeLabMode, 
    setCurrentView, 
    submitExperimentAttempt 
  } = useApp();

  if (!activeExperiment) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>No active experiment selected.</p>
        <button onClick={() => setCurrentView('dashboard')} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isExamMode = activeLabMode === 'exam';

  // Step state tracking
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [stepLogs, setStepLogs] = useState<StepLogEntry[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [isForcePushModalOpen, setIsForcePushModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'simulation' | 'answersheet'>('simulation');
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);

  // Live Experiment Telemetry from the active workbench
  const [liveTelemetry, setLiveTelemetry] = useState<any>(null);

  // Form State Persistence: Answers are NEVER wiped when switching tabs
  const [persistedAnswersState, setPersistedAnswersState] = useState<Record<string, any>>({});

  // Exam Countdown Timer (KCSE Paper 3 Standard: 45 to 135 mins)
  const initialSeconds = (activeAssignment?.timeLimitMinutes || activeExperiment.estimatedDurationMinutes || 45) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);

  // Results Modal State
  const [submittedAttempt, setSubmittedAttempt] = useState<Attempt | null>(null);

  useEffect(() => {
    if (!isExamMode) return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isExamMode]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentStep = activeExperiment.steps[currentStepIndex];

  // Handler: When a student completes an interactive step in the simulator
  const handleSimulatorStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
      
      const targetStep = activeExperiment.steps.find(s => s.id === stepId) || currentStep;
      const logEntry: StepLogEntry = {
        stepId,
        status: 'passed',
        marksEarned: targetStep.marks,
        marksPossible: targetStep.marks,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setStepLogs(prev => [...prev.filter(l => l.stepId !== stepId), logEntry]);

      // Auto advance to next step if at current step
      if (currentStep && currentStep.id === stepId && currentStepIndex < activeExperiment.steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      }
    }
  };

  // Handler: Force-Push mechanism (Section 3.1.2)
  const handleForcePushConfirm = () => {
    if (!currentStep) return;

    const logEntry: StepLogEntry = {
      stepId: currentStep.id,
      status: 'force_pushed',
      marksEarned: 0,
      marksPossible: currentStep.marks,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setStepLogs(prev => [...prev.filter(l => l.stepId !== currentStep.id), logEntry]);

    setIsForcePushModalOpen(false);
    if (currentStepIndex < activeExperiment.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  // Handler: Submit practical answer sheet & auto-grade
  const handleAnswerSheetSubmit = (answers: StudentAnswer[]) => {
    const proceduralMarks = stepLogs.reduce((acc, l) => acc + l.marksEarned, 0);
    const totalProceduralPossible = activeExperiment.steps.reduce((acc, s) => acc + s.marks, 0);

    const questionMarks = answers.reduce((acc, a) => acc + a.autoScore, 0);
    const totalQuestionPossible = activeExperiment.answerSheet.reduce((acc, q) => acc + q.maxMarks, 0);

    const totalEarned = proceduralMarks + questionMarks;
    const maxScore = totalProceduralPossible + totalQuestionPossible;
    const percentage = Math.round((totalEarned / maxScore) * 100);

    const attempt = submitExperimentAttempt({
      schoolId: currentUser?.schoolId || 'sch-default',
      assignmentId: activeAssignment?.id,
      isPracticeOpenLab: !activeAssignment,
      experimentId: activeExperiment.id,
      experimentTitle: activeExperiment.title,
      subject: activeExperiment.subject,
      studentId: currentUser?.id || 'usr-guest',
      studentName: currentUser?.name || 'Student Candidate',
      studentAdmission: currentUser?.admissionNumber || 'NGH/2026/01',
      teacherId: activeAssignment?.teacherId || currentUser?.teacherId,
      teacherName: activeAssignment?.teacherName || currentUser?.teacherName,
      classId: activeAssignment?.classId || currentUser?.classId,
      className: activeAssignment?.className || currentUser?.className,
      mode: activeLabMode,
      startedAt: new Date(Date.now() - 25 * 60000).toISOString(),
      status: 'submitted',
      stepLogs: stepLogs.length > 0 ? stepLogs : activeExperiment.steps.map(s => ({
        stepId: s.id,
        status: completedSteps.includes(s.id) ? 'passed' : 'passed',
        marksEarned: s.marks,
        marksPossible: s.marks,
        timestamp: '14:20'
      })),
      answers,
      totalScore: totalEarned,
      maxScore,
      percentage
    });

    setSubmittedAttempt(attempt);
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-12">
      
      {/* Top Navigation & Status Bar */}
      <div className="bg-slate-850 border-b border-slate-800 sticky top-16 z-30 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  isExamMode 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {isExamMode ? 'KCSE Exam Mode' : 'Practice Mode'}
                </span>
                <span className="text-xs text-slate-400 font-mono">{activeExperiment.kcsePaper}</span>
              </div>
              <h1 className="text-sm sm:text-base font-extrabold text-white leading-tight mt-0.5">
                {activeExperiment.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-end md:self-auto">
            {/* Exam Countdown Timer */}
            {isExamMode && (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold shadow">
                <Clock className="w-3.5 h-3.5 animate-pulse text-rose-400" />
                <span>Timer: {formatTimer(secondsRemaining)}</span>
              </div>
            )}

            {/* Toggle Guided Steps Sidebar Button */}
            <button
              onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition hidden md:flex items-center gap-1 text-xs border border-slate-700 font-medium"
              title={isLeftPanelCollapsed ? 'Show guided steps panel' : 'Collapse steps for full-width workbench'}
            >
              {isLeftPanelCollapsed ? <PanelLeftOpen className="w-4 h-4 text-emerald-400" /> : <PanelLeftClose className="w-4 h-4 text-slate-400" />}
              <span>{isLeftPanelCollapsed ? 'Show Steps' : 'Full Canvas'}</span>
            </button>

            {/* View Switcher: Simulation Canvas vs Answer Sheet */}
            <div className="flex p-1 bg-slate-800 rounded-xl border border-slate-700 text-xs font-semibold shadow-inner">
              <button
                onClick={() => setActiveTab('simulation')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'simulation'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Lab Apparatus</span>
              </button>

              <button
                onClick={() => setActiveTab('answersheet')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'answersheet'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Digital Answer Sheet</span>
                {Object.keys(persistedAnswersState).length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 ml-1" />
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT PANEL: Step-by-Step Guided Instructions */}
          {!isLeftPanelCollapsed && (
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Guided Practical Steps
                  </span>
                  <span className="text-xs text-emerald-400 font-mono font-semibold">
                    Step {currentStepIndex + 1} of {activeExperiment.steps.length}
                  </span>
                </div>

                {/* Current Active Step Box */}
                {currentStep && (
                  <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-3 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Step {currentStep.id} • [{currentStep.marks} Marks]
                      </span>
                      {completedSteps.includes(currentStep.id) && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" /> Validated
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-medium text-white leading-relaxed">
                      {currentStep.instruction}
                    </p>

                    {/* Hint in Practice Mode */}
                    {!isExamMode && currentStep.hint && (
                      <div className="pt-2 border-t border-slate-800">
                        {showHint ? (
                          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start space-x-2">
                            <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{currentStep.hint}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowHint(true)}
                            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Show Step Hint</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Step Navigation & Reverse Step in Guided Steps */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => setIsForcePushModalOpen(true)}
                        className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Force-Push</span>
                      </button>

                      <div className="flex items-center space-x-1.5">
                        {/* Reverse Step / Previous Step Button */}
                        {currentStepIndex > 0 && (
                          <button
                            onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition flex items-center gap-1"
                            title="Go to previous step instruction"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Prev</span>
                          </button>
                        )}

                        {currentStepIndex < activeExperiment.steps.length - 1 && (
                          <button
                            onClick={() => setCurrentStepIndex(prev => prev + 1)}
                            className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-650 text-white text-xs font-semibold transition flex items-center gap-1"
                          >
                            <span>Next</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* All Steps Stepper Checklist */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                    Full Sequence Checklist
                  </span>
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {activeExperiment.steps.map((st, sIdx) => {
                      const isDone = completedSteps.includes(st.id);
                      const isCurrent = sIdx === currentStepIndex;

                      return (
                        <div
                          key={st.id}
                          onClick={() => setCurrentStepIndex(sIdx)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                            isCurrent
                              ? 'bg-slate-750 border-emerald-500/80 text-white font-semibold'
                              : isDone
                              ? 'bg-slate-900/60 border-slate-750 text-slate-300'
                              : 'bg-slate-900/30 border-slate-800 text-slate-500'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isDone ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                            }`}>
                              {isDone ? '✓' : st.id}
                            </span>
                            <span className="line-clamp-1">{st.instruction}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{st.marks}m</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Apparatus in Sidebar */}
                <div className="pt-3 border-t border-slate-700/60">
                  <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
                    Apparatus List ({activeExperiment.apparatus.length})
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {activeExperiment.apparatus.map(app => (
                      <div 
                        key={app.id}
                        className={`p-2 rounded-lg border text-slate-300 flex items-center space-x-1.5 ${
                          app.isDistractor ? 'border-dashed border-slate-700 bg-slate-900/40 opacity-70' : 'border-slate-700 bg-slate-900/80'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="truncate">{app.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* RIGHT / MAIN PANEL: Active Simulator and Digital Answer Sheet (Both kept mounted!) */}
          <div className={`${isLeftPanelCollapsed ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-6`}>
            
            {/* Simulation Workbench View (Preserved in DOM) */}
            <div className={activeTab === 'simulation' ? 'space-y-4' : 'hidden'}>
              {activeExperiment.simulationType === 'titration' && (
                <InteractiveTitrationWorkbench
                  isExamMode={isExamMode}
                  onStepComplete={handleSimulatorStepComplete}
                  onTitrationUpdate={setLiveTelemetry}
                />
              )}

              {activeExperiment.simulationType === 'circuit' && (
                <InteractiveOhmsLawWorkbench
                  currentStepIndex={currentStepIndex}
                  onStepComplete={handleSimulatorStepComplete}
                  onCircuitUpdate={setLiveTelemetry}
                />
              )}

              {activeExperiment.simulationType === 'qualitative' && (
                <InteractiveQualitativeWorkbench
                  onStepComplete={handleSimulatorStepComplete}
                  onQualitativeUpdate={setLiveTelemetry}
                />
              )}

              {activeExperiment.simulationType === 'food_test' && (
                <InteractiveFoodTestWorkbench
                  onStepComplete={handleSimulatorStepComplete}
                  onFoodTestUpdate={setLiveTelemetry}
                />
              )}

              {activeExperiment.simulationType === 'hookes_law' && (
                <InteractiveHookesLawWorkbench
                  onStepComplete={handleSimulatorStepComplete}
                  onHookesLawUpdate={setLiveTelemetry}
                />
              )}

              {(activeExperiment.simulationType === 'general' || 
                !['titration', 'circuit', 'qualitative', 'food_test', 'hookes_law'].includes(activeExperiment.simulationType)) && (
                <InteractiveGeneralWorkbench
                  currentStepIndex={currentStepIndex}
                  onStepComplete={handleSimulatorStepComplete}
                  onUpdateTelemetry={setLiveTelemetry}
                />
              )}

              {/* Quick Switch to Answer Sheet Banner */}
              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex items-center justify-between shadow-lg">
                <div className="text-xs text-slate-300">
                  Ready to record your results? All your apparatus setups, readings, and liquids are safely preserved when you fill in the answer sheet.
                </div>
                <button
                  onClick={() => setActiveTab('answersheet')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center space-x-1.5 shrink-0 ml-4 shadow-lg shadow-emerald-600/30"
                >
                  <span>Go to Digital Answer Sheet</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Answer Sheet View (Preserved in DOM with live telemetry reference!) */}
            <div className={activeTab === 'answersheet' ? 'space-y-4' : 'hidden'}>
              <DigitalAnswerSheet
                questions={activeExperiment.answerSheet}
                isExamMode={isExamMode}
                onSubmit={handleAnswerSheetSubmit}
                persistedAnswersState={persistedAnswersState}
                onAnswersChange={setPersistedAnswersState}
                liveTelemetry={liveTelemetry}
                onReturnToLab={() => setActiveTab('simulation')}
              />
            </div>

          </div>

        </div>
      </div>

      {/* Force Push Warning Modal (Section 3.1.2) */}
      {isForcePushModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-800 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Override Step Warning (Force-Push)</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              In accordance with KNEC KCSE rules, skipping or overriding this step will:
            </p>

            <ul className="text-xs text-slate-400 space-y-1.5 pl-4 list-disc">
              <li>Record a <strong className="text-rose-400">zero mark</strong> for this specific procedural step.</li>
              <li>Propagate potential downstream inaccuracies into your final measurement calculations.</li>
              <li>Log a permanent <strong className="text-amber-400">Force-Pushed Flag</strong> visible to your teacher ({currentUser?.teacherName}).</li>
            </ul>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setIsForcePushModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Go Back & Retry
              </button>
              <button
                onClick={handleForcePushConfirm}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results / Submission Receipt Modal */}
      {submittedAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-800 border border-emerald-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-lg">
                <Award className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-white">Practical Attempt Submitted!</h2>
              <p className="text-xs text-slate-400">
                {activeExperiment.title} • {isExamMode ? 'Official KCSE Exam Mode' : 'Practice Run'}
              </p>
            </div>

            {/* Score pill */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700/80 text-center space-y-1">
              <span className="text-xs uppercase font-bold text-slate-400">Preliminary Auto-Score</span>
              <div className="text-3xl font-black text-emerald-400">
                {submittedAttempt.totalScore} / {submittedAttempt.maxScore}
                <span className="text-lg text-slate-400 ml-2">({submittedAttempt.percentage}%)</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {isExamMode 
                  ? 'Your answers, step logs, and laboratory observations are submitted to your teacher for final evaluation.'
                  : 'Practice mode score recorded with instant feedback.'}
              </p>
            </div>

            {/* Step breakdown */}
            <div className="space-y-2 text-xs">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Procedural Step Summary:</div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-750">
                  <span className="text-slate-400 block text-[10px]">Steps Validated</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {submittedAttempt.stepLogs.filter(s => s.status === 'passed').length} / {submittedAttempt.stepLogs.length}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-750">
                  <span className="text-slate-400 block text-[10px]">Force-Pushed Steps</span>
                  <span className="font-bold text-amber-400 text-sm">
                    {submittedAttempt.stepLogs.filter(s => s.status === 'force_pushed').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setSubmittedAttempt(null);
                  setCurrentView('dashboard');
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/30"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
