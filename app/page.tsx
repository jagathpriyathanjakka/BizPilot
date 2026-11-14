'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Building2,
  RefreshCw,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { MetricCard } from '@/components/MetricCard';
import { SalesChart } from '@/components/SalesChart';
import { QuickPOSModal } from '@/components/QuickPOSModal';
import { NewProductModal } from '@/components/NewProductModal';
import { AICommandModal } from '@/components/AICommandModal';
import { CategoryIcon } from '@/components/CategoryIcon';
import { BUSINESS_CATEGORIES } from '@/lib/categories-config';
import { BusinessProfile, Product, Customer, BusinessCategoryKey } from '@/lib/types';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [allBusinesses, setAllBusinesses] = useState<BusinessProfile[]>([]);
  const [currentBusinessId, setCurrentBusinessId] = useState<string>('biz-grocery-demo');

  // Modals state
  const [isPOSOpen, setIsPOSOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  // Fetch Dashboard data
  const fetchDashboard = async (bId?: string) => {
    try {
      const targetId = bId || currentBusinessId;
      const res = await fetch(`/api/dashboard?businessId=${targetId}`);
      const json = await res.json();
      if (json.business) {
        setData(json);
        setCurrentBusinessId(json.business.id);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all businesses for switcher
  const fetchBusinesses = async () => {
    try {
      const res = await fetch('/api/business');
      const json = await res.json();
      if (json.businesses) {
        setAllBusinesses(json.businesses);
      }
    } catch (err) {
      console.error('Failed to load businesses:', err);
    }
  };

  useEffect(() => {
    fetchBusinesses();
    fetchDashboard();
  }, []);

  const handleSwitchBusiness = async (bId: string) => {
    setLoading(true);
    await fetch('/api/business', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: bId }),
    });
    await fetchDashboard(bId);
  };

  const handleQuickSeedCategory = async (catKey: BusinessCategoryKey) => {
    setLoading(true);
    try {
      const res = await fetch('/api/demo/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: catKey }),
      });
      const json = await res.json();
      if (json.business) {
        await fetchBusinesses();
        await fetchDashboard(json.business.id);
      }
    } catch (err) {
      alert('Failed to switch category');
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center text-center p-6">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-0.5 animate-spin">
          <div className="h-full w-full bg-navy-950 rounded-[14px]" />
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-300">
          Loading BizPilot Workspace...
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Synchronizing multi-agent database & business metrics
        </p>
      </div>
    );
  }

  const business: BusinessProfile = data?.business;
  const metrics = data?.metrics || {};
  const categoryDef = BUSINESS_CATEGORIES[business?.category || 'grocery'];
  const currencySymbol = business?.currency === 'INR' ? '₹' : business?.currency || '₹';

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        currentBusiness={business}
        allBusinesses={allBusinesses}
        onBusinessSwitch={handleSwitchBusiness}
        pendingApprovalsCount={metrics.pendingApprovalsCount || 0}
        onOpenQuickSale={() => setIsPOSOpen(true)}
        onOpenAIChat={() => setIsAIOpen(true)}
      />

      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar currentBusiness={business} className="hidden md:flex" />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Category Switcher Carousel / Pill Bar */}
          <div className="p-3 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Explore All 13 Business Modes (Instant Preview):
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">
                Active: {categoryDef.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {Object.values(BUSINESS_CATEGORIES).map((cat) => {
                const isActive = cat.key === business.category;
                return (
                  <button
                    key={cat.key}
                    onClick={() => handleQuickSeedCategory(cat.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-glow border border-violet-500/40'
                        : 'border border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <CategoryIcon name={cat.icon} className="h-3.5 w-3.5" />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Business Banner Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-2xl p-6 relative overflow-hidden">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {business.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {business.businessType}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                {categoryDef.tagline} • Located in {business.city}, {business.state}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => setIsAddProductOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add {categoryDef.productTerminology.singular}</span>
              </button>

              <button
                onClick={() => setIsPOSOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-bold text-white shadow-glow transition-all active:scale-95"
              >
                <Receipt className="h-4 w-4" />
                <span>Quick POS Bill</span>
              </button>
            </div>
          </div>

          {/* Financial KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <MetricCard
              label="Today's Sales"
              value={`${currencySymbol}${metrics.totalSalesToday?.toLocaleString('en-IN') || 0}`}
              subValue={`${metrics.todaySalesCount || 0} bills recorded`}
              trend={metrics.totalSalesToday >= (metrics.totalSalesYesterday || 0) ? 'up' : 'down'}
              trendValue={`vs ${currencySymbol}${metrics.totalSalesYesterday || 0} y'day`}
              iconName="Receipt"
              highlightColor="violet"
            />
            <MetricCard
              label="Monthly Revenue"
              value={`${currencySymbol}${metrics.monthlyRevenue?.toLocaleString('en-IN') || 0}`}
              subValue="Recorded month-to-date"
              trend="up"
              trendValue="Real sales data"
              iconName="TrendingUp"
              highlightColor="cyan"
            />
            <MetricCard
              label="Estimated Net Profit"
              value={`${currencySymbol}${metrics.estimatedMonthlyNetProfit?.toLocaleString('en-IN') || 0}`}
              subValue={`Gross: ${currencySymbol}${metrics.monthlyGrossProfit?.toLocaleString('en-IN') || 0}`}
              trend="up"
              trendValue="After all expenses"
              iconName="ShieldCheck"
              highlightColor="emerald"
            />
            <MetricCard
              label="Pending Receivables"
              value={`${currencySymbol}${metrics.pendingReceivables?.toLocaleString('en-IN') || 0}`}
              subValue={`${metrics.totalCustomers || 0} total customers`}
              trend="neutral"
              trendValue="Customer credit"
              iconName="Clock"
              highlightColor="amber"
            />
          </div>

          {/* Category-Specific Operational Metric Cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                {categoryDef.name} — Specialized Operational Metrics
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">
                Tailored Terminology & Live Hardware/Kitchen/Booking Feeds
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {categoryDef.customMetrics.map((cm) => {
                const rawVal = metrics.customMetricValues?.[cm.key] ?? '0';
                const formattedVal =
                  cm.format === 'currency'
                    ? `${currencySymbol}${Number(rawVal).toLocaleString('en-IN')}`
                    : rawVal;

                return (
                  <MetricCard
                    key={cm.key}
                    label={cm.label}
                    value={formattedVal}
                    subValue={`Specific to ${categoryDef.name}`}
                    iconName={cm.icon}
                    highlightColor="cyan"
                  />
                );
              })}
            </div>
          </div>

          {/* Charts & AI Intelligence Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 cols: 7-Day Revenue Trend Chart */}
            <div className="lg:col-span-7 glass-panel rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">7-Day Verified Revenue Trend</h3>
                  <p className="text-xs text-slate-400">
                    Real sales transaction records (Zero assumed estimates)
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 text-xs text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-violet-500" />
                  <span>Gross Sales</span>
                </div>
              </div>

              <SalesChart data={data?.salesChartData || []} currency={currencySymbol} />
            </div>

            {/* Right 5 cols: Multi-Agent Intelligence Feed */}
            <div className="lg:col-span-5 glass-panel rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white">Multi-Agent Intelligence</h3>
                  </div>
                  <button
                    onClick={() => setIsAIOpen(true)}
                    className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
                  >
                    Open Console →
                  </button>
                </div>

                {/* AI Tasks & Insights */}
                <div className="space-y-2.5">
                  {data?.recentAgentTasks?.slice(0, 3).map((task: any) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl border border-slate-800/80 bg-slate-900/60 space-y-1.5 hover:border-violet-500/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-600/20 text-violet-300 border border-violet-500/30">
                          {task.agentType} Agent
                        </span>
                        <span
                          className={`text-[10px] font-semibold ${
                            task.status === 'Awaiting Approval'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200">{task.title}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{task.response}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => setIsAIOpen(true)}
                  className="w-full py-2 rounded-xl border border-violet-500/40 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 hover:from-violet-600/30 hover:to-cyan-600/30 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Ask AI: &quot;How much did I sell today?&quot;</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Transactions Table */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Recent Sales & Invoices</h3>
                <p className="text-xs text-slate-400">
                  Instantly recorded at POS counter with auto-inventory sync
                </p>
              </div>
              <Link
                href="/sales"
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                <span>View All Sales</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Invoice #</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Items Sold</th>
                    <th className="px-4 py-3">Total Amount</th>
                    <th className="px-4 py-3">Gross Margin</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {data?.recentSales?.map((sale: any) => (
                    <tr key={sale.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-slate-200">
                        {sale.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">{sale.customerName}</td>
                      <td className="px-4 py-3 text-slate-400 max-w-[200px] truncate">
                        {sale.items?.map((i: any) => `${i.name} (x${i.quantity})`).join(', ')}
                      </td>
                      <td className="px-4 py-3 font-bold text-cyan-400">
                        {currencySymbol}
                        {sale.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-400">
                        +{currencySymbol}
                        {sale.grossProfit?.toLocaleString('en-IN') || 0}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-300">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sale.paymentStatus === 'Paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {sale.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* POS Modal */}
      <QuickPOSModal
        isOpen={isPOSOpen}
        onClose={() => setIsPOSOpen(false)}
        products={data?.products || []}
        customers={data?.customers || []}
        businessId={business?.id}
        currency={currencySymbol}
        onSaleCreated={() => fetchDashboard()}
      />

      {/* New Product Modal */}
      <NewProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        businessId={business?.id}
        categoryKey={business?.category || 'grocery'}
        onProductAdded={() => fetchDashboard()}
      />

      {/* AI Command Center Modal */}
      <AICommandModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        businessId={business?.id}
        categoryKey={business?.category || 'grocery'}
        onActionApproved={() => fetchDashboard()}
      />
    </div>
  );
}
