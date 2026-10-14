import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../shared/StatsCard';
import { 
  Plus, 
  Clock, 
  Eye, 
  Download,
  Edit3,
  Play,
  X,
  Settings
} from 'lucide-react';
import { ExperimentSpec } from '../../types';

export const TeacherDashboard: React.FC = () => {
  const { 
    currentUser, 
    schools, 
    classes, 
    experiments, 
    assignments, 
    attempts, 
    createAssignment, 
    cloneExperiment, 
    openExperimentEditor,
    setCurrentView, 
    startExperiment, 
    openAttemptReview,
    openSettings
  } = useApp();

  const currentSchool = schools.find(s => s.id === currentUser?.schoolId);
  const myClasses = classes.filter(c => c.teacherId === currentUser?.id);
  const myAssignments = assignments.filter(a => a.teacherId === currentUser?.id);
  const myAttempts = attempts.filter(a => a.teacherId === currentUser?.id);

  const [activeTab, setActiveTab] = useState<'assignments' | 'library' | 'diagnostics'>('assignments');
  const [tierFilter, setTierFilter] = useState<'all' | 'global' | 'school' | 'teacher'>('all');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedExperimentToAssign, setSelectedExperimentToAssign] = useState<ExperimentSpec | null>(null);

  // New assignment modal form
  const [assignmentForm, setAssignmentForm] = useState({
    experimentId: '',
    classId: myClasses[0]?.id || '',
    mode: 'exam' as 'practice' | 'exam',
    deadlineDays: 7,
    timeLimitMinutes: 45
  });

  const accessibleExperiments = experiments.filter(e => {
    if (e.ownerType === 'global') return true;
    if (e.ownerType === 'school' && e.schoolId === currentUser?.schoolId) return true;
    if (e.ownerType === 'teacher' && e.teacherId === currentUser?.id) return true;
    return false;
  }).filter(e => {
    if (tierFilter === 'all') return true;
    return e.ownerType === tierFilter;
  });

  const handleOpenAssignModal = (exp: ExperimentSpec) => {
    setSelectedExperimentToAssign(exp);
    setAssignmentForm(prev => ({
      ...prev,
      experimentId: exp.id,
      timeLimitMinutes: exp.estimatedDurationMinutes || 45
    }));
    setIsAssignModalOpen(true);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentSchool) return;

    const exp = experiments.find(x => x.id === assignmentForm.experimentId) || selectedExperimentToAssign;
    const targetClass = classes.find(c => c.id === assignmentForm.classId) || myClasses[0];

    if (!exp || !targetClass) return;

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + Number(assignmentForm.deadlineDays));

    createAssignment({
      schoolId: currentSchool.id,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      classId: targetClass.id,
      className: targetClass.name,
      experimentId: exp.id,
      experimentTitle: exp.title,
      subject: exp.subject,
      kcsePaper: exp.kcsePaper,
      mode: assignmentForm.mode,
      deadline: deadline.toISOString(),
      timeLimitMinutes: Number(assignmentForm.timeLimitMinutes),
      totalEnrolledStudents: targetClass.studentCount || 40
    });

    setIsAssignModalOpen(false);
    setSelectedExperimentToAssign(null);
  };

  const handleModifyExperiment = (exp: ExperimentSpec) => {
    if (!currentUser) return;
    if (exp.ownerType === 'teacher' && exp.teacherId === currentUser.id) {
      openExperimentEditor(exp);
    } else {
      const cloned = cloneExperiment(exp.id, currentUser);
      openExperimentEditor(cloned);
    }
  };

  const exportCSV = () => {
    const rows = [
      ['Student Name', 'Admission No', 'Practical', 'Class', 'Score', 'Max Score', 'Status', 'Force Pushed Steps']
    ];
    myAttempts.forEach(att => {
      const forcePushedCount = att.stepLogs.filter(s => s.status === 'force_pushed').length;
      rows.push([
        att.studentName,
        att.studentAdmission,
        att.experimentTitle,
        att.className || '',
        att.totalScore.toString(),
        att.maxScore.toString(),
        att.status,
        forcePushedCount.toString()
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Practical_Results_${currentUser?.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Real computed class mean
  const classMeanScore = myAttempts.length > 0 
    ? `${Math.round(myAttempts.reduce((acc, a) => acc + a.percentage, 0) / myAttempts.length)}%`
    : 'No data';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Teacher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            {currentUser?.name}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {currentUser?.subjectSpecialization} · {currentSchool?.name} · Streams: {myClasses.map(c => c.name).join(', ') || 'No assigned streams'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openSettings('password')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors shadow-sm cursor-pointer"
            title="Settings & Change Password"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => setCurrentView('builder')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create practical</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Assigned practicals"
          value={myAssignments.length}
          subtitle="Active practical assignments"
        />
        <StatsCard
          title="Class streams"
          value={myClasses.length}
          subtitle={myClasses.map(c => c.name).join(', ') || 'No streams assigned'}
        />
        <StatsCard
          title="Submissions received"
          value={myAttempts.length}
          subtitle="Candidate answer sheets"
        />
        <StatsCard
          title="Class average score"
          value={classMeanScore}
          subtitle={myAttempts.length > 0 ? `Across ${myAttempts.length} submissions` : 'Awaiting candidate submissions'}
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-slate-200 dark:border-slate-800 text-sm font-medium">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`pb-2.5 -mb-px transition-colors ${
            activeTab === 'assignments'
              ? 'border-b-2 border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 font-semibold'
              : 'border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Assignments ({myAssignments.length})
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`pb-2.5 -mb-px transition-colors ${
            activeTab === 'library'
              ? 'border-b-2 border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 font-semibold'
              : 'border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Practicals library ({accessibleExperiments.length})
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`pb-2.5 -mb-px transition-colors ${
            activeTab === 'diagnostics'
              ? 'border-b-2 border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 font-semibold'
              : 'border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Procedural diagnostics
        </button>
      </div>

      {/* TAB 1: ASSIGNMENTS & SUBMISSION QUEUE */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Active practical assignments</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current practical tasks assigned to candidates in your class streams.
              </p>
            </div>

            <button
              onClick={() => {
                if (accessibleExperiments.length > 0) {
                  handleOpenAssignModal(accessibleExperiments[0]);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-medium transition-colors shadow-sm self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign practical</span>
            </button>
          </div>

          {myAssignments.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              No assignments posted yet. Pick a practical from the library to assign to your stream.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myAssignments.map(asg => {
                const asgAttempts = myAttempts.filter(att => att.assignmentId === asg.id);

                return (
                  <div key={asg.id} className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          {asg.mode === 'exam' ? 'Exam mode (timed)' : 'Practice mode'} · {asg.className}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Due {new Date(asg.deadline).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{asg.experimentTitle}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{asg.kcsePaper}</p>

                      <div className="mt-3 grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-800 text-xs">
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">Enrolled</div>
                          <div className="font-medium text-slate-900 dark:text-slate-100 tabular-nums">{asg.totalEnrolledStudents}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">Submitted</div>
                          <div className="font-medium text-slate-900 dark:text-slate-100 tabular-nums">{asg.submittedCount}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">Time limit</div>
                          <div className="font-medium text-slate-900 dark:text-slate-100 tabular-nums">{asg.timeLimitMinutes} min</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>{asgAttempts.length} submissions recorded</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Submission and Grading Queue */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Submissions queue</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Candidate answer sheets, auto-scores, and procedural step logs.
                </p>
              </div>

              {myAttempts.length > 0 && (
                <button
                  onClick={exportCSV}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              )}
            </div>

            {myAttempts.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                No submissions received yet. Once candidates submit answer sheets, they will appear here for review.
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-2.5">Candidate</th>
                      <th className="px-4 py-2.5">Practical</th>
                      <th className="px-4 py-2.5">Stream</th>
                      <th className="px-4 py-2.5">Steps status</th>
                      <th className="px-4 py-2.5 text-right">Score</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {myAttempts.map(att => {
                      const forcePushedSteps = att.stepLogs.filter(s => s.status === 'force_pushed');
                      const hasForcePush = forcePushedSteps.length > 0;

                      return (
                        <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900 dark:text-slate-100">{att.studentName}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{att.studentAdmission}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-slate-900 dark:text-slate-100 font-medium line-clamp-1">{att.experimentTitle}</div>
                            <div className="text-[11px] text-slate-400">{att.mode === 'exam' ? 'Exam' : 'Practice'}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {att.className}
                          </td>
                          <td className="px-4 py-3">
                            {hasForcePush ? (
                              <span className="text-amber-700 dark:text-amber-400 font-medium text-xs">
                                {forcePushedSteps.length} force-pushed
                              </span>
                            ) : (
                              <span className="text-emerald-700 dark:text-emerald-400 font-medium text-xs">
                                All passed
                              </span>
                            )}
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
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => openAttemptReview(att)}
                              className="px-2.5 py-1 rounded text-[11px] font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors inline-flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3 text-slate-400" />
                              <span>Review</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: PRACTICALS LIBRARY */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Practical catalog</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Curriculum, school, and teacher-authored practicals.
              </p>
            </div>

            {/* Tier Filters */}
            <div className="flex items-center space-x-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setTierFilter('all')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${tierFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'}`}
              >
                All ({accessibleExperiments.length})
              </button>
              <button
                onClick={() => setTierFilter('global')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${tierFilter === 'global' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'}`}
              >
                Curriculum
              </button>
              <button
                onClick={() => setTierFilter('school')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${tierFilter === 'school' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'}`}
              >
                School
              </button>
              <button
                onClick={() => setTierFilter('teacher')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${tierFilter === 'teacher' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'}`}
              >
                My own
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accessibleExperiments.map(exp => (
              <div key={exp.id} className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      {exp.ownerType === 'global' ? 'Curriculum' : exp.ownerType === 'school' ? 'School' : 'Custom'} · {exp.subject}
                    </span>
                    <span>~{exp.estimatedDurationMinutes} min</span>
                  </div>

                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-snug">{exp.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{exp.topic}</p>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                    <div>Author: <span className="text-slate-800 dark:text-slate-200">{exp.authorName}</span></div>
                    <div>Paper: <span className="font-mono text-slate-800 dark:text-slate-200">{exp.kcsePaper}</span></div>
                    <div>Steps: <span className="text-slate-800 dark:text-slate-200">{exp.steps.length} guided steps</span></div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenAssignModal(exp)}
                      className="flex-1 py-1.5 px-3 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium text-xs transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Assign to stream</span>
                    </button>
                    <button
                      onClick={() => startExperiment(exp, null, 'practice')}
                      className="py-1.5 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs transition-colors"
                      title="Test experiment"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {exp.ownerType === 'teacher' && exp.teacherId === currentUser?.id ? (
                    <button
                      onClick={() => openExperimentEditor(exp)}
                      className="w-full py-1 px-2 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                    >
                      <Edit3 className="w-3 h-3 text-slate-400" />
                      <span>Edit practical</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleModifyExperiment(exp)}
                      className="w-full py-1 px-2 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                    >
                      <Edit3 className="w-3 h-3 text-slate-400" />
                      <span>Clone and customize</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PROCEDURAL DIAGNOSTICS */}
      {activeTab === 'diagnostics' && (
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Procedural diagnostics</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Analysis of candidate step validations and force-push events.
            </p>
          </div>

          {myAttempts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-md">
              No submission data available yet. Diagnostic logs will populate once candidates complete practical sessions.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-slate-900 dark:text-slate-100">Total practical submissions reviewed</span>
                  <span className="text-slate-600 dark:text-slate-300 tabular-nums">{myAttempts.length}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Submissions with force-pushed steps</span>
                  <span className="tabular-nums">
                    {myAttempts.filter(a => a.stepLogs.some(s => s.status === 'force_pushed')).length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Class average percentage</span>
                  <span className="tabular-nums">{classMeanScore}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ASSIGN TO CLASS */}
      {isAssignModalOpen && selectedExperimentToAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Assign practical</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{selectedExperimentToAssign.title}</p>
              </div>
              <button 
                onClick={() => setIsAssignModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Target stream *</label>
                <select
                  value={assignmentForm.classId}
                  onChange={e => setAssignmentForm({ ...assignmentForm, classId: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {myClasses.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.studentCount || 40} candidates)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Practical mode *</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`p-2.5 rounded-md border cursor-pointer text-xs transition-colors ${
                    assignmentForm.mode === 'exam' 
                      ? 'border-slate-900 bg-slate-50 dark:bg-slate-800 dark:border-slate-100 text-slate-900 dark:text-slate-100 font-medium' 
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}>
                    <input
                      type="radio"
                      name="mode"
                      value="exam"
                      checked={assignmentForm.mode === 'exam'}
                      onChange={() => setAssignmentForm({ ...assignmentForm, mode: 'exam' })}
                      className="sr-only"
                    />
                    <div>Exam mode</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">Timed, no step hints</div>
                  </label>

                  <label className={`p-2.5 rounded-md border cursor-pointer text-xs transition-colors ${
                    assignmentForm.mode === 'practice' 
                      ? 'border-slate-900 bg-slate-50 dark:bg-slate-800 dark:border-slate-100 text-slate-900 dark:text-slate-100 font-medium' 
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}>
                    <input
                      type="radio"
                      name="mode"
                      value="practice"
                      checked={assignmentForm.mode === 'practice'}
                      onChange={() => setAssignmentForm({ ...assignmentForm, mode: 'practice' })}
                      className="sr-only"
                    />
                    <div>Practice mode</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">Step hints enabled</div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Deadline (days)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={assignmentForm.deadlineDays}
                    onChange={e => setAssignmentForm({ ...assignmentForm, deadlineDays: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Time limit (minutes)</label>
                  <input
                    type="number"
                    min="10"
                    max="180"
                    value={assignmentForm.timeLimitMinutes}
                    onChange={e => setAssignmentForm({ ...assignmentForm, timeLimitMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  Want to customize apparatus or steps before assigning?
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAssignModalOpen(false);
                    handleModifyExperiment(selectedExperimentToAssign);
                  }}
                  className="px-2 py-1 rounded text-[11px] font-medium border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition-colors shrink-0"
                >
                  Edit first
                </button>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="flex-1 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium shadow-sm"
                >
                  Assign to stream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
