"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { Loader, Users, Sparkles, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function OrganizerDashboard() {
  const routerParams = useParams();
  const [assigning, setAssigning] = useState(false);
  const [panelsData, setPanelsData] = useState<{ A: string[]; B: string[] } | null>(null);
  const [hackathonData, setHackathonData] = useState<any>(null);
  const [loadingContext, setLoadingContext] = useState(true);

  // Safely extract active database identifier parameter string
  const hackathonId = routerParams?.id || "6a3770ebedfbcfc90965451c";

  // Guard initial configuration load pipelines against 404 network drops
  useEffect(() => {
    const loadDashboardContext = async () => {
      try {
        setLoadingContext(true);
        
        // Try fetching the public hackathon overview metrics safely
        const res = await api.get(`/hackathons/${hackathonId}/public`);
        setHackathonData(res.data?.data || res.data);
        
        // Optional: Safely pre-fetch panel data if it already exists in the DB
        const panelRes = await api.get(`/evaluations/hackathons/${hackathonId}/reviewers`).catch(() => null);
        if (panelRes?.data?.panels) {
          setPanelsData(panelRes.data.panels);
        }
      } catch (err) {
        console.warn("Initial dashboard stats are empty. Ready for new auto-assignment run.");
      } finally {
        setLoadingContext(false);
      }
    };
    
    if (hackathonId) loadDashboardContext();
  }, [hackathonId]);

  const handleAutoAssign = async () => {
    setAssigning(true);
    setPanelsData(null); 
    try {
      // Calls the automated reviewer panel assignment matrix allocation engine
      const res = await api.post(`/evaluations/assign-reviewers/${hackathonId}`);
      
      if (res.data?.success || res.data?.panels) {
        toast.success("AI 3-3 Panel Assignment complete!");
        setPanelsData(res.data.panels);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to distribute reviewer assignments.");
    } finally {
      setAssigning(false);
    }
  };

  if (loadingContext) {
    return (
      <div className="p-10 text-center flex flex-col items-center justify-center min-h-[40vh]">
        <Loader className="animate-spin text-indigo-600 mb-2" size={32} />
        <p className="text-sm text-gray-500 font-medium">Syncing orchestration workspace metadata...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      
      {/* Configuration Header Card */}
      <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-2">
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
          ⚙️ Hackathon Orchestration Control Panel
        </h1>
        <p className="text-sm text-gray-500">
          {hackathonData?.title 
            ? `Managing Parameters for: ${hackathonData.title}` 
            : "Manage system evaluation parameters, load reviewer distributions, and monitor statistical variance metrics."}
        </p>
      </div>

      {/* Reviewer Allocation Controls Section */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-indigo-600" size={20} /> Reviewer Panel Matrix Management
          </h2>
          <p className="text-xs text-gray-500">
            Automatically partition 6 registered judges into balanced evaluation tracks (Panel A and Panel B).
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={handleAutoAssign}
            disabled={assigning}
            className="px-6 py-3 font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {assigning ? (
              <>
                <Loader className="animate-spin" size={18} /> Running Matrix Formations...
              </>
            ) : (
              <>
                <Sparkles size={18} /> Run Automated 3-3 Panel Assignment
              </>
            )}
          </button>
        </div>

        {/* Real-Time Panel Allocation Display */}
        {panelsData && (
          <div className="mt-6 space-y-4 border-t pt-6 bg-slate-50/50 p-6 rounded-2xl border border-dashed">
            <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
              <CheckCircle size={16} /> Panel Configuration Distributed Successfully:
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Panel A Isolation Card Container */}
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

              {/* Panel B Isolation Card Container */}
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
            
            <p className="text-xs text-gray-400 font-mono italic">
              *Projects have been divided equally. Cross-panel visibility locks are now actively enforced.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
