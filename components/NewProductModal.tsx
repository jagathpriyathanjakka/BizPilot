'use client';

import React, { useState } from 'react';
import { X, Plus, Package, Sparkles } from 'lucide-react';
import { BusinessCategoryKey } from '@/lib/types';
import { BUSINESS_CATEGORIES } from '@/lib/categories-config';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  categoryKey: BusinessCategoryKey;
  onProductAdded: () => void;
}

export const NewProductModal: React.FC<NewProductModalProps> = ({
  isOpen,
  onClose,
  businessId,
  categoryKey,
  onProductAdded,
}) => {
  const categoryDef = BUSINESS_CATEGORIES[categoryKey] || BUSINESS_CATEGORIES.grocery;

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState(categoryDef.subcategories[0] || 'General');
  const [brand, setBrand] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [quantity, setQuantity] = useState('10');
  const [unit, setUnit] = useState(categoryDef.productTerminology.commonUnits[0] || 'piece');
  const [minStockLevel, setMinStockLevel] = useState('5');
  const [expiryDate, setExpiryDate] = useState('');

  // Business-specific attributes
  const [batchNumber, setBatchNumber] = useState('');
  const [genericName, setGenericName] = useState('');
  const [prescriptionRequired, setPrescriptionRequired] = useState(false);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [material, setMaterial] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState('');
  const [serialImei, setSerialImei] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sellingPrice) {
      alert('Please enter product name and selling price');
      return;
    }

    setIsSubmitting(true);
    try {
      const attributes: Record<string, any> = {};
      if (batchNumber) attributes.batchNumber = batchNumber;
      if (genericName) attributes.genericName = genericName;
      if (prescriptionRequired) attributes.prescriptionRequired = prescriptionRequired;
      if (size) attributes.size = size;
      if (color) attributes.color = color;
      if (material) attributes.material = material;
      if (dimensions) attributes.dimensions = dimensions;
      if (warrantyMonths) attributes.warrantyMonths = Number(warrantyMonths);
      if (serialImei) attributes.serialImei = serialImei;

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          name,
          sku: sku || undefined,
          barcode: barcode || undefined,
          category,
          brand: brand || undefined,
          purchasePrice: Number(purchasePrice) || 0,
          sellingPrice: Number(sellingPrice),
          quantity: Number(quantity) || 0,
          unit,
          minStockLevel: Number(minStockLevel) || 5,
          expiryDate: expiryDate || undefined,
          attributes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onProductAdded();
        onClose();
      } else {
        alert(data.error || 'Failed to add product');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-navy-900 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Add {categoryDef.productTerminology.singular}</h2>
              <p className="text-xs text-slate-400">Customized fields for {categoryDef.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Row 1: Name and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300">Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Basmati Rice 5kg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Subcategory</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:border-violet-500"
              >
                {categoryDef.subcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: SKU, Barcode, Brand */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300">SKU (Auto or Custom)</label>
              <input
                type="text"
                placeholder="Auto-generated"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Barcode / UPC</label>
              <input
                type="text"
                placeholder="Scan or enter"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Brand / Maker</label>
              <input
                type="text"
                placeholder="e.g. Tata, Nike"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* Row 3: Pricing and Stock */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300">Purchase Cost (₹)</label>
              <input
                type="number"
                placeholder="0.00"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Selling Price (₹) *</label>
              <input
                type="number"
                required
                placeholder="0.00"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Stock Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:border-violet-500"
              >
                {categoryDef.productTerminology.commonUnits.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Business-Specific Dynamic Fields */}
          <div className="pt-2 border-t border-slate-800/80">
            <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-2">
              {categoryDef.name} Specific Fields
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* Expiry Date (Grocery, Medical, Agro, Food) */}
              {categoryDef.features.hasExpiry && (
                <div>
                  <label className="text-xs font-medium text-slate-300">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              )}

              {/* Batch Number */}
              {categoryDef.features.hasBatchNumbers && (
                <div>
                  <label className="text-xs font-medium text-slate-300">Batch Number</label>
                  <input
                    type="text"
                    placeholder="e.g. BCH-2024-09"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              )}

              {/* Medical Specifics */}
              {categoryKey === 'medical' && (
                <>
                  <div>
                    <label className="text-xs font-medium text-slate-300">Generic / Salt Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Paracetamol 650mg"
                      value={genericName}
                      onChange={(e) => setGenericName(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <input
                      type="checkbox"
                      id="rxReq"
                      checked={prescriptionRequired}
                      onChange={(e) => setPrescriptionRequired(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-950 text-violet-600 focus:ring-violet-500"
                    />
                    <label htmlFor="rxReq" className="text-xs text-slate-300 cursor-pointer">
                      Schedule H / Prescription Required
                    </label>
                  </div>
                </>
              )}

              {/* Clothing & Footwear Variants (Size, Color) */}
              {(categoryKey === 'clothing' || categoryKey === 'footwear') && (
                <>
                  <div>
                    <label className="text-xs font-medium text-slate-300">
                      {categoryKey === 'footwear' ? 'Shoe Size (UK/US)' : 'Size (S, M, L, XL, 32)'}
                    </label>
                    <input
                      type="text"
                      placeholder={categoryKey === 'footwear' ? 'e.g. UK 9' : 'e.g. Size 40 (M)'}
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300">Color Variant</label>
                    <input
                      type="text"
                      placeholder="e.g. Navy Blue, Tan Brown"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </>
              )}

              {/* Electronics IMEI / Warranty */}
              {categoryKey === 'electronics' && (
                <>
                  <div>
                    <label className="text-xs font-medium text-slate-300">IMEI or Serial Number</label>
                    <input
                      type="text"
                      placeholder="15-digit IMEI or S/N"
                      value={serialImei}
                      onChange={(e) => setSerialImei(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300">Warranty (Months)</label>
                    <input
                      type="number"
                      placeholder="e.g. 12"
                      value={warrantyMonths}
                      onChange={(e) => setWarrantyMonths(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </>
              )}

              {/* Furniture Dimensions */}
              {categoryKey === 'furniture' && (
                <>
                  <div>
                    <label className="text-xs font-medium text-slate-300">Dimensions (L x W x H)</label>
                    <input
                      type="text"
                      placeholder="e.g. 6ft x 3ft x 30in"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300">Material & Polish</label>
                    <input
                      type="text"
                      placeholder="e.g. Sheesham Wood, Honey Polish"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white shadow-glow transition-all active:scale-95 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>{isSubmitting ? 'Saving...' : `Save ${categoryDef.productTerminology.singular}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
