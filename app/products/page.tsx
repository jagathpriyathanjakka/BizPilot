'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  Trash2,
  Edit2,
  ArrowUpDown,
  Barcode,
  CheckCircle,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { NewProductModal } from '@/components/NewProductModal';
import { QuickPOSModal } from '@/components/QuickPOSModal';
import { AICommandModal } from '@/components/AICommandModal';
import { Product, BusinessProfile } from '@/lib/types';
import { BUSINESS_CATEGORIES } from '@/lib/categories-config';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'low' | 'out' | 'expiry'>('all');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPOSOpen, setIsPOSOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (data.business) {
        setBusiness(data.business);
        setProducts(data.products || []);
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

  const handleStockAdjust = async (id: string, delta: number) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    const newQty = Math.max(0, prod.quantity + delta);

    // Optimistic UI update
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, quantity: newQty } : p)));

    await fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, quantity: newQty }),
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
  };

  const categoryDef = BUSINESS_CATEGORIES[business?.category || 'grocery'];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase())) ||
      (p.barcode && p.barcode.includes(search));

    if (!matchesSearch) return false;

    if (filterType === 'low') return p.quantity > 0 && p.quantity <= p.minStockLevel;
    if (filterType === 'out') return p.quantity === 0;
    if (filterType === 'expiry') {
      if (!p.expiryDate) return false;
      const sixtyDaysAhead = new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0];
      return p.expiryDate <= sixtyDaysAhead;
    }
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
                <Package className="h-5 w-5 text-violet-400" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  {categoryDef.productTerminology.plural} & Inventory
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Manage stock levels, minimum safe thresholds, barcodes, and business-specific attributes
              </p>
            </div>

            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-bold text-white shadow-glow transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Add {categoryDef.productTerminology.singular}</span>
            </button>
          </div>

          {/* Controls: Search & Stock Status Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${categoryDef.productTerminology.plural.toLowerCase()}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-violet-600 text-white font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All ({products.length})
              </button>
              <button
                onClick={() => setFilterType('low')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  filterType === 'low'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Low Stock
              </button>
              <button
                onClick={() => setFilterType('out')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  filterType === 'out'
                    ? 'bg-rose-500 text-white font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Out of Stock
              </button>
              {categoryDef.features.hasExpiry && (
                <button
                  onClick={() => setFilterType('expiry')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    filterType === 'expiry'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Near Expiry (60d)
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Product / SKU</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Purchase Cost</th>
                    <th className="px-4 py-3">Selling Price</th>
                    <th className="px-4 py-3">Gross Margin</th>
                    <th className="px-4 py-3">In Stock</th>
                    <th className="px-4 py-3">Attributes & Expiry</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-500">
                        No products match your criteria. Click &quot;Add Product&quot; to populate your inventory.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const margin = p.sellingPrice - p.purchasePrice;
                      const marginPercent =
                        p.sellingPrice > 0 ? ((margin / p.sellingPrice) * 100).toFixed(0) : '0';
                      const isLow = p.quantity > 0 && p.quantity <= p.minStockLevel;
                      const isOut = p.quantity === 0;

                      return (
                        <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-bold text-white text-xs">{p.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{p.sku}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-400">
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px]">
                              {p.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-400">
                            ₹{p.purchasePrice.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-cyan-400">
                            ₹{p.sellingPrice.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3 font-mono text-emerald-400 font-semibold">
                            +{marginPercent}% (₹{margin})
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleStockAdjust(p.id, -1)}
                                className="h-5 w-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
                              >
                                -
                              </button>
                              <span
                                className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                                  isOut
                                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                    : isLow
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-slate-800 text-white'
                                }`}
                              >
                                {p.quantity} {p.unit}
                              </span>
                              <button
                                onClick={() => handleStockAdjust(p.id, 1)}
                                className="h-5 w-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[11px] text-slate-400 max-w-[200px] truncate">
                            {p.expiryDate && (
                              <span className="block text-amber-400 font-mono">
                                Exp: {p.expiryDate}
                              </span>
                            )}
                            {p.attributes?.batchNumber && (
                              <span className="block text-slate-500 font-mono">
                                Batch: {p.attributes.batchNumber}
                              </span>
                            )}
                            {p.attributes?.size && (
                              <span className="inline-block mr-1 text-violet-300">
                                {p.attributes.size}
                              </span>
                            )}
                            {p.attributes?.color && (
                              <span className="inline-block text-cyan-300">
                                {p.attributes.color}
                              </span>
                            )}
                            {p.attributes?.serialImei && (
                              <span className="block text-slate-400 font-mono text-[10px]">
                                IMEI: {p.attributes.serialImei}
                              </span>
                            )}
                            {p.attributes?.prescriptionRequired && (
                              <span className="inline-block px-1 rounded bg-rose-500/20 text-rose-300 text-[9px] font-bold">
                                Rx
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
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
        </main>
      </div>

      <NewProductModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        businessId={business?.id || 'biz-grocery-demo'}
        categoryKey={business?.category || 'grocery'}
        onProductAdded={fetchData}
      />

      <QuickPOSModal
        isOpen={isPOSOpen}
        onClose={() => setIsPOSOpen(false)}
        products={products}
        customers={[]}
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
