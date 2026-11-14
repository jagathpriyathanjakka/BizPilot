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
import { api } from '../api';

export const QuickPOSModal = ({
  isOpen,
  onClose,
  products = [],
  customers = [],
  businessId,
  currency = '₹',
  onSaleCreated,
}) => {
  const [search, setSearch] = useState('');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerMobile, setCustomerMobile] = useState('');
  const [cart, setCart] = useState([]);
  const [taxRate, setTaxRate] = useState(5);
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);

  if (!isOpen) return null;

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
      (p.barcode && p.barcode.includes(search))
  );

  const addToCart = (product) => {
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

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeItem = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice - item.discount,
    0
  );
  const taxAmount = Math.round(((subtotal - orderDiscount) * (taxRate / 100)) * 100) / 100;
  const grandTotal = Math.max(0, Math.round((subtotal - orderDiscount + taxAmount) * 100) / 100);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const payload = {
        businessId,
        customerName: customerName.trim() || 'Walk-in Customer',
        customerMobile: customerMobile.trim() || undefined,
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          purchaseCost: item.product.purchasePrice || 0,
          discount: item.discount,
        })),
        discountAmount: orderDiscount,
        taxRate,
        paymentMethod,
        amountReceived: grandTotal,
      };

      const res = await api.createSale(payload);
      setCompletedSale(res.invoice);
      onSaleCreated?.();
    } catch (err) {
      alert(`Checkout failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setCart([]);
    setCompletedSale(null);
    setSearch('');
    setOrderDiscount(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-4xl max-h-[92vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-700/80 bg-[#070B14]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Quick POS & Smart Billing
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Instant Checkout
                </span>
              </h2>
              <p className="text-xs text-slate-400">Fast barcode lookup, auto-inventory deduction, and UPI QR</p>
            </div>
          </div>
          <button
            onClick={resetModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        {completedSale ? (
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-4 overflow-y-auto">
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-bounce">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold text-white">Payment Received & Bill Generated!</h3>
            <p className="text-sm text-slate-300 max-w-md">
              Invoice <span className="font-mono font-bold text-cyan-400">{completedSale.invoiceNumber}</span> has been saved. Inventory updated in real-time.
            </p>

            <div className="w-full max-w-md p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Customer</span>
                <span className="text-white font-medium">{completedSale.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Items Count</span>
                <span className="text-white font-medium">{completedSale.items.length} item(s)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Payment Mode</span>
                <span className="text-cyan-400 font-semibold">{completedSale.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800 text-sm font-bold">
                <span className="text-white">Amount Paid</span>
                <span className="text-emerald-400">{currency}{completedSale.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all"
              >
                <Printer className="h-4 w-4" />
                <span>Print Thermal Receipt</span>
              </button>
              <button
                onClick={() => {
                  setCompletedSale(null);
                  setCart([]);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-glow transition-all"
              >
                <Sparkles className="h-4 w-4" />
                <span>Next Customer Bill</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {/* Left Col: Product Catalog */}
            <div className="md:col-span-7 p-4 sm:p-5 flex flex-col gap-3 overflow-hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search item name, SKU, or scan barcode..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[340px] md:max-h-[480px]">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => addToCart(prod)}
                    className="p-2.5 rounded-xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-850 hover:border-violet-500/40 cursor-pointer flex items-center justify-between transition-all group"
                  >
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {prod.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                        <span className="font-mono">{prod.sku}</span>
                        <span>•</span>
                        <span>Stock: {prod.quantity} {prod.unit}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-emerald-400">
                        {currency}{prod.sellingPrice}
                      </span>
                      <button className="h-7 w-7 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center hover:bg-violet-600 hover:text-white transition-colors">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: Bill Breakdown */}
            <div className="md:col-span-5 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto bg-slate-950/40">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400">Customer Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400">Mobile (Optional)</label>
                    <input
                      type="text"
                      placeholder="+91..."
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                    />
                  </div>
                </div>

                {/* Cart Items List */}
                <div className="border border-slate-800 rounded-xl p-2 bg-slate-900/60 max-h-48 overflow-y-auto space-y-1.5 text-xs">
                  {cart.length === 0 ? (
                    <p className="text-center py-6 text-slate-500">Cart is empty. Tap items to add.</p>
                  ) : (
                    cart.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
                        <div className="max-w-[130px] truncate">
                          <p className="font-semibold text-white truncate">{item.product.name}</p>
                          <p className="text-[10px] text-slate-400">{currency}{item.unitPrice} each</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="h-5 w-5 rounded bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-700"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center font-bold text-white text-xs">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="h-5 w-5 rounded bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-700"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="h-5 w-5 rounded bg-rose-500/10 text-rose-400 flex items-center justify-center ml-1 hover:bg-rose-500/20"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {['UPI', 'Cash', 'Card'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m)}
                        className={`py-1.5 px-2 rounded-lg border text-center font-medium transition-all ${
                          paymentMethod === m
                            ? 'bg-violet-600/20 border-violet-500 text-white shadow-glow'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Totals & Submit */}
              <div className="pt-3 border-t border-slate-800 space-y-2 mt-3">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">{currency}{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Tax ({taxRate}%)</span>
                  <span>{currency}{taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-white pt-1 border-t border-slate-800">
                  <span>Grand Total</span>
                  <span className="text-cyan-400">{currency}{grandTotal.toLocaleString('en-IN')}</span>
                </div>

                <button
                  disabled={cart.length === 0 || isSubmitting}
                  onClick={handleCheckout}
                  className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs tracking-wide shadow-glow transition-all"
                >
                  {isSubmitting ? 'Recording Sale...' : `Charge ${currency}${grandTotal.toLocaleString('en-IN')}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickPOSModal;
