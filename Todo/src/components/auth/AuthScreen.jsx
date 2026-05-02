import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

export default function AuthScreen() {
  const { login, signup, loginWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Google Sign-In Error:", err);
      setError(err.message || 'Google Sign-In failed');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center px-4 py-8 bg-transparent z-40 overflow-y-auto">
      <div className="w-full max-w-[420px] my-auto animate-slide-in">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6C63FF] to-[#a78bfa] mb-4 shadow-lg shadow-[#6C63FF]/30">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <h1 className="font-head font-bold text-[34px] tracking-tight leading-none text-app-main mb-2">Veli<span className="text-[#6C63FF]">tox</span></h1>
          <p className="text-[14px] text-app-sec font-light">The ultimate productivity ecosystem.</p>
        </div>

        <div className="bg-app-card backdrop-blur-2xl border border-app-border rounded-3xl p-7 sm:p-9 shadow-2xl">
          <div className="flex bg-app-inner border border-app-border rounded-xl p-1 mb-8 gap-1 shadow-inner">
            <button onClick={() => { setIsLogin(true); setError(''); }} className={clsx("flex-1 py-3 text-xs font-bold font-head rounded-lg transition-all duration-300 uppercase tracking-wide", isLogin ? "bg-[#6C63FF] text-white shadow-md shadow-[#6C63FF]/30" : "bg-transparent text-app-sec hover:text-app-main")}>Sign In</button>
            <button onClick={() => { setIsLogin(false); setError(''); }} className={clsx("flex-1 py-3 text-xs font-bold font-head rounded-lg transition-all duration-300 uppercase tracking-wide", !isLogin ? "bg-[#6C63FF] text-white shadow-md shadow-[#6C63FF]/30" : "bg-transparent text-app-sec hover:text-app-main")}>Sign Up</button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {!isLogin && (
              <div>
                <label className="block text-[11px] text-app-muted font-bold tracking-[1px] uppercase mb-2 ml-1">Full Name</label>
                <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="John Doe" className="tf-input h-12 shadow-sm" required={!isLogin} />
              </div>
            )}
            <div>
              <label className="block text-[11px] text-app-muted font-bold tracking-[1px] uppercase mb-2 ml-1">Email Address</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="tf-input h-12 shadow-sm" required />
            </div>
            <div>
              <label className="block text-[11px] text-app-muted font-bold tracking-[1px] uppercase mb-2 ml-1">Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" className="tf-input h-12 shadow-sm" required />
            </div>
            {error && <div className="text-[12px] text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 font-medium animate-slide-in">{error}</div>}
            
            <button disabled={loading} type="submit" className="w-full h-12 mt-2 bg-gradient-to-r from-[#6C63FF] to-[#8079ff] text-white font-head text-[13px] font-bold tracking-wide uppercase rounded-xl shadow-lg shadow-[#6C63FF]/30 hover:shadow-[#6C63FF]/50 hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>{isLogin ? 'Sign In Securely' : 'Create Account'}</span>}
            </button>
          </form>

          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-app-border"></div>
            <span className="text-[10px] text-app-muted font-bold uppercase tracking-[2px]">Or</span>
            <div className="flex-1 h-px bg-app-border"></div>
          </div>

          <button onClick={handleGoogle} className="w-full h-12 bg-app-inner border border-app-border rounded-xl flex items-center justify-center gap-3 hover:border-[#6C63FF]/50 hover:bg-[#6C63FF]/5 transition-all duration-300 active:scale-[0.98] shadow-sm">
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            <span className="text-[13px] font-bold text-app-main tracking-wide">Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
