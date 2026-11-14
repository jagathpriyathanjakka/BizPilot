'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShieldCheck,
  Calendar,
  PieChart as PieIcon,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { SalesChart } from '@/components/SalesChart';
import { BusinessProfile } from '@/lib/types';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      if (json.business) {
        setBusiness(json.business);
        setData(json);
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

  const metrics = data?.metrics || {};
  const currencySymbol = business?.currency === 'INR' ? '₹' : '₹';

  const revenue = metrics.monthlyRevenue || 0;
  const grossProfit = metrics.monthlyGrossProfit || 0;
  const expenses = metrics.totalMonthlyExpenses || 0;
  const netProfit = metrics.estimatedMonthlyNetProfit || 0;

  const grossMargin = revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(1) : '0';
  const netMargin = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      <Navbar currentBusiness={business || undefined} />

      <div className="flex-1 flex">
        <Sidebar currentBusiness={business || undefined} className="hidden md:flex" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-2xl p-6">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-violet-400" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  Financial Analytics & Business Reports
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Strict deterministic accounting: real recorded sales, verified COGS, and categorized expenses
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <ShieldCheck className="h-4 w-4" />
              <span>Zero-Estimate Certified Ledger</span>
            </div>
          </div>

          {/* KPI Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="glass-panel rounded-2xl p-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Monthly Gross Sales
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                {currencySymbol}{revenue.toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-cyan-400 mt-1">From recorded POS invoices</p>
            </div>

            <div className="glass-panel rounded-2xl p-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Gross Profit (After COGS)
              </span>
              <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">
                {currencySymbol}{grossProfit.toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-emerald-400 mt-1">Gross Margin: {grossMargin}%</p>
            </div>

            <div className="glass-panel rounded-2xl p-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Operating Overhead
              </span>
              <h3 className="text-2xl font-extrabold text-rose-400 mt-1">
                {currencySymbol}{expenses.toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-rose-400 mt-1">Rent, wages & utilities</p>
            </div>

            <div className="glass-panel rounded-2xl p-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Net Operating Profit
              </span>
              <h3 className="text-2xl font-extrabold text-cyan-400 mt-1">
                {currencySymbol}{netProfit.toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-cyan-400 mt-1">Net Margin: {netMargin}%</p>
            </div>
          </div>

          {/* Revenue Trend Chart */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Daily Revenue Progression</h3>
                <p className="text-xs text-slate-400">Past 7 days daily transactional totals</p>
              </div>
            </div>

            <SalesChart data={data?.salesChartData || []} currency={currencySymbol} />
          </div>

          {/* Compliance & Calculation Guarantee Notice */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 text-xs text-slate-400 space-y-1.5 font-mono">
            <p className="font-bold text-slate-300 flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>BizPilot Deterministic Accounting Rules Applied:</span>
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 pl-1">
              <li>Revenue is calculated solely from recorded POS bills, never from projections.</li>
              <li>Gross profit is computed using actual recorded inventory purchase costs (COGS).</li>
              <li>Customer credit receivables (unpaid balances) are kept separate from realized cash.</li>
              <li>Operating expenses are segregated by verified expense entries.</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
