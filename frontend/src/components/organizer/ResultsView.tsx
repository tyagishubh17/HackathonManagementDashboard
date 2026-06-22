"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";

export const ResultsView = ({ hackathonId }: { hackathonId: string }) => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get(`/hackathons/${hackathonId}/results`);
        setResults(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [hackathonId]);

  if (loading) return <div className="text-center py-4">Calculating Final Results...</div>;

  return (
    <div className="bg-white rounded-xl shadow border p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
        Leaderboard
      </h2>

      <div className="space-y-3">
        {results.map((r, idx) => (
          <div key={r._id} className="flex items-center bg-gray-50 border p-4 rounded-xl hover:shadow-md transition">
            <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg mr-4 ${
              idx === 0 ? 'bg-yellow-100 text-yellow-600' :
              idx === 1 ? 'bg-gray-200 text-gray-600' :
              idx === 2 ? 'bg-orange-100 text-orange-600' :
              'bg-blue-50 text-blue-600'
            }`}>
              #{idx + 1}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">{r.title || "Unknown Project"}</h3>
              <p className="text-xs text-gray-500">Total Evaluations: {r.evaluationsCount}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-blue-700">{(r.averageScore).toFixed(1)}</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Score</div>
            </div>
          </div>
        ))}
        {results.length === 0 && <p className="text-center text-gray-500 py-6">No finalized evaluations yet.</p>}
      </div>
    </div>
  );
};
