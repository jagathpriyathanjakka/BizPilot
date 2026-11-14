import React, { useState } from 'react';
import { Settings, Sparkles, Check, ArrowRight, Building2 } from 'lucide-react';
import { BUSINESS_CATEGORIES } from '../categories';
import { CategoryIcon } from '../components/CategoryIcon';
import { api, setToken } from '../api';

export default function SettingsPage({ business, onBusinessSwitched }) {
  const [switching, setSwitching] = useState(false);
  const categoriesList = Object.values(BUSINESS_CATEGORIES);

  const handleSwitchCategory = async (catKey) => {
    setSwitching(true);
    try {
      const res = await api.switchCategoryDemo(catKey);
      if (res.token) setToken(res.token);
      alert(`Switched workspace to ${res.categoryMeta?.name || catKey}!`);
      onBusinessSwitched?.(res.business?.id);
    } catch (err) {
      alert(`Failed to switch industry: ${err.message}`);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-3xl glass-panel border border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-violet-400" />
          <span>Workspace Settings & 13-Industry Showcase</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          1-Click switch between any of the 13 supported business categories with seeded products, sales, and AI rules.
        </p>
      </div>

      {/* Current Workspace Info */}
      <div className="p-5 rounded-3xl glass-panel border border-slate-800 space-y-3">
        <h3 className="font-bold text-sm text-white">Active Business Workspace</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400">Business Name</span>
            <p className="font-bold text-white mt-1">{business?.name}</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400">Category & Type</span>
            <p className="font-bold text-cyan-400 mt-1">{business?.category?.toUpperCase()} ({business?.businessType})</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400">Currency</span>
            <p className="font-bold text-emerald-400 mt-1">{business?.currency || 'INR'} (₹)</p>
          </div>
        </div>
      </div>

      {/* 13-Industry Showcase Switcher */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-white">Instant 1-Click Industry Showcase</h3>
          {switching && <span className="text-xs text-cyan-400 animate-pulse">Switching & seeding industry workspace...</span>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {categoriesList.map((cat) => {
            const isActive = business?.category === cat.key;
            return (
              <div
                key={cat.key}
                onClick={() => !isActive && !switching && handleSwitchCategory(cat.key)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-violet-600/20 border-violet-500 shadow-glow'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                      isActive ? 'bg-violet-600 text-white' : 'bg-slate-800 text-violet-400'
                    }`}>
                      <CategoryIcon name={cat.icon} className="h-4 w-4" />
                    </div>
                    {isActive ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-cyan-400 font-semibold group-hover:underline">
                        Switch →
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-xs text-white">{cat.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {cat.tagline}
                  </p>
                </div>

                <div className="pt-2.5 mt-2.5 border-t border-slate-800 flex justify-between text-[10px] text-slate-500">
                  <span>Stock Unit: {cat.stockUnit}</span>
                  <span>{cat.subcategories.length} segments</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
