import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, ArrowRight, X, ShieldCheck } from 'lucide-react';
import { api, setToken } from '../api';

export default function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  // Option 1: Continue with Google / Gmail
  const handleGoogleSignIn = async (targetEmail, targetName) => {
    const finalEmail = (targetEmail || googleEmail).trim();
    if (!finalEmail) {
      setError('Please provide your Gmail or Google email address.');
      return;
    }

    setGoogleLoading(true);
    setError('');

    try {
      const res = await api.signInWithGoogle({
        email: finalEmail,
        fullName: targetName || googleName || finalEmail.split('@')[0],
      });
      setToken(res.token);
      setShowGoogleModal(false);
      if (res.onboardingComplete) {
        navigate('/');
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      setError(err.message || 'Failed to authenticate with Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Option 2: Continue Manually with Email (Passwordless OTP / 6-digit code)
  const handleManualEmailSubmit = async (e) => {
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
      navigate(`/verify-email?email=${encodeURIComponent(cleanEmail)}`);
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
          <p className="text-xs text-slate-400">One Business. Multiple AI Agents. Zero Manual Chaos.</p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl bg-slate-950/60 backdrop-blur-xl space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              <p>{error}</p>
            </div>
          )}

          {/* OPTION 1: Continue with Google / Gmail */}
          <div>
            <button
              type="button"
              disabled={googleLoading}
              onClick={() => {
                if (email.includes('@gmail.com') || email.includes('@googlemail.com')) {
                  handleGoogleSignIn(email, fullName);
                } else {
                  setGoogleEmail(email || '');
                  setShowGoogleModal(true);
                }
              }}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs tracking-wide transition-all shadow-md active:scale-98 flex items-center justify-center gap-3 border border-slate-200"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{googleLoading ? 'Signing in with Google...' : 'Continue with Google / Gmail'}</span>
            </button>
            <p className="text-[11px] text-slate-500 text-center mt-1.5">No password needed • 1-Click instant access</p>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-[#0b101d] px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider relative">
              Or continue manually
            </span>
          </div>

          {/* OPTION 2: Continue Manually with Email (Passwordless OTP) */}
          <form onSubmit={handleManualEmailSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Business Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  required
                  type="email"
                  placeholder="name@business.com"
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
              <span>{loading ? 'Dispatching Confirmation Code...' : 'Continue with Email (Send Code)'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-[11px] text-slate-500 text-center mt-1">We will send a 6-digit verification code to your email. No password required.</p>
          </form>

          <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400 flex items-center justify-between">
            <Link to="/verify-email" className="text-cyan-400 hover:underline">
              Already have a 6-digit code?
            </Link>
            <Link to="/welcome" className="text-slate-400 hover:text-white">
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Google Sign In Dialog */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign in with Google Account</span>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Enter your Google or Gmail account to instantly access your BizPilot workspace without any passwords.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Google / Gmail Address</label>
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <button
                type="button"
                disabled={googleLoading || !googleEmail.trim()}
                onClick={() => handleGoogleSignIn()}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs tracking-wide transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 mt-2"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>{googleLoading ? 'Signing In...' : 'Confirm & Sign In with Gmail'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
