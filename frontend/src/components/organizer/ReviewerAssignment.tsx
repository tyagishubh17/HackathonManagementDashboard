"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { CheckCircle, Loader, Sparkles } from "lucide-react";

export const ReviewerAssignment = ({ hackathonId, onRefresh }: { hackathonId: string, onRefresh: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [hackathon, setHackathon] = useState<any>(null);
  const [panelsData, setPanelsData] = useState<{ A: string[]; B: string[] } | null>(null);

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const [hRes, pRes] = await Promise.all([
          api.get(`/hackathons/${hackathonId}`),
          api.get(`/evaluations/hackathons/${hackathonId}/reviewers`).catch(() => null)
        ]);
        setHackathon(hRes.data.data);
        if (pRes?.data?.panels) {
          setPanelsData(pRes.data.panels);
        }
      } catch (err) {
        console.error("Failed to load context", err);
      }
    };
    fetchContext();
  }, [hackathonId]);

  const handleAutoAssign = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/evaluations/assign-reviewers/${hackathonId}`);
      toast.success("AI 3-3 Panel Assignment complete!");
      if (res.data?.panels) {
        setPanelsData(res.data.panels);
      }
      onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to auto-assign reviewers");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizePanels = async () => {
    setFinalizing(true);
    try {
      await api.post(`/evaluations/hackathons/${hackathonId}/finalize-panels`);
      toast.success("Panels are permanently locked.");
      setHackathon((prev: any) => ({ ...prev, panelsFinalized: true }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to finalize panels.");
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6 mb-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          ⚙️ Reviewer Panel Matrix Management
        </h2>
        <p className="text-xs text-gray-500">
          Automatically distribute submitted projects to judges. The AI engine ensures optimal load balancing while matching project tech stacks against judge expertise.
        </p>
      </div>

      <div className="pt-2 flex items-center gap-4">
        <button
          onClick={handleAutoAssign}
          disabled={loading || hackathon?.panelsFinalized}
          className={`px-6 py-3 font-bold rounded-xl text-white transition flex items-center gap-2 shadow-sm ${hackathon?.panelsFinalized ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
        >
          {loading ? (
            <><Loader className="animate-spin" size={18} /> Running...</>
          ) : (
            <><Sparkles size={18} /> Auto-Assign Reviewers</>
          )}
        </button>

        {!hackathon?.panelsFinalized && panelsData && (
          <button
            onClick={handleFinalizePanels}
            disabled={finalizing}
            className="px-6 py-3 font-bold rounded-xl bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-2 shadow-sm"
          >
            {finalizing ? "Locking..." : "Finalize Panels"}
          </button>
        )}

        {hackathon?.panelsFinalized && (
          <div className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 font-bold rounded-lg flex items-center gap-2">
            🔒 Panels Finalized
          </div>
        )}
      </div>

      {panelsData && (
        <div className="mt-6 space-y-4 border-t pt-6 bg-slate-50/50 p-6 rounded-2xl border border-dashed">
          <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
            <CheckCircle size={16} /> Panel Configuration Distributed Successfully:
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-blue-100 rounded-xl p-5 shadow-sm space-y-3">
              <div className="font-black text-xs uppercase tracking-wider text-blue-900 bg-blue-50 px-3 py-1 rounded-md inline-block">
                🛡️ Panel A Isolation Group
              </div>
              <ul className="space-y-2">
                {panelsData.A?.map((judgeName: string, i: number) => (
                  <li key={i} className="text-sm text-gray-700 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    {judgeName}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-purple-100 rounded-xl p-5 shadow-sm space-y-3">
              <div className="font-black text-xs uppercase tracking-wider text-purple-900 bg-purple-50 px-3 py-1 rounded-md inline-block">
                🛡️ Panel B Isolation Group
              </div>
              <ul className="space-y-2">
                {panelsData.B?.map((judgeName: string, i: number) => (
                  <li key={i} className="text-sm text-gray-700 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    {judgeName}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
