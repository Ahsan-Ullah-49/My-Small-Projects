import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Zap, Settings2, Target, X, Star } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

const PRESETS = [
  { label: 'Pomodoro', work: 25, break: 5, color: '#3b82f6' }, // Blue
  { label: 'Short Focus', work: 15, break: 3, color: '#f59e0b' }, // Yellow/Amber
  { label: 'Long Session', work: 45, break: 10, color: '#22c55e' }, // Green
  { label: 'Deep Work', work: 60, break: 15, color: '#8b5cf6' }, // Purple
  { label: 'Quick Rest', work: 5, break: 20, color: '#64748b' }, // Grey
];

export default function Pomodoro() {
  const { user } = useAuth();
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); 
  
  const [workTime, setWorkTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [focusGoal, setFocusGoal] = useState('Deep Work');
  const [showSettings, setShowSettings] = useState(false);
  const [accentColor, setAccentColor] = useState('#3b82f6'); // Default Blue

  const switchMode = useCallback((newMode) => {
    setMode(newMode);
    setMinutes(newMode === 'work' ? workTime : breakTime);
    setSeconds(0);
    setIsActive(false);
  }, [workTime, breakTime]);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          clearInterval(interval);
          const nextMode = mode === 'work' ? 'break' : 'work';
          switchMode(nextMode);
          
          // Trigger Notification
          const msg = nextMode === 'break' 
            ? `Great job! Focus session "${focusGoal}" completed. Time for a break!` 
            : `Break over! Ready for another session?`;
            
          addDoc(collection(db, 'users', user.uid, 'notifications'), {
            title: nextMode === 'break' ? 'Focus Complete' : 'Break Over',
            message: msg,
            createdAt: serverTimestamp()
          });

          new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3').play().catch(() => {});
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, minutes, mode, switchMode, focusGoal, user.uid]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setMinutes(mode === 'work' ? workTime : breakTime);
    setSeconds(0);
  };

  const handlePreset = (p) => {
    setWorkTime(p.work);
    setBreakTime(p.break);
    setMinutes(p.work);
    setSeconds(0);
    setIsActive(false);
    setMode('work');
    setAccentColor(p.color);
    setFocusGoal(p.label);
  };

  const progress = mode === 'work' 
    ? ((workTime * 60 - (minutes * 60 + seconds)) / (workTime * 60)) * 100
    : ((breakTime * 60 - (minutes * 60 + seconds)) / (breakTime * 60)) * 100;

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-10 animate-slide-in h-full relative pb-20">
      
      {/* Session Header Card */}
      <div className="w-full max-w-xl bg-app-card border border-app-border rounded-3xl p-6 shadow-xl relative overflow-hidden flex items-center justify-between group">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-app-inner/50 shadow-inner" style={{ color: mode === 'work' ? accentColor : '#22c55e' }}>
            {mode === 'work' ? <Zap className="w-6 h-6" /> : <Coffee className="w-6 h-6" />}
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[2px] text-app-muted">Session</div>
            <div className="font-head font-bold text-lg text-app-main leading-tight">{mode === 'work' ? 'Focus Engine' : 'Recharge'}</div>
          </div>
        </div>
        <div className="text-right relative z-10">
          <div className="text-[10px] font-bold uppercase tracking-[2px] text-app-muted">Goal</div>
          <div className="font-head font-bold text-base truncate max-w-[150px]" style={{ color: accentColor }}>{focusGoal}</div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-5 blur-3xl -z-10 transition-colors duration-1000" style={{ backgroundColor: mode === 'work' ? accentColor : '#22c55e' }}></div>
      </div>

      {/* Timer Section */}
      <div className="flex flex-col items-center gap-10 w-full max-w-lg relative">
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 drop-shadow-xl">
            <circle cx="50%" cy="50%" r="90" className="stroke-app-inner fill-transparent" strokeWidth="6" />
            <circle 
              cx="50%" cy="50%" r="90" 
              className="fill-transparent transition-all duration-1000 ease-linear"
              style={{ stroke: mode === 'work' ? accentColor : '#22c55e' }}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-head text-7xl sm:text-8xl font-bold text-app-main tracking-tighter tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <div className="mt-2 text-[10px] font-bold uppercase tracking-[4px] opacity-60" style={{ color: mode === 'work' ? accentColor : '#22c55e' }}>
              {mode === 'work' ? 'Concentrate' : 'Rest Well'}
            </div>
          </div>
          <div className="absolute inset-0 rounded-full blur-[70px] opacity-10 -z-10" style={{ backgroundColor: mode === 'work' ? accentColor : '#22c55e' }}></div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8 z-10">
          <button onClick={resetTimer} className="w-14 h-14 rounded-2xl bg-app-card border border-app-border flex items-center justify-center text-app-sec hover:text-red-500 hover:border-red-500/30 transition-all shadow-lg active:scale-90 group">
            <RotateCcw className="w-6 h-6 group-hover:-rotate-90 transition-transform" />
          </button>
          
          <button onClick={toggleTimer} className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center shadow-xl transition-all duration-700 active:scale-95 hover:brightness-110" style={{ backgroundColor: mode === 'work' ? accentColor : '#22c55e' }}>
            {isActive ? <Pause className="w-10 h-10 text-white fill-white" /> : <Play className="w-10 h-10 text-white fill-white ml-1.5" />}
          </button>
          
          <button onClick={() => setShowSettings(!showSettings)} className={clsx("w-14 h-14 rounded-2xl bg-app-card border border-app-border flex items-center justify-center transition-all shadow-lg active:scale-90", showSettings ? 'text-app-main border-app-main' : 'text-app-sec')}>
            <Settings2 className="w-6 h-6" />
          </button>
        </div>

        {/* Settings Modal - SOLID BACKGROUND */}
        {showSettings && (
          <div className="absolute inset-x-0 -top-10 bottom-0 flex items-center justify-center z-[100] animate-slide-in">
            <div className="w-full max-w-sm bg-white dark:bg-[#1a1a1a] border-2 border-app-border rounded-[2.5rem] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="font-head font-bold text-xl text-app-main flex items-center gap-3 tracking-tight"><Target className="w-6 h-6" style={{ color: accentColor }} /> Configure</h3>
                  <button onClick={()=>setShowSettings(false)} className="w-10 h-10 rounded-xl bg-app-inner hover:bg-red-500/10 text-app-muted hover:text-red-500 transition-all flex items-center justify-center"><X className="w-5 h-5" /></button>
               </div>
               <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold tracking-[3px] uppercase text-app-muted mb-3 block ml-1">Focus Target</label>
                    <input type="text" value={focusGoal} onChange={e=>setFocusGoal(e.target.value)} className="tf-input h-12 bg-app-inner/50 border-app-border text-base font-bold shadow-inner" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-bold tracking-[3px] uppercase text-app-muted mb-3 block text-center">Work Min</label>
                      <input type="number" value={workTime} onChange={e=>setWorkTime(parseInt(e.target.value) || 1)} className="tf-input h-12 bg-app-inner/50 text-center font-bold text-lg" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold tracking-[3px] uppercase text-app-muted mb-3 block text-center">Break Min</label>
                      <input type="number" value={breakTime} onChange={e=>setBreakTime(parseInt(e.target.value) || 1)} className="tf-input h-12 bg-app-inner/50 text-center font-bold text-lg" />
                    </div>
                  </div>
                  <button onClick={() => {resetTimer(); setShowSettings(false);}} className="w-full h-14 text-white rounded-2xl font-bold text-sm uppercase tracking-[3px] shadow-2xl transition-all hover:brightness-110 mt-2" style={{ backgroundColor: accentColor }}>Apply Settings</button>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Presets - Updated Colors */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 w-full max-w-3xl mt-6">
        {PRESETS.map(p => (
          <button 
            key={p.label}
            onClick={() => handlePreset(p)}
            className={clsx(
              "p-4 rounded-[2rem] border-2 flex flex-col items-center gap-2 transition-all duration-300 hover:-translate-y-1 group shadow-lg",
              accentColor === p.color ? 'bg-app-inner border-current shadow-inner' : 'bg-app-card border-app-border'
            )}
            style={{ color: accentColor === p.color ? p.color : 'inherit' }}
          >
            <Star className={clsx("w-4 h-4 transition-transform", accentColor === p.color ? 'fill-current' : 'text-app-muted')} />
            <div className="text-[10px] font-bold uppercase tracking-[1.5px] text-center leading-tight">{p.label}</div>
            <div className="text-[9px] opacity-40 font-bold">{p.work}m</div>
          </button>
        ))}
      </div>
    </div>
  );
}
