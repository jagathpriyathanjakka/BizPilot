import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Bot,
  ShieldCheck,
  CheckCircle,
  Building2,
  Zap,
} from 'lucide-react';
import { BUSINESS_CATEGORIES } from '../categories';
import { CategoryIcon } from '../components/CategoryIcon';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col justify-between overflow-x-hidden selection:bg-violet-600 selection:text-white">
      {/* Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-violet-600/20 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* Nav */}
      <header className="border-b border-slate-800/80 bg-[#070B14]/70 backdrop-blur-md px-6 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-0.5 shadow-glow flex items-center justify-center">
            <div className="h-full w-full bg-[#070B14] rounded-[10px] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-cyan-300" />
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">BizPilot AI</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/signin"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-xs font-bold text-white shadow-glow transition-all active:scale-95"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 sm:py-16 space-y-16 relative z-10">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-mono">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Next-Generation Multi-Business Operating System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            One Business. Multiple AI Agents.{' '}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              Zero Manual Chaos.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            BizPilot AI dynamically adapts its entire interface, terminology, inventory attributes, and workflows
            specifically to your business — whether you operate a grocery store, restaurant, clinic, boutique, or repair hub.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/signin"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white font-bold text-sm shadow-glow transition-all active:scale-95 flex items-center gap-2"
            >
              <span>Explore Live Workspace Demo</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/signup"
              className="px-6 py-3 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-all"
            >
              Start Free Onboarding
            </Link>
          </div>
        </div>

        {/* 13 Supported Industries Grid */}
        <div className="space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl font-bold text-white">13 Specialized Industry Workspaces</h2>
            <p className="text-xs text-slate-400">
              Each workspace provisions unique terminology, custom fields, and automated agent workflows.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Object.values(BUSINESS_CATEGORIES).map((cat) => (
              <div
                key={cat.key}
                className="glass-panel glass-panel-hover p-4 rounded-2xl flex flex-col justify-between group"
              >
                <div>
                  <div className="h-10 w-10 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-3 group-hover:bg-violet-600 group-hover:text-white transition-all">
                    <CategoryIcon name={cat.icon} className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {cat.tagline}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Unit: {cat.stockUnit}</span>
                  <span className="text-cyan-400 font-medium">Ready →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070B14]/80 py-6 text-center text-xs text-slate-500">
        <p>BizPilot AI • One Business. Multiple AI Agents. Zero Manual Chaos.</p>
      </footer>
    </div>
  );
}
