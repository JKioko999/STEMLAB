import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../shared/StatsCard';
import { 
  Clock, 
  Play, 
  RotateCcw,
  Eye,
  Settings,
  KeyRound
} from 'lucide-react';
import { Assignment } from '../../types';

export const StudentDashboard: React.FC = () => {
  const { 
    currentUser, 
    schools, 
    experiments, 
    assignments, 
    attempts, 
    startExperiment, 
    openAttemptReview,
    openSettings
  } = useApp();

  const [activeTab, setActiveTab] = useState<'assigned' | 'practice_lab' | 'results'>('assigned');
  const [practiceSubject, setPracticeSubject] = useState<'all' | 'chemistry' | 'physics' | 'biology'>('all');

  const currentSchool = schools.find(s => s.id === currentUser?.schoolId);

  // Scoped to student's class and teacher
  const myAssignedPracticals = assignments.filter(asg => {
    if (asg.schoolId !== currentUser?.schoolId) return false;
    if (currentUser?.classId && asg.classId === currentUser.classId) return true;
    if (currentUser?.teacherId && asg.teacherId === currentUser.teacherId) return true;
    return false;
  });

  const myAttempts = attempts.filter(att => att.studentId === currentUser?.id);

  const openPracticeExperiments = experiments.filter(e => {
    if (e.ownerType === 'global') return true;
    if (e.ownerType === 'school' && e.schoolId === currentUser?.schoolId) return true;
    return false;
  }).filter(e => {
    if (practiceSubject === 'all') return true;
    return e.subject === practiceSubject;
  });

  const getStatusBadge = (asg: Assignment) => {
    const attempt = myAttempts.find(a => a.assignmentId === asg.id);
    if (!attempt) {
      return (
        <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          Not started
        </span>
      );
    }
    if (attempt.status === 'graded') {
      return (
        <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          Graded: {attempt.totalScore}/{attempt.maxScore} ({attempt.percentage}%)
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
        Submitted
      </span>
    );
  };

  const averageScore = myAttempts.length > 0
    ? `${Math.round(myAttempts.reduce((acc, a) => acc + a.percentage, 0) / myAttempts.length)}%`
    : 'No submissions';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Student Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            {currentUser?.name}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {currentUser?.className} · Adm: <span className="font-mono">{currentUser?.admissionNumber || 'NGH/2026/0342'}</span> · {currentSchool?.name} · Teacher: {currentUser?.teacherName || 'Assigned instructor'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('practice_lab')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors shadow-sm cursor-pointer"
          >
            <span>Practice lab</span>
          </button>

          <button
            onClick={() => openSettings('password')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors shadow-sm cursor-pointer"
            title="Settings & Change Password"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Assigned practicals"
          value={myAssignedPracticals.length}
          subtitle={`From ${currentUser?.teacherName || 'teacher'}`}
        />
        <StatsCard
          title="Completed practicals"
          value={myAttempts.length}
          subtitle="Submitted answer sheets"
        />
        <StatsCard
          title="Average score"
          value={averageScore}
          subtitle={myAttempts.length > 0 ? `Across ${myAttempts.length} graded attempts` : 'No attempts logged'}
        />
        <StatsCard
          title="Practice modules"
          value={openPracticeExperiments.length}
          subtitle="Available for revision"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-slate-200 dark:border-slate-800 text-sm font-medium">
        <button
          onClick={() => setActiveTab('assigned')}
          className={`pb-2.5 -mb-px transition-colors ${
            activeTab === 'assigned'
              ? 'border-b-2 border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 font-semibold'
              : 'border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Assigned practicals ({myAssignedPracticals.length})
        </button>

        <button
          onClick={() => setActiveTab('practice_lab')}
          className={`pb-2.5 -mb-px transition-colors ${
            activeTab === 'practice_lab'
              ? 'border-b-2 border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 font-semibold'
              : 'border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Practice lab ({openPracticeExperiments.length})
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`pb-2.5 -mb-px transition-colors ${
            activeTab === 'results'
              ? 'border-b-2 border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 font-semibold'
              : 'border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Results & feedback ({myAttempts.length})
        </button>
      </div>

      {/* TAB 1: ASSIGNED PRACTICALS */}
      {activeTab === 'assigned' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Practicals assigned by {currentUser?.teacherName || 'your teacher'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Required assignments for {currentUser?.className}.
            </p>
          </div>

          {myAssignedPracticals.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              No practical assignments pending at this time.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myAssignedPracticals.map(asg => {
                const exp = experiments.find(e => e.id === asg.experimentId);
                const attempt = myAttempts.find(a => a.assignmentId === asg.id);

                return (
                  <div key={asg.id} className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        {getStatusBadge(asg)}
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Due {new Date(asg.deadline).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mt-1">{asg.experimentTitle}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{asg.kcsePaper}</p>

                      <div className="mt-3 p-2.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>Teacher:</span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">{asg.teacherName}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>Mode:</span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">{asg.mode === 'exam' ? 'Exam (timed)' : 'Practice'}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>Time limit:</span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">{asg.timeLimitMinutes} min</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      {attempt ? (
                        <div className="w-full flex gap-2">
                          <button
                            onClick={() => openAttemptReview(attempt)}
                            className="flex-1 py-1.5 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors"
                          >
                            View submission
                          </button>
                          {asg.mode === 'practice' && exp && (
                            <button
                              onClick={() => startExperiment(exp, asg, 'practice')}
                              className="py-1.5 px-3 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium text-xs transition-colors flex items-center gap-1"
                              title="Practice again"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Retry</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        exp && (
                          <button
                            onClick={() => startExperiment(exp, asg, asg.mode)}
                            className="w-full py-1.5 px-3 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>
                              {asg.mode === 'exam' ? 'Start practical exam' : 'Start practical'}
                            </span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRACTICE LAB */}
      {activeTab === 'practice_lab' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Practice simulations</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Self-paced practical revision with procedural hints.
              </p>
            </div>

            {/* Subject Filter */}
            <div className="flex items-center space-x-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setPracticeSubject('all')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${practiceSubject === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'}`}
              >
                All
              </button>
              <button
                onClick={() => setPracticeSubject('chemistry')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${practiceSubject === 'chemistry' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'}`}
              >
                Chemistry
              </button>
              <button
                onClick={() => setPracticeSubject('physics')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${practiceSubject === 'physics' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'}`}
              >
                Physics
              </button>
              <button
                onClick={() => setPracticeSubject('biology')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${practiceSubject === 'biology' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'}`}
              >
                Biology
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openPracticeExperiments.map(exp => (
              <div key={exp.id} className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span>{exp.subject} · {exp.kcsePaper}</span>
                    <span>~{exp.estimatedDurationMinutes} min</span>
                  </div>

                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-snug">{exp.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{exp.topic}</p>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                    <div>Steps: {exp.steps.length} guided steps</div>
                    <div>Apparatus: {exp.apparatus.length} items</div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => startExperiment(exp, null, 'practice')}
                    className="w-full py-1.5 px-3 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Launch practical</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RESULTS & PAST PRACTICALS */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Practical submission history</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recorded answer sheets, marks, and instructor feedback.
            </p>
          </div>

          {myAttempts.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              No completed practical attempts found.
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-2.5">Practical</th>
                    <th className="px-4 py-2.5">Mode</th>
                    <th className="px-4 py-2.5 text-right">Score</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Teacher feedback</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {myAttempts.map(att => (
                    <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{att.experimentTitle}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          Submitted: {new Date(att.startedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {att.mode === 'exam' ? 'Exam' : 'Practice'}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className="font-medium text-slate-900 dark:text-slate-100">{att.totalScore} / {att.maxScore}</span>
                        <span className="text-slate-400 ml-1">({att.percentage}%)</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {att.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {att.teacherComments || 'No comments'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openAttemptReview(att)}
                          className="px-2.5 py-1 rounded text-[11px] font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-slate-400" />
                          <span>Report</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
