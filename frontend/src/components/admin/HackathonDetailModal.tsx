"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";

interface HackathonDetailModalProps {
  hackathon: any;
  onClose: () => void;
  onVerified: () => void;
}

export const HackathonDetailModal: React.FC<HackathonDetailModalProps> = ({ hackathon, onClose, onVerified }) => {
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApprove = async () => {
    if (!window.confirm(`Are you sure you want to approve ${hackathon.title}?`)) return;
    
    setLoading(true);
    try {
      await api.post(`/admin/hackathons/${hackathon._id}/verify`);
      onVerified();
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed");
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (rejectionReason.length < 20) {
      setError("Rejection reason must be at least 20 characters.");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/admin/hackathons/${hackathon._id}/reject`, { rejectionReason });
      onVerified();
    } catch (err: any) {
      setError(err.response?.data?.message || "Rejection failed");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold">{hackathon.title}</h2>
            <p className="text-sm text-gray-500 mt-1">Organized by {hackathon.organizerId?.fullName} ({hackathon.organizerId?.email})</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-black font-bold text-xl">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

          {/* Details Section */}
          <section>
            <h3 className="font-bold border-b pb-2 mb-3">Overview</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{hackathon.description}</p>
          </section>

          <section>
            <h3 className="font-bold border-b pb-2 mb-3">Timeline</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded border">
                <span className="block font-semibold text-xs text-gray-500">Reg Start</span>
                {new Date(hackathon.timeline.registrationStart).toLocaleString()}
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <span className="block font-semibold text-xs text-gray-500">Reg End</span>
                {new Date(hackathon.timeline.registrationEnd).toLocaleString()}
              </div>
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <span className="block font-semibold text-xs text-blue-500">Hackathon Start</span>
                {new Date(hackathon.timeline.hackathonStart).toLocaleString()}
              </div>
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <span className="block font-semibold text-xs text-blue-500">Hackathon End</span>
                {new Date(hackathon.timeline.hackathonEnd).toLocaleString()}
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-bold border-b pb-2 mb-3">Rubric ({hackathon.rubric.reduce((acc: number, r: any) => acc + r.weight, 0)}%)</h3>
            <div className="grid grid-cols-1 gap-2">
              {hackathon.rubric.map((r: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 border rounded text-sm">
                  <span className="font-semibold">{r.criteria}</span>
                  <span className="text-gray-600">{r.description}</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">{r.weight}%</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-bold border-b pb-2 mb-3">Problem Statements ({hackathon.problemStatements?.length || 0})</h3>
            <div className="space-y-2">
              {hackathon.problemStatements?.map((ps: any, idx: number) => (
                <div key={idx} className="p-3 border rounded">
                  <h4 className="font-bold">{ps.title} <span className="bg-gray-200 text-xs px-2 py-0.5 rounded font-normal ml-2">{ps.category}</span></h4>
                  <p className="text-sm text-gray-600 mt-1">{ps.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Action Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          {isRejecting ? (
            <div className="w-full">
              <textarea 
                className="w-full border rounded p-3 text-sm mb-3" 
                rows={3} 
                placeholder="Explain the required changes (min 20 characters)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button disabled={loading} onClick={() => setIsRejecting(false)} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                <button disabled={loading} onClick={handleReject} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">Confirm Rejection</button>
              </div>
            </div>
          ) : (
            <>
              <button disabled={loading} onClick={() => setIsRejecting(true)} className="px-6 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50">Reject</button>
              <button disabled={loading} onClick={handleApprove} className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 shadow-sm">Approve Hackathon</button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
