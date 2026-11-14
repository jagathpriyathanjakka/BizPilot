'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [emailOrMobile, setEmailOrMobile] = useState('owner@bizpilot.ai');
  const [password, setPassword] = useState('Admin123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrMobile, password }),
      });
      const data = await res.json();
      if (data.success) {
        if (!data.session?.onboardingComplete && data.session?.activeBusinessId === '') {
          router.push('/onboarding');
        } else {
          router.push('/');
        }
      } else {
        setError(data.error || 'Failed to sign in');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center items-center p-4 selection:bg-violet-600 selection:text-white">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/welcome" className="inline-flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-0.5 shadow-glow group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="h-full w-full bg-navy-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-cyan-300" />
              </div>
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">BizPilot AI</span>
          </Link>
          <p className="text-xs text-slate-400 mt-1">One Business. Multiple AI Agents. Zero Manual Chaos.</p>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800/80 pb-3">
            <h2 className="text-xl font-bold text-white">Welcome back</h2>
            <p className="text-xs text-slate-400 mt-0.5">Sign in to your business workspace</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-300">Email or Mobile Number</label>
              <div className="relative mt-1">
                <input
                  type="text"
                  required
                  value={emailOrMobile}
                  onChange={(e) => setEmailOrMobile(e.target.value)}
                  className="w-full pl-3 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => alert('Demo password is: Admin123!')}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-800 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-slate-400 text-xs">Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white font-bold text-xs shadow-glow transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Credentials helper */}
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] space-y-1">
            <p className="font-semibold text-slate-300">Quick Test Credentials:</p>
            <p className="font-mono text-cyan-400">Email: owner@bizpilot.ai</p>
            <p className="font-mono text-cyan-400">Password: Admin123!</p>
          </div>

          <div className="text-center pt-2 border-t border-slate-800/80 text-xs text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-cyan-400 hover:underline font-semibold">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
