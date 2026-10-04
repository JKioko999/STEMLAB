import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, 
  Clock, 
  Check
} from 'lucide-react';

export const AttemptReviewView: React.FC = () => {
  const { reviewingAttempt, experiments, gradeStudentAttempt, setCurrentView } = useApp();

  if (!reviewingAttempt) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        <p>No attempt selected for review.</p>
        <button onClick={() => setCurrentView('dashboard')} className="mt-4 px-3 py-1.5 bg-slate-900 text-white rounded-md text-xs font-medium">
          Return to dashboard
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
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to submissions</span>
          </button>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            {reviewingAttempt.studentName}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {reviewingAttempt.experimentTitle} · Adm: <span className="font-mono">{reviewingAttempt.studentAdmission}</span> · {reviewingAttempt.className} · {reviewingAttempt.mode} mode
          </p>
        </div>

        <div className="p-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-left sm:text-right min-w-[120px]">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Recorded score</div>
          <div className="text-xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {reviewingAttempt.totalScore} / {reviewingAttempt.maxScore}
          </div>
          <div className="text-xs text-slate-400">({reviewingAttempt.percentage}%)</div>
        </div>
      </div>

      <form onSubmit={handleSaveGrades} className="space-y-6">
        
        {/* Step-by-Step Telemetry & Force-Push Logs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Procedural step verification log</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Live validation during candidate practical session
            </span>
          </div>

          <div className="space-y-1.5">
            {reviewingAttempt.stepLogs.map((log, idx) => (
              <div 
                key={idx}
                className={`p-2.5 rounded-md border text-xs flex items-center justify-between ${
                  log.status === 'force_pushed'
                    ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-slate-500 text-[11px]">
                    Step {log.stepId}:
                  </span>
                  <span>
                    {exp?.steps.find(s => s.id === log.stepId)?.instruction || 'Procedural validation'}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-[11px]">
                  <span className="font-mono text-slate-400">{log.timestamp}</span>
                  <span className={`px-1.5 py-0.5 rounded font-medium ${
                    log.status === 'force_pushed'
                      ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                      : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                  }`}>
                    {log.status === 'force_pushed' ? 'Force-pushed (0 marks)' : 'Passed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Answer Sheet Questions & Scoring */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-5 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Answer sheet responses</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review candidate recorded values, calculations, and adjust awarded marks.
            </p>
          </div>

          <div className="space-y-4">
            {reviewingAttempt.answers.map(ans => {
              const q = exp?.answerSheet.find(item => item.id === ans.questionId);
              const currentScore = teacherScores[ans.questionId] !== undefined ? teacherScores[ans.questionId] : ans.autoScore;

              return (
                <div key={ans.questionId} className="p-4 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {q?.type.replace('_', ' ')} · Max {q?.maxMarks || 4} marks
                      </span>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100 text-xs">
                        {q?.prompt || 'Question item'}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <label className="text-xs text-slate-500 dark:text-slate-400">Marks:</label>
                      <input
                        type="number"
                        min={0}
                        max={q?.maxMarks || 10}
                        value={currentScore}
                        onChange={e => handleScoreChange(ans.questionId, Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </div>

                  {/* Candidate Value Preview */}
                  <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200">
                    {typeof ans.studentValue === 'object' ? (
                      <pre className="text-[11px] overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(ans.studentValue, null, 2)}
                      </pre>
                    ) : (
                      <span>{String(ans.studentValue || 'No response recorded')}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Teacher Feedback */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-5 space-y-3">
          <label className="block text-xs font-medium text-slate-900 dark:text-slate-100">
            Teacher comments and feedback
          </label>
          <textarea
            rows={3}
            value={teacherComments}
            onChange={e => setTeacherComments(e.target.value)}
            placeholder="Add comments on candidate accuracy, procedural technique, or areas for revision..."
            className="w-full px-3 py-2 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-2">
          {isSaved ? (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Grades saved</span>
            </span>
          ) : <span />}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrentView('dashboard')}
              className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-medium shadow-sm transition-colors"
            >
              Save grades
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};
