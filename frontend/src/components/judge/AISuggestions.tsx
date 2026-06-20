"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";

export const AISuggestions = ({ evaluationId, existingSuggestions }: { evaluationId: string, existingSuggestions?: any }) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(existingSuggestions);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/evaluations/${evaluationId}/ai-suggest`);
      setSuggestions(res.data.data);
    } catch (err: any) {
      alert("AI Suggestion Engine is currently offline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-indigo-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          AI Copilot Suggestions
        </h3>
        {!suggestions && (
          <button 
            onClick={fetchSuggestions}
            disabled={loading}
            className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded font-bold hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Request Analysis"}
          </button>
        )}
      </div>

      {suggestions ? (
        <div className="space-y-3">
          <p className="text-sm text-indigo-800 bg-white p-3 rounded shadow-sm border border-indigo-50 italic">
            "{suggestions.rationale || "Based on the technical stack and problem description, this project meets high criteria standards."}"
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(suggestions.suggestedScores || {}).map(([crit, score]) => (
              <div key={crit} className="flex justify-between bg-white px-3 py-2 rounded shadow-sm">
                <span className="font-semibold text-gray-700">{crit}</span>
                <span className="font-bold text-indigo-600">{score as React.ReactNode}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-indigo-600/70">Click 'Request Analysis' to get AI-driven scoring recommendations based on the project's source code and description.</p>
      )}
    </div>
  );
};
