'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Bot,
  ShieldCheck,
  CheckCircle,
  Building2,
  Zap,
} from 'lucide-react';
import { BUSINESS_CATEGORIES } from '@/lib/categories-config';
import { CategoryIcon } from '@/components/CategoryIcon';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col justify-between overflow-x-hidden selection:bg-violet-600 selection:text-white">
      {/* Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-violet-600/20 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* Nav */}
      <header className="border-b border-slate-800/80 bg-navy-950/70 backdrop-blur-md px-6 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-0.5 shadow-glow flex items-center justify-center">
            <div className="h-full w-full bg-navy-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-cyan-300" />
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">BizPilot AI</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/signin"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
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
              href="/"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white font-bold text-sm shadow-glow transition-all active:scale-95 flex items-center gap-2"
            >
              <span>Explore Live Workspace Demo</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/signup"
              className="px-6 py-3 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-colors"
            >
              Start Free Account
            </Link>
          </div>
        </div>

        {/* 13 Supported Categories Grid */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              13 Tailored Business Configurations Built-In
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Select your category to instantly load customized modules, billing parameters, and AI agents
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Object.values(BUSINESS_CATEGORIES).map((cat) => (
              <div
                key={cat.key}
                className="glass-panel glass-panel-hover rounded-2xl p-4 space-y-2 border border-slate-800/80"
              >
                <div className="h-9 w-9 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
                  <CategoryIcon name={cat.icon} className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-xs text-white">{cat.name}</h3>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-Agent Architecture Showcase */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Autonomous Multi-Agent Architecture</h3>
              <p className="text-xs text-slate-400">
                8 specialized intelligence agents operating synchronously under human-in-the-loop oversight
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Deterministic Validation & Audit Log</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
              <span className="font-bold text-violet-400">Inventory Agent</span>
              <p className="text-slate-400 text-[11px]">
                Detects stock shortages, monitors batch expiry, and prepares automated supplier restock POs.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
              <span className="font-bold text-cyan-400">Sales Intelligence</span>
              <p className="text-slate-400 text-[11px]">
                Surfaces bestsellers, forecasts footfall demand, and analyzes today vs yesterday trends.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
              <span className="font-bold text-emerald-400">Financial Agent</span>
              <p className="text-slate-400 text-[11px]">
                Computes gross and net margins using real cost of goods sold. Never assumes unreceived cash.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
              <span className="font-bold text-amber-400">Audit & Orchestrator</span>
              <p className="text-slate-400 text-[11px]">
                Validates transaction consistency and requires explicit owner approval for funds and POs.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-navy-950/80 py-6 px-6 text-center text-xs text-slate-500 font-mono">
        BizPilot AI SaaS Platform • Built with Next.js, React & Multi-Agent Architecture
      </footer>
    </div>
  );
}
