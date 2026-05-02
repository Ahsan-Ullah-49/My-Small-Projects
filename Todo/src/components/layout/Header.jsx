import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { Bell, Check, X, Sun, Moon } from 'lucide-react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { format } from 'date-fns';

export default function Header({ currentTitle }) {
  const { user } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('tf-theme', newTheme ? 'dark' : 'light');
    if (newTheme) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const dismissNotification = async (notif) => {
    try {
      if (notif.type === 'system') {
        await deleteDoc(doc(db, 'users', user.uid, 'notifications', notif.id));
      } else if (notif.type === 'task') {
        await updateDoc(doc(db, 'users', user.uid, 'tasks', notif.id), { done: true });
      }
    } catch (err) {
      console.error("Failed to dismiss notification:", err);
    }
  };

  useEffect(() => {
    // 1. Listen for Pending Tasks as notifications
    const qTasks = query(collection(db, 'users', user.uid, 'tasks'), orderBy('createdAt', 'desc'), limit(3));
    const unsubTasks = onSnapshot(qTasks, snap => {
      const tasks = snap.docs.map(d => ({id: d.id, ...d.data()}));
      const taskNotifs = tasks
        .filter(t => !t.done)
        .map(t => ({
          id: t.id,
          title: 'Pending Task',
          message: `Don't forget to complete: "${t.text}"`,
          type: 'task',
          time: t.createdAt?.toDate ? format(t.createdAt.toDate(), 'h:mm a') : 'Just now'
        }));
      
      // 2. Listen for System Notifications (like Pomodoro)
      const qSys = query(collection(db, 'users', user.uid, 'notifications'), orderBy('createdAt', 'desc'), limit(5));
      const unsubSys = onSnapshot(qSys, snap => {
        const sysNotifs = snap.docs.map(d => ({id: d.id, ...d.data(), type: 'system'}));
        
        setNotifications(prev => {
          const combined = [...taskNotifs, ...sysNotifs].sort((a, b) => {
             const timeA = a.createdAt?.seconds || 0;
             const timeB = b.createdAt?.seconds || 0;
             return timeB - timeA;
          });
          
          if (combined.length > prev.length && prev.length > 0) {
            new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3').play().catch(() => {});
          }
          return combined;
        });
      });
      return unsubSys;
    });
    return unsubTasks;
  }, [user.uid]);

  return (
    <header className="sticky top-0 z-40 w-full bg-app-body backdrop-blur-md border-b border-app-border transition-colors duration-300">
      <div className="flex items-center justify-between px-4 sm:px-8 h-20">
        
        {/* Page Title & Mobile Brand */}
        <div className="flex flex-col justify-center">
          <div className="md:hidden flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-[#6C63FF] flex items-center justify-center shadow-md shadow-[#6C63FF]/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
             </div>
             <div className="flex flex-col">
               <h1 className="font-head font-bold text-xl tracking-tight leading-none text-app-main">Veli<span className="text-[#6C63FF]">tox</span></h1>
               <p className="text-[10px] text-app-sec mt-0.5 font-bold uppercase tracking-wider">{currentTitle}</p>
             </div>
          </div>
          <div className="hidden md:block">
             <h2 className="font-head font-bold text-2xl tracking-tight leading-none text-app-main transition-all">{currentTitle}</h2>
             <p className="text-[12px] text-app-sec mt-1.5 font-bold tracking-[1px] uppercase">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mobile Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="md:hidden w-11 h-11 rounded-full border border-app-border bg-app-card flex items-center justify-center text-app-sec hover:text-app-main transition-all"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-[#6C63FF]" />}
          </button>

          <div className="relative">
            <button onClick={() => setShowNotifs(!showNotifs)} className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${showNotifs ? 'bg-[#6C63FF] text-white border-[#6C63FF] shadow-lg shadow-[#6C63FF]/30' : 'bg-app-card border-app-border text-app-sec hover:text-app-main hover:border-[#6C63FF]/50'}`}>
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-app-body animate-pulse"></span>
              )}
            </button>

            {/* Notifications Dropdown (SOLID background to prevent unreadable overlaps) */}
            {showNotifs && (
              <div className="absolute right-0 top-14 w-[300px] sm:w-[320px] bg-white dark:bg-[#121212] border border-app-border rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.4)] z-[200] overflow-hidden animate-slide-in">
                <div className="p-4 border-b border-app-border flex items-center justify-between bg-app-inner/50">
                  <h3 className="font-head font-bold text-sm text-app-main tracking-wide">Notifications</h3>
                  <span className="text-[10px] font-bold text-white bg-[#6C63FF] px-2 py-0.5 rounded-md">{notifications.length} New</span>
                </div>
                
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-app-muted font-medium">No new notifications.</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="p-4 border-b border-app-border last:border-0 hover:bg-app-inner transition-colors cursor-pointer group relative">
                        <div className="flex gap-3 pr-8">
                          <div className="w-8 h-8 rounded-full bg-[#6C63FF]/10 text-[#6C63FF] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            {n.type === 'task' ? <Check className="w-4 h-4"/> : <Bell className="w-4 h-4"/>}
                          </div>
                          <div>
                            <div className="text-[13px] font-bold text-app-main">{n.title}</div>
                            <div className="text-[12px] text-app-sec mt-1 leading-snug">{n.message}</div>
                            <div className="text-[10px] font-bold uppercase tracking-[1px] text-app-muted mt-2">{n.time}</div>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); dismissNotification(n); }}
                          className="absolute right-4 top-4 w-7 h-7 flex items-center justify-center rounded-lg bg-app-inner text-app-muted hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
