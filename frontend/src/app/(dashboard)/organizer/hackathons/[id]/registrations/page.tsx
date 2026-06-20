"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Download } from "lucide-react";

export default function RegistrationsManagement() {
  const { id } = useParams();
  const [statusFilter, setStatusFilter] = useState("");

  const { data: registrations, isLoading, refetch } = useQuery({
    queryKey: ["hackathonRegistrations", id, statusFilter],
    queryFn: () => api.get(`/hackathons/${id}/registrations${statusFilter ? `?status=${statusFilter}` : ''}`).then((res: any) => res.data.data.registrations),
  });

  const handleStatusUpdate = async (regId: string, newStatus: string) => {
    try {
      await api.put(`/hackathons/${id}/registrations/${regId}/status`, { status: newStatus });
      refetch();
    } catch (err: any) {
      alert("Failed to update status");
    }
  };

  const handleExport = async () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/hackathons/${id}/registrations/export`, "_blank");
  };

  if (isLoading) return <div className="animate-pulse">Loading registrations...</div>;

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-green-50 text-green-700 font-bold px-4 py-2 rounded-xl hover:bg-green-100 transition border border-green-200"
        >
          <Download size={16} /> Export Excel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-y">
              <th className="py-3 px-4 text-sm font-semibold text-gray-500">Applicant Name</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-500">Status</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-500">AI Duplicate Score</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {registrations?.map((reg: any) => (
              <tr key={reg._id} className="hover:bg-gray-50">
                <td className="py-4 px-4 font-semibold text-gray-900">{reg.userId?.fullName || "Unknown"}</td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    reg.status === 'confirmed' ? 'bg-green-50 text-green-700' :
                    reg.status === 'pending_review' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {reg.status.replace("_", " ")}
                  </span>
                </td>
                <td className="py-4 px-4 font-medium text-gray-600">
                  {reg.aiDuplicateScore ? `${(reg.aiDuplicateScore * 100).toFixed(0)}%` : 'N/A'}
                </td>
                <td className="py-4 px-4 flex gap-2">
                  <button 
                    onClick={() => handleStatusUpdate(reg._id, 'confirmed')}
                    disabled={reg.status === 'confirmed'}
                    className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1.5 rounded disabled:opacity-50 hover:bg-indigo-100"
                  >
                    Confirm
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(reg._id, 'rejected')}
                    disabled={reg.status === 'rejected'}
                    className="text-xs bg-red-50 text-red-700 font-bold px-3 py-1.5 rounded disabled:opacity-50 hover:bg-red-100"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
            {registrations?.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">No registrations found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
