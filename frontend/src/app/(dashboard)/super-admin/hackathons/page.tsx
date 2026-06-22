"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";

export default function SuperAdminHackathonsPage() {
  const queryClient = useQueryClient();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: hackathons, isLoading } = useQuery({
    queryKey: ["allHackathons"],
    queryFn: () => api.get("/admin/hackathons/all?limit=100").then((res: any) => res.data.data),
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/hackathons/${id}/edits/acknowledge`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allHackathons"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/hackathons/${id}/edits/reject`, { rejectionReason }),
    onSuccess: () => {
      setRejectingId(null);
      setRejectionReason("");
      queryClient.invalidateQueries({ queryKey: ["allHackathons"] });
    },
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading hackathons...</div>;

  const unreviewedEdits = (hackathons || []).filter((h: any) => h.hasUnreviewedEdits);

  return (
    <div className="space-y-8">
      {unreviewedEdits.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-amber-600 flex items-center gap-2">
            Unreviewed Organizer Edits
            <span className="bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full">{unreviewedEdits.length}</span>
          </h2>
          <div className="grid gap-4">
            {unreviewedEdits.map((h: any) => (
              <div key={h._id} className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{h.title}</h3>
                    <p className="text-sm text-gray-500">Organizer: {h.organizerId?.fullName}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => acknowledgeMutation.mutate(h._id)}
                      disabled={acknowledgeMutation.isPending}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50"
                    >
                      Acknowledge
                    </button>
                    <button 
                      onClick={() => setRejectingId(h._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700"
                    >
                      Reject Hackathon
                    </button>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border text-sm">
                  <span className="font-bold text-gray-700 block mb-1">Reason for change:</span>
                  <p className="text-gray-800">{h.editReason}</p>
                </div>

                {rejectingId === h._id && (
                  <div className="mt-4 bg-white p-4 rounded-lg border border-red-200">
                    <h4 className="font-bold text-red-700 mb-2">Rejection Reason</h4>
                    <textarea 
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3} 
                      className="w-full border rounded px-3 py-2 text-sm mb-3"
                      placeholder="Explain why this edit requires rejecting the hackathon..."
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setRejectingId(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
                      <button 
                        onClick={() => rejectMutation.mutate(h._id)}
                        disabled={rejectMutation.isPending || rejectionReason.length < 10}
                        className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-red-700 disabled:opacity-50"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h1 className="text-3xl font-black text-gray-900">All Hackathons</h1>
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-500">Title</th>
                <th className="p-4 text-sm font-semibold text-gray-500">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-500">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(hackathons || []).map((h: any) => (
                <tr key={h._id} className="hover:bg-gray-50">
                  <td className="p-4 font-bold">{h.title}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded text-xs bg-gray-100 font-medium">{h.status}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      h.verificationStatus === "verified" ? "bg-green-100 text-green-800" :
                      h.verificationStatus === "pending" ? "bg-amber-100 text-amber-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {h.verificationStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link href="/super-admin/pending" className="text-indigo-600 font-bold hover:underline inline-block mt-4">
          Review pending verifications →
        </Link>
      </div>
    </div>
  );
}
