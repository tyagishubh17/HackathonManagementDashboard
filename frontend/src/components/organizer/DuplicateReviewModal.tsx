"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";

export const DuplicateReviewModal = ({ registration, onClose, onRefresh }: { registration: any, onClose: () => void, onRefresh: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");

  const handleAction = async (status: string) => {
    if (status === "rejected" && reason.length < 10) return alert("Please provide a detailed rejection reason");
    
    setLoading(true);
    try {
      await api.put(`/hackathons/${registration.hackathonId}/registrations/${registration._id}/status`, {
        status,
        reason: status === "rejected" ? reason : undefined,
      });
      onRefresh();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const dup = registration.duplicateCheckResult;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="p-4 border-b bg-yellow-50 flex justify-between items-center">
          <h2 className="font-bold text-yellow-800 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            AI Duplicate Warning ({(dup.confidence * 100).toFixed(1)}% Match)
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">&times;</button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-600">
            Our AI system has flagged <strong>{registration.userId?.fullName}</strong> as a potential duplicate registration. 
            It matches closely with another user in the system.
          </p>

          <div className="bg-gray-50 border p-4 rounded text-sm space-y-2">
            <h3 className="font-bold border-b pb-2 mb-2">AI Reasoning</h3>
            <ul className="list-disc pl-5 text-gray-700">
              {dup.reasons?.map((r: string, i: number) => <li key={i}>{r}</li>)}
            </ul>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold">Rejection Reason (if rejecting)</label>
            <textarea 
              value={reason} 
              onChange={e => setReason(e.target.value)} 
              className="w-full border rounded p-2 text-sm" 
              rows={3} 
              placeholder="E.g., Suspected duplicate account violation..."
            ></textarea>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
          <button onClick={() => handleAction("rejected")} disabled={loading} className="px-4 py-2 border border-red-600 text-red-600 hover:bg-red-50 rounded text-sm font-semibold">Reject Registration</button>
          <button onClick={() => handleAction("confirmed")} disabled={loading} className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded text-sm font-semibold">Approve as Unique</button>
        </div>
      </div>
    </div>
  );
};
