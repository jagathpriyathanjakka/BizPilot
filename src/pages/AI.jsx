import React, { useState, useEffect } from 'react';
import { Bot, Send, Sparkles, ShieldCheck, CheckCircle, Clock } from 'lucide-react';
import { api } from '../api';

export default function AIPage({ business, onOpenAIChat }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await api.getAITasks(business?.id);
      setTasks(res.tasks || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [business?.id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl glass-panel border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="h-6 w-6 text-cyan-400" />
            <span>Autonomous AI Multi-Agent Command Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            6 specialized intelligence agents analyzing inventory, sales, pricing, marketing, and cash flow in SQLite
          </p>
        </div>

        <button
          onClick={onOpenAIChat}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-95 text-white text-xs font-bold shadow-glow transition-all active:scale-95 w-fit"
        >
          <Sparkles className="h-4 w-4" />
          <span>Launch AI Query Dialog</span>
        </button>
      </div>

      {/* Agents Roster Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { name: 'Central Orchestrator', role: 'Intent & Task Delegation', status: 'Active' },
          { name: 'Sales Intelligence', role: 'Revenue Trajectory & POS', status: 'Active' },
          { name: 'Inventory Intelligence', role: 'Low Stock & Reorder POs', status: 'Active' },
          { name: 'Pricing & Margins', role: 'Margin Safeguards', status: 'Active' },
          { name: 'Customer & Marketing', role: 'Khata & WhatsApp Promos', status: 'Active' },
          { name: 'Service Operations', role: 'Queues, Tables & Repair', status: 'Active' },
        ].map((ag, i) => (
          <div key={i} className="p-3.5 rounded-2xl glass-panel border border-slate-800 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{ag.status}</span>
            </div>
            <p className="font-bold text-white text-[11px] leading-tight mt-1">{ag.name}</p>
            <p className="text-[10px] text-slate-400">{ag.role}</p>
          </div>
        ))}
      </div>

      {/* Tasks History Table */}
      <div className="p-5 rounded-3xl glass-panel border border-slate-800 space-y-3">
        <h3 className="font-bold text-sm text-white">Agent Execution Logs & Synthesis History</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Agent Type</th>
                <th className="p-3">Prompt / Trigger</th>
                <th className="p-3">Response Summary</th>
                <th className="p-3">Status</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    No autonomous tasks executed yet. Click "Launch AI Query Dialog" to run an evaluation.
                  </td>
                </tr>
              ) : (
                tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-cyan-400">{t.agentType}</td>
                    <td className="p-3 text-white max-w-[200px] truncate">{t.prompt}</td>
                    <td className="p-3 text-slate-300 max-w-[320px] truncate">{t.response}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 text-[10px] border border-violet-500/20">
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">
                      {new Date(t.createdAt).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
