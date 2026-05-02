import { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, Wallet, Activity, ChevronDown, PieChart } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { format } from 'date-fns';
import clsx from 'clsx';

ChartJS.register(ArcElement, Tooltip, Legend);

const CustomDropdown = ({ value, onChange, options, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.id === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="text-[10px] font-bold tracking-[1.5px] uppercase text-app-muted mb-1.5 block">{label}</label>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 bg-app-inner border border-app-border rounded-xl px-4 flex items-center justify-between text-app-main text-sm font-medium transition-all hover:border-[#6C63FF]/50"
      >
        <span className="capitalize">{selectedOption?.label || value}</span>
        <ChevronDown className={clsx("w-4 h-4 text-app-muted transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-app-card border border-app-border rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] z-[100] overflow-hidden animate-slide-in">
          {options.map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => { onChange(opt.id); setIsOpen(false); }}
              className={clsx(
                "w-full px-4 py-3 text-left text-sm font-medium transition-colors border-b border-app-border last:border-0",
                value === opt.id ? "bg-[#6C63FF] text-white" : "text-app-main hover:bg-app-inner"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Expenses() {
  const { user, activeCurrency } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');

  useEffect(() => {
    const q = query(collection(db, 'users', user.uid, 'expenses'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => setExpenses(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    return unsub;
  }, [user.uid]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!desc.trim() || !amount) return;
    await addDoc(collection(db, 'users', user.uid, 'expenses'), { desc: desc.trim(), amount: parseFloat(amount), type, createdAt: serverTimestamp() });
    setDesc(''); setAmount('');
  };

  const removeExp = async (id) => await deleteDoc(doc(db, 'users', user.uid, 'expenses', id));

  const totalIncome = expenses.filter(e => e.type === 'income').reduce((acc, e) => acc + e.amount, 0);
  const totalExpense = expenses.filter(e => e.type === 'expense').reduce((acc, e) => acc + e.amount, 0);
  const balance = totalIncome - totalExpense;

  const chartData = {
    labels: ['Income', 'Expense'],
    datasets: [{
      data: [totalIncome, totalExpense],
      backgroundColor: ['#22c55e', '#ef4444'],
      hoverBackgroundColor: ['#16a34a', '#dc2626'],
      borderWidth: 0,
      hoverOffset: 15
    }]
  };

  return (
    <div className="flex flex-col gap-8 animate-slide-in pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] rounded-[2rem] p-8 shadow-2xl relative overflow-hidden text-white flex flex-col justify-between min-h-[240px] border border-white/10 group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#6C63FF]/20 blur-[80px] rounded-full pointer-events-none group-hover:bg-[#6C63FF]/30 transition-all duration-700"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[3px] text-white/50 mb-1">Total Balance</div>
              <div className="font-head text-5xl font-bold tracking-tight">{activeCurrency.symbol}{balance.toFixed(2)}</div>
            </div>
            <Wallet className="w-8 h-8 text-white/50" />
          </div>
          <div className="flex items-center gap-8 relative z-10 mt-8">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-green-400 mb-1"><ArrowUpRight className="w-3.5 h-3.5" /><span className="text-[9px] font-bold uppercase tracking-[1px]">Income</span></div>
              <div className="font-head text-lg font-bold">{activeCurrency.symbol}{totalIncome.toFixed(0)}</div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-red-400 mb-1"><ArrowDownRight className="w-3.5 h-3.5" /><span className="text-[9px] font-bold uppercase tracking-[1px]">Expense</span></div>
              <div className="font-head text-lg font-bold">{activeCurrency.symbol}{totalExpense.toFixed(0)}</div>
            </div>
          </div>
        </div>

        {/* Transaction Form */}
        <section className="bg-app-card border border-app-border rounded-[2rem] p-8 shadow-xl flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5"><PieChart className="w-24 h-24 text-[#6C63FF]" /></div>
          <h2 className="font-head text-lg font-bold text-app-main tracking-tight mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-[#6C63FF]" /> New Entry</h2>
          <form onSubmit={handleAdd} className="space-y-4 relative z-10">
            <div>
              <label className="text-[10px] font-bold tracking-[1.5px] uppercase text-app-muted mb-1.5 block">Description</label>
              <input type="text" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="e.g. Office Rent" className="tf-input bg-app-inner" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold tracking-[1.5px] uppercase text-app-muted mb-1.5 block">Amount ({activeCurrency.code})</label>
                <input type="number" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} className="tf-input bg-app-inner" required />
              </div>
              <CustomDropdown label="Type" value={type} onChange={setType} options={[{id:'expense', label:'Expense'}, {id:'income', label:'Income'}]} />
            </div>
            <button type="submit" className="w-full h-12 bg-[#6C63FF] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-[#6C63FF]/30 hover:-translate-y-1 transition-all active:scale-[0.98]">Record Transaction</button>
          </form>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* History */}
        <section className="lg:col-span-2 bg-app-card border border-app-border rounded-[2rem] p-8 shadow-xl">
          <h3 className="font-head text-lg font-bold text-app-main mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-app-muted" /> Transaction History</h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {expenses.map(e => (
              <div key={e.id} className="flex items-center justify-between p-4 bg-app-inner/50 border border-app-border rounded-2xl group transition-all hover:border-[#6C63FF]/50 hover:bg-app-inner">
                <div className="flex items-center gap-4">
                  <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center transition-all", e.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500')}>
                    {e.type === 'income' ? <Plus className="w-4 h-4"/> : null}
                    {e.type === 'income' ? <ArrowUpRight className="w-5 h-5"/> : <ArrowDownRight className="w-5 h-5"/>}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-app-main leading-tight">{e.desc}</div>
                    <div className="text-[10px] text-app-sec uppercase tracking-wider font-bold mt-1">{e.createdAt?.toDate ? format(e.createdAt.toDate(), 'MMM d, h:mm a') : 'Recently'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={clsx("font-head font-bold text-lg", e.type === 'income' ? 'text-green-500' : 'text-red-500')}>
                    {e.type === 'income' ? '+' : '-'}{activeCurrency.symbol}{e.amount.toLocaleString()}
                  </div>
                  <button onClick={() => removeExp(e.id)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {expenses.length === 0 && <div className="text-center py-10 text-app-muted font-medium">No transactions yet.</div>}
          </div>
        </section>

        {/* Enhanced Analytics Chart */}
        <section className="bg-app-card border border-app-border rounded-[2rem] p-8 shadow-xl flex flex-col items-center relative">
           <div className="font-head text-lg font-bold text-app-main tracking-tight mb-8 self-start">Flow Analytics</div>
           
           <div className="w-full max-w-[240px] aspect-square relative flex items-center justify-center group">
             {(totalIncome > 0 || totalExpense > 0) ? (
               <>
                 <Doughnut data={chartData} options={{ maintainAspectRatio: true, plugins: { legend: { display: false } }, cutout: '82%' }} />
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-bold uppercase tracking-[2px] text-app-muted mb-1">Savings</span>
                    <span className="font-head text-3xl font-bold text-app-main">{Math.round((balance / (totalIncome || 1)) * 100)}%</span>
                 </div>
               </>
             ) : (
               <div className="text-[11px] uppercase tracking-[2px] font-bold text-app-muted text-center">Add data to generate<br/>analytics</div>
             )}
           </div>
           
           <div className="w-full mt-10 space-y-3">
              <div className="flex items-center justify-between p-3 bg-app-inner rounded-xl border border-app-border">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs font-bold text-app-sec uppercase">Income</span>
                 </div>
                 <span className="text-xs font-bold text-app-main">{activeCurrency.symbol}{totalIncome.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-app-inner rounded-xl border border-app-border">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-xs font-bold text-app-sec uppercase">Expense</span>
                 </div>
                 <span className="text-xs font-bold text-app-main">{activeCurrency.symbol}{totalExpense.toLocaleString()}</span>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}
