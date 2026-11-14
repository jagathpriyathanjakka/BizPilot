'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Printer,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
  CreditCard,
  Banknote,
  QrCode,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { QuickPOSModal } from '@/components/QuickPOSModal';
import { AICommandModal } from '@/components/AICommandModal';
import { Sale, Product, Customer, BusinessProfile } from '@/lib/types';

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [isPOSOpen, setIsPOSOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (data.business) {
        setBusiness(data.business);
        setProducts(data.products || []);
        setCustomers(data.customers || []);
      }

      const sRes = await fetch('/api/sales');
      const sData = await sRes.json();
      if (sData.sales) {
        setSales(sData.sales);
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

  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalGrossProfit = sales.reduce((sum, s) => sum + s.grossProfit, 0);
  const pendingCount = sales.filter((s) => s.paymentStatus !== 'Paid').length;

  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.customerName.toLowerCase().includes(search.toLowerCase()) ||
      s.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (paymentFilter !== 'all' && s.paymentMethod !== paymentFilter) return false;
    if (statusFilter !== 'all' && s.paymentStatus !== statusFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      <Navbar
        currentBusiness={business || undefined}
        onOpenQuickSale={() => setIsPOSOpen(true)}
        onOpenAIChat={() => setIsAIOpen(true)}
      />

      <div className="flex-1 flex">
        <Sidebar currentBusiness={business || undefined} className="hidden md:flex" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-2xl p-6">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-violet-400" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">Sales & POS Billing</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Deterministic cost accounting, itemized bills, and multi-channel payment records
              </p>
            </div>

            <button
              onClick={() => setIsPOSOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-bold text-white shadow-glow transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Bill / Sale</span>
            </button>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel rounded-2xl p-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Sales Revenue
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-cyan-400 mt-1">From {sales.length} verified transactions</p>
            </div>

            <div className="glass-panel rounded-2xl p-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Gross Profit
              </span>
              <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">
                +₹{totalGrossProfit.toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Margin: {totalRevenue > 0 ? ((totalGrossProfit / totalRevenue) * 100).toFixed(1) : 0}%
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Pending / Credit Bills
              </span>
              <h3 className="text-2xl font-extrabold text-amber-400 mt-1">{pendingCount}</h3>
              <p className="text-[11px] text-slate-400 mt-1">Follow-up via AI Command Center</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by invoice #, customer, item..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white"
              >
                <option value="all">All Payment Modes</option>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Split">Split</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white"
              >
                <option value="all">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Sales Table */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Invoice #</th>
                    <th className="px-4 py-3">Date & Time</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Line Items</th>
                    <th className="px-4 py-3">COGS</th>
                    <th className="px-4 py-3">Total Amount</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-slate-500">
                        No sales recorded matching your filters. Click &quot;Create New Bill&quot; to test.
                      </td>
                    </tr>
                  ) : (
                    filteredSales.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-white">{s.invoiceNumber}</td>
                        <td className="px-4 py-3 text-slate-400">
                          {new Date(s.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-200">
                          {s.customerName}
                          {s.customerMobile && (
                            <span className="block text-[10px] text-slate-500 font-mono">
                              {s.customerMobile}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-400 max-w-[220px] truncate">
                          {s.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500">
                          ₹{s.costOfGoodsSold?.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-cyan-400">
                          ₹{s.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono">
                            {s.paymentMethod}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.paymentStatus === 'Paid'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {s.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setViewingSale(s)}
                            className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-[11px] text-white transition-colors"
                          >
                            Receipt
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Receipt Modal Preview */}
          {viewingSale && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
              <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4 font-mono text-xs shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-sm">{business?.name}</h3>
                    <p className="text-[10px] text-slate-400">{business?.address}</p>
                    <p className="text-[10px] text-slate-400">GSTIN: {business?.gstin || 'Unregistered'}</p>
                  </div>
                  <button
                    onClick={() => setViewingSale(null)}
                    className="text-slate-400 hover:text-white text-base"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span>Invoice:</span>
                    <span className="text-white font-bold">{viewingSale.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(viewingSale.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span className="text-white">{viewingSale.customerName}</span>
                  </div>
                </div>

                <div className="border-t border-b border-slate-800 py-2 space-y-1.5">
                  {viewingSale.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-slate-300">
                        {i.name} x{i.quantity}
                      </span>
                      <span className="text-white">₹{i.total.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{viewingSale.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {viewingSale.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span>GST:</span>
                      <span>₹{viewingSale.taxAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {viewingSale.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount:</span>
                      <span>-₹{viewingSale.discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-cyan-400 text-sm pt-2 border-t border-slate-800">
                    <span>Total Paid:</span>
                    <span>₹{viewingSale.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs text-white"
                  >
                    Print
                  </button>
                  <button
                    onClick={() => setViewingSale(null)}
                    className="px-4 py-1.5 rounded-lg bg-violet-600 text-xs font-bold text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <QuickPOSModal
        isOpen={isPOSOpen}
        onClose={() => setIsPOSOpen(false)}
        products={products}
        customers={customers}
        businessId={business?.id || 'biz-grocery-demo'}
        onSaleCreated={fetchData}
      />

      <AICommandModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        businessId={business?.id || 'biz-grocery-demo'}
        categoryKey={business?.category || 'grocery'}
        onActionApproved={fetchData}
      />
    </div>
  );
}
