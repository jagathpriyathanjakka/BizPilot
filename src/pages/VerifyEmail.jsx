import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle, ArrowRight, RefreshCw, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { api, setToken } from '../api';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';
  const deliveredFromUrl = searchParams.get('delivered');

  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState('');
  const [isDelivered, setIsDelivered] = useState(deliveredFromUrl === null || deliveredFromUrl === '1');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle cooldown countdown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanCode = code.trim();

    if (!cleanEmail || !cleanCode) {
      setError('Please enter your email and 6-digit confirmation code');
      return;
    }

    if (cleanCode.length !== 6) {
      setError('Please enter the complete 6-digit code from your email');
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
      }, 700);
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code in your email and try again.');
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

    if (cooldown > 0) return;

    setResending(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.resendVerificationCode({ email: cleanEmail });
      setSuccessMsg(res.message || 'A fresh confirmation code has been dispatched to your email.');
      if (typeof res?.deliveredToEmail === 'boolean') {
        setIsDelivered(res.deliveredToEmail);
      }
      setCooldown(30); // 30 second cooldown
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Check Your Email</h2>
          <p className="text-xs text-slate-400">
            We sent a confidential 6-digit confirmation code to:
          </p>
          <div className="inline-block px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-xs font-semibold">
            {email.trim() || 'your email'}
          </div>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl bg-slate-950/60 backdrop-blur-xl space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {!isDelivered && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1.5">
              <div className="font-semibold flex items-center gap-1.5 text-amber-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Live Email Delivery Inactive</span>
              </div>
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                The OTP was not dispatched because <strong>GMAIL_USER</strong> and <strong>GMAIL_APP_PASSWORD</strong> are missing on this server.
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                If viewing on <strong>Vercel</strong>: Go to your <em>Vercel Dashboard &rarr; Project Settings &rarr; Environment Variables</em>, add <code>GMAIL_USER</code> and <code>GMAIL_APP_PASSWORD</code>, then click <em>Redeploy</em>.
              </p>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed space-y-1">
            <p className="flex items-center gap-1.5 text-slate-300 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Confidential One-Time Password</span>
            </p>
            <p>
              Please open your Gmail or email inbox, locate the message from BizPilot AI, and enter your 6-digit code below.
              If you don't see it within a minute, check your <strong>Spam</strong> or <strong>Promotions</strong> folder.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4 text-xs">
            {!emailFromUrl && (
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
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-300 font-semibold">6-Digit Confirmation Code</label>
                <span className="text-[11px] text-slate-500 font-mono">Expires in 10 mins</span>
              </div>
              <input
                required
                autoFocus
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="••••••"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full text-center tracking-[0.5em] text-2xl font-mono font-bold py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.trim().length !== 6}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs tracking-wide shadow-glow transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Verifying...' : 'Verify & Access Workspace'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Didn't receive email?</span>
            <button
              type="button"
              disabled={resending || cooldown > 0}
              onClick={handleResend}
              className="text-cyan-400 font-semibold hover:underline flex items-center gap-1 disabled:opacity-50 disabled:no-underline"
            >
              <RefreshCw className={`h-3 w-3 ${resending ? 'animate-spin' : ''}`} />
              <span>
                {resending
                  ? 'Resending...'
                  : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : 'Resend Code'}
              </span>
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link to="/signin" className="text-slate-500 hover:text-slate-300 text-xs">
              ← Return to Sign In with different email
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
