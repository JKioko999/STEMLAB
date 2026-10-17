import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../shared/StatsCard';
import { 
  Plus, 
  ExternalLink, 
  FolderPlus, 
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  Settings
} from 'lucide-react';
import { User, ExperimentSpec } from '../../types';

export const SchoolAdminDashboard: React.FC = () => {
  const { 
    currentUser, 
    schools, 
    users, 
    classes, 
    experiments, 
    assignments, 
    attempts, 
    registerTeacher, 
    deleteTeacher,
    deleteExperiment,
    addClass, 
    promoteExperimentToSchool,
    switchUser,
    openSettings
  } = useApp();

  const currentSchool = schools.find(s => s.id === currentUser?.schoolId) || schools[0];
  
  const [activeTab, setActiveTab] = useState<'teachers' | 'classes' | 'school_experiments' | 'reports'>('teachers');
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<User | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<ExperimentSpec | null>(null);

  // Form states
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    subjectSpecialization: 'Chemistry & Biology'
  });

  const [classForm, setClassForm] = useState({
    name: '',
    formYear: 3,
    teacherId: '',
    subject: 'Chemistry' as const,
    studentCount: 40
  });

  // Filter scoped data
  const schoolTeachers = users.filter(u => u.schoolId === currentSchool.id && u.role === 'teacher');
  const schoolStudents = users.filter(u => u.schoolId === currentSchool.id && u.role === 'student');
  const schoolClasses = classes.filter(c => c.schoolId === currentSchool.id);
  const schoolAssignments = assignments.filter(a => a.schoolId === currentSchool.id);
  const schoolAttempts = attempts.filter(a => a.schoolId === currentSchool.id);

  // Experiments visible in this school:
  const schoolTierExperiments = experiments.filter(e => e.ownerType === 'school' && e.schoolId === currentSchool.id);
  const globalExperiments = experiments.filter(e => e.ownerType === 'global');

  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherForm.name.trim() || !teacherForm.email.trim()) return;

    const teacherName = teacherForm.name.trim();
    const teacherEmail = teacherForm.email.trim();

    registerTeacher({
      name: teacherName,
      email: teacherEmail,
      schoolId: currentSchool.id,
      subjectSpecialization: teacherForm.subjectSpecialization.trim()
    });

    setIsAddTeacherOpen(false);
    setSuccessNotification(`Teacher "${teacherName}" registered successfully! Appointment invitation and login credentials sent directly to ${teacherEmail} from intellicaautomationgroup@gmail.com.`);
    setTimeout(() => setSuccessNotification(null), 6000);

    setTeacherForm({ name: '', email: '', subjectSpecialization: 'Chemistry & Biology' });
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.name.trim()) return;

    const assignedTeacher = schoolTeachers.find(t => t.id === classForm.teacherId) || schoolTeachers[0];

    addClass({
      schoolId: currentSchool.id,
      name: classForm.name.trim(),
      formYear: Number(classForm.formYear),
      teacherId: assignedTeacher?.id || '',
      teacherName: assignedTeacher?.name || 'Unassigned',
      subject: classForm.subject,
      studentCount: Number(classForm.studentCount || 40)
    });

    setIsAddClassOpen(false);
    setClassForm({ name: '', formYear: 3, teacherId: '', subject: 'Chemistry', studentCount: 40 });
  };

  // Real computed stats
  const averageSchoolScore = schoolAttempts.length > 0 
    ? Math.round(schoolAttempts.reduce((acc, a) => acc + a.percentage, 0) / schoolAttempts.length)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Direct Success Notification Toast */}
      {successNotification && (
        <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between gap-3 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium">{successNotification}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setSuccessNotification(null)}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-100 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      
      {/* School Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-50 via-white to-sky-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 p-5 sm:p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            {currentSchool.name}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {currentSchool.county} County · {currentSchool.category} · {currentSchool.registrationNumber || 'Pending code'} · Admin: {currentUser?.name}
          </p>
        </div>

        <div className="flex items-center gap-2">

          <button
            onClick={() => setIsAddTeacherOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add teacher</span>
          </button>

          <button
            onClick={() => setIsAddClassOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create stream</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard color="emerald"
          title="Appointed teachers"
          value={schoolTeachers.length}
          subtitle="Physics, chemistry, biology"
        />
        <StatsCard color="blue"
          title="Class streams"
          value={schoolClasses.length}
          subtitle="Active candidate cohorts"
        />
        <StatsCard color="amber"
          title="Enrolled students"
          value={schoolStudents.length > 0 ? schoolStudents.length : currentSchool.totalStudents}
          subtitle="Registered science candidates"
        />
        <StatsCard color="violet"
          title="Completed attempts"
          value={schoolAttempts.length}
          subtitle={averageSchoolScore !== null ? `Average score: ${averageSchoolScore}%` : 'No attempts logged yet'}
        />
      </div>

      {/* Plain Tabs */}
      <div className="flex space-x-6 border-b border-slate-200 dark:border-slate-800 text-sm font-medium">
        <button
          onClick={() => setActiveTab('teachers')}
          className={`pb-2.5 -mb-px transition-colors ${
            activeTab === 'teachers'
              ? 'border-b-2 border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-300 font-semibold'
              : 'border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Teachers ({schoolTeachers.length})
        </button>

        <button
          onClick={() => setActiveTab('classes')}
          className={`pb-2.5 -mb-px transition-colors ${
            activeTab === 'classes'
              ? 'border-b-2 border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-300 font-semibold'
              : 'border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Streams ({schoolClasses.length})
        </button>

        <button
          onClick={() => setActiveTab('school_experiments')}
          className={`pb-2.5 -mb-px transition-colors ${
            activeTab === 'school_experiments'
              ? 'border-b-2 border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-300 font-semibold'
              : 'border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Practicals repository ({schoolTierExperiments.length + globalExperiments.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-2.5 -mb-px transition-colors ${
            activeTab === 'reports'
              ? 'border-b-2 border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-300 font-semibold'
              : 'border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Assessment summary
        </button>
      </div>

      {/* TAB 1: TEACHERS DIRECTORY */}
      {activeTab === 'teachers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Science faculty members</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Teachers authorized to assign virtual practicals and review candidate submissions.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-2.5">Teacher</th>
                  <th className="px-4 py-2.5">Specialization</th>
                  <th className="px-4 py-2.5">Assigned streams</th>
                  <th className="px-4 py-2.5 text-right">Practicals set</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {schoolTeachers.map(teacher => {
                  const teacherClasses = schoolClasses.filter(c => c.teacherId === teacher.id);
                  const teacherAssignments = schoolAssignments.filter(a => a.teacherId === teacher.id);

                  return (
                    <tr key={teacher.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{teacher.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{teacher.email}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {teacher.subjectSpecialization}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {teacherClasses.map(c => c.name).join(', ') || 'None assigned'}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-900 dark:text-slate-100 font-medium">
                        {teacherAssignments.length}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => switchUser(teacher.id)}
                            className="px-2 py-1 rounded text-[11px] font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors inline-flex items-center gap-1"
                            title="View as teacher"
                          >
                            <span>Switch</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </button>

                          <button
                            onClick={() => setTeacherToDelete(teacher)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title={`Remove ${teacher.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CLASSES & STREAMS */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Class streams and enrollment</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registered science class cohorts under {currentSchool.name}.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {schoolClasses.map(cls => {
              const studentsInClass = schoolStudents.filter(s => s.classId === cls.id);
              return (
                <div key={cls.id} className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Form {cls.formYear} · {cls.subject}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {cls.studentCount || studentsInClass.length} students
                    </span>
                  </div>

                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">{cls.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Teacher: {cls.teacherName}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">Enrolled students:</div>
                    <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                      {studentsInClass.length > 0 ? (
                        studentsInClass.map(st => (
                          <div key={st.id} className="flex items-center justify-between text-xs py-0.5">
                            <span className="text-slate-800 dark:text-slate-200">{st.name}</span>
                            <span className="text-slate-400 font-mono text-[10px]">{st.admissionNumber}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-slate-400 italic">No candidates enrolled directly yet</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SCHOOL LAB REPOSITORY */}
      {activeTab === 'school_experiments' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              School-approved practicals ({schoolTierExperiments.length})
            </h3>
            
            {schoolTierExperiments.length === 0 ? (
              <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                No school-specific practicals loaded yet. You can load practicals from the standard curriculum catalog below.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schoolTierExperiments.map(exp => (
                  <div key={exp.id} className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1 text-xs text-slate-500 dark:text-slate-400">
                        <span>{exp.subject} · {exp.kcsePaper}</span>
                        <span>Author: {exp.authorName}</span>
                      </div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mt-1">{exp.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{exp.topic}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                      <button
                        onClick={() => setProjectToDelete(exp)}
                        className="px-2 py-1 rounded text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-slate-200 dark:border-slate-700 transition-colors inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete practical</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 space-y-3">
            <h3 className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Curriculum catalog (available to load into school)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {globalExperiments.map(exp => (
                <div key={exp.id} className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {exp.subject} · {exp.kcsePaper.split(' ')[0]}
                    </span>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mt-1">{exp.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{exp.topic}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        promoteExperimentToSchool(exp.id, currentSchool.id);
                      }}
                      className="w-full py-1.5 px-2 rounded-md bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>Load into school catalog</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REPORTS */}
      {activeTab === 'reports' && (
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Assessment summary</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggregated assessment analytics for {currentSchool.name}.
            </p>
          </div>

          {schoolAttempts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-md">
              No student submissions logged yet. Performance metrics will appear once candidates complete practical assignments.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Average school score</span>
                <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-1">{averageSchoolScore}%</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Across {schoolAttempts.length} candidate attempts</p>
              </div>

              <div className="p-4 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active practical assignments</span>
                <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-1">{schoolAssignments.length}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Assignments posted by teachers</p>
              </div>

              <div className="p-4 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Candidate completion rate</span>
                <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-1">
                  {schoolAssignments.length > 0 ? `${Math.round((schoolAttempts.length / (schoolAssignments.length * 40)) * 100)}%` : '0%'}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Submissions versus class capacity</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD TEACHER */}
      {isAddTeacherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Add teacher</h3>
              <button 
                onClick={() => setIsAddTeacherOpen(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTeacher} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Teacher full name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Peter Kamau"
                  value={teacherForm.name}
                  onChange={e => setTeacherForm({ ...teacherForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Email address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. teacher@school.ac.ke"
                  value={teacherForm.email}
                  onChange={e => setTeacherForm({ ...teacherForm, email: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Subject specialization</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chemistry (Form 3 & 4)"
                  value={teacherForm.subjectSpecialization}
                  onChange={e => setTeacherForm({ ...teacherForm, subjectSpecialization: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddTeacherOpen(false)}
                  className="flex-1 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
                >
                  Add teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CLASS */}
      {isAddClassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Create stream</h3>
              <button 
                onClick={() => setIsAddClassOpen(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddClass} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Stream name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Form 3 West or Form 4 Blue"
                  value={classForm.name}
                  onChange={e => setClassForm({ ...classForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Form level</label>
                  <select
                    value={classForm.formYear}
                    onChange={e => setClassForm({ ...classForm, formYear: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value={1}>Form 1</option>
                    <option value={2}>Form 2</option>
                    <option value={3}>Form 3</option>
                    <option value={4}>Form 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Subject</label>
                  <select
                    value={classForm.subject}
                    onChange={e => setClassForm({ ...classForm, subject: e.target.value as any })}
                    className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="Chemistry">Chemistry</option>
                    <option value="Physics">Physics</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Enrolled candidate capacity *
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  required
                  placeholder="e.g. 40"
                  value={classForm.studentCount}
                  onChange={e => setClassForm({ ...classForm, studentCount: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Assign teacher</label>
                <select
                  value={classForm.teacherId}
                  onChange={e => setClassForm({ ...classForm, teacherId: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="">Select teacher...</option>
                  {schoolTeachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.subjectSpecialization})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddClassOpen(false)}
                  className="flex-1 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
                >
                  Create stream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE TEACHER */}
      {teacherToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md max-w-md w-full p-5 shadow-xl space-y-4 text-xs">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Remove teacher</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to remove <strong className="text-slate-900 dark:text-slate-100">{teacherToDelete.name}</strong> from {currentSchool.name}?
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTeacherToDelete(null)}
                className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteTeacher(teacherToDelete.id);
                  setTeacherToDelete(null);
                }}
                className="px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-sm flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE PROJECT */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md max-w-md w-full p-5 shadow-xl space-y-4 text-xs">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Delete practical</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to remove <strong className="text-slate-900 dark:text-slate-100">{projectToDelete.title}</strong> from {currentSchool.name}&apos;s repository?
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteExperiment(projectToDelete.id);
                  setProjectToDelete(null);
                }}
                className="px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-sm flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};