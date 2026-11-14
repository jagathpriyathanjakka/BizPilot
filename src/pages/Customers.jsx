import React, { useState, useEffect } from 'react';
import { Users, Plus, Phone, Mail, DollarSign } from 'lucide-react';
import { api } from '../api';

export default function CustomersPage({ business }) {
  const [customers, setCustomers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [notes, setNotes] = useState('');

  const loadCustomers = async () => {
    try {
      const res = await api.getCustomers(business?.id);
      setCustomers(res.customers || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [business?.id]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name) return;
    try {
      await api.createCustomer({ businessId: business?.id, name, mobile, notes });
      setName('');
      setMobile('');
      setNotes('');
      setShowAddModal(false);
      loadCustomers();
    } catch (err) {
      alert(`Add customer error: ${err.message}`);
    }
  };

  const currency = business?.currency === 'INR' ? '₹' : (business?.currency || '₹');

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl glass-panel border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400" />
            <span>Customers CRM & Credit Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track customer lifetime value, transaction history, and khata credit balances
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-glow transition-all active:scale-95 w-fit"
        >
          <Plus className="h-4 w-4" />
          <span>Add Customer</span>
        </button>
      </div>

      <div className="p-5 rounded-3xl glass-panel border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Customer Name</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Lifetime Spent</th>
                <th className="p-3">Outstanding Due (Khata)</th>
                <th className="p-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/40">
                  <td className="p-3 font-semibold text-white">{c.name}</td>
                  <td className="p-3 text-slate-400">{c.mobile || '-'}</td>
                  <td className="p-3 font-bold text-white">{currency}{c.totalSpent?.toLocaleString('en-IN') || 0}</td>
                  <td className="p-3">
                    <span
                      className={`font-semibold ${
                        c.outstandingBalance > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {currency}{c.outstandingBalance?.toLocaleString('en-IN') || 0}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{c.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form onSubmit={handleAdd} className="glass-panel w-full max-w-sm rounded-3xl p-5 border border-slate-800 bg-[#070B14] space-y-3 text-xs">
            <h3 className="font-bold text-white text-sm">Add New Customer</h3>
            <div>
              <label className="text-slate-400 block mb-1">Name *</label>
              <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Mobile</label>
              <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Notes</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">Cancel</button>
              <button type="submit" className="px-4 py-1.5 rounded-lg bg-violet-600 text-white font-bold">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
