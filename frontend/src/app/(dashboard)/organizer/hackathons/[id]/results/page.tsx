"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const API_BASE = (api.defaults.baseURL as string) || "http://localhost:5000/api";
import { useParams } from "next/navigation";
import { Trophy, Medal, Award, Download, Users, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const RANK_CONFIG: Record<number, { label: string; color: string; bg: string; icon: any }> = {
  0: { label: "1st Place", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: Trophy },
  1: { label: "2nd Place", color: "text-slate-600", bg: "bg-slate-50 border-slate-200", icon: Medal },
  2: { label: "3rd Place", color: "text-orange-700", bg: "bg-orange-50 border-orange-200", icon: Award },
};

export default function ResultsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [publishError, setPublishError] = useState("");
  const [publishSuccess, setPublishSuccess] = useState("");

  const { data: hackathon } = useQuery({
    queryKey: ["hackathonMgmt", id],
    queryFn: () => api.get(`/hackathons/${id}`).then((res: any) => res.data.data),
  });

  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ["hackathonResults", id],
    queryFn: () => api.get(`/hackathons/${id}/results`).then((res: any) => res.data.data),
  });

  const { data: certificates, isLoading: certsLoading, refetch: refetchCerts } = useQuery({
    queryKey: ["hackathonCertificates", id],
    queryFn: () => api.get(`/hackathons/${id}/certificates`).then((res: any) => res.data.data),
    enabled: hackathon?.resultsPublished === true,
  });

  const publishMutation = useMutation({
    mutationFn: () => api.post(`/hackathons/${id}/publish-results`),
    onSuccess: (res: any) => {
      setPublishSuccess(res.data.message || "Results published successfully!");
      setPublishError("");
      queryClient.invalidateQueries({ queryKey: ["hackathonMgmt", id] });
      refetchCerts();
    },
    onError: (err: any) => {
      setPublishError(err.response?.data?.message || "Failed to publish results.");
      setPublishSuccess("");
    },
  });

  const canPublish = hackathon && ["evaluating", "completed"].includes(hackathon.status);

  if (resultsLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Publish Results Card */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Trophy className="text-amber-500" size={22} />
              Results & Certificates
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Publish evaluation results to generate participation certificates for all confirmed participants.
            </p>
          </div>

          {hackathon?.resultsPublished ? (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold">
              <CheckCircle size={16} />
              Results Published — {hackathon.resultsPublishedAt ? new Date(hackathon.resultsPublishedAt).toLocaleDateString() : ""}
            </div>
          ) : (
            <button
              onClick={() => publishMutation.mutate()}
              disabled={!canPublish || publishMutation.isPending}
              title={!canPublish ? "Hackathon must be in evaluating or completed status" : ""}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-sm"
            >
              {publishMutation.isPending ? (
                <><Loader2 size={16} className="animate-spin" /> Publishing...</>
              ) : (
                <><Trophy size={16} /> Publish Results & Generate Certificates</>
              )}
            </button>
          )}
        </div>

        {!canPublish && !hackathon?.resultsPublished && (
          <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            Hackathon must be in <strong className="mx-1">Evaluating</strong> or <strong className="mx-1">Completed</strong> status to publish results.
            Currently: <strong className="ml-1 capitalize">{hackathon?.status?.replace(/_/g, " ")}</strong>
          </div>
        )}

        {publishSuccess && (
          <div className="mt-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800 font-medium">
            <CheckCircle size={16} /> {publishSuccess}
          </div>
        )}
        {publishError && (
          <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-800 font-medium">
            <AlertCircle size={16} /> {publishError}
          </div>
        )}
      </div>

      {/* Ranked Results */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Evaluation Leaderboard</h2>

        {!results || results.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl text-gray-500">
            <Trophy size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No submitted evaluations yet.</p>
            <p className="text-sm mt-1">Results will appear here once judges submit their scores.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((r: any, idx: number) => {
              const cfg = RANK_CONFIG[idx] || { label: `#${idx + 1}`, color: "text-gray-600", bg: "bg-gray-50 border-gray-200", icon: Award };
              const Icon = cfg.icon;
              return (
                <div key={r._id} className={`flex items-center gap-4 p-4 border rounded-xl ${cfg.bg}`}>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-white border ${cfg.color} font-black text-sm shadow-sm flex-shrink-0`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <p className="font-bold text-gray-900 truncate">{r._id?.title || "Untitled Project"}</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                      <Users size={12} /> {r.evaluationsCount} evaluation{r.evaluationsCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-black text-gray-900">{r.averageScore?.toFixed(1)}</p>
                    <p className="text-xs text-gray-400">avg score</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Generated Certificates */}
      {hackathon?.resultsPublished && (
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="text-indigo-500" size={20} />
            Generated Certificates
            {certificates && (
              <span className="ml-2 bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {certificates.length}
              </span>
            )}
          </h2>

          {certsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>
          ) : !certificates || certificates.length === 0 ? (
            <p className="text-center text-gray-500 py-8 bg-gray-50 rounded-xl">No certificates generated yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-semibold">Participant</th>
                    <th className="pb-3 font-semibold">Email</th>
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold">Issued</th>
                    <th className="pb-3 font-semibold">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {certificates.map((cert: any) => (
                    <tr key={cert._id} className="hover:bg-gray-50 transition">
                      <td className="py-3 font-medium text-gray-900">{cert.userId?.fullName}</td>
                      <td className="py-3 text-gray-500">{cert.userId?.email}</td>
                      <td className="py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold capitalize border ${
                          cert.type === "winner" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          cert.type === "runner_up" ? "bg-slate-50 text-slate-600 border-slate-200" :
                          "bg-indigo-50 text-indigo-700 border-indigo-200"
                        }`}>
                          {cert.type?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500">{new Date(cert.issuedAt).toLocaleDateString()}</td>
                      <td className="py-3">
                        <a
                          href={`${API_BASE}/certificates/${cert._id}/download`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold text-xs bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                        >
                          <Download size={12} /> PDF
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
