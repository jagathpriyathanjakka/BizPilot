import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { api } from '../api';

export default function ReportsPage({ business }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await api.getReports(business?.id);
      setReport(res);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [business?.id]);

  const currency = business?.currency === 'INR' ? '₹' : (business?.currency || '₹');
  const summary = report?.summary || {};

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-3xl glass-panel border border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-violet-400" />
          <span>Financial Analytics & Profit & Loss Statement</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Deterministic profit computation: Gross Revenue - Cost of Goods Sold - Operating Expenses = Net Profit
        </p>
      </div>

      {/* P&L Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs text-slate-400 uppercase font-semibold">Gross Revenue</p>
          <h3 className="text-2xl font-bold text-white">{currency}{summary.totalRevenue?.toLocaleString('en-IN') || 0}</h3>
          <p className="text-[11px] text-slate-500">Across {summary.totalTransactions || 0} sales</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs text-slate-400 uppercase font-semibold">Cost of Goods Sold (COGS)</p>
          <h3 className="text-2xl font-bold text-slate-300">{currency}{summary.totalCOGS?.toLocaleString('en-IN') || 0}</h3>
          <p className="text-[11px] text-slate-500">Inventory purchase cost</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs text-slate-400 uppercase font-semibold">Gross Profit</p>
          <h3 className="text-2xl font-bold text-cyan-400">{currency}{summary.grossProfit?.toLocaleString('en-IN') || 0}</h3>
          <p className="text-[11px] text-cyan-500/80 font-bold">{summary.grossMarginPct || 0}% Margin</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs text-slate-400 uppercase font-semibold">Net Profit</p>
          <h3 className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {currency}{summary.netProfit?.toLocaleString('en-IN') || 0}
          </h3>
          <p className="text-[11px] text-slate-400">After {currency}{summary.totalExpenses?.toLocaleString('en-IN') || 0} expenses</p>
        </div>
      </div>

      {/* Payment & Expense Distributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-3xl glass-panel border border-slate-800 space-y-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <PieChart className="h-4 w-4 text-cyan-400" />
            <span>Payment Mode Breakdown</span>
          </h3>
          <div className="space-y-2">
            {report?.paymentBreakdown?.map((p) => (
              <div key={p.method} className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-300">{p.method}</span>
                  <span className="font-bold text-white">{currency}{p.amount.toLocaleString('en-IN')} ({p.percentage}%)</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${p.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-3xl glass-panel border border-slate-800 space-y-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-rose-400" />
            <span>Overhead Category Breakdown</span>
          </h3>
          <div className="space-y-2">
            {report?.expenseBreakdown?.map((e) => (
              <div key={e.category} className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-300">{e.category}</span>
                  <span className="font-bold text-white">{currency}{e.amount.toLocaleString('en-IN')} ({e.percentage}%)</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-400 rounded-full" style={{ width: `${e.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
