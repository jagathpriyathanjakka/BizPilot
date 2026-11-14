'use client';

import React, { useState } from 'react';
import {
  X,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  QrCode,
  CreditCard,
  Banknote,
  Receipt,
  Printer,
  Sparkles,
} from 'lucide-react';
import { Product, Customer } from '@/lib/types';

interface QuickPOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  customers: Customer[];
  businessId: string;
  currency?: string;
  onSaleCreated: () => void;
}

interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export const QuickPOSModal: React.FC<QuickPOSModalProps> = ({
  isOpen,
  onClose,
  products,
  customers,
  businessId,
  currency = '₹',
  onSaleCreated,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerMobile, setCustomerMobile] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [taxRate, setTaxRate] = useState<number>(5);
  const [orderDiscount, setOrderDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Pending'>('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSale, setCompletedSale] = useState<any>(null);

  if (!isOpen) return null;

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search))
  );

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, unitPrice: product.sellingPrice, discount: 0 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity - item.discount, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const grandTotal = Math.max(0, subtotal + taxAmount - orderDiscount);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          customerId: selectedCustomer || undefined,
          customerName: customerName || 'Walk-in Customer',
          customerMobile: customerMobile || undefined,
          items: cart.map((c) => ({
            productId: c.product.id,
            name: c.product.name,
            sku: c.product.sku,
            quantity: c.quantity,
            unitPrice: c.unitPrice,
            purchaseCost: c.product.purchasePrice,
            discount: c.discount,
          })),
          discountAmount: orderDiscount,
          taxRate,
          paymentMethod,
          paymentStatus: paymentMethod === 'Pending' ? 'Pending' : 'Paid',
          amountReceived: paymentMethod === 'Pending' ? 0 : grandTotal,
          staffName: 'Sunil Kumar (Owner)',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCompletedSale(data.sale);
        onSaleCreated();
      } else {
        alert(data.error || 'Failed to complete sale');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAll = () => {
    setCart([]);
    setCompletedSale(null);
    setSearch('');
    setSelectedCustomer('');
    setCustomerName('Walk-in Customer');
    setCustomerMobile('');
    setOrderDiscount(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-800 bg-navy-900 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-navy-950/60">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center">
              <Receipt className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Quick POS Billing & Invoice</h2>
              <p className="text-xs text-slate-400">Deterministic inventory deduction & instant tax calculation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content: If Completed, Show Invoice Preview */}
        {completedSale ? (
          <div className="p-8 text-center flex-1 overflow-y-auto">
            <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Sale Recorded Successfully!</h3>
            <p className="text-sm text-slate-400 mt-1">
              Invoice #{completedSale.invoiceNumber} • Paid via {completedSale.paymentMethod}
            </p>

            <div className="max-w-md mx-auto mt-6 p-4 rounded-xl border border-slate-800 bg-slate-950/80 text-left font-mono text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Customer:</span>
                <span className="text-white font-semibold">{completedSale.customerName}</span>
              </div>
              <div className="space-y-1 py-1">
                {completedSale.items.map((i: any, idx: number) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-slate-300">
                      {i.name} x{i.quantity}
                    </span>
                    <span className="text-slate-200">
                      {currency}
                      {i.total.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-sm">
                <span className="text-cyan-400">Total Paid:</span>
                <span className="text-cyan-400">
                  {currency}
                  {completedSale.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-3 mt-8">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
              >
                <Printer className="h-4 w-4" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={resetAll}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white shadow-glow transition-colors"
              >
                <span>New Bill</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
            {/* Left: Product Selector */}
            <div className="md:col-span-7 p-4 border-r border-slate-800 flex flex-col overflow-hidden">
              {/* Search bar */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products by name, SKU, or barcode..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-950/80 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Product Grid */}
              <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 gap-2 max-h-[420px]">
                {filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-violet-500/40 hover:bg-slate-800/40 text-left transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-200 line-clamp-1 group-hover:text-violet-300">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{p.sku}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-400">
                        {currency}
                        {p.sellingPrice.toLocaleString('en-IN')}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          p.quantity <= p.minStockLevel
                            ? 'bg-rose-500/10 text-rose-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {p.quantity} {p.unit}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Cart & Checkout */}
            <div className="md:col-span-5 p-4 flex flex-col justify-between bg-slate-950/30 overflow-y-auto">
              <div className="space-y-4">
                {/* Customer Details */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Customer Info
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Customer Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                    <input
                      type="text"
                      placeholder="Mobile No."
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                {/* Cart Items List */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Bill Items ({cart.length})
                    </span>
                    {cart.length > 0 && (
                      <button
                        onClick={() => setCart([])}
                        className="text-[10px] text-rose-400 hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {cart.length === 0 ? (
                      <div className="text-center py-8 text-xs text-slate-500">
                        Click on products to add to current bill
                      </div>
                    ) : (
                      cart.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center justify-between p-2 rounded-lg border border-slate-800/80 bg-slate-900/60 text-xs"
                        >
                          <div className="truncate max-w-[120px]">
                            <p className="font-medium text-slate-200 truncate">{item.product.name}</p>
                            <p className="text-[10px] text-cyan-400">
                              {currency}
                              {item.unitPrice}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="h-5 w-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
                            >
                              -
                            </button>
                            <span className="w-5 text-center font-bold text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, 1)}
                              className="h-5 w-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="ml-1 text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Calculation breakdown */}
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span>
                      {currency}
                      {subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Tax (GST %)</span>
                    <select
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-white"
                    >
                      <option value={0}>0% (Exempt)</option>
                      <option value={5}>5% GST</option>
                      <option value={12}>12% GST</option>
                      <option value={18}>18% GST</option>
                    </select>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-white pt-2 border-t border-slate-800">
                    <span>Grand Total:</span>
                    <span className="text-cyan-400">
                      {currency}
                      {grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Payment Mode
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['UPI', 'Cash', 'Card', 'Pending'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`py-1.5 rounded-lg text-xs font-medium border text-center transition-colors ${
                          paymentMethod === method
                            ? 'bg-violet-600/30 border-violet-500 text-white font-bold'
                            : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="mt-4">
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs shadow-glow transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>
                    {isSubmitting
                      ? 'Generating Bill...'
                      : `Complete Sale (${currency}${grandTotal.toLocaleString('en-IN')})`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
