import { useAuth } from '../../context/AuthContext';
import { CURRENCIES } from '../../constants/currencies';
import { User, Globe, Shield, LogOut, Mail, Fingerprint } from 'lucide-react';
import clsx from 'clsx';

export default function Settings() {
  const { user, currency, setCurrency, logout } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-in pb-32">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-app-main font-head tracking-tight">Settings</h1>
        <p className="text-app-sec text-sm mt-1">Manage your account preferences and application settings</p>
      </div>

      {/* Account Section */}
      <section className="bg-app-card border border-app-border rounded-[2rem] overflow-hidden shadow-xl">
        <div className="p-6 border-b border-app-border bg-app-inner/30">
          <h3 className="text-sm font-bold uppercase tracking-[2px] text-app-main flex items-center gap-3">
            <User className="w-5 h-5 text-[#6C63FF]" /> Account Profile
          </h3>
        </div>
        <div className="p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-app-border/50">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#6C63FF] to-[#8079ff] flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-[#6C63FF]/30">
              {user?.email ? user.email[0].toUpperCase() : 'U'}
            </div>
            <div className="text-center sm:text-left space-y-1">
              <div className="text-xl font-bold text-app-main">{user?.displayName || 'Velitox User'}</div>
              <div className="text-app-sec flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-4 h-4" /> {user?.email}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-app-inner/50 border border-app-border rounded-2xl">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-app-muted mb-2">
                <Fingerprint className="w-3 h-3" /> Unique ID
              </div>
              <div className="text-app-main text-xs font-mono truncate">{user?.uid}</div>
            </div>
            <div className="p-4 bg-app-inner/50 border border-app-border rounded-2xl">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-app-muted mb-2">
                <Shield className="w-3 h-3" /> Account Status
              </div>
              <div className="text-green-500 text-xs font-bold uppercase">Verified / Active</div>
            </div>
          </div>
        </div>
      </section>

      {/* Localization Section */}
      <section className="bg-app-card border border-app-border rounded-[2rem] overflow-hidden shadow-xl">
        <div className="p-6 border-b border-app-border bg-app-inner/30">
          <h3 className="text-sm font-bold uppercase tracking-[2px] text-app-main flex items-center gap-3">
            <Globe className="w-5 h-5 text-amber-500" /> Regional Settings
          </h3>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-app-main">Application Currency</label>
              <p className="text-xs text-app-sec">Choose the default currency for your expense tracking</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CURRENCIES.map(curr => (
                <button
                  key={curr.code}
                  onClick={() => setCurrency(curr.code)}
                  className={clsx(
                    "relative p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all group overflow-hidden",
                    currency === curr.code 
                      ? "bg-[#6C63FF]/5 border-[#6C63FF] text-[#6C63FF]" 
                      : "bg-app-inner border-app-border text-app-sec hover:border-app-muted"
                  )}
                >
                  {currency === curr.code && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-[#6C63FF] rounded-full"></div>
                  )}
                  <span className="text-2xl font-bold font-head">{curr.symbol}</span>
                  <div className="text-center">
                    <div className="text-[11px] font-bold uppercase tracking-wider">{curr.code}</div>
                    <div className="text-[8px] opacity-60 truncate w-full px-1">{curr.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-red-500/5 border border-red-500/20 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <h4 className="text-red-500 font-bold">Sign Out</h4>
            <p className="text-app-sec text-xs mt-1">Close your session and return to the login screen</p>
          </div>
          <button 
            onClick={logout}
            className="px-8 py-3 bg-red-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-500/20 hover:bg-red-600 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Logout Now
          </button>
        </div>
      </section>
    </div>
  );
}
