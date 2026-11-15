import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { api } from '../api';

export default function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Secure Passwordless OTP Login
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.requestCode({ email: cleanEmail, fullName: fullName.trim() });
      const delParam = res?.deliveredToEmail ? '&delivered=1' : '&delivered=0';
      navigate(`/verify-email?email=${encodeURIComponent(cleanEmail)}${delParam}`);
    } catch (err) {
      setError(err.message || 'Failed to dispatch verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col justify-center items-center p-4 selection:bg-violet-600 selection:text-white">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-violet-600/20 via-cyan-600/10 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <Link to="/welcome" className="inline-flex items-center gap-2 group mb-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-0.5 shadow-glow flex items-center justify-center">
              <div className="h-full w-full bg-[#070B14] rounded-[10px] flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-cyan-300" />
              </div>
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">BizPilot AI</span>
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sign In to Workspace</h2>
          <p className="text-xs text-slate-400">Secure Two-Factor Email Verification for Business Accounts</p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl bg-slate-950/60 backdrop-blur-xl space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-950/30 border border-violet-800/40 text-violet-300 text-xs">
            <Lock className="h-4 w-4 shrink-0 text-cyan-400" />
            <span>A 6-digit confirmation code will be sent to your Gmail/email inbox to verify your identity.</span>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Email Address (Gmail / Business)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  required
                  type="email"
                  placeholder="you@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Your Name (Optional)</label>
              <input
                type="text"
                placeholder="Owner / Manager Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white font-bold text-xs tracking-wide shadow-glow transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{loading ? 'Dispatching Verification Code...' : 'Send Secure Verification Code'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-[11px] text-slate-500 text-center mt-1">We will send a single-use 6-digit OTP code directly to your email inbox.</p>
          </form>

          <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400 flex items-center justify-between">
            <Link to="/verify-email" className="text-cyan-400 hover:underline">
              Already have a 6-digit code?
            </Link>
            <Link to="/signup" className="text-slate-400 hover:text-white">
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
