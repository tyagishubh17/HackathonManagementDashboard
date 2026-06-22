"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { Loader, History, ArrowRight, CheckCircle, Trophy } from "lucide-react";

export default function JudgeHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/evaluations/my-assignments");
        // Filter only completed or resolved evaluations
        const completed = (res.data.data || []).filter(
          (a: any) => a.status === "submitted" || a.status === "resolved"
        );
        // Sort by updatedAt descending
        completed.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setHistory(completed);
      } catch (err) {
        console.error("Error loading judge history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <Loader className="animate-spin text-indigo-600 mb-3" size={32} />
        <p className="text-gray-600 font-semibold">Loading past evaluations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      
      {/* Header Context Tracking Block */}
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
          <History className="text-indigo-600" /> Evaluation History
        </h1>
        <p className="text-sm text-gray-500">
          Review all your past project scores and feedback submissions across different hackathons.
        </p>
      </div>

      {/* Dynamic Data Array Lists Grid Layout */}
      {history.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed p-12 text-center text-gray-500 max-w-xl mx-auto">
          📭 You have not submitted any evaluations yet. Your completed reviews will appear here.
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item: any) => {
            const project = item.projectId || {};
            const hackathonTitle = item.hackathonId?.title || project.hackathonId?.title || "Unknown Hackathon";
            const scoreTotal = item.totalScore || 0;

            return (
              <div 
                key={item._id} 
                className="bg-white rounded-2xl border p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-200 hover:shadow-md hover:border-indigo-200"
              >
                <div className="flex-1 space-y-2 w-full">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1 block">
                        {hackathonTitle}
                      </span>
                      <h3 className="text-xl font-black text-gray-900 line-clamp-1">
                        {project.title || "Untitled Project"}
                      </h3>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                      <CheckCircle size={12} /> {item.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {project.description || "No project description available."}
                  </p>

                  <div className="text-xs text-gray-400 font-medium pt-2">
                    Evaluated on: {new Date(item.updatedAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 w-full md:w-auto shrink-0 md:border-l md:pl-6">
                  <div className="text-center bg-gray-50 px-6 py-3 rounded-xl border w-full md:w-auto">
                    <div className="text-xs font-bold text-gray-500 mb-1 flex items-center justify-center gap-1">
                       <Trophy size={14} className="text-yellow-500" /> FINAL SCORE
                    </div>
                    <div className="text-3xl font-black text-indigo-700">
                      {scoreTotal}
                    </div>
                  </div>
                  
                  <Link 
                    href={`/judge/assignments/${item._id}`}
                    className="w-full text-center px-4 py-2 text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl transition flex items-center justify-center gap-1"
                  >
                    View Details <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
