"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  ShieldCheck,
  UserX,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Search,
  Clock,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

interface DuplicateEntry {
  _id?: string;
  candidate: { name: string; email: string; phone: string; college: string };
  duplicate_score: number;
  status: "Exact Duplicate" | "Suspicious" | "Unique";
  best_match?: { existing_name: string; existing_email: string; matching_fields: string[] };
  checked_against: number;
  response_time_ms: number;
  action_taken: string;
  createdAt: string;
}

interface BiasEntry {
  _id?: string;
  reviewer_id: string;
  project_id: string;
  bias_detected: boolean;
  bias_type: string;
  bias_flags: string[];
  confidence: number;
  recommended_action: string;
  escalated: boolean;
  resolved: boolean;
  analytics?: { reviewer_bias_index?: number; normalized_score?: number };
  createdAt: string;
}

type Tab = "duplicates" | "bias";

const dupStatusMeta = {
  "Exact Duplicate": { color: "text-red-400", bg: "bg-red-950/40", border: "border-red-800", dot: "bg-red-500", Icon: UserX },
  Suspicious:        { color: "text-yellow-400", bg: "bg-yellow-950/40", border: "border-yellow-800", dot: "bg-yellow-500", Icon: AlertTriangle },
  Unique:            { color: "text-emerald-400", bg: "bg-emerald-950/40", border: "border-emerald-800", dot: "bg-emerald-500", Icon: CheckCircle2 },
};

function DuplicateRow({ entry }: { entry: DuplicateEntry }) {
  const [open, setOpen] = useState(false);
  const meta = dupStatusMeta[entry.status];
  const { Icon } = meta;

  return (
    <div className={`bg-gray-900 border rounded-xl overflow-hidden ${open ? meta.border : "border-gray-800"}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left p-4 flex items-center gap-3 hover:bg-gray-800/50 transition-colors"
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-white truncate">{entry.candidate.name}</span>
            <span className="text-xs text-gray-500">{entry.candidate.email}</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(entry.createdAt).toLocaleString()}</span>
            <span>{entry.checked_against} records scanned</span>
            <span>{entry.response_time_ms}ms</span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${meta.bg} ${meta.color}`}>
            <Icon className="w-3 h-3" />
            {entry.status}
          </div>
          <span className={`text-sm font-bold font-mono ${meta.color}`}>{entry.duplicate_score.toFixed(0)}%</span>
          {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-800 p-4 space-y-3 text-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Phone", val: entry.candidate.phone },
              { label: "College", val: entry.candidate.college },
              { label: "Action", val: entry.action_taken?.replace(/_/g, " ") },
              { label: "Score", val: `${entry.duplicate_score.toFixed(1)}%` },
            ].map(({ label, val }) => (
              <div key={label} className="bg-gray-800 rounded-lg p-2.5">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm text-white capitalize">{val ?? "—"}</p>
              </div>
            ))}
          </div>
          {entry.best_match && entry.status !== "Unique" && (
            <div className="p-3 bg-gray-800 rounded-lg space-y-1">
              <p className="text-xs text-gray-500">Matched against</p>
              <p className="text-sm text-white">{entry.best_match.existing_name}</p>
              <p className="text-xs text-gray-400">{entry.best_match.existing_email}</p>
              {entry.best_match.matching_fields?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {entry.best_match.matching_fields.map((f) => (
                    <span key={f} className="px-2 py-0.5 bg-red-950 border border-red-800 text-red-300 text-xs rounded-full capitalize">{f}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BiasRow({ entry }: { entry: BiasEntry }) {
  const [open, setOpen] = useState(false);
  const hasAlert = entry.bias_detected;

  return (
    <div className={`bg-gray-900 border rounded-xl overflow-hidden ${hasAlert ? (entry.escalated ? "border-red-800" : "border-yellow-800") : "border-gray-800"}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left p-4 flex items-center gap-3 hover:bg-gray-800/50 transition-colors"
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${hasAlert ? (entry.escalated ? "bg-red-500" : "bg-yellow-500") : "bg-emerald-500"}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-white">Reviewer {entry.reviewer_id}</span>
            <span className="text-xs text-gray-500">Project {entry.project_id}</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(entry.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {hasAlert ? (
            <>
              <span className="px-2 py-0.5 bg-red-950 border border-red-800 text-red-400 text-xs rounded-full">
                {entry.bias_type?.replace(/_/g, " ")}
              </span>
              {entry.escalated && (
                <span className="px-2 py-0.5 bg-orange-950 border border-orange-800 text-orange-400 text-xs rounded-full">Escalated</span>
              )}
              {entry.resolved && (
                <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs rounded-full">Resolved</span>
              )}
              <span className="text-sm font-bold font-mono text-red-400">{(entry.confidence * 100).toFixed(0)}%</span>
            </>
          ) : (
            <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs rounded-full">No Bias</span>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-800 p-4 space-y-3 text-sm">
          <p className="text-xs text-gray-400">{entry.recommended_action}</p>
          {entry.bias_flags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {entry.bias_flags.map((f) => (
                <span key={f} className="px-2 py-0.5 bg-yellow-950 border border-yellow-800 text-yellow-300 text-xs rounded-full">
                  {f.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
          {entry.analytics && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Bias Index", val: entry.analytics.reviewer_bias_index?.toFixed(1) },
                { label: "Normalized Score", val: entry.analytics.normalized_score?.toFixed(1) },
              ].filter((x) => x.val !== undefined).map(({ label, val }) => (
                <div key={label} className="bg-gray-800 rounded-lg p-2.5">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-base font-semibold text-white font-mono">{val}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AuditTrailPage() {
  const [tab, setTab] = useState<Tab>("duplicates");
  const [dupEntries, setDupEntries] = useState<DuplicateEntry[]>([]);
  const [biasEntries, setBiasEntries] = useState<BiasEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dupRes, biasRes] = await Promise.all([
        fetch(`${BACKEND}/api/participants/audit/duplicates?limit=100`),
        fetch(`${BACKEND}/api/reviews/audit/bias?limit=100`),
      ]);
      if (dupRes.ok) { const d = await dupRes.json(); setDupEntries(d.entries || []); }
      if (biasRes.ok) { const d = await biasRes.json(); setBiasEntries(d.entries || []); }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredDup = dupEntries.filter((e) => {
    const q = search.toLowerCase();
    return !q || e.candidate.name.toLowerCase().includes(q) || e.candidate.email.toLowerCase().includes(q);
  });

  const filteredBias = biasEntries.filter((e) => {
    const q = search.toLowerCase();
    return !q || e.reviewer_id.toLowerCase().includes(q) || e.project_id.toLowerCase().includes(q);
  });

  const exportCSV = () => {
    const data = tab === "duplicates" ? filteredDup : filteredBias;
    const csv = [
      Object.keys(data[0] || {}).join(","),
      ...data.map((row) => Object.values(row).map((v) => JSON.stringify(v)).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `audit-${tab}-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const dupStats = {
    total: dupEntries.length,
    exact: dupEntries.filter((e) => e.status === "Exact Duplicate").length,
    suspicious: dupEntries.filter((e) => e.status === "Suspicious").length,
    unique: dupEntries.filter((e) => e.status === "Unique").length,
  };

  const biasStats = {
    total: biasEntries.length,
    detected: biasEntries.filter((e) => e.bias_detected).length,
    escalated: biasEntries.filter((e) => e.escalated).length,
    resolved: biasEntries.filter((e) => e.resolved).length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Audit Trail</h1>
            <p className="text-gray-400 text-sm mt-1">Complete log of all AI detection events</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
          {(["duplicates", "bias"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              {t === "duplicates" ? <UserX className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              {t}
            </button>
          ))}
        </div>

        {/* Stats */}
        {tab === "duplicates" ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Checks", val: dupStats.total, color: "text-blue-400" },
              { label: "Exact Duplicates", val: dupStats.exact, color: "text-red-400" },
              { label: "Suspicious", val: dupStats.suspicious, color: "text-yellow-400" },
              { label: "Unique", val: dupStats.unique, color: "text-emerald-400" },
            ].map(({ label, val, color }) => (
              <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className={`text-2xl font-bold ${color}`}>{val}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Reviews", val: biasStats.total, color: "text-blue-400" },
              { label: "Bias Detected", val: biasStats.detected, color: "text-red-400" },
              { label: "Escalated", val: biasStats.escalated, color: "text-orange-400" },
              { label: "Resolved", val: biasStats.resolved, color: "text-emerald-400" },
            ].map(({ label, val, color }) => (
              <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className={`text-2xl font-bold ${color}`}>{val}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "duplicates" ? "Search by name or email…" : "Search by reviewer or project ID…"}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        ) : tab === "duplicates" ? (
          filteredDup.length === 0 ? (
            <p className="text-center text-gray-500 py-16">No duplicate check records found.</p>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">{filteredDup.length} record{filteredDup.length !== 1 ? "s" : ""}</p>
              {filteredDup.map((e, i) => <DuplicateRow key={e._id ?? i} entry={e} />)}
            </div>
          )
        ) : (
          filteredBias.length === 0 ? (
            <p className="text-center text-gray-500 py-16">No bias detection records found.</p>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">{filteredBias.length} record{filteredBias.length !== 1 ? "s" : ""}</p>
              {filteredBias.map((e, i) => <BiasRow key={e._id ?? i} entry={e} />)}
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
}
