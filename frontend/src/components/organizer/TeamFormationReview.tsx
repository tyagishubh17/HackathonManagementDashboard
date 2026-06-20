"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";

export const TeamFormationReview = ({ hackathonId, onRefresh }: { hackathonId: string, onRefresh: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [suggestedTeams, setSuggestedTeams] = useState<any[]>([]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/hackathons/${hackathonId}/teams/form`);
      setSuggestedTeams(res.data.data);
      alert("AI has generated suggested teams. In a real app, you would review them here before saving.");
      // If the backend actually saved them, we call onRefresh()
      // But typically, AI suggests, organizer reviews, then calls an "approve teams" endpoint.
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to generate AI teams");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-blue-100 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            Auto-Form Teams via AI
          </h2>
          <p className="text-sm text-indigo-700 mt-1">Our AI will match unassigned participants based on complementary skills and experience.</p>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:bg-indigo-700 transition disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? "Analyzing Participants..." : "Generate Teams"}
        </button>
      </div>

      {suggestedTeams.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold mb-3 border-b pb-2">AI Suggestions Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {suggestedTeams.map((team, idx) => (
              <div key={idx} className="bg-white p-4 rounded border shadow-sm">
                <div className="font-bold mb-2">Suggested Team {idx + 1}</div>
                <ul className="list-disc pl-5 text-gray-700">
                  {team.members.map((m: any, i: number) => <li key={i}>{m.fullName} - {m.skills.join(", ")}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
