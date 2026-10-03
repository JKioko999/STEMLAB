import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, 
  Award, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Save, 
  MessageSquare,
  FileCheck
} from 'lucide-react';
import { Attempt } from '../../types';

export const AttemptReviewView: React.FC = () => {
  const { reviewingAttempt, experiments, gradeStudentAttempt, setCurrentView } = useApp();

  if (!reviewingAttempt) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>No attempt selected for review.</p>
        <button onClick={() => setCurrentView('dashboard')} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const exp = experiments.find(e => e.id === reviewingAttempt.experimentId);

  // Editable scores and comments
  const [teacherScores, setTeacherScores] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    reviewingAttempt.answers.forEach(a => {
      map[a.questionId] = a.teacherScore !== undefined ? a.teacherScore : a.autoScore;
    });
    return map;
  });

  const [teacherComments, setTeacherComments] = useState(reviewingAttempt.teacherComments || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleScoreChange = (questionId: string, score: number) => {
    setTeacherScores(prev => ({ ...prev, [questionId]: score }));
  };

  const handleSaveGrades = (e: React.FormEvent) => {
    e.preventDefault();
    const scoreUpdates = Object.entries(teacherScores).map(([qId, s]) => ({
      questionId: qId,
      teacherScore: Number(s)
    }));

    gradeStudentAttempt(reviewingAttempt.id, scoreUpdates, teacherComments);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setCurrentView('dashboard');
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Submissions Queue</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
            Status: {reviewingAttempt.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Candidate Banner */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            KCSE Practical Candidate Evaluation
          </span>
          <h1 className="text-2xl font-black text-white mt-1">
            {reviewingAttempt.studentName}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Admission No: <span className="font-mono text-slate-200">{reviewingAttempt.studentAdmission}</span> • Class: {reviewingAttempt.className} • Submitted: {new Date(reviewingAttempt.startedAt).toLocaleString()}
          </p>
          <p className="text-xs text-slate-300 font-semibold mt-1">
            Practical: {reviewingAttempt.experimentTitle} ({reviewingAttempt.mode.toUpperCase()} MODE)
          </p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-750 text-center min-w-[140px]">
          <span className="text-[10px] uppercase font-bold text-slate-400">Current Score</span>
          <div className="text-3xl font-black text-amber-400">
            {reviewingAttempt.totalScore} / {reviewingAttempt.maxScore}
          </div>
          <span className="text-xs text-slate-400">({reviewingAttempt.percentage}%)</span>
        </div>
      </div>

      <form onSubmit={handleSaveGrades} className="space-y-6">
        
        {/* Step-by-Step Telemetry & Force-Push Logs (Section 3.1.2) */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Procedural Step Log & Force-Push Audit</h3>
            </div>
            <span className="text-xs text-slate-400">
              Recorded live during candidate simulation
            </span>
          </div>

          <div className="space-y-2">
            {reviewingAttempt.stepLogs.map((log, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  log.status === 'force_pushed'
                    ? 'bg-rose-950/20 border-rose-500/50 text-rose-200'
                    : 'bg-slate-900/80 border-slate-750 text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    log.status === 'force_pushed' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {log.stepId}
                  </span>
                  <div>
                    <span className="font-semibold text-white">
                      Step {log.stepId}: {exp?.steps.find(s => s.id === log.stepId)?.instruction || 'Procedural validation'}
                    </span>
                    {log.status === 'force_pushed' && (
                      <span className="block text-[11px] text-rose-400 font-bold mt-0.5 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Candidate force-pushed through this step without completing validation!
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-bold">
                    {log.marksEarned} / {log.marksPossible} marks
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Answer Sheet Responses & Manual Override */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div className="flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Answer Sheet Submissions & Grade Overrides</h3>
            </div>
            <span className="text-xs text-slate-400">
              Teachers can adjust marks for scientific qualitative inferences
            </span>
          </div>

          <div className="space-y-4">
            {reviewingAttempt.answers.map(ans => {
              const q = exp?.answerSheet.find(x => x.id === ans.questionId);
              const maxMarks = q?.maxMarks || 5;

              return (
                <div key={ans.questionId} className="p-4 rounded-xl bg-slate-900/80 border border-slate-750 space-y-3 text-xs">
                  <div className="flex items-start justify-between">
                    <span className="font-semibold text-white text-xs">
                      {q?.prompt || ans.questionId}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400">Score:</span>
                      <input
                        type="number"
                        min="0"
                        max={maxMarks}
                        value={teacherScores[ans.questionId] ?? ans.autoScore}
                        onChange={e => handleScoreChange(ans.questionId, Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-amber-400 font-mono font-bold text-center focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-slate-400">/ {maxMarks}</span>
                    </div>
                  </div>

                  {/* Student Response Display */}
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Student Submitted Value:</span>
                    <pre className="text-slate-300 font-mono text-[11px] whitespace-pre-wrap">
                      {typeof ans.studentValue === 'object' 
                        ? JSON.stringify(ans.studentValue, null, 2) 
                        : String(ans.studentValue || 'No response recorded')}
                    </pre>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Algorithm Auto-Score: <strong className="text-slate-200">{ans.autoScore} marks</strong></span>
                    {q?.correctNumericValue !== undefined && (
                      <span className="text-emerald-400 font-mono">
                        Model Value: {q.correctNumericValue} {q.unit}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Teacher Feedback Comment Field */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow space-y-3">
          <div className="flex items-center space-x-2 text-slate-300 font-bold text-xs uppercase tracking-wider">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>Teacher Qualitative Feedback & Examiner Remarks</span>
          </div>

          <textarea
            rows={3}
            placeholder="Write constructive examiner feedback for this candidate (e.g. good titre consistency, take care when heating test tubes)..."
            value={teacherComments}
            onChange={e => setTeacherComments(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Save & Release Button */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          {isSaved && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Marks & Feedback Released to Student!
            </span>
          )}

          <button
            type="submit"
            className="py-3 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition shadow-lg shadow-amber-600/30 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save & Release Grades to Student</span>
          </button>
        </div>

      </form>

    </div>
  );
};
