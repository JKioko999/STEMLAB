import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FlaskConical, 
  LogOut, 
  Sun, 
  Moon, 
  ChevronDown, 
  User as UserIcon,
  KeyRound,
  LayoutDashboard
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    schools, 
    logout, 
    setCurrentView, 
    setAuthMode,
    theme,
    toggleTheme 
  } = useApp();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentSchool = schools.find(s => s.id === currentUser?.schoolId);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'super_admin': return 'Admin';
      case 'school_admin': return 'School Admin';
      case 'teacher': return 'Teacher';
      case 'student': return 'Student';
      default: return 'Guest';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => setCurrentView(currentUser ? 'dashboard' : 'landing')}
          className="flex items-center space-x-2.5 cursor-pointer focus:outline-none"
        >
          <div className="w-8 h-8 rounded-md bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white">
              STEM-SPARK-LAB
            </span>
            {currentSchool && (
              <>
                <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">/</span>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-normal hidden sm:inline truncate max-w-[200px]">
                  {currentSchool.name}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 flex items-center gap-1.5 text-xs shadow-2xs cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-[11px] font-medium hidden sm:inline text-slate-700">Dark mode</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-medium hidden sm:inline text-slate-200">Light mode</span>
              </>
            )}
          </button>

          {currentUser ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 pl-2 pr-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 text-xs"
              >
                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium flex items-center justify-center text-[11px]">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="font-medium max-w-[120px] truncate hidden sm:inline">
                  {currentUser.name}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {getRoleLabel(currentUser.role)}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Menu Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-60 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                      Role: {getRoleLabel(currentUser.role)}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setCurrentView('dashboard');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                      <span>Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        toggleTheme();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {theme === 'light' ? (
                          <Moon className="w-3.5 h-3.5 text-slate-500" />
                        ) : (
                          <Sun className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span>Appearance</span>
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {theme === 'light' ? 'White & Grey' : 'Dark'}
                      </span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setCurrentView('auth');
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-md text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Sign in
              </button>
              <button
                onClick={() => {
                  setAuthMode('register_student');
                  setCurrentView('auth');
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
              >
                Register student account
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
