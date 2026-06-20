"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Calendar, Users, Target, PlusCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OrganizerDashboard() {
  const { data: hackathons, isLoading } = useQuery({
    queryKey: ["myHackathons"],
    queryFn: () => api.get("/hackathons/my-hackathons").then((res: any) => res.data.data),
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading dashboard...</div>;

  const activeCount = hackathons?.filter((h: any) => h.status !== 'draft' && h.status !== 'completed').length || 0;
  const draftCount = hackathons?.filter((h: any) => h.status === 'draft').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-gray-900">Organizer Overview</h1>
        <Link 
          href="/organizer/hackathons/create" 
          className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-200"
        >
          <PlusCircle size={20} /> Create Hackathon
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500">Active Events</p>
            <p className="text-3xl font-black text-indigo-600 mt-1">{activeCount}</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-xl text-indigo-600"><Calendar size={32}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500">Total Hackathons</p>
            <p className="text-3xl font-black text-green-600 mt-1">{hackathons?.length || 0}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl text-green-600"><Target size={32}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500">Drafts</p>
            <p className="text-3xl font-black text-gray-600 mt-1">{draftCount}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl text-gray-600"><Calendar size={32}/></div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border shadow-sm mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Hackathons</h2>
          <Link href="/organizer/hackathons" className="text-sm font-bold text-indigo-600 flex items-center hover:underline">
            View All <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        
        {hackathons?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't created any hackathons yet.</p>
            <Link href="/organizer/hackathons/create" className="text-indigo-600 font-bold hover:underline">Create your first hackathon</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-sm font-semibold text-gray-500">Hackathon Name</th>
                  <th className="pb-3 text-sm font-semibold text-gray-500">Status</th>
                  <th className="pb-3 text-sm font-semibold text-gray-500">Verification</th>
                  <th className="pb-3 text-sm font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {hackathons?.slice(0, 5).map((hack: any) => (
                  <tr key={hack._id} className="hover:bg-gray-50 transition">
                    <td className="py-4 font-bold text-gray-900">{hack.title}</td>
                    <td className="py-4">
                      <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                        {hack.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        hack.verificationStatus === 'verified' ? 'bg-green-50 text-green-700' :
                        hack.verificationStatus === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {hack.verificationStatus.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4">
                      <Link href={`/organizer/hackathons/${hack._id}`} className="text-indigo-600 font-bold hover:underline text-sm">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}