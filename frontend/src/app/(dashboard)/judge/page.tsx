"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ClipboardList, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function JudgeDashboard() {
  const { data: assignments, isLoading } = useQuery({
    queryKey: ["myAssignments"],
    queryFn: () => api.get("/evaluations/my-assignments").then((res: any) => res.data.data),
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading assignments...</div>;

  const pending = assignments?.filter((a: any) => a.status === 'draft').length || 0;
  const completed = assignments?.filter((a: any) => a.status === 'completed').length || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-gray-900">Judge Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500">Total Assignments</p>
            <p className="text-3xl font-black text-indigo-600 mt-1">{assignments?.length || 0}</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-xl text-indigo-600"><ClipboardList size={32}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500">Pending</p>
            <p className="text-3xl font-black text-yellow-600 mt-1">{pending}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-xl text-yellow-600"><Clock size={32}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500">Completed</p>
            <p className="text-3xl font-black text-green-600 mt-1">{completed}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl text-green-600"><CheckCircle size={32}/></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6 mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Assignments</h2>
        
        {assignments?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">You have no pending assignments.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {assignments?.slice(0, 5).map((assign: any) => (
              <div key={assign._id} className="border rounded-xl p-4 flex justify-between items-center hover:shadow-md transition">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Project: {assign.projectId?.name || assign.projectId}</h3>
                  <p className="text-sm text-gray-500">Hackathon: {assign.hackathonId?.title || assign.hackathonId}</p>
                </div>
                <div>
                  {assign.status === 'completed' ? (
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Completed</span>
                  ) : (
                    <Link 
                      href={`/judge/assignments/${assign._id}`}
                      className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-indigo-700 transition shadow-sm"
                    >
                      Evaluate
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}