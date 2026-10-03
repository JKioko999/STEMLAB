import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FlaskConical, 
  ShieldCheck, 
  GraduationCap, 
  School as SchoolIcon, 
  BookOpen, 
  ChevronDown, 
  LogOut, 
  RotateCcw, 
  UserCheck, 
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    schools, 
    users, 
    switchUser, 
    logout, 
    setCurrentView, 
    setAuthMode, 
    resetAllToDefaults,
    currentView 
  } = useApp();

  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [showRoleInfo, setShowRoleInfo] = useState(false);

  const currentSchool = schools.find(s => s.id === currentUser?.schoolId);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'super_admin':
        return {
          label: 'Platform Owner (Super Admin)',
          bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mr-1" />
        };
      case 'school_admin':
        return {
          label: 'School Principal (Admin)',
          bg: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          icon: <SchoolIcon className="w-3.5 h-3.5 text-blue-400 mr-1" />
        };
      case 'teacher':
        return {
          label: 'Subject Teacher',
          bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          icon: <BookOpen className="w-3.5 h-3.5 text-amber-400 mr-1" />
        };
      case 'student':
        return {
          label: 'KCSE Student',
          bg: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
          icon: <GraduationCap className="w-3.5 h-3.5 text-violet-400 mr-1" />
        };
      default:
        return {
          label: 'Guest',
          bg: 'bg-slate-700 text-slate-300 border-slate-600',
          icon: null
        };
    }
  };

  const badge = getRoleBadge(currentUser?.role);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                STEM-SPARK<span className="text-emerald-400">-LAB</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                KCSE v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Kenyan Secondary Schools Virtual Science Lab
            </p>
          </div>
        </div>

        {/* Tenant & Active User Section */}
        {currentUser ? (
          <div className="flex items-center space-x-3">
            {/* School Scope indicator */}
            {currentSchool && (
              <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
                <SchoolIcon className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-200">{currentSchool.name}</span>
                <span className="text-slate-500">({currentSchool.county} Co.)</span>
              </div>
            )}

            {/* Role Badge */}
            <div className={`hidden sm:flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${badge.bg}`}>
              {badge.icon}
              {badge.label}
            </div>

            {/* Quick Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSwitcherOpen(!switcherOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-sm font-medium text-slate-200 hover:text-white transition-all shadow-sm"
                title="Switch active role / persona"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold ${currentUser.avatarColor || 'bg-slate-700'}`}>
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden lg:block max-w-[130px] truncate">
                  <div className="text-xs font-semibold leading-tight truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{currentUser.email}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {switcherOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-2 border-b border-slate-700/80">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Switch Role & Persona
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Test any of the 4 hierarchical roles instantly:
                    </p>
                  </div>

                  <div className="max-h-72 overflow-y-auto py-1 divide-y divide-slate-750">
                    {/* Super Admin */}
                    {users.filter(u => u.role === 'super_admin').map(user => (
                      <button
                        key={user.id}
                        onClick={() => { switchUser(user.id); setSwitcherOpen(false); }}
                        className={`w-full text-left px-3.5 py-2 hover:bg-slate-700/60 transition flex items-start space-x-2.5 ${currentUser.id === user.id ? 'bg-emerald-950/40 text-emerald-300' : 'text-slate-200'}`}
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-bold flex items-center gap-1.5">
                            {user.name}
                            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Owner</span>
                          </div>
                          <div className="text-[11px] text-slate-400">Super Admin (All Schools & Global Library)</div>
                        </div>
                      </button>
                    ))}

                    {/* School Admins */}
                    {users.filter(u => u.role === 'school_admin').map(user => {
                      const sch = schools.find(s => s.id === user.schoolId);
                      return (
                        <button
                          key={user.id}
                          onClick={() => { switchUser(user.id); setSwitcherOpen(false); }}
                          className={`w-full text-left px-3.5 py-2 hover:bg-slate-700/60 transition flex items-start space-x-2.5 ${currentUser.id === user.id ? 'bg-blue-950/40 text-blue-300' : 'text-slate-200'}`}
                        >
                          <SchoolIcon className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                          <div>
                            <div className="text-xs font-bold">{user.name}</div>
                            <div className="text-[11px] text-slate-400">School Admin • {sch?.name}</div>
                          </div>
                        </button>
                      );
                    })}

                    {/* Teachers */}
                    {users.filter(u => u.role === 'teacher').map(user => {
                      const sch = schools.find(s => s.id === user.schoolId);
                      return (
                        <button
                          key={user.id}
                          onClick={() => { switchUser(user.id); setSwitcherOpen(false); }}
                          className={`w-full text-left px-3.5 py-2 hover:bg-slate-700/60 transition flex items-start space-x-2.5 ${currentUser.id === user.id ? 'bg-amber-950/40 text-amber-300' : 'text-slate-200'}`}
                        >
                          <BookOpen className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                          <div>
                            <div className="text-xs font-bold">{user.name}</div>
                            <div className="text-[11px] text-slate-400">{user.subjectSpecialization} • {sch?.name}</div>
                          </div>
                        </button>
                      );
                    })}

                    {/* Students */}
                    {users.filter(u => u.role === 'student').map(user => {
                      return (
                        <button
                          key={user.id}
                          onClick={() => { switchUser(user.id); setSwitcherOpen(false); }}
                          className={`w-full text-left px-3.5 py-2 hover:bg-slate-700/60 transition flex items-start space-x-2.5 ${currentUser.id === user.id ? 'bg-violet-950/40 text-violet-300' : 'text-slate-200'}`}
                        >
                          <GraduationCap className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                          <div>
                            <div className="text-xs font-bold flex items-center gap-1.5">
                              {user.name}
                              <span className="text-[10px] text-slate-400">({user.className})</span>
                            </div>
                            <div className="text-[11px] text-slate-400">Connected Teacher: {user.teacherName}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-2 border-t border-slate-700 space-y-1">
                    <button
                      onClick={() => {
                        setAuthMode('register_student');
                        setCurrentView('auth');
                        setSwitcherOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 rounded-lg flex items-center space-x-2 font-medium"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Register New Student</span>
                    </button>

                    <button
                      onClick={() => {
                        setAuthMode('register_student');
                        setCurrentView('auth');
                        setSwitcherOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 rounded-lg flex items-center space-x-2 font-medium"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-violet-400" />
                      <span>Register New Student</span>
                    </button>

                    {currentUser.role === 'super_admin' && (
                      <button
                        onClick={() => {
                          setCurrentView('dashboard');
                          setSwitcherOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-blue-300 hover:bg-slate-700 rounded-lg flex items-center space-x-2 font-medium"
                      >
                        <SchoolIcon className="w-3.5 h-3.5 text-blue-400" />
                        <span>Manage / Onboard Schools</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setCurrentView('landing');
                        setSwitcherOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-emerald-300 hover:bg-slate-700 rounded-lg flex items-center space-x-2 font-medium"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>STEM Spark Lab Overview</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('Reset simulated database back to Kenyan KCSE seed data?')) {
                          resetAllToDefaults();
                          setSwitcherOpen(false);
                        }
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-slate-700 rounded-lg flex items-center space-x-2 font-medium"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Simulated Demo Data</span>
                    </button>

                    <button
                      onClick={() => { logout(); setSwitcherOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-700 hover:text-white rounded-lg flex items-center space-x-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Navigation */}
            {currentView !== 'dashboard' && (
              <button
                onClick={() => setCurrentView('dashboard')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow"
              >
                Dashboard
              </button>
            )}

            {currentView === 'dashboard' && (
              <button
                onClick={() => setCurrentView('landing')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>About Lab</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setCurrentView('landing')}
              className="text-xs font-semibold px-3 py-1.5 text-slate-300 hover:text-white transition hidden sm:inline"
            >
              About
            </button>
            <button
              onClick={() => { setAuthMode('login'); setCurrentView('auth'); }}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition"
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('register_student'); setCurrentView('auth'); }}
              className="text-xs font-bold px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm flex items-center gap-1.5"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Register</span>
            </button>
          </div>
        )}

      </div>
    </header>
  );
};
