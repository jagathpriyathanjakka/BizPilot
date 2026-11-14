'use client';

import React, { useState, useEffect } from 'react';
import {
  Flame,
  Calendar,
  Wrench,
  Sparkles,
  Copy,
  Armchair,
  Plane,
  Cross,
  Shirt,
  Sprout,
  Footprints,
  CheckCircle,
  Clock,
  Plus,
  RefreshCw,
  Package,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { BusinessProfile } from '@/lib/types';
import { BUSINESS_CATEGORIES } from '@/lib/categories-config';
import { CategoryIcon } from '@/components/CategoryIcon';

export default function SpecializedWorkflowPage() {
  const [data, setData] = useState<any>(null);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      if (json.business) {
        setBusiness(json.business);
        setData(json);
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

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleUpdateRepairStatus = async (ticketId: string, newStatus: string) => {
    try {
      await fetch('/api/repairs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ticketId, status: newStatus }),
      });
      fetchData();
    } catch (err) {
      alert('Failed to update repair status');
    }
  };

  const categoryKey = business?.category || 'food';
  const categoryDef = BUSINESS_CATEGORIES[categoryKey] || BUSINESS_CATEGORIES.food;

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      <Navbar currentBusiness={business || undefined} />

      <div className="flex-1 flex">
        <Sidebar currentBusiness={business || undefined} className="hidden md:flex" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  {categoryDef.name} — Specialized Operations
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Domain-specific operational queues, status pipelines, and workflow automation
              </p>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-mono bg-violet-600/20 text-violet-300 border border-violet-500/30">
              Module: {categoryDef.subcategories[0]}
            </span>
          </div>

          {/* 1. FOOD BUSINESS: KOT & Kitchen Orders */}
          {categoryKey === 'food' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-400" />
                  <span>Live Kitchen Order Tickets (KOT) & Delivery Queue</span>
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  Tables 4/12 Occupied • Avg Turnover 18m
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.recentOrders?.map((ord: any) => (
                  <div
                    key={ord.id}
                    className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div>
                        <span className="font-bold text-white text-sm font-mono">{ord.orderNumber}</span>
                        <span className="ml-2 text-xs text-cyan-400">
                          {ord.tableNumber || ord.orderType}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {ord.status}
                      </span>
                    </div>

                    <div className="space-y-1 py-1">
                      {ord.items.map((i: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-300">
                          <span>
                            {i.name} (x{i.quantity})
                          </span>
                          <span className="font-mono">₹{i.price * i.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {ord.notes && (
                      <p className="text-[11px] text-amber-300/80 italic bg-amber-500/5 p-2 rounded-lg">
                        Chef Note: {ord.notes}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-mono">
                        Total: ₹{ord.totalAmount}
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'Preparing')}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-[11px] font-semibold hover:bg-amber-500/30"
                        >
                          Mark Preparing
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'Ready')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold hover:bg-emerald-500/30"
                        >
                          Mark Ready
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'Completed')}
                          className="px-2.5 py-1 rounded-lg bg-violet-600 text-white text-[11px] font-semibold hover:bg-violet-500"
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. SALON & SPA: Appointments & Stylists */}
          {categoryKey === 'salon' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-violet-400" />
                  <span>Today&apos;s Client Appointments & Floor Schedule</span>
                </h2>
                <span className="text-xs text-slate-400 font-mono">Stylists Active: 4</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.recentAppointments?.map((apt: any) => (
                  <div
                    key={apt.id}
                    className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div>
                        <h3 className="font-bold text-white text-sm">{apt.customerName}</h3>
                        <p className="text-[11px] text-cyan-400 font-mono">{apt.customerMobile}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {apt.status}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="text-slate-200 font-medium">Service: {apt.serviceName}</p>
                      <p className="text-slate-400">Assigned Stylist: {apt.staffName}</p>
                      <p className="text-amber-300 font-mono">Time Slot: {apt.timeSlot}</p>
                    </div>

                    {apt.notes && (
                      <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded-lg">
                        Client Note: {apt.notes}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-mono text-xs">
                      <span className="text-white font-bold">Fee: ₹{apt.price}</span>
                      <span className="text-emerald-400 font-semibold">Confirmed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. ELECTRONICS & MOBILE: Repair & Care Tickets */}
          {categoryKey === 'electronics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-cyan-400" />
                  <span>Device Service & Care Job Tickets</span>
                </h2>
                <span className="text-xs text-slate-400 font-mono">IMEI Tracking Enabled</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.recentRepairs?.map((tkt: any) => (
                  <div
                    key={tkt.id}
                    className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div>
                        <span className="font-bold text-white font-mono text-xs">{tkt.ticketNumber}</span>
                        <span className="ml-2 text-xs font-semibold text-cyan-400">
                          {tkt.brandModel}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        {tkt.status}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="text-slate-300">
                        <span className="text-slate-500">Customer:</span> {tkt.customerName} ({tkt.customerMobile})
                      </p>
                      <p className="text-slate-300 font-mono text-[11px]">
                        <span className="text-slate-500">IMEI/Serial:</span> {tkt.imeiOrSerial}
                      </p>
                      <p className="text-amber-300">
                        <span className="text-slate-500">Reported Issue:</span> {tkt.issueDescription}
                      </p>
                      {tkt.technicianNotes && (
                        <p className="text-slate-400 text-[11px] bg-slate-900/60 p-2 rounded-lg">
                          Tech Notes: {tkt.technicianNotes}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-mono">
                        Estimate: ₹{tkt.estimatedCost}
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleUpdateRepairStatus(tkt.id, 'In Repair')}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-[11px] font-semibold"
                        >
                          In Repair
                        </button>
                        <button
                          onClick={() => handleUpdateRepairStatus(tkt.id, 'Ready for Pickup')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold"
                        >
                          Ready Pickup
                        </button>
                        <button
                          onClick={() => handleUpdateRepairStatus(tkt.id, 'Delivered')}
                          className="px-2.5 py-1 rounded-lg bg-violet-600 text-white text-[11px] font-semibold"
                        >
                          Delivered
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. LAUNDRY & DRY CLEANING: 7-Stage Pipeline */}
          {categoryKey === 'laundry' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <span>7-Stage Garment Processing Pipeline</span>
                </h2>
                <span className="text-xs text-slate-400 font-mono">Doorstep Logistics Active</span>
              </div>

              {/* 7-stage visual pipeline */}
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 text-center text-xs">
                {['Received', 'Processing', 'Washing', 'Ironing', 'Ready', 'Out for Delivery', 'Delivered'].map(
                  (st, idx) => (
                    <div
                      key={st}
                      className={`p-3 rounded-xl border ${
                        idx === 3
                          ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-bold'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400'
                      }`}
                    >
                      <span className="text-[10px] text-slate-500 block">Stage {idx + 1}</span>
                      <span className="text-xs mt-1 block">{st}</span>
                    </div>
                  )
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {data?.recentOrders?.map((ord: any) => (
                  <div key={ord.id} className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="font-bold text-white font-mono">{ord.orderNumber}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {ord.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1">
                      <p>Customer: {ord.customerName} ({ord.customerMobile})</p>
                      <p>Delivery: {ord.deliveryTimeSlot || 'Standard 24h'}</p>
                      <div className="py-1">
                        {ord.items.map((i: any, idx: number) => (
                          <p key={idx} className="text-slate-400">
                            • {i.name} (x{i.quantity})
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                      <span className="font-mono font-bold text-white">Total: ₹{ord.totalAmount}</span>
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, 'Ready')}
                        className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                      >
                        Advance to Ready
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. STATIONERY & XEROX: Print/Bind Job Status */}
          {categoryKey === 'stationery' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Copy className="h-4 w-4 text-violet-400" />
                  <span>Xerox, Digital Printing & Project Binding Queue</span>
                </h2>
                <span className="text-xs text-slate-400 font-mono">Paper Inventory: 32 Reams</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.recentOrders?.map((job: any) => (
                  <div key={job.id} className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="font-bold text-white font-mono">{job.orderNumber}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300">
                        {job.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1">
                      <p>Client: {job.customerName}</p>
                      <div className="py-1">
                        {job.items.map((i: any, idx: number) => (
                          <p key={idx} className="text-slate-400">
                            • {i.name} (Qty: {i.quantity})
                          </p>
                        ))}
                      </div>
                      {job.notes && (
                        <p className="text-[11px] text-amber-300 italic">{job.notes}</p>
                      )}
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                      <span className="font-mono font-bold text-white">Amount: ₹{job.totalAmount}</span>
                      <button
                        onClick={() => handleUpdateOrderStatus(job.id, 'Completed')}
                        className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
                      >
                        Mark Completed
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. GENERAL FALLBACK FOR OTHER CATEGORIES */}
          {!['food', 'salon', 'electronics', 'laundry', 'stationery'].includes(categoryKey) && (
            <div className="glass-panel rounded-2xl p-8 text-center space-y-4">
              <div className="h-12 w-12 mx-auto rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
                <CategoryIcon name={categoryDef.icon} className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{categoryDef.name} Workflow Active</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                All inventory attributes (such as batch numbers, size variants, farmer balances, and quotations)
                are fully mapped into the main Products & Sales modules.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
