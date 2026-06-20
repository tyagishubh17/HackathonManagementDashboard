"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";

export const AppealManager = ({ evaluation }: { evaluation: any }) => {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  if (evaluation.status !== "appealed") return null;

  const handleResolve = async () => {
    setLoading(true);
    try {
      await api.put(`/evaluations/${evaluation._id}/appeal-review`, {
        appealResponse: response,
        statusChange: "resolved"
      });
      alert("Appeal resolved successfully");
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to resolve appeal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 p-6 rounded-xl mt-6">
      <h3 className="text-red-800 font-bold text-lg mb-2 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        Active Appeal Request
      </h3>
      <div className="bg-white p-4 rounded text-sm text-gray-700 shadow-sm border border-red-100 mb-4">
        <strong>Reason for appeal:</strong> {evaluation.appealReason}
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">Organizer Resolution Notes</label>
        <textarea 
          rows={3} 
          value={response} 
          onChange={(e) => setResponse(e.target.value)} 
          className="w-full border rounded p-3 text-sm" 
          placeholder="Explain the resolution of this appeal..."
        ></textarea>
        <div className="flex justify-end gap-3">
          <button 
            onClick={handleResolve} 
            disabled={loading || !response} 
            className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 disabled:opacity-50 text-sm"
          >
            Mark as Resolved
          </button>
        </div>
      </div>
    </div>
  );
};
