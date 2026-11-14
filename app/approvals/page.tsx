'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Bot,
  Lock,
  FileText,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { ApprovalRequest, AuditLog, BusinessProfile } from '@/lib/types';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const bRes = await fetch('/api/dashboard');
      const bData = await bRes.json();
      if (bData.business) {
        setBusiness(bData.business);
      }

      const aRes = await fetch('/api/approvals');
      const aData = await aRes.json();
      if (aData.approvals) {
        setApprovals(aData.approvals);
      }

      const logRes = await fetch('/api/audit');
      const logData = await logRes.json();
      if (logData.logs) {
        setAuditLogs(logData.logs);
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

  const handleResolve = async (id: string, decision: 'Approved' | 'Rejected') => {
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalId: id, decision }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      alert('Failed to resolve approval');
    }
  };

  const pendingApprovals = approvals.filter((a) => a.status === 'Pending');
  const pastApprovals = approvals.filter((a) => a.status !== 'Pending');

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      <Navbar currentBusiness={business || undefined} />

      <div className="flex-1 flex">
        <Sidebar currentBusiness={business || undefined} className="hidden md:flex" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-2xl p-6">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-violet-400" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  AI Approvals & Audit Control Center
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Human-in-the-Loop Safeguards: Autonomous AI agents cannot commit funds or send orders without authorized sign-off
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
              <Lock className="h-3.5 w-3.5" />
              <span>Owner Privilege Enforced</span>
            </div>
          </div>

          {/* Pending Approval Requests */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Actions Awaiting Owner Authorization ({pendingApprovals.length})</span>
            </h2>

            {pendingApprovals.length === 0 ? (
              <div className="glass-panel rounded-2xl p-8 text-center text-xs text-slate-500">
                All clear! No pending high-impact actions require your approval at this time.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingApprovals.map((req) => (
                  <div
                    key={req.id}
                    className="glass-panel rounded-2xl p-5 border border-amber-500/30 bg-amber-500/5 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-600/20 text-violet-300 border border-violet-500/30">
                          {req.agentType}
                        </span>
                        <span className="text-[10px] text-amber-400 font-bold uppercase">
                          Awaiting Approval
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-white mt-2">{req.actionTitle}</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {req.description}
                      </p>

                      {req.impactAmount !== undefined && req.impactAmount > 0 && (
                        <p className="text-xs font-mono font-bold text-cyan-400 mt-2">
                          Financial Impact: ₹{req.impactAmount.toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleResolve(req.id, 'Rejected')}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleResolve(req.id, 'Approved')}
                        className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 shadow-md transition-colors"
                      >
                        Authorize & Execute
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Immutable Audit Log Table */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Immutable System Audit Log</h3>
                <p className="text-xs text-slate-400">
                  Cryptographic transaction audit trail of every sale, expense, approval, and AI recommendation
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Actor & Role</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Entity</th>
                    <th className="px-4 py-3">Payload Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(log.timestamp).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white font-semibold">{log.actorName}</span>
                        <span className="text-slate-500 text-[10px] block">[{log.actorRole}]</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-cyan-400">{log.action}</td>
                      <td className="px-4 py-3 text-slate-400">{log.entityType}</td>
                      <td className="px-4 py-3 text-[11px] text-slate-400 max-w-xs truncate">
                        {JSON.stringify(log.details)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
