import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../shared/StatsCard';
import { 
  BookOpen, 
  FlaskConical, 
  Users, 
  CheckCircle, 
  Plus, 
  Clock, 
  Eye, 
  Award, 
  Copy, 
  Filter, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  Play,
  ArrowRight,
  Sparkles,
  Download,
  Edit3
} from 'lucide-react';
import { ExperimentSpec, Assignment, Attempt } from '../../types';

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
    openAttemptReview 
  } = useApp();

  const currentSchool = schools.find(s => s.id === currentUser?.schoolId);
  const myClasses = classes.filter(c => c.teacherId === currentUser?.id);
  const myAssignments = assignments.filter(a => a.teacherId === currentUser?.id);
  const myAttempts = attempts.filter(a => a.teacherId === currentUser?.id);

  const [activeTab, setActiveTab] = useState<'assignments' | 'library' | 'analytics'>('assignments');
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

  // Filter 3-tier experiments accessible to this teacher:
  // 1. Global experiments (available to all)
  // 2. School experiments (available to teachers at this school)
  // 3. Teacher's own experiments (created by this teacher)
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

  const handleClone = (exp: ExperimentSpec) => {
    if (!currentUser) return;
    const cloned = cloneExperiment(exp.id, currentUser);
    alert(`Cloned "${exp.title}" into your personal library as "${cloned.title}"!`);
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
    link.setAttribute('download', `KCSE_Practical_Results_${currentUser?.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Teacher Header */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-850 to-slate-900 border border-amber-500/20 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <BookOpen className="w-4 h-4" />
            <span>Subject Teacher Portal • {currentSchool?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            {currentUser?.name}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Specialization: <span className="text-amber-300 font-semibold">{currentUser?.subjectSpecialization}</span> • Assigned Form Streams: {myClasses.map(c => c.name).join(', ') || 'Form 3 & 4'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCurrentView('builder')}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition shadow-lg shadow-amber-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Open Experiment Builder</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Practicals Assigned"
          value={myAssignments.length}
          subtitle="Exam & Practice modes set"
          icon={<FlaskConical className="w-5 h-5" />}
          color="amber"
        />
        <StatsCard
          title="My Form Streams"
          value={myClasses.length}
          subtitle={myClasses.map(c => c.name).join(' • ') || 'Active Streams'}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        <StatsCard
          title="Submissions Received"
          value={myAttempts.length}
          subtitle="Student answer sheets"
          icon={<CheckCircle className="w-5 h-5" />}
          color="emerald"
        />
        <StatsCard
          title="Class Mean Score"
          value={
            myAttempts.length > 0 
              ? `${Math.round(myAttempts.reduce((acc, a) => acc + a.percentage, 0) / myAttempts.length)}%`
              : '88%'
          }
          subtitle="Average KCSE practical grade"
          icon={<Award className="w-5 h-5" />}
          color="violet"
        />
      </div>

      {/* Tab Bar */}
      <div className="border-b border-slate-800 flex space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'assignments'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Assigned Practicals & Submissions ({myAssignments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'library'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>KCSE Experiment Library ({accessibleExperiments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'analytics'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Class Heatmap & Step Diagnostics</span>
        </button>
      </div>

      {/* TAB 1: ASSIGNED PRACTICALS & SUBMISSIONS */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Current Active Practicals Set for Your Classes</h2>
              <p className="text-xs text-slate-400">
                Students in your assigned streams will see these practicals on their individual dashboards.
              </p>
            </div>

            <button
              onClick={() => {
                if (accessibleExperiments.length > 0) {
                  handleOpenAssignModal(accessibleExperiments[0]);
                }
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign New Practical</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myAssignments.map(asg => {
              const asgAttempts = myAttempts.filter(att => att.assignmentId === asg.id);
              const isPastDeadline = new Date(asg.deadline) < new Date();

              return (
                <div key={asg.id} className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5 shadow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        asg.mode === 'exam' 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {asg.mode === 'exam' ? 'KCSE Exam Mode (Timed)' : 'Practice Mode'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">Class: <span className="text-white font-bold">{asg.className}</span></span>
                    </div>

                    <h3 className="font-bold text-white text-base leading-snug">{asg.experimentTitle}</h3>
                    <p className="text-xs text-slate-400 mt-1">{asg.kcsePaper}</p>

                    <div className="mt-4 grid grid-cols-3 gap-2 bg-slate-900/60 p-2.5 rounded-xl text-center text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Enrolled</div>
                        <div className="font-bold text-white text-sm">{asg.totalEnrolledStudents}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Submitted</div>
                        <div className="font-bold text-emerald-400 text-sm">{asg.submittedCount}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Time Limit</div>
                        <div className="font-bold text-amber-400 text-sm">{asg.timeLimitMinutes} min</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Due: {new Date(asg.deadline).toLocaleDateString()}
                    </span>

                    <span className="text-xs font-semibold text-emerald-400">
                      {asgAttempts.length} Answer Sheet(s) Logged
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Student Submissions & Grading Review Queue */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Student Submission & Auto-Grade Queue</h3>
                <p className="text-xs text-slate-400">
                  Review student digital answer sheets, inspect force-push events, override auto-grades, and release marks.
                </p>
              </div>

              {myAttempts.length > 0 && (
                <button
                  onClick={exportCSV}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-650 text-slate-200 text-xs font-semibold transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Class Results (CSV)</span>
                </button>
              )}
            </div>

            <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-850 text-slate-400 uppercase font-semibold border-b border-slate-700/80">
                    <tr>
                      <th className="px-5 py-3.5">Candidate Student</th>
                      <th className="px-5 py-3.5">Practical Title</th>
                      <th className="px-5 py-3.5">Class</th>
                      <th className="px-5 py-3.5 text-center">Procedural Steps</th>
                      <th className="px-5 py-3.5 text-center">Auto-Score</th>
                      <th className="px-5 py-3.5 text-center">Status</th>
                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 font-medium">
                    {myAttempts.map(att => {
                      const forcePushedSteps = att.stepLogs.filter(s => s.status === 'force_pushed');
                      const hasForcePush = forcePushedSteps.length > 0;

                      return (
                        <tr key={att.id} className="hover:bg-slate-750/50 transition">
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-white text-sm">{att.studentName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{att.studentAdmission}</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="text-white font-semibold line-clamp-1">{att.experimentTitle}</div>
                            <div className="text-[10px] text-slate-400">{att.mode === 'exam' ? 'Exam Attempt' : 'Practice'}</div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-300">
                            {att.className}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            {hasForcePush ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold" title="Student force-pushed through steps!">
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                {forcePushedSteps.length} Force-Pushed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                <CheckCircle className="w-3 h-3" />
                                All Steps Passed
                              </span>
                            )}
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
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => openAttemptReview(att)}
                              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Review & Grade</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: KCSE EXPERIMENT LIBRARY (3-TIER) */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Three-Tier Experiment Catalog</h2>
              <p className="text-xs text-slate-400">
                Section 13 of architecture doc: Global Library, School Library, and Teacher's Own experiments.
              </p>
            </div>

            {/* Tier Filters */}
            <div className="flex p-1 bg-slate-800 rounded-xl border border-slate-700 text-xs font-medium">
              <button
                onClick={() => setTierFilter('all')}
                className={`px-3 py-1 rounded-lg transition ${tierFilter === 'all' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                All ({accessibleExperiments.length})
              </button>
              <button
                onClick={() => setTierFilter('global')}
                className={`px-3 py-1 rounded-lg transition ${tierFilter === 'global' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Global KCSE
              </button>
              <button
                onClick={() => setTierFilter('school')}
                className={`px-3 py-1 rounded-lg transition ${tierFilter === 'school' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                School Approved
              </button>
              <button
                onClick={() => setTierFilter('teacher')}
                className={`px-3 py-1 rounded-lg transition ${tierFilter === 'teacher' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                My Own
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accessibleExperiments.map(exp => (
              <div key={exp.id} className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5 flex flex-col justify-between hover:border-slate-600 transition shadow">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      exp.ownerType === 'global' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      exp.ownerType === 'school' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {exp.ownerType === 'global' ? 'Global KCSE' : exp.ownerType === 'school' ? 'School Library' : 'My Custom Lab'}
                    </span>
                    <span className="text-[11px] text-slate-400">{exp.estimatedDurationMinutes} mins</span>
                  </div>

                  <h3 className="font-bold text-white text-base leading-snug">{exp.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{exp.topic}</p>

                  <div className="mt-4 pt-3 border-t border-slate-700/60 text-xs text-slate-400 space-y-1">
                    <div>Author: <span className="text-slate-200">{exp.authorName}</span></div>
                    <div>Paper Code: <span className="text-slate-200 font-mono">{exp.kcsePaper}</span></div>
                    <div>Guided Steps: <span className="text-slate-200">{exp.steps.length} steps</span></div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-700/60 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenAssignModal(exp)}
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Assign to Class</span>
                    </button>
                    <button
                      onClick={() => startExperiment(exp, null, 'practice')}
                      className="py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs transition"
                      title="Test experiment as student"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {exp.ownerType === 'teacher' && exp.teacherId === currentUser?.id ? (
                    <button
                      onClick={() => openExperimentEditor(exp)}
                      className="w-full py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold transition flex items-center justify-center space-x-1.5 border border-amber-500/40"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Modify Steps, Apparatus & Bench</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleModifyExperiment(exp)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-medium transition flex items-center justify-center space-x-1.5 border border-slate-700"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Clone & Modify for My Stream</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ANALYTICS & HEATMAP */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-6 space-y-4">
            <h2 className="text-base font-bold text-white">Step-by-Step Diagnostic Heatmap</h2>
            <p className="text-xs text-slate-400">
              Pinpoints exact procedural steps in KCSE Paper 3 where your students either failed validation or triggered the force-push mechanism.
            </p>

            <div className="space-y-3 pt-2">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Acid-Base Titration: Step 3 (Indicator Addition)</span>
                  <span className="text-rose-400 font-bold">14% Force-Push Rate</span>
                </div>
                <div className="w-full bg-slate-750 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '14%' }} />
                </div>
                <p className="text-[11px] text-slate-400">
                  Diagnostic: Students frequently forget to add phenolphthalein before starting titration run. Recommended action: Review indicator role in revision session.
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Ohm's Law: Step 4 (Voltmeter Parallel Connection)</span>
                  <span className="text-amber-400 font-bold">9% Error Rate</span>
                </div>
                <div className="w-full bg-slate-750 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '9%' }} />
                </div>
                <p className="text-[11px] text-slate-400">
                  Diagnostic: Connecting voltmeter in series instead of across resistor terminals.
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Titration: Step 5 (Titre Consistency Check)</span>
                  <span className="text-emerald-400 font-bold">96% Success Rate</span>
                </div>
                <div className="w-full bg-slate-750 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '96%' }} />
                </div>
                <p className="text-[11px] text-slate-400">
                  Excellent! Students reliably obtain 3 consecutive titres within KNEC ±0.20 cm³ margin.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {isAssignModalOpen && selectedExperimentToAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Assign Practical to Class</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedExperimentToAssign.title}</p>
              </div>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Form Class *</label>
                <select
                  value={assignmentForm.classId}
                  onChange={e => setAssignmentForm({ ...assignmentForm, classId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                >
                  {myClasses.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.studentCount || 40} candidates)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Practical Mode *</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-3 rounded-xl border cursor-pointer flex flex-col ${
                    assignmentForm.mode === 'exam' 
                      ? 'bg-rose-950/40 border-rose-500 text-white' 
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="mode"
                      value="exam"
                      checked={assignmentForm.mode === 'exam'}
                      onChange={() => setAssignmentForm({ ...assignmentForm, mode: 'exam' })}
                      className="sr-only"
                    />
                    <span className="font-bold text-xs text-rose-400">KCSE Exam Mode</span>
                    <span className="text-[11px] text-slate-400 mt-1">Timed countdown, no hints, 1 attempt lock, summative grading</span>
                  </label>

                  <label className={`p-3 rounded-xl border cursor-pointer flex flex-col ${
                    assignmentForm.mode === 'practice' 
                      ? 'bg-emerald-950/40 border-emerald-500 text-white' 
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="mode"
                      value="practice"
                      checked={assignmentForm.mode === 'practice'}
                      onChange={() => setAssignmentForm({ ...assignmentForm, mode: 'practice' })}
                      className="sr-only"
                    />
                    <span className="font-bold text-xs text-emerald-400">Practice Mode</span>
                    <span className="text-[11px] text-slate-400 mt-1">Step hints shown, unlimited resets, formative instant feedback</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Deadline (Days from now)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={assignmentForm.deadlineDays}
                    onChange={e => setAssignmentForm({ ...assignmentForm, deadlineDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Time Limit (Minutes)</label>
                  <input
                    type="number"
                    min="10"
                    max="180"
                    value={assignmentForm.timeLimitMinutes}
                    onChange={e => setAssignmentForm({ ...assignmentForm, timeLimitMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Modify before assign option */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-amber-300 block">Want to modify steps, apparatus, or hints first?</span>
                  <p className="text-[11px] text-slate-400">
                    Customize the instructions, force-push permissions, and marking scheme before candidates start.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAssignModalOpen(false);
                    handleModifyExperiment(selectedExperimentToAssign);
                  }}
                  className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center gap-1.5 transition shrink-0 shadow"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Modify First</span>
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Assign to Candidates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
