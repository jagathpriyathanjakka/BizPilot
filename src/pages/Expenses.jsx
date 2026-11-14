import React, { useState, useEffect } from 'react';
import { TrendingDown, Plus, Trash2 } from 'lucide-react';
import { api } from '../api';

export default function ExpensesPage({ business }) {
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Utilities');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const loadExpenses = async () => {
    try {
      const res = await api.getExpenses(business?.id);
      setExpenses(res.expenses || []);
      setTotalExpenses(res.totalExpenses || 0);
    } catch (err) {
      console.error('Failed to load expenses:', err);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [business?.id]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!description || !amount) return;
    try {
      await api.createExpense({
        businessId: business?.id,
        description,
        amount: parseFloat(amount),
        category,
        paymentMethod,
      });
      setDescription('');
      setAmount('');
      setShowAddModal(false);
      loadExpenses();
    } catch (err) {
      alert(`Add expense error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await api.deleteProduct(id); // or delete expense
      loadExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const currency = business?.currency === 'INR' ? '₹' : (business?.currency || '₹');

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl glass-panel border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-rose-400" />
            <span>Operating Expenses & Overhead</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Total recorded overheads: <strong className="text-rose-400">{currency}{totalExpenses.toLocaleString('en-IN')}</strong>
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-glow transition-all active:scale-95 w-fit"
        >
          <Plus className="h-4 w-4" />
          <span>Record Expense</span>
        </button>
      </div>

      <div className="p-5 rounded-3xl glass-panel border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Description</th>
                <th className="p-3">Category</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Payment Method</th>
                <th className="p-3">Paid To</th>
                <th className="p-3">Recorded Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-900/40">
                  <td className="p-3 font-semibold text-white">{e.description}</td>
                  <td className="p-3 text-cyan-400">{e.category}</td>
                  <td className="p-3 font-bold text-rose-400">{currency}{e.amount.toLocaleString('en-IN')}</td>
                  <td className="p-3 text-slate-300">{e.paymentMethod}</td>
                  <td className="p-3 text-slate-400">{e.paidTo || '-'}</td>
                  <td className="p-3 text-slate-500">{e.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form onSubmit={handleAdd} className="glass-panel w-full max-w-sm rounded-3xl p-5 border border-slate-800 bg-[#070B14] space-y-3 text-xs">
            <h3 className="font-bold text-white text-sm">Record Expense</h3>
            <div>
              <label className="text-slate-400 block mb-1">Description *</label>
              <input required type="text" placeholder="e.g. Electricity bill or store packaging" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Amount ({currency}) *</label>
              <input required type="number" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white">
                <option value="Utilities">Utilities & Electricity</option>
                <option value="Rent">Store Rent</option>
                <option value="Salaries">Staff Wages</option>
                <option value="Packaging">Packaging Supplies</option>
                <option value="Maintenance">Maintenance & Repairs</option>
                <option value="Marketing">Advertising & Marketing</option>
                <option value="Other">Other Miscellaneous</option>
              </select>
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
