import { useState, useEffect } from 'react';
import { LayoutDashboard, CheckSquare, Timer, StickyNote, Wallet, Sun, Moon, Settings as SettingsIcon } from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar({ currentView, setCurrentView }) {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('tf-theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('tf-theme', newTheme ? 'dark' : 'light');
    if (newTheme) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'pomodoro', label: 'Focus', icon: Timer },
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'expenses', label: 'Expenses', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full md:relative md:w-[280px] md:h-full bg-app-card border-t md:border-t-0 md:border-r border-app-border z-50 flex md:flex-col justify-between px-2 py-3 md:py-8 md:px-5 shadow-[0_0_40px_rgba(0,0,0,0.05)] transition-colors duration-300">
      
      {/* Brand (Desktop) */}
      <div className="hidden md:flex flex-col items-center mb-10 shrink-0">
        <div className="w-14 h-14 rounded-2xl bg-[#6C63FF] flex items-center justify-center shadow-lg shadow-[#6C63FF]/30 mb-4 hover:scale-105 transition-transform cursor-pointer">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        </div>
        <h1 className="font-head font-bold text-[24px] tracking-tight leading-none text-app-main">Veli<span className="text-[#6C63FF]">tox</span></h1>
      </div>

      {/* Nav Links */}
      <div className="flex md:flex-col justify-around md:justify-start w-full gap-1 md:gap-2 overflow-x-auto no-scrollbar py-2 md:py-0 flex-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={clsx(
                "flex items-center justify-center md:justify-start gap-4 p-3 md:px-4 md:py-3.5 rounded-xl transition-all duration-300 group relative shrink-0 md:shrink",
                isActive ? "bg-[#6C63FF] text-white shadow-md shadow-[#6C63FF]/20" : "text-app-sec hover:bg-gray-100 dark:hover:bg-[#1a1a1a] hover:text-app-main"
              )}
            >
              <Icon className={clsx("w-6 h-6 md:w-5 md:h-5 shrink-0 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} strokeWidth={isActive ? 2.5 : 2} />
              <span className={clsx("font-head font-bold text-[13px] tracking-wide hidden md:block", isActive ? "text-white" : "")}>{item.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Bottom Section (Desktop Only) */}
      <div className="hidden md:flex flex-col mt-auto pt-6 border-t border-app-border gap-3 shrink-0">
        
        {/* Theme Toggle (NOW ON TOP) */}
        <div className="flex items-center justify-between px-3 py-2 bg-app-inner rounded-xl border border-app-border">
          <span className="text-[10px] font-bold uppercase tracking-[1px] text-app-muted">Appearance</span>
          <button onClick={toggleTheme} className="w-10 h-5 rounded-full bg-app-border relative flex items-center p-1 transition-colors">
             <div className={clsx("w-3 h-3 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm", isDark ? "bg-[#6C63FF] translate-x-5" : "bg-white translate-x-0")}>
               {isDark ? <Moon className="w-2.5 h-2.5 text-white" /> : <Sun className="w-2.5 h-2.5 text-amber-500" />}
             </div>
          </button>
        </div>
      </div>
    </nav>
  );
}
