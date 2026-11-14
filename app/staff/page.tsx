'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Shield,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  X,
  Lock,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { StaffMember, UserRole, BusinessProfile } from '@/lib/types';

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New staff form
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('cashier');
  const [salary, setSalary] = useState('');

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (data.business) {
        setBusiness(data.business);
      }
      const sRes = await fetch('/api/staff');
      const sData = await sRes.json();
      if (sData.staff) {
        setStaff(sData.staff);
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

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) return;
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business?.id || 'biz-grocery-demo',
          name,
          mobile,
          email,
          role,
          salary: salary ? Number(salary) : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStaff((prev) => [data.staff, ...prev]);
        setIsAddOpen(false);
        setName('');
        setMobile('+91 ');
        setEmail('');
        setSalary('');
      }
    } catch (err) {
      alert('Failed to add staff');
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      <Navbar currentBusiness={business || undefined} />

      <div className="flex-1 flex">
        <Sidebar currentBusiness={business || undefined} className="hidden md:flex" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-2xl p-6">
            <div>
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-violet-400" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">Staff & Role Permissions</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Configure role-based access control (RBAC), cashier permissions, sales activity, and wages
              </p>
            </div>

            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-bold text-white shadow-glow transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Add Staff Member</span>
            </button>
          </div>

          {/* Staff Roster Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map((st) => (
              <div
                key={st.id}
                className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm">{st.name}</h3>
                      <p className="text-xs text-cyan-400 font-mono mt-0.5">{st.mobile}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      {st.role}
                    </span>
                  </div>

                  {st.salary && (
                    <p className="text-xs text-slate-300 mt-2 font-mono">
                      Salary: ₹{st.salary.toLocaleString('en-IN')}/mo
                    </p>
                  )}

                  {/* Permissions matrix */}
                  <div className="mt-3 p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-[10px] space-y-1">
                    <p className="font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Assigned Capabilities:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {st.permissions.canBill && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          POS Billing
                        </span>
                      )}
                      {st.permissions.canManageInventory && (
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          Manage Stock
                        </span>
                      )}
                      {st.permissions.canViewReports && (
                        <span className="px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                          View Reports
                        </span>
                      )}
                      {st.permissions.canApproveActions && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          Approve POs
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Recorded Sales:</span>
                  <span className="text-white font-bold">{st.salesCount} bills</span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Staff Modal */}
          {isAddOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
              <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-navy-900 p-6 space-y-4 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white">Add Staff Member</h3>
                  <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleAddStaff} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-300">Staff Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Manoj Verma"
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
                      placeholder="+91 98210 99887"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300">Assigned Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-violet-500"
                    >
                      <option value="cashier">Cashier (Bill Creation & Receipts)</option>
                      <option value="sales_staff">Sales Staff (Assisted Billing)</option>
                      <option value="inventory_manager">Inventory Manager (Stock In / Out)</option>
                      <option value="manager">Manager (Reports & Floor Operations)</option>
                      <option value="admin">Admin (Full System Access)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300">Monthly Salary (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 16500"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono focus:outline-none focus:border-violet-500"
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
                      Save Staff
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
