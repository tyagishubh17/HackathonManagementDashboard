"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Users, Folder, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ParticipantDashboard() {
  const { data: myTeams, isLoading: loadingTeams } = useQuery({
    queryKey: ["myTeams"],
    queryFn: () => api.get("/teams/my-teams").then((res: any) => res.data.data),
  });

  const { data: hackathons, isLoading: loadingHacks } = useQuery({
    queryKey: ["publicHackathons"],
    queryFn: () => api.get("/hackathons").then((res: any) => res.data.data),
  });

  if (loadingTeams || loadingHacks) return <div className="p-8 text-center animate-pulse">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-gray-900">Welcome Back!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500">Active Teams</p>
            <p className="text-3xl font-black text-indigo-600 mt-1">{myTeams?.length || 0}</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-xl text-indigo-600"><Users size={32}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500">Projects Submitted</p>
            <p className="text-3xl font-black text-green-600 mt-1">{myTeams?.filter((t: any) => t.projectId).length || 0}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl text-green-600"><Folder size={32}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500">Available Hackathons</p>
            <p className="text-3xl font-black text-purple-600 mt-1">{hackathons?.length || 0}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl text-purple-600"><Calendar size={32}/></div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border shadow-sm mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recommended Hackathons</h2>
          <Link href="/participant/hackathons" className="text-sm font-bold text-indigo-600 flex items-center hover:underline">
            View All <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hackathons?.slice(0, 4).map((hack: any) => (
            <Link key={hack.id} href={`/participant/hackathons/${hack.id}`} className="border rounded-xl p-4 hover:border-indigo-500 hover:shadow-md transition group">
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition">{hack.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mt-1">{hack.description}</p>
              <div className="mt-4 flex gap-2">
                <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-1 rounded">{hack.status}</span>
                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">Starts: {new Date(hack.timeline.hackathonStart).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}