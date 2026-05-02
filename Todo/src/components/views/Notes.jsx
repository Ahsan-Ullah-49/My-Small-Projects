import { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash2, Search, Type, Edit3, Check, X, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, StickyNote } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

const COLORS = [
  { bg: 'bg-[#6C63FF]/10', border: 'border-[#6C63FF]/30', text: 'text-[#6C63FF]' },
  { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-500' },
  { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-500' },
  { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-500' },
  { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-500' },
];

const TEXT_COLORS = ['#0f172a', '#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#6C63FF'];

export default function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [colorIdx, setColorIdx] = useState(0);
  const [search, setSearch] = useState('');
  
  const editorRef = useRef(null);
  const editEditorRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users', user.uid, 'notes'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => setNotes(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    return unsub;
  }, [user.uid]);

  const execCmd = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) editorRef.current.focus();
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const content = editorRef.current.innerHTML;
    if (!content || content === '<br>') return;
    await addDoc(collection(db, 'users', user.uid, 'notes'), { title: title.trim(), content, colorIdx, createdAt: serverTimestamp() });
    setTitle(''); editorRef.current.innerHTML = ''; setColorIdx(0);
  };

  const removeNote = async (id) => await deleteDoc(doc(db, 'users', user.uid, 'notes', id));

  const startEdit = (note) => {
    setEditingId(note.id);
    setEditTitle(note.title || '');
    setTimeout(() => { if (editEditorRef.current) editEditorRef.current.innerHTML = note.content; }, 0);
  };

  const saveEdit = async () => {
    const content = editEditorRef.current.innerHTML;
    await updateDoc(doc(db, 'users', user.uid, 'notes', editingId), { title: editTitle.trim(), content });
    setEditingId(null);
  };

  const filtered = notes.filter(n => 
    n.content.toLowerCase().includes(search.toLowerCase()) || 
    (n.title && n.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 animate-slide-in pb-40 w-full relative">
      
      {/* Search Header - Fixed Placeholder/Icon Overlap */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-app-card border border-app-border rounded-2xl p-5 shadow-lg">
        <div className="relative w-full sm:max-w-xs">
          <input 
            type="text" 
            value={search} 
            onChange={e=>setSearch(e.target.value)} 
            placeholder="Search notes..." 
            className="tf-input h-10 pl-12 bg-app-inner/50 border-app-border shadow-inner" 
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-app-muted" />
        </div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6C63FF]">
          <StickyNote className="w-4 h-4" />
          {notes.length} Total
        </div>
      </div>

      <section className="bg-app-card border border-app-border rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col">
        <form onSubmit={handleAdd} className="flex flex-col gap-5 relative z-10">
          <div className="flex items-center gap-3 border-b border-app-border/10 pb-3">
            <Type className="w-5 h-5 text-[#6C63FF]" />
            <input 
              type="text" 
              value={title} 
              onChange={e=>setTitle(e.target.value)} 
              placeholder="Title..." 
              className="w-full bg-transparent border-none text-app-main font-head font-bold text-xl focus:ring-0 outline-none" 
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-app-inner/30 rounded-xl border border-app-border w-fit">
            <button type="button" onClick={() => execCmd('bold')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#6C63FF] hover:text-white text-app-sec transition-all"><Bold className="w-4 h-4"/></button>
            <button type="button" onClick={() => execCmd('italic')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#6C63FF] hover:text-white text-app-sec transition-all"><Italic className="w-4 h-4"/></button>
            <button type="button" onClick={() => execCmd('underline')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#6C63FF] hover:text-white text-app-sec transition-all"><Underline className="w-4 h-4"/></button>
            <div className="w-[1px] h-4 bg-app-border mx-1"></div>
            <button type="button" onClick={() => execCmd('justifyLeft')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#6C63FF] hover:text-white text-app-sec transition-all"><AlignLeft className="w-4 h-4"/></button>
            <button type="button" onClick={() => execCmd('justifyCenter')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#6C63FF] hover:text-white text-app-sec transition-all"><AlignCenter className="w-4 h-4"/></button>
            <button type="button" onClick={() => execCmd('justifyRight')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#6C63FF] hover:text-white text-app-sec transition-all"><AlignRight className="w-4 h-4"/></button>
            <div className="w-[1px] h-4 bg-app-border mx-1"></div>
            <button type="button" onClick={() => execCmd('insertUnorderedList')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#6C63FF] hover:text-white text-app-sec transition-all"><List className="w-4 h-4"/></button>
            <div className="w-[1px] h-4 bg-app-border mx-1"></div>
            <div className="flex items-center gap-1.5 px-2">
              {TEXT_COLORS.map(c => (
                <button key={c} type="button" onClick={() => execCmd('foreColor', c)} className="w-4 h-4 rounded-full border border-white/20 transition-all shadow-sm" style={{ backgroundColor: c }}></button>
              ))}
            </div>
          </div>

          <div 
            ref={editorRef}
            contentEditable
            className="w-full bg-app-inner/10 rounded-2xl p-6 text-app-main font-body text-base leading-relaxed outline-none min-h-[150px] max-h-[400px] overflow-y-auto border border-app-border/10 custom-scrollbar"
            data-placeholder="Start writing..."
          ></div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-app-border">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-bold uppercase tracking-[2px] text-app-muted">Backdrop:</span>
              <div className="flex gap-2">
                {COLORS.map((c, i) => (
                  <button type="button" key={i} onClick={() => setColorIdx(i)} className={clsx("w-6 h-6 rounded-full border-2 transition-all shadow-md", c.bg, colorIdx === i ? `scale-125 border-[#6C63FF]` : 'border-transparent hover:scale-110')}></button>
                ))}
              </div>
            </div>
            <button type="submit" className="w-full sm:w-auto h-11 bg-[#6C63FF] text-white px-8 font-head text-[11px] uppercase tracking-[2px] font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
               <Plus className="w-4 h-4" /> Save Note
            </button>
          </div>
        </form>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {filtered.map(n => {
          const colClass = COLORS[n.colorIdx] || COLORS[0];
          const isEditing = editingId === n.id;
          return (
            <article key={n.id} className={clsx(
              "p-6 rounded-3xl flex flex-col group relative overflow-hidden shadow-lg border transition-all duration-300 backdrop-blur-xl min-h-[220px]",
              colClass.bg, colClass.border,
              isEditing && "ring-2 ring-[#6C63FF] bg-app-card z-30"
            )}>
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30">
                {!isEditing ? (
                  <>
                    <button onClick={() => startEdit(n)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 text-app-main hover:bg-[#6C63FF] hover:text-white transition-all"><Edit3 className="w-4 h-4"/></button>
                    <button onClick={() => removeNote(n.id)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4"/></button>
                  </>
                ) : (
                  <>
                    <button onClick={saveEdit} className="w-8 h-8 flex items-center justify-center rounded-xl bg-green-500 text-white hover:bg-green-600 shadow-md"><Check className="w-4 h-4"/></button>
                    <button onClick={() => setEditingId(null)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-500 text-white hover:bg-gray-600 shadow-md"><X className="w-4 h-4"/></button>
                  </>
                )}
              </div>
              <div className="relative z-10 flex flex-col h-full">
                {isEditing ? (
                  <div className="space-y-4 pt-8">
                    <input type="text" value={editTitle} onChange={e=>setEditTitle(e.target.value)} className="w-full bg-app-inner border border-app-border rounded-xl px-3 py-2 text-base font-bold text-app-main outline-none focus:border-[#6C63FF]" />
                    <div ref={editEditorRef} contentEditable className="w-full bg-app-inner border border-app-border rounded-xl px-3 py-3 text-sm text-app-main outline-none focus:border-[#6C63FF] min-h-[120px] overflow-y-auto custom-scrollbar shadow-inner"></div>
                  </div>
                ) : (
                  <>
                    {n.title && <h4 className="font-head font-bold text-lg text-app-main mb-3 tracking-tight leading-tight border-b border-app-border/10 pb-2">{n.title}</h4>}
                    <div className="rich-text-content text-sm leading-relaxed flex-1 mb-6 font-medium opacity-90" dangerouslySetInnerHTML={{ __html: n.content }}></div>
                  </>
                )}
                <div className={clsx("text-[9px] font-bold uppercase tracking-[3px] mt-auto opacity-50 flex items-center justify-between", colClass.text)}>
                  <span>{n.createdAt?.toDate ? format(n.createdAt.toDate(), 'MMM d, yyyy') : 'Stashed'}</span>
                  <StickyNote className="w-3 h-3" />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
