"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CheckCircle, XCircle } from "lucide-react";

export default function PendingVerifications() {
  const { data: pending, isLoading, refetch } = useQuery({
    queryKey: ["pendingHackathons"],
    queryFn: () => api.get("/admin/hackathons/pending").then((res: any) => res.data.data),
  });

  const handleVerify = async (id: string, action: 'verify' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this hackathon?`)) return;
    try {
      await api.post(`/admin/hackathons/${id}/${action}`);
      refetch();
    } catch (err: any) {
      alert(`Failed to ${action} hackathon: ${err.response?.data?.message || err.message}`);
    }
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading pending verifications...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-gray-900 mb-6">Pending Verifications</h1>

      {pending?.length === 0 ? (
        <div className="bg-white rounded-2xl border shadow-sm p-12 text-center">
          <CheckCircle size={48} className="text-green-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">All caught up!</h3>
          <p className="text-gray-500 mt-2">There are no hackathons waiting for verification.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pending?.map((hack: any) => (
            <div key={hack._id} className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition">
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-2xl text-gray-900 mb-1">{hack.title}</h3>
                    <p className="text-sm text-gray-500">Organizer: <span className="font-semibold text-gray-700">{hack.organizerId?.fullName || hack.organizerId}</span></p>
                  </div>
                  <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">
                    PENDING
                  </span>
                </div>
                
                <p className="text-gray-600 line-clamp-2">{hack.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl text-sm border">
                  <div>
                    <span className="block text-gray-500 font-semibold mb-1">Max Participants</span>
                    <span className="font-bold text-gray-900">{hack.config.maxParticipants}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 font-semibold mb-1">Team Size</span>
                    <span className="font-bold text-gray-900">{hack.config.minTeamSize}-{hack.config.maxTeamSize}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-gray-500 font-semibold mb-1">Date</span>
                    <span className="font-bold text-gray-900">{new Date(hack.timeline.hackathonStart).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-48 flex flex-col gap-3 justify-center border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                <button 
                  onClick={() => handleVerify(hack._id, 'verify')}
                  className="flex justify-center items-center gap-2 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition"
                >
                  <CheckCircle size={18} /> Approve
                </button>
                <button 
                  onClick={() => handleVerify(hack._id, 'reject')}
                  className="flex justify-center items-center gap-2 bg-red-50 text-red-700 font-bold py-3 rounded-xl hover:bg-red-100 border border-red-200 transition"
                >
                  <XCircle size={18} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
