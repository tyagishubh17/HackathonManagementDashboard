"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";

export const ReviewerAssignment = ({ hackathonId, onRefresh }: { hackathonId: string, onRefresh: () => void }) => {
  const [loading, setLoading] = useState(false);

  const handleAutoAssign = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/hackathons/${hackathonId}/reviewers/assign`);
      alert(`AI successfully generated ${res.data.count} evaluation assignments based on judge expertise.`);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to auto-assign reviewers");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 shadow-sm mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            AI Reviewer Assignment
          </h2>
          <p className="text-sm text-indigo-700 mt-1 max-w-xl">
            Automatically distribute submitted projects to judges. The AI engine ensures optimal load balancing while matching project tech stacks against judge expertise.
          </p>
        </div>
        <button 
          onClick={handleAutoAssign}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-blue-700 transition disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? "Calculating Assignments..." : "Auto-Assign Reviewers"}
        </button>
      </div>
    </div>
  );
};
