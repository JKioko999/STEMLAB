import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../shared/StatsCard';
import { 
  GraduationCap, 
  FlaskConical, 
  CheckCircle2, 
  Clock, 
  Play, 
  Award, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  FileCheck, 
  Flame, 
  Zap, 
  Dna,
  RotateCcw
} from 'lucide-react';
import { ExperimentSpec, Assignment, Attempt } from '../../types';

export const StudentDashboard: React.FC = () => {
  const { 
    currentUser, 
    schools, 
    experiments, 
    assignments, 
    attempts, 
    startExperiment, 
    openAttemptReview 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'assigned' | 'practice_lab' | 'results'>('assigned');
  const [practiceSubject, setPracticeSubject] = useState<'all' | 'chemistry' | 'physics' | 'biology'>('all');

  const currentSchool = schools.find(s => s.id === currentUser?.schoolId);

  // CRITICAL REQUIREMENT:
  // "For the student i want him or her to see only the assignment and project assigned to him by the specific teacher they should be connected"
  const myAssignedPracticals = assignments.filter(asg => {
    // Must match student's school
    if (asg.schoolId !== currentUser?.schoolId) return false;
    // Must match student's specific class or specific teacher
    if (currentUser?.classId && asg.classId === currentUser.classId) return true;
    if (currentUser?.teacherId && asg.teacherId === currentUser.teacherId) return true;
    return false;
  });

  // Student's own submissions
  const myAttempts = attempts.filter(att => att.studentId === currentUser?.id);

  // Available experiments for Practice Lab (Global KCSE + School Library)
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
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-700 text-slate-300">
          Not Started
        </span>
      );
    }
    if (attempt.status === 'graded') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          Graded: {attempt.totalScore}/{attempt.maxScore} ({attempt.percentage}%)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
        Submitted
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Student Profile Header */}
      <div className="bg-gradient-to-r from-violet-950/40 via-slate-850 to-slate-900 border border-violet-500/20 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-violet-400">
            <GraduationCap className="w-4 h-4" />
            <span>KCSE Candidate Science Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            {currentUser?.name}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {currentUser?.className} • Adm No: <span className="font-mono text-slate-200">{currentUser?.admissionNumber || 'NGH/2026/0342'}</span> • {currentSchool?.name}
          </p>
          <p className="text-xs text-violet-300 mt-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Connected Teacher: <strong className="text-white">{currentUser?.teacherName || 'Assigned Science Instructor'}</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('practice_lab')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition shadow-lg shadow-violet-600/30"
          >
            <FlaskConical className="w-4 h-4" />
            <span>Go to Practice Lab</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Assigned by Teacher"
          value={myAssignedPracticals.length}
          subtitle={`From ${currentUser?.teacherName}`}
          icon={<FlaskConical className="w-5 h-5" />}
          color="violet"
        />
        <StatsCard
          title="Completed Practicals"
          value={myAttempts.length}
          subtitle="Submitted answer sheets"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
        />
        <StatsCard
          title="My Average Score"
          value={
            myAttempts.length > 0
              ? `${Math.round(myAttempts.reduce((acc, a) => acc + a.percentage, 0) / myAttempts.length)}%`
              : 'N/A'
          }
          subtitle="KCSE practical grade"
          icon={<Award className="w-5 h-5" />}
          color="amber"
        />
        <StatsCard
          title="Practice Lab Access"
          value="Unlimited"
          subtitle="Open revision simulations"
          icon={<RotateCcw className="w-5 h-5" />}
          color="cyan"
        />
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-800 flex space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('assigned')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'assigned'
              ? 'border-violet-500 text-violet-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>My Assigned Practicals ({myAssignedPracticals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('practice_lab')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'practice_lab'
              ? 'border-violet-500 text-violet-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Practice Lab (Open Revision)</span>
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'results'
              ? 'border-violet-500 text-violet-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>My Results & Teacher Feedback ({myAttempts.length})</span>
        </button>
      </div>

      {/* TAB 1: MY ASSIGNED PRACTICALS */}
      {activeTab === 'assigned' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Practicals Assigned by {currentUser?.teacherName}</h2>
              <p className="text-xs text-slate-400">
                These are official school assignments set specifically for your class stream ({currentUser?.className}).
              </p>
            </div>
          </div>

          {myAssignedPracticals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myAssignedPracticals.map(asg => {
                const exp = experiments.find(e => e.id === asg.experimentId);
                const attempt = myAttempts.find(a => a.assignmentId === asg.id);

                return (
                  <div key={asg.id} className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5 shadow flex flex-col justify-between hover:border-slate-600 transition">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        {getStatusBadge(asg)}
                        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          Due: {new Date(asg.deadline).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-bold text-white text-base leading-snug mt-2">{asg.experimentTitle}</h3>
                      <p className="text-xs text-slate-400 mt-1">{asg.kcsePaper}</p>

                      <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-750 text-xs space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span>Assigned Teacher:</span>
                          <span className="text-slate-200 font-semibold">{asg.teacherName}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Exam Mode:</span>
                          <span className="text-slate-200 font-semibold uppercase">{asg.mode}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Time Allowed:</span>
                          <span className="text-slate-200 font-semibold">{asg.timeLimitMinutes} minutes</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-700/60 flex items-center gap-2">
                      {attempt ? (
                        <div className="w-full flex gap-2">
                          <button
                            onClick={() => openAttemptReview(attempt)}
                            className="flex-1 py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-650 text-white font-bold text-xs transition"
                          >
                            View Submitted Attempt & Grade
                          </button>
                          {asg.mode === 'practice' && exp && (
                            <button
                              onClick={() => startExperiment(exp, asg, 'practice')}
                              className="py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition flex items-center gap-1"
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
                            className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-lg ${
                              asg.mode === 'exam' 
                                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30' 
                                : 'bg-violet-600 hover:bg-violet-500 shadow-violet-600/30'
                            }`}
                          >
                            <Play className="w-4 h-4 fill-current" />
                            <span>
                              {asg.mode === 'exam' ? 'Start KCSE Practical Exam (Timed)' : 'Launch Guided Assignment'}
                            </span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-8 text-center text-slate-400">
              <FlaskConical className="w-8 h-8 mx-auto text-slate-500 mb-2" />
              <p className="font-semibold text-white">No pending practicals assigned right now</p>
              <p className="text-xs mt-1">
                Your teacher ({currentUser?.teacherName}) has not posted any new practicals today. Feel free to explore the Practice Lab below!
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRACTICE LAB (OPEN REVISION) */}
      {activeTab === 'practice_lab' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span>Open Practice & Revision Lab</span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                Simulate Any KCSE Practical Step-by-Step
              </h2>
              <p className="text-xs text-slate-400">
                Unlimited retries, step hints enabled, and zero exam penalty. Practice as many times as you need!
              </p>
            </div>

            {/* Subject Filter */}
            <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-700 text-xs font-medium">
              <button
                onClick={() => setPracticeSubject('all')}
                className={`px-3 py-1 rounded-lg transition ${practiceSubject === 'all' ? 'bg-violet-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                All Subjects
              </button>
              <button
                onClick={() => setPracticeSubject('chemistry')}
                className={`px-3 py-1 rounded-lg transition ${practiceSubject === 'chemistry' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Chemistry
              </button>
              <button
                onClick={() => setPracticeSubject('physics')}
                className={`px-3 py-1 rounded-lg transition ${practiceSubject === 'physics' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Physics
              </button>
              <button
                onClick={() => setPracticeSubject('biology')}
                className={`px-3 py-1 rounded-lg transition ${practiceSubject === 'biology' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Biology
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openPracticeExperiments.map(exp => (
              <div key={exp.id} className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5 flex flex-col justify-between hover:border-violet-500/50 transition shadow">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      exp.subject === 'chemistry' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      exp.subject === 'physics' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {exp.subject} • {exp.kcsePaper}
                    </span>
                    <span className="text-xs text-slate-400">~{exp.estimatedDurationMinutes} mins</span>
                  </div>

                  <h3 className="font-bold text-white text-base leading-snug">{exp.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{exp.topic}</p>

                  <div className="mt-4 pt-3 border-t border-slate-700/60 text-xs text-slate-400 space-y-1">
                    <div>Steps: <span className="text-slate-200">{exp.steps.length} guided steps with hints</span></div>
                    <div>Apparatus: <span className="text-slate-200">{exp.apparatus.length} lab items</span></div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-700/60">
                  <button
                    onClick={() => startExperiment(exp, null, 'practice')}
                    className="w-full py-2.5 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-lg shadow-violet-600/30"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Practice Simulation Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MY RESULTS & PAST PRACTICALS */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Your Practical Examination History</h2>
              <p className="text-xs text-slate-400">
                Detailed step logs, force-pushes, and comments from your teacher.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-850 text-slate-400 uppercase font-semibold border-b border-slate-700/80">
                  <tr>
                    <th className="px-5 py-3.5">Practical Title</th>
                    <th className="px-5 py-3.5">Mode</th>
                    <th className="px-5 py-3.5 text-center">Score</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5">Teacher Feedback</th>
                    <th className="px-5 py-3.5 text-right">Answer Sheet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 font-medium">
                  {myAttempts.map(att => (
                    <tr key={att.id} className="hover:bg-slate-750/50 transition">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white text-sm">{att.experimentTitle}</div>
                        <div className="text-[11px] text-slate-400">Submitted: {new Date(att.startedAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-5 py-3.5 uppercase text-slate-300">
                        {att.mode}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="font-extrabold text-white text-sm">{att.totalScore} / {att.maxScore}</span>
                        <span className="text-xs text-slate-400 ml-1">({att.percentage}%)</span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          att.status === 'graded' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {att.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-300 max-w-xs">
                        {att.teacherComments ? (
                          <span className="text-emerald-300 italic">"{att.teacherComments}"</span>
                        ) : (
                          <span className="text-slate-500 italic">Pending review</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => openAttemptReview(att)}
                          className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
