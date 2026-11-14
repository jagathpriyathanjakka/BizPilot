'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  CheckCircle,
  MessageSquare,
  X,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Customer, BusinessProfile } from '@/lib/types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New customer form
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (data.business) {
        setBusiness(data.business);
        setCustomers(data.customers || []);
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

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) return;
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business?.id || 'biz-grocery-demo',
          name,
          mobile,
          email,
          address,
          notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCustomers((prev) => [data.customer, ...prev]);
        setIsAddOpen(false);
        setName('');
        setMobile('+91 ');
        setEmail('');
        setAddress('');
        setNotes('');
      }
    } catch (err) {
      alert('Failed to add customer');
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      <Navbar currentBusiness={business || undefined} />

      <div className="flex-1 flex">
        <Sidebar currentBusiness={business || undefined} className="hidden md:flex" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-2xl p-6">
            <div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-violet-400" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">Customers & CRM</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Maintain customer profiles, lifetime spending, and outstanding store credit ledger
              </p>
            </div>

            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-bold text-white shadow-glow transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Add Customer</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm">{c.name}</h3>
                      <p className="text-xs text-cyan-400 font-mono mt-0.5">{c.mobile}</p>
                    </div>
                    {c.outstandingBalance > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Due: ₹{c.outstandingBalance.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  {c.address && (
                    <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5 line-clamp-1">
                      <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                      <span>{c.address}</span>
                    </p>
                  )}

                  {c.notes && (
                    <p className="text-[11px] text-slate-400 mt-1 italic line-clamp-2">
                      &quot;{c.notes}&quot;
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Lifetime Spent:</span>
                  <span className="text-white font-bold">₹{c.totalSpent.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Customer Modal */}
          {isAddOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
              <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-navy-900 p-6 space-y-4 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white">Add New Customer</h3>
                  <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleAddCustomer} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-300">Customer Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300">Mobile Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98201 12345"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300">Email Address (Optional)</label>
                    <input
                      type="email"
                      placeholder="customer@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300">Address / Delivery Location</label>
                    <input
                      type="text"
                      placeholder="Flat 201, Shanti Apts, Mumbai"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300">Notes / Preferences</label>
                    <input
                      type="text"
                      placeholder="Prefers UPI, calls before delivery"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-violet-500"
                    />
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
                      Save Customer
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
