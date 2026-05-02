import { LayoutDashboard, CheckSquare, Timer, StickyNote, Wallet } from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar({ currentView, setCurrentView }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'pomodoro', label: 'Focus', icon: Timer },
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'expenses', label: 'Expenses', icon: Wallet },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full md:relative md:w-[260px] md:h-full bg-app-card backdrop-blur-2xl border-t md:border-t-0 md:border-r border-app-border z-50 flex md:flex-col justify-between px-2 py-3 md:p-6 transition-colors duration-300">
      
      {/* Brand (Desktop) */}
      <div className="hidden md:block mb-8 px-2">
        <h1 className="font-head font-bold text-3xl tracking-tight leading-none text-app-main">Task<span className="text-[#6C63FF]">Flow</span></h1>
        <p className="text-[12px] text-app-sec mt-1.5 font-light tracking-wide">Productivity Suite</p>
      </div>

      {/* Nav Links */}
      <div className="flex md:flex-col justify-around md:justify-start w-full gap-1 md:gap-2 overflow-x-auto no-scrollbar py-2 md:py-0">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={clsx(
                "flex items-center justify-center md:justify-start gap-3 p-2.5 md:p-3 rounded-xl transition-all min-w-[3.5rem]",
                isActive ? "active text-app-main bg-app-inner" : "text-app-sec hover:bg-app-hover"
              )}
            >
              <Icon className="w-5 h-5 md:w-5 md:h-5 shrink-0" strokeWidth={2} />
              <span className="font-medium text-xs md:text-sm hidden md:inline">{item.label}</span>
            </button>
          );
        })}
      </div>
      
      <div className="hidden md:block mt-auto"></div>
    </nav>
  );
}
