import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Search, Eye, Download, Printer, CheckCircle } from 'lucide-react';
import { api } from '../api';

export default function SalesPage({ business, onOpenQuickSale }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const loadSales = async () => {
    try {
      setLoading(true);
      const res = await api.getSales(business?.id);
      setSales(res.sales || []);
    } catch (err) {
      console.error('Failed to load sales:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, [business?.id]);

  const currency = business?.currency === 'INR' ? '₹' : (business?.currency || '₹');

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl glass-panel border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Receipt className="h-5 w-5 text-cyan-400" />
            <span>Sales History & Invoicing Records</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic bill totals, payment reconciliations, and customer ledger adjustments
          </p>
        </div>

        <button
          onClick={onOpenQuickSale}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-glow transition-all active:scale-95 w-fit"
        >
          <Plus className="h-4 w-4" />
          <span>New Sale / POS Bill</span>
        </button>
      </div>

      <div className="p-5 rounded-3xl glass-panel border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">COGS</th>
                <th className="p-3">Gross Profit</th>
                <th className="p-3">Payment Mode</th>
                <th className="p-3">Cashier</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-500">
                    No sales recorded yet. Use the Quick POS button above to record your first checkout.
                  </td>
                </tr>
              ) : (
                sales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-mono font-bold text-cyan-400">{s.invoiceNumber}</td>
                    <td className="p-3 font-medium text-white">
                      {s.customerName}
                      {s.customerMobile && <span className="block text-[10px] text-slate-500">{s.customerMobile}</span>}
                    </td>
                    <td className="p-3 font-bold text-emerald-400">{currency}{s.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-slate-400">{currency}{s.costOfGoodsSold.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-semibold text-violet-400">{currency}{s.grossProfit.toLocaleString('en-IN')}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{s.staffName || 'Owner'}</td>
                    <td className="p-3 text-slate-500">{new Date(s.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedInvoice(s)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-800 bg-[#070B14] space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-sm">Invoice #{selectedInvoice.invoiceNumber}</h3>
                <p className="text-[10px] text-slate-400">{new Date(selectedInvoice.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-1 text-slate-300">
              <p><strong>Customer:</strong> {selectedInvoice.customerName}</p>
              <p><strong>Payment Method:</strong> {selectedInvoice.paymentMethod}</p>
            </div>

            <div className="border border-slate-800 rounded-xl p-3 bg-slate-900/60 max-h-40 overflow-y-auto space-y-1.5">
              {selectedInvoice.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span className="text-white">{item.name} (x{item.quantity})</span>
                  <span className="text-slate-300">{currency}{item.lineTotal || (item.quantity * item.unitPrice)}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>{currency}{selectedInvoice.subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tax</span>
                <span>{currency}{selectedInvoice.taxAmount}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-slate-800">
                <span>Total Amount</span>
                <span className="text-cyan-400">{currency}{selectedInvoice.totalAmount}</span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold flex items-center justify-center gap-1.5"
            >
              <Printer className="h-4 w-4" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
