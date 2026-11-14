'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingDown,
  Plus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  CreditCard,
  Building2,
  X,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Expense, BusinessProfile } from '@/lib/types';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New expense form
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Expense['category']>('Utilities');
  const [paymentMethod, setPaymentMethod] = useState<Expense['paymentMethod']>('UPI');
  const [paidTo, setPaidTo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (data.business) {
        setBusiness(data.business);
      }
      const eRes = await fetch('/api/expenses');
      const eData = await eRes.json();
      if (eData.expenses) {
        setExpenses(eData.expenses);
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

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business?.id || 'biz-grocery-demo',
          description,
          amount: Number(amount),
          category,
          paymentMethod,
          paidTo,
          date,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setExpenses((prev) => [data.expense, ...prev]);
        setIsAddOpen(false);
        setDescription('');
        setAmount('');
        setPaidTo('');
      }
    } catch (err) {
      alert('Failed to log expense');
    }
  };

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      <Navbar currentBusiness={business || undefined} />

      <div className="flex-1 flex">
        <Sidebar currentBusiness={business || undefined} className="hidden md:flex" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-2xl p-6">
            <div>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-rose-400" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">Operating Expenses</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Track overhead, rent, wages, logistics, and store maintenance for exact net profit calculation
              </p>
            </div>

            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-bold text-white shadow-glow transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Record Expense</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel rounded-2xl p-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Operating Expenses
              </span>
              <h3 className="text-2xl font-extrabold text-rose-400 mt-1">
                ₹{totalExpense.toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">{expenses.length} recorded payments</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Paid To</th>
                    <th className="px-4 py-3">Payment Method</th>
                    <th className="px-4 py-3">Recorded By</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-400">{e.date}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-semibold text-violet-300">
                          {e.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">{e.description}</td>
                      <td className="px-4 py-3 text-slate-400">{e.paidTo || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono">
                          {e.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{e.recordedBy}</td>
                      <td className="px-4 py-3 font-mono font-bold text-rose-400 text-right">
                        -₹{e.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Expense Modal */}
          {isAddOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
              <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-navy-900 p-6 space-y-4 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white">Record Operating Expense</h3>
                  <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-300">Expense Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-violet-500"
                    >
                      <option value="Rent">Rent</option>
                      <option value="Utilities">Utilities (Electricity, Water, Internet)</option>
                      <option value="Salaries">Staff Salaries & Wages</option>
                      <option value="Raw Materials & Supplies">Raw Materials & Supplies</option>
                      <option value="Logistics & Delivery">Logistics & Delivery</option>
                      <option value="Maintenance">Store Maintenance & Repairs</option>
                      <option value="Marketing">Marketing & Advertising</option>
                      <option value="Taxes & Licenses">Taxes & Licenses</option>
                      <option value="Other">Other Miscellaneous</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300">Description *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Monthly Electricity Bill"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-300">Amount (₹) *</label>
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-300">Date</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-300">Paid To (Vendor/Entity)</label>
                      <input
                        type="text"
                        placeholder="e.g. Mahavitaran Discom"
                        value={paidTo}
                        onChange={(e) => setPaidTo(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-300">Payment Mode</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-violet-500"
                      >
                        <option value="UPI">UPI</option>
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Card">Card</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-xs text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white shadow-glow"
                    >
                      Save Expense
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
