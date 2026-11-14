import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { api, setToken } from '../api';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanCode = code.trim();

    if (!cleanEmail || !cleanCode) {
      setError('Please enter your email and 6-digit confirmation code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.verifyEmail({ email: cleanEmail, code: cleanCode });
      if (res.token) {
        setToken(res.token);
      }
      setSuccessMsg('Email successfully verified! Redirecting to your workspace...');
      setTimeout(() => {
        if (res.onboardingComplete) {
          navigate('/');
        } else {
          navigate('/onboarding');
        }
      }, 800);
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please provide your registered email address to resend the code');
      return;
    }
    setResending(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.resendVerificationCode({ email: cleanEmail });
      setSuccessMsg(res.message || 'A new verification code has been dispatched to your email.');
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col justify-center items-center p-4 selection:bg-violet-600 selection:text-white">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-cyan-600/20 via-violet-600/10 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-0.5 shadow-glow flex items-center justify-center mb-3">
            <div className="h-full w-full bg-[#070B14] rounded-[14px] flex items-center justify-center">
              <Mail className="h-7 w-7 text-cyan-300" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Verify Your Email Address</h2>
          <p className="text-xs text-slate-400">
            Please check your inbox and enter the 6-digit confirmation code sent to <strong className="text-white">{email.trim() || 'your email'}</strong>
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl bg-slate-950/60 backdrop-blur-xl">
          <form onSubmit={handleVerify} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Registered Email</label>
              <input
                required
                type="email"
                placeholder="name@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 text-xs"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">6-Digit Confirmation Code</label>
              <input
                required
                type="text"
                maxLength={6}
                placeholder="••••••"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full text-center tracking-[0.5em] text-xl font-bold py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white font-bold text-xs tracking-wide shadow-glow transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Verifying...' : 'Verify & Activate Workspace'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Didn't receive the email?</span>
            <button
              type="button"
              disabled={resending}
              onClick={handleResend}
              className="text-cyan-400 font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${resending ? 'animate-spin' : ''}`} />
              <span>{resending ? 'Resending...' : 'Resend Code'}</span>
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link to="/signin" className="text-slate-500 hover:text-slate-300 text-xs">
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
