import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter, AlertTriangle, Trash2, Edit } from 'lucide-react';
import { api } from '../api';

export default function ProductsPage({ business, onOpenAddProduct }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.getProducts(business?.id, {
        search: search.trim() || undefined,
        lowStock: lowStockOnly ? 'true' : undefined,
      });
      setProducts(res.products || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [business?.id, search, lowStockOnly]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this item?')) return;
    try {
      await api.deleteProduct(id);
      loadProducts();
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const currency = business?.currency === 'INR' ? '₹' : (business?.currency || '₹');

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl glass-panel border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-violet-400" />
            <span>Product Catalog & Stock Matrix</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time quantity tracking, reorder levels, batch codes & attributes
          </p>
        </div>

        <button
          onClick={onOpenAddProduct}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-glow transition-all active:scale-95 w-fit"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search items by name, barcode or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <button
          onClick={() => setLowStockOnly(!lowStockOnly)}
          className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
            lowStockOnly
              ? 'bg-rose-500/20 border-rose-500 text-rose-300'
              : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Low Stock Alerts</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="p-5 rounded-3xl glass-panel border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Product Name</th>
                <th className="p-3">SKU / Barcode</th>
                <th className="p-3">Category</th>
                <th className="p-3">Stock Quantity</th>
                <th className="p-3">Selling Price</th>
                <th className="p-3">Purchase Cost</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLow = p.quantity <= (p.minStockLevel || 5);
                  return (
                    <tr key={p.id} className="hover:bg-slate-900/40">
                      <td className="p-3 font-semibold text-white">
                        {p.name}
                        {p.expiryDate && (
                          <span className="block text-[10px] text-slate-400">Exp: {p.expiryDate}</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-400">
                        {p.sku || '-'}
                        {p.barcode && <span className="block text-[10px] text-slate-500">{p.barcode}</span>}
                      </td>
                      <td className="p-3 text-slate-300">{p.category}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isLow
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-500/10 text-emerald-400'
                          }`}
                        >
                          {p.quantity} {p.unit}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-white">{currency}{p.sellingPrice}</td>
                      <td className="p-3 text-slate-400">{currency}{p.purchasePrice || 0}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
