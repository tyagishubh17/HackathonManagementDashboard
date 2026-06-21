"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { Loader, ClipboardList, CheckCircle, ArrowRight } from "lucide-react";

export default function JudgeAssignmentsListPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await api.get("/evaluations/my-assignments");
        setAssignments(res.data.data || []);
      } catch (err) {
        console.error("Error loading active judge assignments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  // Structural configurations matching the hardcoded dashboard matrix layer
  const assignedPanel = "A";
  const panelMembersList = "Judge 1 (panel_peer1@fairjudge.com), Judge 2 (You), Judge 3 (panel_peer3@fairjudge.com)";

  if (loading) {
    return (
      <div className="p-10 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <Loader className="animate-spin text-indigo-600 mb-3" size={32} />
        <p className="text-gray-600 font-semibold">Loading assignment parameters...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      
      {/* 🛡️ VISIBILITY SHIELD PANEL MATRIX BANNER */}
      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-6 rounded-xl shadow-sm flex flex-col gap-1">
        <div className="font-black text-sm uppercase tracking-wider text-blue-900 flex items-center gap-2">
          🛡️ Visibility Shield Panel Matrix Active
        </div>
        <p className="text-sm text-blue-700">
          You are grading this track under <span className="font-extrabold text-blue-900 text-base">Panel {assignedPanel}</span>. Your baseline evaluations are completely hidden from outer groups.
        </p>
        <p className="text-xs font-mono text-blue-600 pt-1">
          <span className="font-bold">Panel Group Reviewers:</span> {panelMembersList}
        </p>
      </div>

      {/* Header Context Tracking Block */}
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
          <ClipboardList className="text-indigo-600" /> Assigned Projects Matrix
        </h1>
        <p className="text-sm text-gray-500">
          Review your current project assignment track allocations below. Click any card profile wrapper to score the submission elements.
        </p>
      </div>

      {/* Dynamic Data Array Lists Grid Layout */}
      {assignments.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed p-12 text-center text-gray-500 max-w-xl mx-auto">
          📭 No projects have been distributed to your active panel matrix tracking block yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((item: any) => {
            const project = item.projectId || {};
            const isCompleted = item.status === "submitted";

            return (
              <div 
                key={item._id} 
                className={`bg-white rounded-2xl border p-6 shadow-sm flex flex-col justify-between transition-all duration-200 ${
                  isCompleted ? "border-green-200 bg-green-50/20" : "hover:shadow-md hover:border-gray-300"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                      {project.title || "Untitled Project"}
                    </h3>
                    {isCompleted ? (
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                        <CheckCircle size={12} /> Graded
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
                        Pending Evaluation
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-3 min-h-[3.75rem]">
                    {project.description || "No summary log specifications appended yet."}
                  </p>

                  {project.techStack && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.techStack.slice(0, 3).map((tech: string) => (
                        <span key={tech} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 3 && (
                        <span className="text-xs text-gray-400 font-bold self-center">
                          +{project.techStack.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t mt-4 flex items-center justify-between">
                  <div className="text-xs font-mono text-gray-400">
                    ID: {item._id.substring(0, 8)}...
                  </div>
                  
                  <Link 
                    href={`/judge/assignments/${item._id}`}
                    className={`px-4 py-2 text-sm font-bold rounded-xl transition flex items-center gap-1 ${
                      isCompleted 
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
                        : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                    }`}
                  >
                    {isCompleted ? "Review Scores" : "Start Grading"} <ArrowRight size={14} />
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
