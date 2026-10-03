import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Sparkles, UserCheck, ArrowRightLeft } from 'lucide-react';

export const RoleBanner: React.FC = () => {
  const { currentUser, users, switchUser, schools } = useApp();

  if (!currentUser) return null;

  const currentSchool = schools.find(s => s.id === currentUser.schoolId);

  const getRoleDescription = () => {
    switch (currentUser.role) {
      case 'super_admin':
        return '👑 Platform Owner (Super Admin): Full oversight of all registered Kenyan schools, global experiment catalog, institutional subscriptions, and national KCSE lab telemetry.';
      case 'school_admin':
        return `🏫 School Admin (${currentSchool?.name || 'School'}): Manage your institution's science teachers, form classes, school-level experiment repository, and student pass rates.`;
      case 'teacher':
        return `👨‍🏫 Subject Teacher (${currentUser.name} - ${currentUser.subjectSpecialization}): Assign KCSE practicals, track your class attempts, force-push logs, grade answer sheets, and build custom practicals.`;
      case 'student':
        return `🎓 Student (${currentUser.name} - ${currentUser.className}): View assignments from your teacher ${currentUser.teacherName || ''}, or practice freely in the Practice Lab!`;
      default:
        return '';
    }
  };

  return (
    <div className="bg-slate-800/80 border-b border-slate-750/70 px-4 py-2 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-xs text-slate-300">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="leading-snug">{getRoleDescription()}</span>
        </div>

        {/* Quick Switch Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-[11px] shrink-0">
          <span className="text-slate-400 font-medium hidden lg:inline mr-1">Switch:</span>
          
          <button
            onClick={() => switchUser('usr-super-admin')}
            className={`px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1 ${
              currentUser.role === 'super_admin'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-700/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            👑 Super Admin (Me)
          </button>

          <button
            onClick={() => switchUser('usr-admin-nairobi-girls')}
            className={`px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1 ${
              currentUser.role === 'school_admin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-700/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            🏫 School Admin
          </button>

          <button
            onClick={() => switchUser('usr-teacher-kamau')}
            className={`px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1 ${
              currentUser.id === 'usr-teacher-kamau'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-700/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            👨‍🏫 Chem Teacher
          </button>

          <button
            onClick={() => switchUser('usr-teacher-otieno')}
            className={`px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1 ${
              currentUser.id === 'usr-teacher-otieno'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-slate-700/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            👩‍🏫 Phys Teacher
          </button>

          <button
            onClick={() => switchUser('usr-student-faith')}
            className={`px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1 ${
              currentUser.id === 'usr-student-faith'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-slate-700/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            🎓 Student (Faith)
          </button>
        </div>
      </div>
    </div>
  );
};
