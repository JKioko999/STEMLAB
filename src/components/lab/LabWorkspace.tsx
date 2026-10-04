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
  Award, 
  FileCheck,
  PanelLeftClose,
  PanelLeftOpen
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
      <div className="p-8 text-center text-slate-500">
        <p className="text-sm">No active experiment selected.</p>
        <button 
          onClick={() => setCurrentView('dashboard')} 
          className="mt-3 px-3 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded text-xs font-medium hover:bg-slate-800 dark:hover:bg-white transition"
        >
          Return to dashboard
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

  // Form State Persistence: Answers are preserved when switching tabs
  const [persistedAnswersState, setPersistedAnswersState] = useState<Record<string, any>>({});

  // Exam Countdown Timer
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

  // Handler: Force-Push mechanism
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-12">
      
      {/* Top Navigation & Status Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-14 z-30 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="p-1.5 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
              title="Return to dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${
                  isExamMode 
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900' 
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}>
                  {isExamMode ? 'Exam mode' : 'Practice mode'}
                </span>
                <span className="text-xs text-slate-500 font-mono">{activeExperiment.kcsePaper}</span>
              </div>
              <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                {activeExperiment.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 self-end md:self-auto">
            {/* Countdown timer */}
            {isExamMode && (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs font-mono font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Timer: {formatTimer(secondsRemaining)}</span>
              </div>
            )}

            {/* Toggle guided steps */}
            <button
              onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
              className="px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium transition hidden md:flex items-center gap-1.5"
              title={isLeftPanelCollapsed ? 'Show guided steps panel' : 'Collapse steps for full-width workbench'}
            >
              {isLeftPanelCollapsed ? <PanelLeftOpen className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
              <span>{isLeftPanelCollapsed ? 'Show steps' : 'Hide steps'}</span>
            </button>

            {/* View Switcher: Tabs with clean underline */}
            <div className="flex border border-slate-200 dark:border-slate-800 rounded bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-medium">
              <button
                onClick={() => setActiveTab('simulation')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded transition ${
                  activeTab === 'simulation'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Workbench</span>
              </button>

              <button
                onClick={() => setActiveTab('answersheet')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded transition ${
                  activeTab === 'answersheet'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Answer sheet</span>
                {Object.keys(persistedAnswersState).length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 ml-1" />
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
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Procedure
                  </span>
                  <span className="text-xs text-slate-500 font-mono font-medium">
                    Step {currentStepIndex + 1} of {activeExperiment.steps.length}
                  </span>
                </div>

                {/* Current Active Step Box */}
                {currentStep && (
                  <div className="p-3.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Step {currentStep.id} • {currentStep.marks} marks
                      </span>
                      {completedSteps.includes(currentStep.id) && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Validated
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-relaxed">
                      {currentStep.instruction}
                    </p>

                    {/* Hint in Practice Mode */}
                    {!isExamMode && currentStep.hint && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                        {showHint ? (
                          <div className="p-2.5 rounded border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs flex items-start space-x-2">
                            <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>{currentStep.hint}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowHint(true)}
                            className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium flex items-center gap-1"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Show hint</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Step Navigation & Reverse Step in Guided Steps */}
                    <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => setIsForcePushModalOpen(true)}
                        className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span>Force-push step</span>
                      </button>

                      <div className="flex items-center space-x-1.5">
                        {currentStepIndex > 0 && (
                          <button
                            onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                            className="px-2 py-1 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1"
                            title="Previous step"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Prev</span>
                          </button>
                        )}

                        {currentStepIndex < activeExperiment.steps.length - 1 && (
                          <button
                            onClick={() => setCurrentStepIndex(prev => prev + 1)}
                            className="px-2 py-1 rounded border border-slate-300 dark:border-slate-750 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-900 dark:text-slate-100 text-xs font-medium flex items-center gap-1"
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
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                    Step checklist
                  </span>
                  <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                    {activeExperiment.steps.map((st, sIdx) => {
                      const isDone = completedSteps.includes(st.id);
                      const isCurrent = sIdx === currentStepIndex;

                      return (
                        <div
                          key={st.id}
                          onClick={() => setCurrentStepIndex(sIdx)}
                          className={`p-2 rounded border text-xs cursor-pointer transition flex items-center justify-between ${
                            isCurrent
                              ? 'bg-slate-100 dark:bg-slate-800 border-slate-400 dark:border-slate-600 font-medium'
                              : isDone
                              ? 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                              : 'bg-white dark:bg-slate-900/30 border-slate-200 dark:border-slate-850 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-medium ${
                              isDone ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                              {isDone ? '✓' : st.id}
                            </span>
                            <span className="truncate">{st.instruction}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 ml-2">{st.marks}m</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Apparatus list in Sidebar */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-2">
                    Apparatus ({activeExperiment.apparatus.length})
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {activeExperiment.apparatus.map(app => (
                      <div 
                        key={app.id}
                        className={`p-1.5 rounded border text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 ${
                          app.isDistractor ? 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 opacity-70' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span className="truncate">{app.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* MAIN PANEL: Active Simulator and Digital Answer Sheet */}
          <div className={`${isLeftPanelCollapsed ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-4`}>
            
            {/* Simulation Workbench View */}
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
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded flex items-center justify-between">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Ready to record your results? All apparatus setups and readings remain saved when you switch to the answer sheet.
                </div>
                <button
                  onClick={() => setActiveTab('answersheet')}
                  className="px-3 py-1.5 rounded bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-medium text-xs transition flex items-center space-x-1.5 shrink-0 ml-4"
                >
                  <span>Go to answer sheet</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Answer Sheet View */}
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

      {/* Force Push Modal */}
      {isForcePushModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded max-w-md w-full p-5 space-y-4 shadow-lg">
            <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Skip step confirmation</h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Skipping or overriding this procedural step will:
            </p>

            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pl-4 list-disc">
              <li>Record 0 marks for this procedural step.</li>
              <li>May affect subsequent readings in the experiment.</li>
              <li>Log a force-pushed status on your submission record.</li>
            </ul>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setIsForcePushModalOpen(false)}
                className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-750"
              >
                Go back
              </button>
              <button
                onClick={handleForcePushConfirm}
                className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium"
              >
                Confirm skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results / Submission Receipt Modal */}
      {submittedAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-700 dark:text-slate-300">
                <Award className="w-5 h-5" />
              </div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Attempt submitted</h2>
              <p className="text-xs text-slate-500">
                {activeExperiment.title} • {isExamMode ? 'Exam mode' : 'Practice mode'}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded border border-slate-200 dark:border-slate-800 text-center space-y-1">
              <span className="text-[10px] uppercase font-medium text-slate-500 tracking-wider">Score</span>
              <div className="text-2xl font-mono font-semibold text-slate-900 dark:text-slate-100">
                {submittedAttempt.totalScore} / {submittedAttempt.maxScore}
                <span className="text-sm text-slate-500 font-normal ml-2">({submittedAttempt.percentage}%)</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {isExamMode 
                  ? 'Your answers, step logs, and readings are recorded for teacher review.'
                  : 'Practice mode score recorded.'}
              </p>
            </div>

            <div className="space-y-1 text-xs">
              <div className="text-slate-500 font-medium text-[10px] uppercase tracking-wider">Step summary:</div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <span className="text-slate-500 block text-[10px]">Validated</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                    {submittedAttempt.stepLogs.filter(s => s.status === 'passed').length} / {submittedAttempt.stepLogs.length}
                  </span>
                </div>
                <div className="p-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <span className="text-slate-500 block text-[10px]">Skipped</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
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
                className="w-full py-2 rounded bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-medium text-xs transition"
              >
                Return to dashboard
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
