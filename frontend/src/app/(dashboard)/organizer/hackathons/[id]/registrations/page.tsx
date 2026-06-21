"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Download, Mail, X } from "lucide-react";

export default function RegistrationsManagement() {
  const { id } = useParams();
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([]);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

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

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRegistrations(registrations?.map((r: any) => r._id) || []);
    } else {
      setSelectedRegistrations([]);
    }
  };

  const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, regId: string) => {
    if (e.target.checked) {
      setSelectedRegistrations(prev => [...prev, regId]);
    } else {
      setSelectedRegistrations(prev => prev.filter(id => id !== regId));
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRegistrations.length === 0) return alert("Select at least one participant");
    
    setIsSending(true);
    try {
      await api.post(`/hackathons/${id}/registrations/email`, {
        registrationIds: selectedRegistrations,
        subject: emailSubject,
        message: emailMessage,
      });
      alert(`Email sent successfully to ${selectedRegistrations.length} participant(s)!`);
      setIsEmailModalOpen(false);
      setEmailSubject("");
      setEmailMessage("");
      setSelectedRegistrations([]);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to send email");
    } finally {
      setIsSending(false);
    }
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
          
          {selectedRegistrations.length > 0 && (
            <button 
              onClick={() => setIsEmailModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-indigo-700 transition shadow-sm"
            >
              <Mail size={16} /> Send Email ({selectedRegistrations.length})
            </button>
          )}
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
              <th className="py-3 px-4 text-sm font-semibold text-gray-500 w-10">
                <input 
                  type="checkbox" 
                  checked={registrations?.length > 0 && selectedRegistrations.length === registrations?.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-500">Applicant Name</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-500">Status</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-500">AI Duplicate Score</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {registrations?.map((reg: any) => (
              <tr key={reg._id} className="hover:bg-gray-50">
                <td className="py-4 px-4">
                  <input 
                    type="checkbox" 
                    checked={selectedRegistrations.includes(reg._id)}
                    onChange={(e) => handleSelectOne(e, reg._id)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
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
                <td colSpan={5} className="text-center py-8 text-gray-500">No registrations found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in relative">
            <button 
              onClick={() => setIsEmailModalOpen(false)} 
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Mail className="text-indigo-600" /> Send Email
            </h2>
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                <input 
                  type="text" 
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  required 
                  placeholder="e.g. Update on your Hackathon Registration"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                <textarea 
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="w-full border rounded-xl p-3 h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  required 
                  placeholder="Write your email content here..."
                />
              </div>
              <button 
                type="submit" 
                disabled={isSending}
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {isSending ? "Sending Emails..." : "Send Email"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
