import React, { useState, useEffect } from 'react';
import {
  Flame,
  Calendar,
  Wrench,
  Copy,
  Armchair,
  Shirt,
  Plane,
  HeartPulse,
  Sprout,
  Footprints,
  Sparkles,
  CheckCircle,
  Clock,
  Plus,
} from 'lucide-react';
import { api } from '../api';
import { BUSINESS_CATEGORIES } from '../categories';

export default function SpecializedPage({ business }) {
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryKey = business?.category || 'grocery';
  const categoryDef = BUSINESS_CATEGORIES[categoryKey] || BUSINESS_CATEGORIES.grocery;

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordRes, aptRes, repRes] = await Promise.all([
        api.getOrders(business?.id),
        api.getAppointments(business?.id),
        api.getRepairs(business?.id),
      ]);
      setOrders(ordRes.orders || []);
      setAppointments(aptRes.appointments || []);
      setRepairs(repRes.repairs || []);
    } catch (err) {
      console.error('Failed to load specialized queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [business?.id]);

  const currency = business?.currency === 'INR' ? '₹' : (business?.currency || '₹');

  const handleUpdateOrderStatus = async (id, newStatus) => {
    try {
      await api.updateOrderStatus(id, newStatus);
      loadData();
    } catch (err) {
      alert(`Error updating order: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-3xl glass-panel border border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-cyan-400" />
          <span>{categoryDef.name} — Specialized Operational Queue</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Workflows specifically tailored for your business segment.
        </p>
      </div>

      {/* FOOD / RESTAURANT: KOT & TABLE DINING */}
      {categoryKey === 'food' && (
        <div className="space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Flame className="h-5 w-5 text-amber-400" />
            <span>Kitchen Order Tickets (KOT) & Dine-In Tables</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((ord) => (
              <div key={ord.id} className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-white text-sm">{ord.orderNumber}</span>
                    <p className="text-xs text-cyan-400 font-semibold">{ord.tableNumber || ord.orderType}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {ord.status}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                  {ord.items?.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-slate-300">
                      <span>{it.name}</span>
                      <span className="font-bold">x{it.qty || it.quantity || 1}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleUpdateOrderStatus(ord.id, 'Ready')}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Mark Ready
                  </button>
                  <button
                    onClick={() => handleUpdateOrderStatus(ord.id, 'Completed')}
                    className="flex-1 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                  >
                    Served & Closed
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SALON / BEAUTY: APPOINTMENTS */}
      {categoryKey === 'salon' && (
        <div className="space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-violet-400" />
            <span>Stylist Appointment Diary & Time Slots</span>
          </h3>

          <div className="p-5 rounded-3xl glass-panel border border-slate-800 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Client</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Stylist</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Time Slot</th>
                  <th className="p-3">Fee</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-white">{a.customerName}</td>
                    <td className="p-3 text-cyan-400">{a.serviceName}</td>
                    <td className="p-3 text-slate-300">{a.staffName}</td>
                    <td className="p-3 text-slate-400">{a.date}</td>
                    <td className="p-3 font-bold text-violet-400">{a.timeSlot}</td>
                    <td className="p-3 font-bold text-emerald-400">{currency}{a.price}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px]">
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ELECTRONICS: REPAIRS WORKBENCH */}
      {categoryKey === 'electronics' && (
        <div className="space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Wrench className="h-5 w-5 text-cyan-400" />
            <span>Device Service & Technician Repair Tickets</span>
          </h3>

          <div className="p-5 rounded-3xl glass-panel border border-slate-800 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Ticket #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Device / Model</th>
                  <th className="p-3">IMEI / Serial</th>
                  <th className="p-3">Issue Reported</th>
                  <th className="p-3">Est. Cost</th>
                  <th className="p-3">Technician Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {repairs.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-mono font-bold text-cyan-400">{r.ticketNumber}</td>
                    <td className="p-3 text-white font-medium">{r.customerName}</td>
                    <td className="p-3 text-slate-200">{r.brandModel}</td>
                    <td className="p-3 font-mono text-slate-400 text-[11px]">{r.imeiSerial || '-'}</td>
                    <td className="p-3 text-slate-300">{r.issueDescription}</td>
                    <td className="p-3 font-bold text-emerald-400">{currency}{r.estimatedCost}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] border border-amber-500/20">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OTHER CATEGORIES: SPECIALIZED WORKSPACE HIGHLIGHTS */}
      {!['food', 'salon', 'electronics'].includes(categoryKey) && (
        <div className="p-8 rounded-3xl glass-panel border border-slate-800 text-center space-y-3">
          <div className="h-12 w-12 mx-auto rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center">
            <CategoryIcon name={categoryDef.icon} className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg text-white">{categoryDef.name} Operational Hub</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {categoryDef.tagline}. All data fields for {categoryDef.stockUnit} tracking are active across inventory and POS.
          </p>
        </div>
      )}
    </div>
  );
}
