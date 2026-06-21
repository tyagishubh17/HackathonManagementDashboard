"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { PlusCircle, Search } from "lucide-react";

export default function OrganizerHackathons() {
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const { data: hackathons, isLoading, refetch } = useQuery({
    queryKey: ["myHackathons"],
    queryFn: () => api.get("/hackathons/my-hackathons").then((res: any) => res.data.data),
  });

  const handlePublish = async (id: string) => {
    setPublishingId(id);
    try {
      await api.post(`/hackathons/${id}/publish`);
      alert("Hackathon submitted for verification successfully!");
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to publish hackathon. Make sure all settings and at least one problem statement are added.");
    } finally {
      setPublishingId(null);
    }
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading hackathons...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-gray-900">My Hackathons</h1>
        <Link 
          href="/organizer/hackathons/create" 
          className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <PlusCircle size={20} /> Create New
        </Link>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search your hackathons..." className="pl-10 pr-4 py-2 border rounded-full text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64 max-w-full" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-t">
                <th className="py-3 px-4 text-sm font-semibold text-gray-500 rounded-tl-xl">Title</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-500">Status</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-500">Verification</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-500">Registrations</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-500 rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {hackathons?.map((hack: any) => (
                <tr key={hack._id} className="hover:bg-gray-50 transition">
                  <td className="py-4 px-4 text-gray-900">
                    <div className="font-bold">{hack.title}</div>
                    {hack.verificationStatus === 'rejected' && hack.rejectionReason && (
                      <div className="text-xs text-red-600 font-normal mt-1 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5 max-w-md">
                        <strong>Feedback:</strong> {hack.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      {hack.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      hack.verificationStatus === 'verified' ? 'bg-green-50 text-green-700 border border-green-200' :
                      hack.verificationStatus === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                      'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {hack.verificationStatus.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium text-gray-600">{hack.stats?.totalRegistrations || 0}</td>
                  <td className="py-4 px-4 flex gap-2 items-center">
                    <Link href={`/organizer/hackathons/${hack._id}`} className="text-indigo-600 font-bold hover:underline text-sm border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition">
                      Manage Hub
                    </Link>
                    {(hack.status === "draft" || hack.verificationStatus === "rejected") && (
                      <button
                        onClick={() => handlePublish(hack._id)}
                        disabled={publishingId === hack._id}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition"
                      >
                        {publishingId === hack._id ? "Publishing..." : "Publish"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
