'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Settings,
  Building2,
  PlusCircle,
  RefreshCw,
  CheckCircle,
  Sparkles,
  Shield,
  MapPin,
  Phone,
  Mail,
  Zap,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { BusinessProfile, BusinessCategoryKey } from '@/lib/types';
import { BUSINESS_CATEGORIES } from '@/lib/categories-config';
import { CategoryIcon } from '@/components/CategoryIcon';

export default function SettingsPage() {
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [allBusinesses, setAllBusinesses] = useState<BusinessProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [seedingCategory, setSeedingCategory] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (data.business) {
        setBusiness(data.business);
      }

      const bRes = await fetch('/api/business');
      const bData = await bRes.json();
      if (bData.businesses) {
        setAllBusinesses(bData.businesses);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSwitch = async (id: string) => {
    setLoading(true);
    await fetch('/api/business', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: id }),
    });
    fetchData();
  };

  const handleSeedDemoCategory = async (catKey: BusinessCategoryKey) => {
    setSeedingCategory(catKey);
    try {
      const res = await fetch('/api/demo/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: catKey }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
        alert(`Demo workspace created for ${BUSINESS_CATEGORIES[catKey].name}! Active workspace switched.`);
      }
    } catch (err) {
      alert('Failed to seed category');
    } finally {
      setSeedingCategory(null);
    }
  };

  const currentCategoryDef = BUSINESS_CATEGORIES[business?.category || 'grocery'];

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      <Navbar currentBusiness={business || undefined} allBusinesses={allBusinesses} onBusinessSwitch={handleSwitch} />

      <div className="flex-1 flex">
        <Sidebar currentBusiness={business || undefined} className="hidden md:flex" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-2xl p-6">
            <div>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-violet-400" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  Business Settings & 13-Category Showcase
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Manage organization profile, multi-branch operations, and explore all 13 business modes
              </p>
            </div>

            <Link
              href="/onboarding"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-bold text-white shadow-glow transition-all active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Launch Onboarding Wizard</span>
            </Link>
          </div>

          {/* Current Workspace Profile */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400">
              Active Business Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Business Name:</span>
                <span className="text-white font-bold text-sm">{business?.name}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Category:</span>
                <span className="text-cyan-400 font-bold">{currentCategoryDef.name}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Primary Type:</span>
                <span className="text-white">{business?.businessType}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Owner / Rep:</span>
                <span className="text-white">{business?.ownerName}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Contact Phone:</span>
                <span className="text-white">{business?.mobile}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">GSTIN / Registration:</span>
                <span className="text-white">{business?.gstin || 'Unregistered'}</span>
              </div>
            </div>
          </div>

          {/* 13-Category Showcase Demo Generator */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">
                One-Click Category Exploration (All 13 Industries)
              </h2>
              <p className="text-xs text-slate-400">
                Click any industry card below to instantly spawn and switch into a realistic sample workspace with matching catalog, POS bills, and AI tasks:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.values(BUSINESS_CATEGORIES).map((cat) => {
                const isCurrent = business?.category === cat.key;
                const isSeeding = seedingCategory === cat.key;

                return (
                  <div
                    key={cat.key}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isCurrent
                        ? 'border-violet-500 bg-violet-950/20 shadow-glow'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="h-9 w-9 rounded-xl bg-slate-800 text-violet-400 flex items-center justify-center">
                          <CategoryIcon name={cat.icon} className="h-4 w-4" />
                        </div>
                        {isCurrent ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            Active Workspace
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSeedDemoCategory(cat.key)}
                            disabled={isSeeding}
                            className="px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-[10px] font-bold text-white transition-colors"
                          >
                            {isSeeding ? 'Creating...' : 'Explore Demo'}
                          </button>
                        )}
                      </div>

                      <h3 className="font-bold text-sm text-white mt-3">{cat.name}</h3>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{cat.tagline}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
                      Subcategories: {cat.subcategories.slice(0, 3).join(', ')}...
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
