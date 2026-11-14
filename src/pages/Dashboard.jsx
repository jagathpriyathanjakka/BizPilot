import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Receipt,
  Package,
  AlertTriangle,
  Users,
  Clock,
  Sparkles,
  Bot,
  Plus,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { SalesChart } from '../components/SalesChart';
import { CategoryIcon } from '../components/CategoryIcon';
import { api } from '../api';

export default function DashboardPage({
  business,
  onOpenQuickSale,
  onOpenAIChat,
  onOpenAddProduct,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard(business?.id);
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [business?.id]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
          <span>Loading workspace intelligence...</span>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const categoryMeta = data?.categoryMeta || {};
  const currency = data?.business?.currency === 'INR' ? '₹' : (data?.business?.currency || '₹');

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl glass-panel bg-gradient-to-r from-violet-950/40 via-slate-900/60 to-cyan-950/40 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              {data?.business?.category} Workspace
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">{data?.business?.businessType}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
            {data?.business?.name}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{categoryMeta.tagline}</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenAddProduct}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold transition-all"
          >
            <Plus className="h-3.5 w-3.5 text-cyan-400" />
            <span>Add Item</span>
          </button>

          <button
            onClick={onOpenQuickSale}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-glow transition-all active:scale-95"
          >
            <Zap className="h-3.5 w-3.5 text-yellow-300 fill-yellow-300" />
            <span>New Sale / POS Bill</span>
          </button>
        </div>
      </div>

      {/* Pending Approvals Alert Banner */}
      {metrics.pendingApprovalsCount > 0 && (
        <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>
              <strong>{metrics.pendingApprovalsCount} AI Action(s)</strong> require your authorization to execute.
            </span>
          </div>
          <Link
            to="/approvals"
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition-colors"
          >
            Review & Authorize
          </Link>
        </div>
      )}

      {/* 4 Core Financial & Operational Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Today's Sales"
          value={`${currency}${metrics.todayRevenue?.toLocaleString('en-IN') || 0}`}
          subValue={`${metrics.todayOrdersCount || 0} transaction(s)`}
          trend="up"
          trendValue="+12.4% vs avg"
          iconName="Receipt"
          highlightColor="cyan"
        />

        <MetricCard
          label="Total Revenue"
          value={`${currency}${metrics.totalRevenue?.toLocaleString('en-IN') || 0}`}
          subValue={`Gross Profit: ${currency}${metrics.grossProfit?.toLocaleString('en-IN') || 0} (${metrics.grossProfitMargin}%)`}
          trend="up"
          trendValue="Healthy Margin"
          iconName="TrendingUp"
          highlightColor="violet"
        />

        <MetricCard
          label="Net Profit"
          value={`${currency}${metrics.netProfit?.toLocaleString('en-IN') || 0}`}
          subValue={`Overheads: ${currency}${metrics.totalExpenses?.toLocaleString('en-IN') || 0}`}
          trend={metrics.netProfit >= 0 ? 'up' : 'down'}
          trendValue={metrics.netProfit >= 0 ? 'Profitable' : 'Loss Alert'}
          iconName="Sparkles"
          highlightColor="emerald"
        />

        <MetricCard
          label="Stock Health"
          value={`${metrics.totalProductsCount || 0} Items`}
          subValue={`${metrics.lowStockCount || 0} low stock • ${metrics.outOfStockCount || 0} out`}
          trend={metrics.lowStockCount > 0 ? 'down' : 'neutral'}
          trendValue={metrics.lowStockCount > 0 ? 'Needs PO' : 'Optimal'}
          iconName="Package"
          highlightColor={metrics.lowStockCount > 0 ? 'rose' : 'cyan'}
        />
      </div>

      {/* Middle Row: 7-Day Chart & Category-Specific Operational Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sales Area Trend */}
        <div className="lg:col-span-8 p-5 rounded-3xl glass-panel border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white">7-Day Sales Trend</h3>
              <p className="text-[11px] text-slate-400">Daily revenue and transaction trajectory</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
              Live Aggregate
            </span>
          </div>

          <SalesChart data={data?.salesTrend || []} currency={currency} />
        </div>

        {/* Category-Specific Operational Snapshot */}
        <div className="lg:col-span-4 p-5 rounded-3xl glass-panel border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <CategoryIcon name={categoryMeta.icon || 'Sparkles'} className="h-4 w-4 text-cyan-400" />
                <span>Industry Operations</span>
              </h3>
              <Link to="/specialized" className="text-[11px] text-cyan-400 hover:underline">
                View All →
              </Link>
            </div>

            {/* Render Category Highlight */}
            {data?.categoryHighlights?.activeOrdersCount !== undefined && (
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Active Kitchen Orders (KOT)</span>
                  <span className="font-bold text-cyan-400">{data.categoryHighlights.activeOrdersCount} Open</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {data.categoryHighlights.activeOrders?.map((ord) => (
                    <div key={ord.id} className="p-1.5 rounded bg-slate-850 flex justify-between text-[11px]">
                      <span className="text-white">{ord.order_number} ({ord.table_number || ord.order_type})</span>
                      <span className="text-yellow-400">{ord.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data?.categoryHighlights?.todayAppointmentsCount !== undefined && (
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Appointments Today</span>
                  <span className="font-bold text-violet-400">{data.categoryHighlights.todayAppointmentsCount} Slots</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {data.categoryHighlights.todayAppointments?.map((apt) => (
                    <div key={apt.id} className="p-1.5 rounded bg-slate-850 flex justify-between text-[11px]">
                      <span className="text-white">{apt.customer_name} ({apt.service_name})</span>
                      <span className="text-emerald-400">{apt.time_slot}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data?.categoryHighlights?.activeRepairsCount !== undefined && (
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Active Device Repairs</span>
                  <span className="font-bold text-cyan-400">{data.categoryHighlights.activeRepairsCount} Devices</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {data.categoryHighlights.activeRepairs?.map((rep) => (
                    <div key={rep.id} className="p-1.5 rounded bg-slate-850 flex justify-between text-[11px]">
                      <span className="text-white">{rep.ticket_number} - {rep.brand_model}</span>
                      <span className="text-amber-400">{rep.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!data?.categoryHighlights?.activeOrdersCount && !data?.categoryHighlights?.todayAppointmentsCount && !data?.categoryHighlights?.activeRepairsCount && (
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2 text-slate-300">
                <p><strong>Expiry Surveillance:</strong> {metrics.nearExpiryCount || 0} batch(es) nearing threshold.</p>
                <p><strong>Stock Unit:</strong> {categoryMeta.stockUnit || 'unit'} tracking enabled.</p>
                <p><strong>Pricing Agent:</strong> Margin protection active.</p>
              </div>
            )}
          </div>

          <button
            onClick={onOpenAIChat}
            className="w-full mt-4 py-2.5 rounded-xl border border-violet-500/30 bg-violet-600/10 hover:bg-violet-600/20 text-violet-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Bot className="h-4 w-4 text-cyan-400" />
            <span>Run Multi-Agent Audit</span>
          </button>
        </div>
      </div>

      {/* Recent Sales Transactions */}
      <div className="p-5 rounded-3xl glass-panel border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-white">Recent POS Invoices</h3>
            <p className="text-[11px] text-slate-400">Latest checkout transactions and billing records</p>
          </div>
          <Link to="/sales" className="text-xs text-cyan-400 hover:underline">
            View All Sales →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data?.recentSales?.map((s) => (
                <tr key={s.id} className="hover:bg-slate-900/40">
                  <td className="p-3 font-mono font-bold text-cyan-400">{s.invoiceNumber}</td>
                  <td className="p-3 text-white font-medium">{s.customerName}</td>
                  <td className="p-3 text-slate-400">{s.itemsCount} item(s)</td>
                  <td className="p-3 font-bold text-emerald-400">
                    {currency}{s.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                      {s.paymentMethod}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">
                    {new Date(s.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
