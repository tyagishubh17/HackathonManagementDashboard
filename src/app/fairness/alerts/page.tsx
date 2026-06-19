"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  User,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

interface BiasAlert {
  _id: string;
  reviewer_id: string;
  project_id: string;
  bias_detected: boolean;
  bias_type: string;
  bias_flags: string[];
  confidence: number;
  recommended_action: string;
  analytics: {
    reviewer_bias_index?: number;
    normalized_score?: number;
    consistency_score?: number;
    z_score?: number;
    reviewer_stats?: { mean: number; std: number; count: number };
    global_stats?: { mean: number; std: number };
    tech_stack_analysis?: {
      bias_detected: boolean;
      max_diff: number;
      favored_group?: string;
      penalized_group?: string;
    };
  };
  evaluation: {
    innovation: number;
    technical: number;
    presentation: number;
    final_score: number;
    tech_stack: string[];
  };
  escalated: boolean;
  resolved: boolean;
  createdAt: string;
}

const BIAS_TYPE_META: Record<string, { label: string; color: string; bg: string; border: string; Icon: React.ElementType }> = {
  LENIENCY_BIAS:    { label: "Leniency",     color: "text-blue-400",   bg: "bg-blue-950/40",   border: "border-blue-700",   Icon: TrendingUp },
  SEVERITY_BIAS:    { label: "Severity",     color: "text-purple-400", bg: "bg-purple-950/40", border: "border-purple-700", Icon: TrendingDown },
  TECH_STACK_BIAS:  { label: "Tech Stack",   color: "text-orange-400", bg: "bg-orange-950/40", border: "border-orange-700", Icon: Zap },
  INCONSISTENCY_BIAS: { label: "Inconsistency", color: "text-yellow-400", bg: "bg-yellow-950/40", border: "border-yellow-700", Icon: BarChart3 },
  OUTLIER_BIAS:     { label: "Outlier",      color: "text-red-400",    bg: "bg-red-950/40",    border: "border-red-700",    Icon: ShieldAlert },
  NONE:             { label: "Clear",        color: "text-emerald-400", bg: "bg-emerald-950/40", border: "border-emerald-700", Icon: CheckCircle2 },
};

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 75 ? "text-red-400 bg-red-950 border-red-800" : pct >= 45 ? "text-yellow-400 bg-yellow-950 border-yellow-800" : "text-emerald-400 bg-emerald-950 border-emerald-800";
  return <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded-full border ${color}`}>{pct}%</span>;
}

function AlertCard({ alert, onResolve }: { alert: BiasAlert; onResolve: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [resolving, setResolving] = useState(false);
  const meta = BIAS_TYPE_META[alert.bias_type] ?? BIAS_TYPE_META.NONE;
  const { Icon } = meta;

  const resolve = async () => {
    setResolving(true);
    try {
      await fetch(`${BACKEND}/api/reviews/audit/bias/${alert._id}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution_notes: "Resolved via Fairness Dashboard" }),
      });
      onResolve(alert._id);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className={`bg-gray-900 border rounded-xl overflow-hidden transition-all ${alert.bias_detected ? meta.border : "border-gray-800"}`}>
      <div className="p-4 flex items-start gap-3">
        <div className={`p-2 rounded-lg ${meta.bg} mt-0.5`}>
          <Icon className={`w-4 h-4 ${meta.color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-semibold ${meta.color}`}>{meta.label} Bias</span>
            <ConfidenceBadge value={alert.confidence} />
            {alert.escalated && (
              <span className="px-2 py-0.5 text-xs bg-red-950 border border-red-800 text-red-400 rounded-full">Escalated</span>
            )}
            {alert.resolved && (
              <span className="px-2 py-0.5 text-xs bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-full">Resolved</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {alert.reviewer_id}</span>
            <span>Project: {alert.project_id}</span>
            <span>{new Date(alert.createdAt).toLocaleString()}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">{alert.recommended_action}</p>

          {alert.bias_flags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {alert.bias_flags.map((f) => {
                const fm = BIAS_TYPE_META[f] ?? BIAS_TYPE_META.NONE;
                return (
                  <span key={f} className={`px-2 py-0.5 text-xs rounded-full border ${fm.bg} ${fm.border} ${fm.color}`}>{fm.label}</span>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!alert.resolved && alert.bias_detected && (
            <button
              onClick={resolve}
              disabled={resolving}
              className="px-3 py-1.5 text-xs bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {resolving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Resolve"}
            </button>
          )}
          <button onClick={() => setExpanded((v) => !v)} className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-800 p-4 space-y-4 text-sm">
          {/* Evaluation scores */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Evaluation Scores</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Innovation", val: alert.evaluation?.innovation },
                { label: "Technical", val: alert.evaluation?.technical },
                { label: "Presentation", val: alert.evaluation?.presentation },
                { label: "Final Score", val: alert.evaluation?.final_score },
              ].map(({ label, val }) => (
                <div key={label} className="bg-gray-800 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-white">{val ?? "—"}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics */}
          {alert.analytics && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: "Bias Index", val: alert.analytics.reviewer_bias_index?.toFixed(1) },
                { label: "Normalized Score", val: alert.analytics.normalized_score?.toFixed(1) },
                { label: "Consistency", val: alert.analytics.consistency_score ? `${alert.analytics.consistency_score.toFixed(0)}%` : undefined },
                { label: "Z-Score", val: alert.analytics.z_score?.toFixed(3) },
                { label: "Reviewer Avg", val: alert.analytics.reviewer_stats?.mean?.toFixed(1) },
                { label: "Global Avg", val: alert.analytics.global_stats?.mean?.toFixed(1) },
              ].filter((x) => x.val !== undefined).map(({ label, val }) => (
                <div key={label} className="bg-gray-800 rounded-lg p-2.5">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-base font-semibold text-white font-mono">{val}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tech stack */}
          {alert.evaluation?.tech_stack?.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Tech Stack</p>
              <div className="flex flex-wrap gap-1">
                {alert.evaluation.tech_stack.map((t) => (
                  <span key={t} className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded-full">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Tech stack bias detail */}
          {alert.analytics?.tech_stack_analysis?.bias_detected && (
            <div className="p-3 bg-orange-950/30 border border-orange-800 rounded-lg text-xs space-y-1">
              <p className="font-semibold text-orange-400">Tech Stack Bias Detected</p>
              <p className="text-gray-400">
                Favored: <span className="text-white capitalize">{alert.analytics.tech_stack_analysis.favored_group}</span>
                {" · "}Penalized: <span className="text-white capitalize">{alert.analytics.tech_stack_analysis.penalized_group}</span>
                {" · "}Diff: <span className="text-white">{alert.analytics.tech_stack_analysis.max_diff.toFixed(1)} pts</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BiasAlertsPage() {
  const [alerts, setAlerts] = useState<BiasAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unresolved" | "escalated">("unresolved");
  const [biasOnly, setBiasOnly] = useState(true);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (biasOnly) params.set("bias_detected", "true");
      const res = await fetch(`${BACKEND}/api/reviews/audit/bias?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setAlerts(data.entries || []);
    } catch { setAlerts([]); }
    finally { setLoading(false); }
  }, [biasOnly]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const handleResolve = (id: string) => {
    setAlerts((prev) => prev.map((a) => a._id === id ? { ...a, resolved: true } : a));
  };

  const filtered = alerts.filter((a) => {
    if (filter === "unresolved") return !a.resolved;
    if (filter === "escalated") return a.escalated;
    return true;
  });

  const stats = {
    total: alerts.length,
    active: alerts.filter((a) => !a.resolved).length,
    escalated: alerts.filter((a) => a.escalated).length,
    resolved: alerts.filter((a) => a.resolved).length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Bias Alerts</h1>
            <p className="text-gray-400 text-sm mt-1">Real-time reviewer bias detection and escalation management</p>
          </div>
          <button
            onClick={fetchAlerts}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Alerts", val: stats.total, color: "text-blue-400" },
            { label: "Active", val: stats.active, color: "text-red-400" },
            { label: "Escalated", val: stats.escalated, color: "text-orange-400" },
            { label: "Resolved", val: stats.resolved, color: "text-emerald-400" },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className={`text-2xl font-bold ${color}`}>{val}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
            {(["all", "unresolved", "escalated"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors ${filter === f ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={() => setBiasOnly((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${biasOnly ? "bg-purple-950 border-purple-700 text-purple-300" : "bg-gray-900 border-gray-700 text-gray-400 hover:text-white"}`}
          >
            <Filter className="w-3 h-3" />
            Bias Only
          </button>
        </div>

        {/* Alerts list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <p className="text-white font-semibold">No bias alerts found</p>
            <p className="text-gray-500 text-sm">All reviewers are scoring within expected ranges.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">{filtered.length} alert{filtered.length !== 1 ? "s" : ""}</p>
            {filtered.map((a) => (
              <AlertCard key={a._id} alert={a} onResolve={handleResolve} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
