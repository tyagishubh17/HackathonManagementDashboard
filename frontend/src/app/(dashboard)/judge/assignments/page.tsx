"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { Search } from "lucide-react";

export default function JudgeAssignments() {
  const { data: assignments, isLoading } = useQuery({
    queryKey: ["myAssignments"],
    queryFn: () => api.get("/evaluations/my-assignments").then((res: any) => res.data.data),
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading assignments...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-gray-900">My Assignments</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search projects..." className="pl-10 pr-4 py-2 border rounded-full text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64 max-w-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {assignments?.map((assign: any) => (
          <div key={assign._id} className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-indigo-300 transition">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  assign.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                }`}>
                  {assign.status}
                </span>
                <span className="text-xs text-gray-500 font-semibold uppercase">Eval ID: {assign._id.substring(0,8)}</span>
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-1">Project: {assign.projectId?.name || assign.projectId}</h3>
              <p className="text-sm text-gray-500">Hackathon: {assign.hackathonId?.title || assign.hackathonId}</p>
            </div>
            
            <div className="w-full md:w-auto flex justify-end">
              {assign.status === 'completed' ? (
                <div className="text-center">
                  <p className="text-sm text-gray-500 font-semibold mb-1">Final Score</p>
                  <p className="text-2xl font-black text-green-600">{assign.totalScore}</p>
                </div>
              ) : (
                <Link 
                  href={`/judge/assignments/${assign._id}`}
                  className="w-full md:w-auto text-center bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                >
                  Start Evaluation
                </Link>
              )}
            </div>
          </div>
        ))}
        {assignments?.length === 0 && (
          <div className="bg-white rounded-2xl border shadow-sm p-12 text-center text-gray-500">
            No assignments found. Wait for organizers to assign projects to you.
          </div>
        )}
      </div>
    </div>
  );
}
