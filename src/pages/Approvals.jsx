import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle, XCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import { api } from '../api';

export default function ApprovalsPage({ business }) {
  const [approvals, setApprovals] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [apprRes, auditRes] = await Promise.all([
        api.getApprovals(business?.id),
        api.getAuditLogs(business?.id),
      ]);
      setApprovals(apprRes.approvals || []);
      setAuditLogs(auditRes.logs || []);
    } catch (err) {
      console.error('Failed to load approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [business?.id]);

  const handleResolve = async (id, action) => {
    try {
      await api.resolveApproval(id, action);
      alert(`Action successfully ${action}d.`);
      loadData();
    } catch (err) {
      alert(`Failed to resolve approval: ${err.message}`);
    }
  };

  const currency = business?.currency === 'INR' ? '₹' : (business?.currency || '₹');

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-3xl glass-panel border border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
          <span>Human-in-the-Loop AI Approvals & Security Audit Trail</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          AI agents can draft restock orders, discounts, and payment reminders, but sensitive actions require owner authorization
        </p>
      </div>

      {/* Approvals Section */}
      <div className="p-5 rounded-3xl glass-panel border border-slate-800 space-y-3">
        <h3 className="font-bold text-sm text-white">Pending & Resolved AI Authorizations</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Agent</th>
                <th className="p-3">Action Title</th>
                <th className="p-3">Description</th>
                <th className="p-3">Financial Impact</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Owner Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {approvals.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    No approval requests pending. All AI actions are verified.
                  </td>
                </tr>
              ) : (
                approvals.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-cyan-400">{a.agentType}</td>
                    <td className="p-3 font-medium text-white">{a.actionTitle}</td>
                    <td className="p-3 text-slate-300 max-w-xs">{a.description}</td>
                    <td className="p-3 font-bold text-amber-400">
                      {a.impactAmount > 0 ? `${currency}${a.impactAmount.toLocaleString('en-IN')}` : 'None'}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          a.status === 'Pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : a.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {a.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleResolve(a.id, 'reject')}
                            className="px-2.5 py-1 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-[11px] font-semibold"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleResolve(a.id, 'approve')}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-md"
                          >
                            Approve
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Immutable Audit Log Section */}
      <div className="p-5 rounded-3xl glass-panel border border-slate-800 space-y-3">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <FileText className="h-4 w-4 text-violet-400" />
          <span>Immutable System Audit Trail</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Action Type</th>
                <th className="p-3">Entity</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {auditLogs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-900/40">
                  <td className="p-3 font-mono font-bold text-cyan-400">{l.action}</td>
                  <td className="p-3 text-slate-300">{l.entityType} ({l.entityId})</td>
                  <td className="p-3 text-white font-medium">{l.actorName} ({l.actorRole})</td>
                  <td className="p-3 text-slate-500 font-mono text-[11px]">{new Date(l.timestamp).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
