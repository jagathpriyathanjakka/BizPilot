'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  Building2,
  CreditCard,
  Star,
  X,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Supplier, BusinessProfile } from '@/lib/types';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New supplier form
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [mobile, setMobile] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 15 Days');

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (data.business) {
        setBusiness(data.business);
        setSuppliers(data.suppliers || []);
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

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) return;
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business?.id || 'biz-grocery-demo',
          name,
          companyName,
          mobile,
          email,
          gstin,
          paymentTerms,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuppliers((prev) => [data.supplier, ...prev]);
        setIsAddOpen(false);
        setName('');
        setCompanyName('');
        setMobile('+91 ');
        setEmail('');
        setGstin('');
      }
    } catch (err) {
      alert('Failed to add supplier');
    }
  };

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.companyName.toLowerCase().includes(search.toLowerCase()) ||
      s.mobile.includes(search)
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
                <Truck className="h-5 w-5 text-violet-400" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">Suppliers & Vendors</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Maintain distributor contracts, payment terms, and automated restocking purchase orders
              </p>
            </div>

            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-bold text-white shadow-glow transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Add Supplier</span>
            </button>
          </div>

          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by vendor name, company, mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s) => (
              <div
                key={s.id}
                className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm">{s.companyName}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Contact: {s.name}</p>
                    </div>
                    {s.rating && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Star className="h-3 w-3 fill-amber-400" />
                        <span>{s.rating}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-cyan-400 font-mono mt-2">{s.mobile}</p>
                  {s.email && <p className="text-[11px] text-slate-400">{s.email}</p>}
                  {s.gstin && (
                    <p className="text-[10px] text-slate-500 font-mono mt-1">GSTIN: {s.gstin}</p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Terms: {s.paymentTerms}</span>
                  <span className="text-amber-400 font-bold">
                    Owed: ₹{s.balanceOwed?.toLocaleString('en-IN') || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Supplier Modal */}
          {isAddOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
              <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-navy-900 p-6 space-y-4 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white">Add New Supplier</h3>
                  <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleAddSupplier} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-300">Company / Business Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. National Wholesale Distributors"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300">Contact Person Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Harish Mehta"
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
                      placeholder="+91 98210 55443"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300">GSTIN Number</label>
                    <input
                      type="text"
                      placeholder="27AABCN8831Q1ZS"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300">Payment Terms</label>
                    <input
                      type="text"
                      placeholder="Net 15 Days, Immediate UPI, etc."
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
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
                      Save Supplier
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
