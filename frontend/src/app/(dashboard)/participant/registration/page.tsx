"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  User,
  Mail,
  Phone,
  Building2,
  Code2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Plus,
  X,
  ShieldCheck,
  Clock,
  BarChart3,
} from "lucide-react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

type DuplicateStatus = "Exact Duplicate" | "Suspicious" | "Unique";

interface DuplicateResult {
  duplicate_score: number;
  status: DuplicateStatus;
  best_match?: {
    existing_name: string;
    existing_email: string;
    field_scores: Record<string, number>;
    matching_fields: string[];
  };
  checked_against: number;
  response_time_ms: number;
}

const statusConfig: Record<
  DuplicateStatus,
  { icon: React.ReactNode; color: string; bg: string; border: string; label: string }
> = {
  "Exact Duplicate": {
    icon: <XCircle className="w-5 h-5" />,
    color: "text-red-400",
    bg: "bg-red-950/40",
    border: "border-red-700",
    label: "Registration Blocked",
  },
  Suspicious: {
    icon: <AlertTriangle className="w-5 h-5" />,
    color: "text-yellow-400",
    bg: "bg-yellow-950/40",
    border: "border-yellow-700",
    label: "Flagged for Review",
  },
  Unique: {
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: "text-emerald-400",
    bg: "bg-emerald-950/40",
    border: "border-emerald-700",
    label: "Clear to Register",
  },
};

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = Math.round(score);
  const color = pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-yellow-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-20 text-gray-400 capitalize">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right text-gray-300 font-mono">{pct}%</span>
    </div>
  );
}

export default function RegistrationPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", college: "" });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<DuplicateResult | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isFormFilled =
    form.name.length > 2 && form.email.includes("@") && form.phone.length > 7 && form.college.length > 2;

  useEffect(() => {
    if (!isFormFilled) { setResult(null); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(runDuplicateCheck, 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, skills]);

  const runDuplicateCheck = async () => {
    setChecking(true);
    setResult(null);
    try {
      const res = await fetch(`${BACKEND}/api/participants/check-duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, skills }),
      });
      if (!res.ok) throw new Error(await res.text());
      setResult(await res.json());
    } catch { /* swallow — show nothing if service unavailable */ }
    finally { setChecking(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (result?.status === "Exact Duplicate") return;
    setSubmitStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch(`${BACKEND}/api/participants/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, skills }),
      });
      const data = await res.json();
      if (res.status === 409) { setSubmitStatus("error"); setErrorMsg(data.message); return; }
      if (!res.ok) throw new Error(data.message || "Registration failed");
      setSubmitStatus("success");
    } catch (err: unknown) {
      setSubmitStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills((p) => [...p, s]);
    setSkillInput("");
  };

  if (submitStatus === "success") {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Registration Successful!</h2>
            <p className="text-gray-400">
              {result?.status === "Suspicious"
                ? "Your registration is pending manual review due to a suspicious match."
                : "You have been registered for the hackathon."}
            </p>
            <button
              onClick={() => { setSubmitStatus("idle"); setForm({ name: "", email: "", phone: "", college: "" }); setSkills([]); setResult(null); }}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Register Another
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const cfg = result ? statusConfig[result.status] : null;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Participant Registration</h1>
          <p className="text-gray-400 text-sm mt-1">AI-powered duplicate detection runs in real time as you type.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Personal Info</h2>

              {[
                { key: "name", label: "Full Name", type: "text", placeholder: "Jane Doe", Icon: User },
                { key: "email", label: "Email Address", type: "email", placeholder: "jane@university.edu", Icon: Mail },
                { key: "phone", label: "Phone Number", type: "tel", placeholder: "+1 234 567 8900", Icon: Phone },
                { key: "college", label: "College / Institution", type: "text", placeholder: "MIT, Stanford, IIT…", Icon: Building2 },
              ].map(({ key, label, type, placeholder, Icon }) => (
                <div key={key} className="space-y-1">
                  <label className="text-sm text-gray-400">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={type}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      required
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
              ))}

              {/* Skills */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Skills</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                      placeholder="React, Python, AWS…"
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>
                  <button type="button" onClick={addSkill} className="px-3 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-950 border border-blue-800 text-blue-300 rounded-full text-xs">
                        {s}
                        <button type="button" onClick={() => setSkills((p) => p.filter((x) => x !== s))}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {submitStatus === "error" && (
              <div className="p-3 bg-red-950/40 border border-red-700 rounded-lg text-red-400 text-sm">{errorMsg}</div>
            )}

            <button
              type="submit"
              disabled={submitStatus === "submitting" || checking || result?.status === "Exact Duplicate" || !isFormFilled}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
            >
              {submitStatus === "submitting" ? (
                <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Registering…</span>
              ) : result?.status === "Exact Duplicate" ? "Registration Blocked" : "Complete Registration"}
            </button>
          </form>

          {/* ── AI Panel ── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-semibold text-white">AI Duplicate Detector</span>
                </div>
                {checking && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
              </div>

              {!isFormFilled && !checking && (
                <p className="text-xs text-gray-500 text-center py-4">Fill in name, email, phone, and college to begin real-time detection.</p>
              )}

              {checking && (
                <div className="text-center py-6 space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
                  <p className="text-sm text-gray-400">Scanning records…</p>
                </div>
              )}

              {!checking && result && cfg && (
                <div className="space-y-4">
                  <div className={`flex items-center gap-2 p-3 rounded-lg border ${cfg.bg} ${cfg.border}`}>
                    <span className={cfg.color}>{cfg.icon}</span>
                    <div>
                      <p className={`text-sm font-semibold ${cfg.color}`}>{result.status}</p>
                      <p className="text-xs text-gray-400">{cfg.label}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className={`text-lg font-bold ${cfg.color}`}>{result.duplicate_score.toFixed(0)}%</p>
                      <p className="text-xs text-gray-500">score</p>
                    </div>
                  </div>

                  {/* SVG score ring */}
                  <div className="flex justify-center">
                    <div className="relative w-24 h-24">
                      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1f2937" strokeWidth="2.5" />
                        <circle
                          cx="18" cy="18" r="15.9" fill="none"
                          stroke={result.duplicate_score >= 85 ? "#ef4444" : result.duplicate_score >= 55 ? "#eab308" : "#10b981"}
                          strokeWidth="2.5"
                          strokeDasharray={`${result.duplicate_score} ${100 - result.duplicate_score}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-white">{result.duplicate_score.toFixed(0)}</span>
                        <span className="text-xs text-gray-500">score</span>
                      </div>
                    </div>
                  </div>

                  {result.best_match && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Field Match Scores</p>
                      {Object.entries(result.best_match.field_scores)
                        .filter(([k]) => k !== "skills_similarity")
                        .map(([field, score]) => <ScoreBar key={field} label={field} score={score} />)}
                    </div>
                  )}

                  {result.best_match && result.best_match.matching_fields.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Matched Fields</p>
                      <div className="flex flex-wrap gap-1">
                        {result.best_match.matching_fields.map((f) => (
                          <span key={f} className="px-2 py-0.5 bg-red-950 border border-red-800 text-red-300 text-xs rounded-full capitalize">{f}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.best_match && result.status !== "Unique" && (
                    <div className="p-2.5 bg-gray-800 rounded-lg space-y-1">
                      <p className="text-xs text-gray-500">Closest existing record</p>
                      <p className="text-sm text-white">{result.best_match.existing_name}</p>
                      <p className="text-xs text-gray-400">{result.best_match.existing_email}</p>
                    </div>
                  )}

                  <div className="flex justify-between text-xs text-gray-600 pt-1 border-t border-gray-800">
                    <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {result.checked_against} records</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {result.response_time_ms}ms</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Detection Thresholds</p>
              {[
                { label: "Exact Duplicate", range: "≥ 85%", dot: "bg-red-500", color: "text-red-400" },
                { label: "Suspicious", range: "55 – 84%", dot: "bg-yellow-500", color: "text-yellow-400" },
                { label: "Unique", range: "< 55%", dot: "bg-emerald-500", color: "text-emerald-400" },
              ].map((t) => (
                <div key={t.label} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${t.dot}`} /><span className={t.color}>{t.label}</span></span>
                  <span className="text-gray-500">{t.range}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
