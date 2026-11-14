'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ChevronDown,
  Building2,
  PlusCircle,
  Bell,
  Search,
  Check,
  ShieldCheck,
  LogOut,
  User,
  ExternalLink,
  Bot,
  Zap,
} from 'lucide-react';
import { BusinessProfile } from '@/lib/types';
import { BUSINESS_CATEGORIES } from '@/lib/categories-config';
import { CategoryIcon } from './CategoryIcon';

interface NavbarProps {
  currentBusiness?: BusinessProfile;
  allBusinesses?: BusinessProfile[];
  onBusinessSwitch?: (businessId: string) => void;
  pendingApprovalsCount?: number;
  onOpenQuickSale?: () => void;
  onOpenAIChat?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentBusiness,
  allBusinesses = [],
  onBusinessSwitch,
  pendingApprovalsCount = 0,
  onOpenQuickSale,
  onOpenAIChat,
}) => {
  const router = useRouter();
  const [showBizDropdown, setShowBizDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const currentCategory = currentBusiness ? BUSINESS_CATEGORIES[currentBusiness.category] : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-navy-950/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand & Active Business */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-0.5 shadow-glow group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="h-full w-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white">BizPilot</span>
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent font-extrabold text-sm">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider block -mt-1">
                MULTI-AGENT SAAS
              </span>
            </div>
          </Link>

          {/* Business Switcher Dropdown */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setShowBizDropdown(!showBizDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800/80 transition-colors text-left"
            >
              <div className="h-6 w-6 rounded bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs">
                {currentCategory ? (
                  <CategoryIcon name={currentCategory.icon} className="h-3.5 w-3.5" />
                ) : (
                  <Building2 className="h-3.5 w-3.5" />
                )}
              </div>
              <div className="max-w-[160px] truncate">
                <p className="text-xs font-semibold text-slate-200 truncate leading-none">
                  {currentBusiness?.name || 'My Business'}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {currentCategory?.name || 'Workspace'}
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
            </button>

            {showBizDropdown && (
              <div className="absolute left-0 mt-2 w-72 rounded-xl border border-slate-800 bg-slate-900/95 shadow-2xl backdrop-blur-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Business Workspace
                </div>
                <div className="max-h-60 overflow-y-auto py-1 space-y-1">
                  {allBusinesses.map((b) => {
                    const cat = BUSINESS_CATEGORIES[b.category];
                    const isSelected = b.id === currentBusiness?.id;
                    return (
                      <button
                        key={b.id}
                        onClick={() => {
                          onBusinessSwitch?.(b.id);
                          setShowBizDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                          isSelected
                            ? 'bg-violet-600/20 border border-violet-500/30 text-white'
                            : 'hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="h-7 w-7 rounded bg-slate-800 flex items-center justify-center text-violet-400 shrink-0">
                            {cat ? <CategoryIcon name={cat.icon} className="h-3.5 w-3.5" /> : <Building2 className="h-3.5 w-3.5" />}
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-medium text-slate-200 truncate">{b.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{cat?.name || b.category}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-violet-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
                <div className="pt-2 border-t border-slate-800 mt-1">
                  <Link
                    href="/onboarding"
                    onClick={() => setShowBizDropdown(false)}
                    className="flex items-center gap-2 w-full p-2 rounded-lg text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Add New Business / Onboard</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2.5">
          {/* Multi-Agent status indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>8 AI Agents Active</span>
          </div>

          {/* AI Command Center button */}
          <button
            onClick={onOpenAIChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-violet-500/40 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 hover:from-violet-600/30 hover:to-cyan-600/30 text-white text-xs font-semibold shadow-glow transition-all"
          >
            <Bot className="h-4 w-4 text-cyan-300" />
            <span className="hidden sm:inline">AI Command Center</span>
            <span className="sm:hidden">AI</span>
          </button>

          {/* Quick Sale / POS Button */}
          <button
            onClick={onOpenQuickSale}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            <Zap className="h-3.5 w-3.5 text-yellow-300 fill-yellow-300" />
            <span className="hidden sm:inline">New Sale / Bill</span>
            <span className="sm:hidden">Bill</span>
          </button>

          {/* Pending Approvals Bell */}
          <Link
            href="/approvals"
            className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Approvals & Tasks"
          >
            <Bell className="h-4 w-4" />
            {pendingApprovalsCount > 0 && (
              <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {pendingApprovalsCount}
              </span>
            )}
          </Link>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 transition-colors"
            >
              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                {currentBusiness?.ownerName ? currentBusiness.ownerName.charAt(0) : 'O'}
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900/95 shadow-2xl backdrop-blur-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1.5 border-b border-slate-800">
                  <p className="text-xs font-semibold text-white truncate">
                    {currentBusiness?.ownerName || 'Business Owner'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {currentBusiness?.email || 'owner@bizpilot.ai'}
                  </p>
                </div>
                <div className="py-1">
                  <Link
                    href="/onboarding"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <PlusCircle className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Run Onboarding Wizard</span>
                  </Link>
                  <Link
                    href="/approvals"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Audit & AI Approvals</span>
                  </Link>
                </div>
                <div className="pt-1 border-t border-slate-800">
                  <Link
                    href="/signin"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-2 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign In / Switch User</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
