"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Users, Code, Trophy } from "lucide-react";

export default function MyTeams() {
  const { data: teams, isLoading } = useQuery({
    queryKey: ["myTeams"],
    queryFn: () => api.get("/teams/my-teams").then((res: any) => res.data.data),
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading teams...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-gray-900 mb-6">My Teams</h1>
      
      {teams?.length === 0 ? (
        <div className="bg-white rounded-2xl border shadow-sm p-12 text-center">
          <Users size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No teams yet</h3>
          <p className="text-gray-500 mt-2">You haven't joined any teams. Register for a hackathon and form a team to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams?.map((team: any) => (
            <div key={team._id} className="bg-white rounded-2xl border shadow-sm p-6 hover:shadow-md transition relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
              <div className="flex justify-between items-start mb-4 pl-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
                  <p className="text-sm text-gray-500">Hackathon ID: {team.hackathonId}</p>
                </div>
                <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                  {team.members?.length || 0} Members
                </div>
              </div>
              
              <div className="pl-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Members</p>
                  <div className="flex flex-wrap gap-2">
                    {team.members?.map((m: any) => (
                      <div key={m._id} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border">
                        <div className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold uppercase">
                          {m.fullName?.charAt(0) || 'M'}
                        </div>
                        <span className="text-sm font-medium">{m.fullName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
