import React, { useState, useEffect } from 'react';
import { Truck, Plus, Phone, Star } from 'lucide-react';
import { api } from '../api';

export default function SuppliersPage({ business }) {
  const [suppliers, setSuppliers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [mobile, setMobile] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30 Days');

  const loadSuppliers = async () => {
    try {
      const res = await api.getSuppliers(business?.id);
      setSuppliers(res.suppliers || []);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [business?.id]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name && !companyName) return;
    try {
      await api.createSupplier({ businessId: business?.id, name, companyName, mobile, paymentTerms });
      setName('');
      setCompanyName('');
      setMobile('');
      setShowAddModal(false);
      loadSuppliers();
    } catch (err) {
      alert(`Add supplier error: ${err.message}`);
    }
  };

  const currency = business?.currency === 'INR' ? '₹' : (business?.currency || '₹');

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl glass-panel border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Truck className="h-5 w-5 text-cyan-400" />
            <span>Suppliers & Wholesale Vendors</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Procurement terms, credit lines, payment terms, and vendor performance ratings
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-glow transition-all active:scale-95 w-fit"
        >
          <Plus className="h-4 w-4" />
          <span>Add Supplier</span>
        </button>
      </div>

      <div className="p-5 rounded-3xl glass-panel border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Vendor Company</th>
                <th className="p-3">Contact Person</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Payment Terms</th>
                <th className="p-3">Payable Balance</th>
                <th className="p-3">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-900/40">
                  <td className="p-3 font-semibold text-white">{s.companyName}</td>
                  <td className="p-3 text-slate-300">{s.name}</td>
                  <td className="p-3 text-slate-400">{s.mobile || '-'}</td>
                  <td className="p-3 text-cyan-400">{s.paymentTerms}</td>
                  <td className="p-3 font-bold text-amber-400">{currency}{s.balanceOwed?.toLocaleString('en-IN') || 0}</td>
                  <td className="p-3 text-yellow-400 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400" />
                    <span>{s.rating || 5.0}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form onSubmit={handleAdd} className="glass-panel w-full max-w-sm rounded-3xl p-5 border border-slate-800 bg-[#070B14] space-y-3 text-xs">
            <h3 className="font-bold text-white text-sm">Add New Supplier</h3>
            <div>
              <label className="text-slate-400 block mb-1">Company Name *</label>
              <input required type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Contact Person</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Phone</label>
              <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
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
