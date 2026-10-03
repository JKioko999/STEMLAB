import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../shared/StatsCard';
import { 
  School as SchoolIcon, 
  Users, 
  BookOpen, 
  FlaskConical, 
  Plus, 
  CheckCircle, 
  ExternalLink, 
  FolderPlus, 
  Award, 
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Trash2,
  AlertTriangle
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
    switchUser 
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
    studentCount: 42
  });

  // Filter scoped data
  const schoolTeachers = users.filter(u => u.schoolId === currentSchool.id && u.role === 'teacher');
  const schoolStudents = users.filter(u => u.schoolId === currentSchool.id && u.role === 'student');
  const schoolClasses = classes.filter(c => c.schoolId === currentSchool.id);
  const schoolAssignments = assignments.filter(a => a.schoolId === currentSchool.id);
  const schoolAttempts = attempts.filter(a => a.schoolId === currentSchool.id);

  // Experiments visible in this school:
  // Global experiments + School experiments for this school
  const schoolTierExperiments = experiments.filter(e => e.ownerType === 'school' && e.schoolId === currentSchool.id);
  const globalExperiments = experiments.filter(e => e.ownerType === 'global');

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherForm.name || !teacherForm.email) return;

    registerTeacher({
      name: teacherForm.name,
      email: teacherForm.email,
      schoolId: currentSchool.id,
      subjectSpecialization: teacherForm.subjectSpecialization
    });

    setIsAddTeacherOpen(false);
    setTeacherForm({ name: '', email: '', subjectSpecialization: 'Chemistry & Biology' });
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.name) return;

    const assignedTeacher = schoolTeachers.find(t => t.id === classForm.teacherId) || schoolTeachers[0];

    addClass({
      schoolId: currentSchool.id,
      name: classForm.name,
      formYear: Number(classForm.formYear),
      teacherId: assignedTeacher?.id || '',
      teacherName: assignedTeacher?.name || 'Unassigned',
      subject: classForm.subject,
      studentCount: Number(classForm.studentCount || 40)
    });

    setIsAddClassOpen(false);
    setClassForm({ name: '', formYear: 3, teacherId: '', subject: 'Chemistry', studentCount: 42 });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* School Header */}
      <div className="bg-gradient-to-r from-blue-950/50 via-slate-850 to-slate-900 border border-blue-500/20 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-400">
            <SchoolIcon className="w-4 h-4" />
            <span>Institution Science Department Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 flex items-center gap-2 flex-wrap">
            <span>{currentSchool.name}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono font-bold">
              {currentSchool.registrationNumber || 'MOE/REG/PENDING'}
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {currentSchool.category} Secondary School • {currentSchool.county} County • Principal / Science HOD: {currentUser?.name}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddTeacherOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg shadow-blue-600/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Science Teacher</span>
          </button>

          <button
            onClick={() => setIsAddClassOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Form Stream</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Appointed Teachers"
          value={schoolTeachers.length}
          subtitle="Physics, Chemistry & Biology"
          icon={<BookOpen className="w-5 h-5" />}
          color="amber"
        />
        <StatsCard
          title="Form Classes"
          value={schoolClasses.length}
          subtitle="Active science streams"
          icon={<SchoolIcon className="w-5 h-5" />}
          color="blue"
        />
        <StatsCard
          title="Enrolled Candidates"
          value={schoolStudents.length > 0 ? schoolStudents.length : currentSchool.totalStudents}
          subtitle="KCSE practical students"
          icon={<Users className="w-5 h-5" />}
          color="violet"
        />
        <StatsCard
          title="Lab Attempts"
          value={schoolAttempts.length}
          subtitle="Assignments submitted & graded"
          icon={<FlaskConical className="w-5 h-5" />}
          color="emerald"
        />
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-800 flex space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('teachers')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'teachers'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Teachers Directory ({schoolTeachers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('classes')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'classes'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <SchoolIcon className="w-4 h-4" />
          <span>Form Classes & Streams ({schoolClasses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('school_experiments')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'school_experiments'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>School Practical Repository ({schoolTierExperiments.length + globalExperiments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'reports'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>School KCSE Lab Performance</span>
        </button>
      </div>

      {/* TAB 1: TEACHERS DIRECTORY */}
      {activeTab === 'teachers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Science Faculty Members</h2>
              <p className="text-xs text-slate-400">
                Teachers who can assign virtual practicals, monitor real-time force pushes, and review KCSE answer sheets.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schoolTeachers.map(teacher => {
              const teacherClasses = schoolClasses.filter(c => c.teacherId === teacher.id);
              const teacherAssignments = schoolAssignments.filter(a => a.teacherId === teacher.id);

              return (
                <div key={teacher.id} className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5 shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${teacher.avatarColor || 'bg-amber-600'}`}>
                        {teacher.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{teacher.name}</h3>
                        <p className="text-xs text-slate-400">{teacher.email}</p>
                      </div>
                    </div>

                    {teacher.mustChangePassword && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Temp Password Active
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700/60 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Specialization:</span>
                      <span className="text-slate-200 font-semibold">{teacher.subjectSpecialization}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Assigned Streams:</span>
                      <span className="text-slate-200 font-semibold">
                        {teacherClasses.map(c => c.name).join(', ') || 'None yet'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Active Practicals Set:</span>
                      <span className="text-slate-200 font-semibold">{teacherAssignments.length}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => switchUser(teacher.id)}
                      className="flex-1 py-2 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-xs font-semibold text-white transition flex items-center justify-center space-x-1.5"
                    >
                      <span>Switch to {teacher.name.split(' ')[1] || 'Teacher'} View</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => setTeacherToDelete(teacher)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 transition"
                      title={`Remove ${teacher.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CLASSES & STREAMS */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Form Streams & Student Enrollment</h2>
              <p className="text-xs text-slate-400">
                Form 3 and Form 4 laboratory cohorts registered under {currentSchool.name}.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {schoolClasses.map(cls => {
              const studentsInClass = schoolStudents.filter(s => s.classId === cls.id);
              return (
                <div key={cls.id} className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5 shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Form {cls.formYear} • {cls.subject}
                    </span>
                    <span className="text-xs text-slate-400">{cls.studentCount || studentsInClass.length} students</span>
                  </div>

                  <h3 className="font-extrabold text-white text-lg mt-2">{cls.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Subject Head: <span className="text-slate-200 font-semibold">{cls.teacherName}</span>
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-700/60">
                    <div className="text-[11px] font-semibold text-slate-400 mb-2">Registered Students:</div>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {studentsInClass.length > 0 ? (
                        studentsInClass.map(st => (
                          <div key={st.id} className="flex items-center justify-between text-xs bg-slate-900/60 p-1.5 rounded-lg">
                            <span className="text-slate-200 font-medium">{st.name}</span>
                            <span className="text-slate-500 font-mono text-[10px]">{st.admissionNumber}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-slate-500 italic">Enrolled students appear here</div>
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
        <div className="space-y-4">
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
            <h2 className="text-base font-bold text-white">School Experiment Projects & Curriculum Repository</h2>
            <p className="text-xs text-slate-400 mt-1">
              As School Admin, you load and approve practical projects for science teachers across {currentSchool.name}. Teachers can immediately pick these approved experiments to assign to their Form 3 & Form 4 cohorts.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              School-Specific Approved Projects ({schoolTierExperiments.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schoolTierExperiments.map(exp => (
                <div key={exp.id} className="bg-slate-800/90 rounded-2xl border border-blue-500/30 p-5 shadow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase border border-blue-500/30">
                        School Approved
                      </span>
                      <span className="text-xs text-slate-400">Author: {exp.authorName}</span>
                    </div>
                    <h4 className="font-bold text-white text-base">{exp.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{exp.topic}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-end">
                    <button
                      onClick={() => setProjectToDelete(exp)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Practical</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                National Global KCSE Library (Available to Load into School)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {globalExperiments.map(exp => (
                <div key={exp.id} className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                      {exp.subject} • {exp.kcsePaper}
                    </span>
                    <h4 className="font-bold text-white text-sm mt-2">{exp.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{exp.topic}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                    <button
                      onClick={() => {
                        promoteExperimentToSchool(exp.id, currentSchool.id);
                        alert(`Loaded "${exp.title}" into ${currentSchool.name} School Library!`);
                      }}
                      className="w-full py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-semibold transition flex items-center justify-center space-x-1.5"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>Load into School Projects</span>
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
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white">School KCSE Paper 3 Performance Summary</h2>
            <p className="text-xs text-slate-400">
              Aggregated assessment analytics for {currentSchool.name}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400 font-semibold uppercase">Form 3 East Practical Mean</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">18.4 / 20 (92%)</div>
              <p className="text-xs text-slate-400 mt-1">Chemistry Titration Standardization</p>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400 font-semibold uppercase">Form 4 Science Practical Mean</span>
              <div className="text-2xl font-bold text-cyan-400 mt-1">16.8 / 20 (84%)</div>
              <p className="text-xs text-slate-400 mt-1">Physics Ohm's Law Circuit Practical</p>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400 font-semibold uppercase">Syllabus Practical Coverage</span>
              <div className="text-2xl font-bold text-purple-400 mt-1">85% Complete</div>
              <p className="text-xs text-slate-400 mt-1">KCSE Paper 3 readiness index</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Teacher Modal */}
      {isAddTeacherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-base font-bold text-white">Add Science Teacher</h3>
              <button onClick={() => setIsAddTeacherOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddTeacher} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Teacher Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mr. Peter Kamau"
                  value={teacherForm.name}
                  onChange={e => setTeacherForm({ ...teacherForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. chem.teacher@school.ac.ke"
                  value={teacherForm.email}
                  onChange={e => setTeacherForm({ ...teacherForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Subject Specialization</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chemistry (Form 3 & 4)"
                  value={teacherForm.subjectSpecialization}
                  onChange={e => setTeacherForm({ ...teacherForm, subjectSpecialization: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                  <span>✉ Automated Teacher Invitation:</span>
                </div>
                <p className="text-slate-400">
                  An appointment email containing an auto-generated temporary password will be immediately dispatched to <strong>{teacherForm.email || 'the teacher email'}</strong>. The teacher will be required to change this password on their first login.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTeacherOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Appoint Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {isAddClassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-base font-bold text-white">Create Form Stream</h3>
              <button onClick={() => setIsAddClassOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddClass} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Stream Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Form 3 West or Form 4 Blue"
                  value={classForm.name}
                  onChange={e => setClassForm({ ...classForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Form Level</label>
                  <select
                    value={classForm.formYear}
                    onChange={e => setClassForm({ ...classForm, formYear: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value={1}>Form 1</option>
                    <option value={2}>Form 2</option>
                    <option value={3}>Form 3</option>
                    <option value={4}>Form 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Subject</label>
                  <select
                    value={classForm.subject}
                    onChange={e => setClassForm({ ...classForm, subject: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Chemistry">Chemistry</option>
                    <option value="Physics">Physics</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Number of Enrolled Students *
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  required
                  placeholder="e.g. 42"
                  value={classForm.studentCount}
                  onChange={e => setClassForm({ ...classForm, studentCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Initial student capacity / candidate count for this stream
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Assign Subject Teacher</label>
                <select
                  value={classForm.teacherId}
                  onChange={e => setClassForm({ ...classForm, teacherId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select a teacher...</option>
                  {schoolTeachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.subjectSpecialization})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddClassOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Create Stream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Teacher Confirmation Modal */}
      {teacherToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs text-slate-300">
            <div className="flex items-center space-x-2.5 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Remove Science Teacher</h3>
                <span className="text-[11px] text-rose-300">Faculty roster update</span>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed">
              Are you sure you want to remove <strong>{teacherToDelete.name}</strong> ({teacherToDelete.subjectSpecialization}) from {currentSchool.name}?
            </p>

            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 text-[11px] space-y-1">
              <div>• Their assigned class streams will be marked as unassigned.</div>
              <div>• Previous student exam submissions and marks will be preserved.</div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTeacherToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteTeacher(teacherToDelete.id);
                  setTeacherToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove Teacher</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Project Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs text-slate-300">
            <div className="flex items-center space-x-2.5 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Practical Project</h3>
                <span className="text-[11px] text-rose-300">Curriculum catalog modification</span>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed">
              Are you sure you want to remove <strong>{projectToDelete.title}</strong> from {currentSchool.name}&apos;s approved practical library?
            </p>

            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 text-[11px]">
              This experiment will no longer appear in your school-specific catalog for assignment.
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteExperiment(projectToDelete.id);
                  setProjectToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Project</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
