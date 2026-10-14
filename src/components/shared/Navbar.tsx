import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FlaskConical, 
  LogOut, 
  ChevronDown, 
  User as UserIcon,
  KeyRound,
  LayoutDashboard,
  Settings
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    schools, 
    logout, 
    setCurrentView,
    currentView,
    setAuthMode,
    openSettings,
    landingTab,
    setLandingTab
  } = useApp();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentSchool = schools.find(s => s.id === currentUser?.schoolId);

  const navTabs = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'subjects', label: 'Subjects' },
    { id: 'workbenches', label: 'Workbenches' },
    { id: 'curriculum', label: 'KCSE Standards' },
    { id: 'schools', label: 'Institutions' },
    { id: 'faq', label: 'FAQ' }
  ] as const;

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

  const handleTabClick = (tabId: typeof navTabs[number]['id']) => {
    setLandingTab(tabId);
    if (currentView !== 'landing') {
      setCurrentView('landing');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand / Logo & Navigation Tabs on the same row */}
        <div className="flex items-center space-x-6 sm:space-x-8 min-w-0">
          <div 
            onClick={() => {
              if (currentUser) {
                setCurrentView('dashboard');
              } else {
                setCurrentView('landing');
                setLandingTab('home');
              }
            }}
            className="flex items-center space-x-2.5 cursor-pointer focus:outline-none shrink-0 group py-1"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
              <FlaskConical className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                STEM-SPARK-LAB
              </span>
              {currentSchool && (
                <>
                  <span className="text-slate-300 dark:text-slate-700 hidden lg:inline">/</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-normal hidden lg:inline truncate max-w-[160px]">
                    {currentSchool.name}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Navigation Tabs - Placed directly on the same row with clearer, larger font */}
          {(!currentUser || currentView === 'landing') && (
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 overflow-x-auto no-scrollbar py-1">
              {navTabs.map((tab) => {
                const isActive = currentView === 'landing' && landingTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`px-3.5 py-1.5 rounded-md text-[14px] lg:text-[15px] font-semibold tracking-tight transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center space-x-2 shrink-0">

          {currentUser ? (
            <div className="flex items-center gap-1.5" ref={menuRef}>
              {/* Quick Settings Action Button */}
              <button
                onClick={() => openSettings('password')}
                className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Settings & Password (Open account configuration)"
                aria-label="Open settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* User Profile Button */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 pl-2 pr-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 text-xs cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold flex items-center justify-center text-[11px]">
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
                  <div className="absolute right-0 mt-1.5 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">{currentUser.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="inline-block text-[10px] text-slate-500 dark:text-slate-400">
                          Role: {getRoleLabel(currentUser.role)}
                        </span>
                        {currentSchool && (
                          <>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[130px]">{currentSchool.name}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setCurrentView('dashboard');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                        <span>Dashboard</span>
                      </button>

                      {/* Settings Option */}
                      <button
                        onClick={() => {
                          openSettings('password');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between group transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
                          <span className="font-medium">Settings</span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          Theme & Preferences
                        </span>
                      </button>

                      {/* Change Password Option */}
                      <button
                        onClick={() => {
                          openSettings('password');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                        <span>Change Password</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
