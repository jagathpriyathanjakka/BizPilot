import React, { useState } from 'react';
import { X, Package, Plus } from 'lucide-react';
import { api } from '../api';

export const NewProductModal = ({ isOpen, onClose, businessId, currency = '₹', onProductCreated }) => {
  const [name, setName] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [quantity, setQuantity] = useState('10');
  const [unit, setUnit] = useState('piece');
  const [category, setCategory] = useState('General');
  const [sku, setSku] = useState('');
  const [minStockLevel, setMinStockLevel] = useState('5');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !sellingPrice) return;
    setIsSubmitting(true);
    try {
      await api.createProduct({
        businessId,
        name,
        sellingPrice: parseFloat(sellingPrice),
        purchasePrice: parseFloat(purchasePrice) || 0,
        quantity: parseFloat(quantity) || 0,
        unit,
        category,
        sku: sku.trim() || undefined,
        minStockLevel: parseFloat(minStockLevel) || 5,
      });
      onProductCreated?.();
      onClose();
    } catch (err) {
      alert(`Error creating item: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-700/80 bg-[#070B14]">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Add New Product / Inventory Item</h2>
              <p className="text-xs text-slate-400">Save to catalog with automatic reorder threshold</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Product Name *</label>
            <input
              required
              type="text"
              placeholder="e.g. Basmati Rice 5kg or Copper Wire 90m"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Selling Price ({currency}) *</label>
              <input
                required
                type="number"
                step="any"
                placeholder="0.00"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Purchase / Cost Price ({currency})</label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Initial Stock</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
              >
                <option value="piece">Piece</option>
                <option value="packet">Packet</option>
                <option value="kg">Kg</option>
                <option value="litre">Litre</option>
                <option value="box">Box</option>
                <option value="strip">Strip</option>
                <option value="roll">Roll</option>
                <option value="set">Set</option>
                <option value="pair">Pair</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Min Safe Level</label>
              <input
                type="number"
                value={minStockLevel}
                onChange={(e) => setMinStockLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Category</label>
              <input
                type="text"
                placeholder="e.g. Grains, Hardware"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Custom SKU (Optional)</label>
              <input
                type="text"
                placeholder="Auto-generated if blank"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-glow flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Saving...' : 'Save Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProductModal;
