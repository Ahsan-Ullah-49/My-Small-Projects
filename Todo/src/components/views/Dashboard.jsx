import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { CheckSquare, Timer, StickyNote, Wallet, ArrowRight, Activity } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard({ setView }) {
  const { user, activeCurrency } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [expenses, setExpenses] = useState([]);
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
  
  useEffect(() => {
    const q = query(collection(db, 'users', user.uid, 'tasks'), orderBy('createdAt', 'desc'), limit(6));
    const unsub = onSnapshot(q, snap => setTasks(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    return unsub;
  }, [user.uid]);

  useEffect(() => {
    const q = query(collection(db, 'users', user.uid, 'expenses'));
    const unsub = onSnapshot(q, snap => setExpenses(snap.docs.map(d => d.data())));
    return unsub;
  }, [user.uid]);

  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const active = total - done;

  const totalIncome = expenses.filter(e => e.type === 'income').reduce((acc, e) => acc + e.amount, 0);
  const totalExpense = expenses.filter(e => e.type === 'expense').reduce((acc, e) => acc + e.amount, 0);
  const balance = totalIncome - totalExpense;

  const chartData = {
    labels: ['Completed', 'Active'],
    datasets: [{
      data: [done, active],
      backgroundColor: ['#6C63FF', isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'],
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
      borderWidth: 1,
    }]
  };

  return (
    <div className="flex flex-col gap-6 animate-slide-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: total, icon: CheckSquare, color: 'text-[#6C63FF]', bg: 'bg-[#6C63FF]/10' },
          { label: 'Active Tasks', value: active, icon: Timer, color: 'text-amber-500', bg: 'bg-amber-500/10', action: () => setView('tasks') },
          { label: 'Quick Notes', value: 'Open', icon: StickyNote, color: 'text-pink-500', bg: 'bg-pink-500/10', action: () => setView('notes') },
          { label: 'Net Balance', value: `${activeCurrency.symbol}${balance.toFixed(0)}`, icon: Wallet, color: 'text-green-500', bg: 'bg-green-500/10', action: () => setView('expenses') }
        ].map((item, i) => (
          <div key={i} onClick={item.action} className={`bg-app-card backdrop-blur-2xl border border-app-border rounded-3xl p-6 shadow-xl flex items-center justify-between group overflow-hidden relative ${item.action ? 'cursor-pointer hover:-translate-y-1 transition-all duration-300' : ''}`}>
            <div className="relative z-10">
              <div className="text-[11px] font-head font-bold uppercase tracking-[2px] text-app-muted mb-2">{item.label}</div>
              <div className={`font-head text-3xl font-bold ${item.color} drop-shadow-sm`}>{item.value}</div>
            </div>
            <div className={`relative z-10 w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300`}>
              <item.icon className={`w-7 h-7 ${item.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-app-card border border-app-border rounded-3xl p-7 shadow-xl lg:col-span-2 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#6C63FF]" />
              <div className="font-head text-[11px] font-bold tracking-[2px] uppercase text-app-main">Recent Activity</div>
            </div>
            <button onClick={() => setView('tasks')} className="text-[12px] font-bold uppercase tracking-wide text-[#6C63FF] hover:text-[#8079ff] flex items-center gap-1.5 transition-colors group">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="flex flex-col gap-3 flex-1 relative z-10">
            {tasks.length === 0 ? (
               <div className="text-sm text-app-muted flex flex-col items-center justify-center h-40 bg-app-inner/50 rounded-2xl border border-dashed border-app-border">
                 <span>No recent tasks to display.</span>
               </div>
            ) : tasks.map(t => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-app-inner border border-app-border rounded-2xl transition-all hover:border-[#6C63FF]/50 hover:-translate-y-0.5">
                 <span className={`text-[15px] font-medium ${t.done ? 'line-through text-app-muted' : 'text-app-main'}`}>{t.text}</span>
                 <div className="text-[10px] font-bold uppercase tracking-[1px] px-3 py-1 bg-app-card rounded-lg text-app-sec border border-app-border">{t.priority}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-app-card border border-app-border rounded-3xl p-7 shadow-xl flex flex-col items-center justify-center min-h-[350px]">
           <div className="font-head text-[11px] font-bold tracking-[2px] uppercase text-app-main mb-6 self-start relative z-10">Performance</div>
           <div className="w-full max-w-[200px] aspect-square relative flex items-center justify-center z-10">
             {total > 0 ? (
               <>
                 <Doughnut data={chartData} options={{ maintainAspectRatio: true, plugins: { legend: { display: false } }, cutout: '80%' }} />
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <span className="font-head text-4xl font-bold text-app-main">{Math.round((done/total)*100)}%</span>
                   <span className="text-[10px] font-bold uppercase tracking-[1px] text-app-sec mt-1">Done</span>
                 </div>
               </>
             ) : (
               <div className="text-sm text-app-muted font-medium">Add tasks to see progress</div>
             )}
           </div>
        </section>
      </div>
    </div>
  );
}
