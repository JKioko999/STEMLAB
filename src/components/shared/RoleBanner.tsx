import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';

export const RoleBanner: React.FC = () => {
  const { currentUser, switchUser, resetAllToDefaults } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  if (!currentUser) return null;

  return (
    <aside 
      aria-label="Developer Preview Bar"
      className="fixed bottom-3 right-3 z-50 transition-all duration-150"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-md rounded-md text-xs text-slate-700 dark:text-slate-300 overflow-hidden">
        
        {/* Toggle header */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 font-mono text-[11px] text-slate-600 dark:text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-[10px]">
            Demo role switcher
          </span>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-0.5 hover:text-slate-900 dark:hover:text-white rounded"
            title={collapsed ? 'Expand role switcher' : 'Collapse role switcher'}
          >
            {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {!collapsed && (
          <div className="p-2 space-y-2 max-w-sm">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Active persona: <strong className="text-slate-900 dark:text-slate-100">{currentUser.name}</strong> ({currentUser.role.replace('_', ' ')})
            </div>

            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => switchUser('usr-super-admin')}
                className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                  currentUser.role === 'super_admin'
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Admin
              </button>

              <button
                onClick={() => switchUser('usr-admin-nairobi-girls')}
                className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                  currentUser.role === 'school_admin'
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                School admin
              </button>

              <button
                onClick={() => switchUser('usr-teacher-kamau')}
                className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                  currentUser.id === 'usr-teacher-kamau'
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Teacher (Chem)
              </button>

              <button
                onClick={() => switchUser('usr-teacher-otieno')}
                className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                  currentUser.id === 'usr-teacher-otieno'
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Teacher (Phys)
              </button>

              <button
                onClick={() => switchUser('usr-student-faith')}
                className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                  currentUser.id === 'usr-student-faith'
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Student
              </button>
            </div>

            <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700/80 flex justify-end">
              <button
                onClick={resetAllToDefaults}
                className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                title="Reset sample records back to initial curriculum state"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset demo state</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
