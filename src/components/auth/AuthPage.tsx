import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FlaskConical, 
  GraduationCap, 
  School as SchoolIcon, 
  LogIn, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  Building2, 
  UserPlus, 
  ChevronRight,
  ArrowRight,
  Filter,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { 
    schools, 
    classes, 
    users, 
    login, 
    registerStudent, 
    authMode, 
    setAuthMode,
    setCurrentView
  } = useApp();

  // Student registration form state
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    schoolId: schools[0]?.id || '',
    classId: '',
    admissionNumber: '',
    password: ''
  });

  // Filter state for student teacher selection
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'chemistry' | 'physics' | 'biology'>('all');
  const [formYearFilter, setFormYearFilter] = useState<'all' | '1' | '2' | '3' | '4'>('all');

  // Regular login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Selected school
  const selectedSchool = schools.find(s => s.id === studentForm.schoolId) || schools[0];

  // Teachers registered under the selected school
  const schoolTeachers = users.filter(u => u.role === 'teacher' && u.schoolId === studentForm.schoolId);

  // Classes registered under the selected school
  const availableClasses = classes.filter(c => c.schoolId === studentForm.schoolId);

  // Filtered classes based on subject and form year
  const filteredClasses = availableClasses.filter(c => {
    const matchesSubject = subjectFilter === 'all' || c.subject.toLowerCase() === subjectFilter;
    const matchesYear = formYearFilter === 'all' || c.formYear.toString() === formYearFilter;
    return matchesSubject && matchesYear;
  });

  // Currently selected class object
  const selectedClass = classes.find(c => c.id === studentForm.classId);

  // Handle school change
  const handleSchoolChange = (newSchoolId: string) => {
    setStudentForm(prev => ({
      ...prev,
      schoolId: newSchoolId,
      classId: '' // Reset selected class so student explicitly selects teacher under the new school
    }));
    setRegistrationError('');
  };

  // Handler: Student Registration
  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationError('');

    if (!studentForm.name.trim() || !studentForm.email.trim() || !studentForm.admissionNumber.trim()) {
      setRegistrationError('Please fill in all student credentials (Full Name, Email, and Admission Number).');
      return;
    }

    if (!studentForm.schoolId) {
      setRegistrationError('Please select your secondary school from the list.');
      return;
    }

    if (!studentForm.classId) {
      setRegistrationError(`Please select your registered class teacher under ${selectedSchool?.name || 'your school'}.`);
      return;
    }

    const newStudent = registerStudent({
      name: studentForm.name.trim(),
      email: studentForm.email.trim(),
      schoolId: studentForm.schoolId,
      classId: studentForm.classId,
      admissionNumber: studentForm.admissionNumber.trim()
    });

    setSuccessMessage(`Welcome ${newStudent.name}! You are enrolled under ${newStudent.teacherName} (${newStudent.className}) at ${selectedSchool?.name}. Redirecting to your student lab dashboard...`);
  };

  // Handler: Manual Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const targetUser = users.find(u => u.email.toLowerCase() === loginForm.email.toLowerCase().trim());
    if (targetUser) {
      login(targetUser);
    } else {
      setLoginError('No registered user found with that email. Please check your spelling or use one of the 1-click test personas below.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      <div className="w-full max-w-4xl bg-slate-800/90 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden backdrop-blur">
        
        {/* Navigation back to landing page */}
        <div className="px-6 sm:px-8 pt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentView('landing')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to STEM Spark Lab Overview</span>
          </button>
          
          <span className="text-[11px] font-mono text-emerald-400 font-bold hidden sm:inline">
            KENYA KCSE PRACTICAL ECOSYSTEM
          </span>
        </div>

        {/* Header Bar */}
        <div className="p-6 sm:p-8 border-b border-slate-700/80 bg-slate-850/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <FlaskConical className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  STEM-SPARK-LAB
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                    KCSE Portal
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  Virtual Chemistry, Physics & Biology Lab for Secondary Schools
                </p>
              </div>
            </div>

            {/* Top Auth Mode Tabs (ONLY Student Register & Sign In - School Register is handled by Platform Owner) */}
            <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-700/60 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => { setAuthMode('register_student'); setLoginError(''); setRegistrationError(''); }}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
                  authMode === 'register_student'
                    ? 'bg-violet-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student Register</span>
              </button>

              <button
                type="button"
                onClick={() => { setAuthMode('login'); setLoginError(''); setRegistrationError(''); }}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
                  authMode === 'login'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center space-x-3 text-emerald-300 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {registrationError && (
          <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center space-x-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{registrationError}</span>
          </div>
        )}

        <div className="p-6 sm:p-8">
          
          {/* 1. STUDENT REGISTRATION TAB */}
          {authMode === 'register_student' && (
            <div>
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  <span>Enrolled Secondary Student Registration</span>
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  Create Your Student Laboratory Account
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Select your school and class teacher to link your account to your teacher's virtual practical stream.
                </p>
              </div>

              <form onSubmit={handleStudentSubmit} className="space-y-6">
                
                {/* Section A: Student Personal Details */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-750 space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                    1. Student Credentials
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Full Student Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kevin Mwenda or Faith Wanjiku"
                        value={studentForm.name}
                        onChange={e => setStudentForm({ ...studentForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Student Email Address <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. kevin.student@example.ac.ke"
                        value={studentForm.email}
                        onChange={e => setStudentForm({ ...studentForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        School Admission Number <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. NS/2026/0819 or NGH/2026/0412"
                        value={studentForm.admissionNumber}
                        onChange={e => setStudentForm({ ...studentForm, admissionNumber: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: School Selection (Required) */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-750 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                      2. Select Your Secondary School <span className="text-rose-400">*</span>
                    </span>
                    <span className="text-xs text-slate-400">
                      Selecting your school loads all registered subject teachers
                    </span>
                  </div>

                  <select
                    value={studentForm.schoolId}
                    onChange={e => handleSchoolChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium text-sm focus:outline-none focus:border-violet-500 shadow-sm"
                  >
                    <option value="" disabled>-- Select Your Secondary School --</option>
                    {schools.map(sch => (
                      <option key={sch.id} value={sch.id}>
                        {sch.name} — {sch.county} County ({sch.category} School)
                      </option>
                    ))}
                  </select>

                  {selectedSchool && (
                    <div className="p-3 rounded-xl bg-slate-850/80 border border-slate-750 flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <SchoolIcon className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-white">{selectedSchool.name}</span>
                        <span className="text-slate-400">• {selectedSchool.county} County</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                        {schoolTeachers.length} Registered Teachers Available
                      </span>
                    </div>
                  )}
                </div>

                {/* Section C: Teacher & Class Selection (Populated dynamically from selected school) */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-750 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                        3. Select Class Teacher under {selectedSchool?.name || 'Your School'} <span className="text-rose-400">*</span>
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Choose your class teacher for your specific subject stream (Chemistry, Physics, or Biology).
                      </p>
                    </div>

                    {/* Filter controls */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Filter className="w-3 h-3 text-slate-500" />
                        <span>Filter:</span>
                      </div>

                      {/* Subject Filter */}
                      <select
                        value={subjectFilter}
                        onChange={e => setSubjectFilter(e.target.value as any)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="all">All Subjects</option>
                        <option value="chemistry">Chemistry</option>
                        <option value="physics">Physics</option>
                        <option value="biology">Biology</option>
                      </select>

                      {/* Form Filter */}
                      <select
                        value={formYearFilter}
                        onChange={e => setFormYearFilter(e.target.value as any)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="all">All Forms</option>
                        <option value="1">Form 1</option>
                        <option value="2">Form 2</option>
                        <option value="3">Form 3</option>
                        <option value="4">Form 4</option>
                      </select>
                    </div>
                  </div>

                  {/* Populated Teacher / Class Cards */}
                  {filteredClasses.length === 0 ? (
                    <div className="p-8 text-center bg-slate-900 rounded-xl border border-dashed border-slate-800 space-y-2">
                      <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-400 font-medium">
                        No classes match the filter under {selectedSchool?.name}.
                      </p>
                      <button
                        type="button"
                        onClick={() => { setSubjectFilter('all'); setFormYearFilter('all'); }}
                        className="text-xs text-violet-400 font-bold hover:underline"
                      >
                        Reset filters to see all available teachers
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                      {filteredClasses.map(cls => {
                        const isSelected = studentForm.classId === cls.id;
                        const teacher = users.find(u => u.id === cls.teacherId);

                        const subjectBadgeColor = 
                          cls.subject === 'Chemistry'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : cls.subject === 'Physics'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

                        return (
                          <div
                            key={cls.id}
                            onClick={() => {
                              setStudentForm(prev => ({ ...prev, classId: cls.id }));
                              setRegistrationError('');
                            }}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-violet-950/40 border-violet-500 shadow-md ring-1 ring-violet-500'
                                : 'bg-slate-900 border-slate-750 hover:border-slate-600'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${subjectBadgeColor}`}>
                                  {cls.subject} • Form {cls.formYear}
                                </span>
                                <h4 className="text-sm font-bold text-white mt-1.5 leading-snug">
                                  {cls.name}
                                </h4>
                              </div>

                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                isSelected ? 'border-violet-400 bg-violet-600' : 'border-slate-600'
                              }`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                                <span>{cls.teacherName}</span>
                              </div>
                              <span className="text-[11px] text-slate-500">
                                {cls.studentCount} students
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Summary of Selected Teacher */}
                  {selectedClass && (
                    <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-500/30 flex items-center justify-between text-xs text-violet-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-violet-400" />
                        <span>Enrolling in: <strong>{selectedClass.name}</strong> ({selectedClass.subject})</span>
                      </div>
                      <span className="font-semibold text-white">Teacher: {selectedClass.teacherName}</span>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-sm transition shadow-xl shadow-violet-600/30 flex items-center justify-center space-x-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Complete Student Registration & Enter Practical Portal</span>
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* 2. REGULAR LOGIN TAB */}
          {authMode === 'login' && (
            <div>
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Registered Account Authentication
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  Sign In to STEM Spark Lab
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Access your assigned KCSE science practicals, review previous attempts, or enter teacher marking dashboards.
                </p>
              </div>

              {loginError && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-lg mb-8">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. faith.wanjiku@student.ac.ke or chem.omondi@nairobischool.ac.ke"
                    value={loginForm.email}
                    onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Password (Optional for Demo Environment)
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              </form>

              {/* 1-Click Persona Quick Logins for Instant Testing */}
              <div className="border-t border-slate-700/80 pt-6">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Instant 1-Click Role Logins (Pre-configured Kenyan Personas)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Super Admin */}
                  <button
                    type="button"
                    onClick={() => {
                      const u = users.find(x => x.role === 'super_admin');
                      if (u) login(u);
                    }}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-500 transition text-left group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Owner
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300">
                      Super Admin (Platform Owner)
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Full view of all schools & global experiments
                    </div>
                  </button>

                  {/* School Admin */}
                  <button
                    type="button"
                    onClick={() => {
                      const u = users.find(x => x.role === 'school_admin' && x.schoolId === 'sch-nairobi-school-00') || users.find(x => x.role === 'school_admin');
                      if (u) login(u);
                    }}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-blue-500/30 hover:border-blue-500 transition text-left group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                        <SchoolIcon className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                        School
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white group-hover:text-blue-300">
                      Mr. Kenneth Ngigi (Principal)
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Nairobi School • Teachers & classes
                    </div>
                  </button>

                  {/* Chemistry Teacher */}
                  <button
                    type="button"
                    onClick={() => {
                      const u = users.find(x => x.id === 'usr-teacher-ns-chem') || users.find(x => x.role === 'teacher');
                      if (u) login(u);
                    }}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-500 transition text-left group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                        <BookOpen className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                        Teacher
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-300">
                      Mr. David Omondi (Chemistry)
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Nairobi School • Assign & grade practicals
                    </div>
                  </button>

                  {/* Student */}
                  <button
                    type="button"
                    onClick={() => {
                      const u = users.find(x => x.id === 'usr-student-kevin') || users.find(x => x.role === 'student');
                      if (u) login(u);
                    }}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-violet-500/30 hover:border-violet-500 transition text-left group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="p-1.5 rounded-lg bg-violet-500/20 text-violet-400">
                        <GraduationCap className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800">
                        Student
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white group-hover:text-violet-300">
                      Kevin Mwenda (Candidate)
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Connected to Mr. Omondi (Nairobi School)
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
