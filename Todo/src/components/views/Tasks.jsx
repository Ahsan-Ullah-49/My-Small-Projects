import { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { Plus, Check, Trash2, ChevronDown, Tag, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

const TAG_CLS = {
  work: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  personal: 'bg-pink-500/10 text-pink-400 border border-pink-500/20',
  shopping: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  health: 'bg-green-500/10 text-green-400 border border-green-500/20',
  other: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
};

const CustomDropdown = ({ value, onChange, options, label, icon: Icon }) => {
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
        <div className="flex items-center gap-2 overflow-hidden">
          {Icon && <Icon className="w-3.5 h-3.5 text-app-muted shrink-0" />}
          <span className="capitalize truncate">{selectedOption?.label || value}</span>
        </div>
        <ChevronDown className={clsx("w-4 h-4 text-app-muted transition-transform shrink-0", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-app-card border border-app-border rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] z-[100] overflow-hidden animate-slide-in">
          <div className="max-h-48 overflow-y-auto custom-scrollbar">
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
        </div>
      )}
    </div>
  );
};

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState('');
  const [cat, setCat] = useState('work');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    const q = query(collection(db, 'users', user.uid, 'tasks'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => setTasks(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    return unsub;
  }, [user.uid]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addDoc(collection(db, 'users', user.uid, 'tasks'), { text: text.trim(), cat, priority, deadline: deadline || null, done: false, createdAt: serverTimestamp() });
    setText(''); setDeadline('');
  };

  const toggleDone = async (id, done) => await updateDoc(doc(db, 'users', user.uid, 'tasks', id), { done: !done });
  const removeTask = async (id) => await deleteDoc(doc(db, 'users', user.uid, 'tasks', id));

  const visible = tasks.filter(t => {
    if (filter === 'active' && t.done) return false;
    if (filter === 'done' && !t.done) return false;
    return true;
  });

  const getPriorityColor = (p) => {
    if (p === 'high') return 'text-red-500 bg-red-500/10 border border-red-500/20';
    if (p === 'medium') return 'text-amber-500 bg-amber-500/10 border border-amber-500/20';
    return 'text-blue-500 bg-blue-500/10 border border-blue-500/20';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-slide-in h-full relative">
      <div className="w-full lg:w-[350px] shrink-0">
        <div className="sticky top-24">
          <section className="bg-app-card border border-app-border rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#6C63FF]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#6C63FF]/20 transition-all duration-700"></div>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#6C63FF]/20 flex items-center justify-center text-[#6C63FF]"><Plus className="w-4 h-4" /></div>
              <h2 className="font-head text-lg font-bold text-app-main tracking-tight">New Task</h2>
            </div>

            <form onSubmit={handleAdd} className="flex flex-col gap-4 relative z-10">
              <div>
                <label className="text-[10px] font-bold tracking-[1.5px] uppercase text-app-muted mb-1.5 block">Task Name</label>
                <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="What needs to be done?" className="tf-input h-auto min-h-[80px] p-3 resize-none bg-app-inner/50" required></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <CustomDropdown 
                  label="Category" 
                  value={cat} 
                  onChange={setCat} 
                  icon={Tag}
                  options={[
                    { id: 'work', label: 'Work' },
                    { id: 'personal', label: 'Personal' },
                    { id: 'shopping', label: 'Shopping' },
                    { id: 'health', label: 'Health' },
                    { id: 'other', label: 'Other' },
                  ]}
                />
                <CustomDropdown 
                  label="Priority" 
                  value={priority} 
                  onChange={setPriority} 
                  icon={AlertCircle}
                  options={[
                    { id: 'high', label: 'High' },
                    { id: 'medium', label: 'Medium' },
                    { id: 'low', label: 'Low' },
                  ]}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold tracking-[1.5px] uppercase text-app-muted mb-1.5 block">Deadline (Optional)</label>
                <input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} className="tf-input h-11 bg-app-inner/50" />
              </div>

              <button type="submit" className="w-full h-12 mt-2 bg-gradient-to-r from-[#6C63FF] to-[#8079ff] text-white rounded-xl shadow-lg shadow-[#6C63FF]/30 hover:shadow-[#6C63FF]/50 hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-head font-bold uppercase tracking-wide text-xs">
                Create Task
              </button>
            </form>
          </section>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <section className="bg-app-card border border-app-border rounded-3xl p-6 lg:p-8 shadow-2xl flex-1 flex flex-col min-h-[500px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-app-border pb-4">
            <h3 className="font-head text-xl font-bold text-app-main tracking-tight">My Tasks</h3>
            <div className="flex bg-app-inner border border-app-border rounded-xl p-1 gap-1">
              {['all', 'active', 'done'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={clsx("px-4 py-1.5 text-[11px] font-bold uppercase tracking-[1px] rounded-lg transition-all", filter === f ? "bg-[#6C63FF] text-white shadow-md" : "text-app-sec hover:bg-app-hover")}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {visible.map(t => (
              <article key={t.id} className={clsx("flex items-center gap-4 px-5 py-4 bg-app-inner border rounded-2xl group transition-all", t.done ? 'opacity-60 grayscale' : 'hover:border-[#6C63FF]/50 hover:-translate-y-0.5')}>
                <button onClick={() => toggleDone(t.id, t.done)} className={clsx("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all", t.done ? 'bg-[#6C63FF] border-transparent' : 'border-app-muted')}>
                  {t.done && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={clsx("text-sm font-medium truncate", t.done && "line-through text-app-muted")}>{t.text}</div>
                  <div className="flex gap-2 mt-1">
                    <span className={clsx("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md", TAG_CLS[t.cat] || TAG_CLS.other)}>{t.cat}</span>
                    <span className={clsx("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md", getPriorityColor(t.priority))}>{t.priority}</span>
                  </div>
                </div>
                <button onClick={() => removeTask(t.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500 hover:text-white text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
              </article>
            ))}
            {visible.length === 0 && <div className="text-center py-10 text-app-muted font-medium">No tasks found.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
