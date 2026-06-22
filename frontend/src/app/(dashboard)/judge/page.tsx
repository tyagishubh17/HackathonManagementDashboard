"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { BookOpen, Clock, AlertCircle, CheckCircle, Loader, Shield } from "lucide-react";
import { useState } from "react";

export default function JudgeAssignmentsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "draft" | "submitted">("all");

  // Fetch judge's assignments
  const { data: assignmentsResponse, isLoading } = useQuery({
    queryKey: ["judgeAssignments"],
    queryFn: () =>
      api.get(`/evaluations/my-assignments`).then((res: any) => res.data),
  });

  // Safe Extraction: Always guarantee we are interacting with an iterable array structure
  const assignments = Array.isArray(assignmentsResponse?.data) 
    ? assignmentsResponse.data 
    : Array.isArray(assignmentsResponse) 
      ? assignmentsResponse 
      : [];

  const filteredAssignments = assignments.filter((a: any) => {
    if (!a) return false;
    if (filter === "all") return true;
    return a?.status === filter;
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <Loader className="animate-spin mx-auto text-indigo-600 mb-3" size={32} />
        <p className="text-gray-600 font-semibold">Loading your assignments...</p>
      </div>
    );
  }

  const draftCount = assignments.filter((a: any) => a?.status === "draft").length;
  const submittedCount = assignments.filter((a: any) => a?.status === "submitted").length;

  // Extract panel info safely from the first assignment object if available
  const sampleHackathonData = assignments.length > 0 ? assignments[0]?.projectId?.hackathonId : null;
  const assignedPanel = sampleHackathonData?.assignedPanel;
  const panelMembers = sampleHackathonData?.reviewers;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="text-indigo-600" size={32} />
          <h1 className="text-3xl font-black text-gray-900">Your Assignments</h1>
        </div>
        <p className="text-gray-600">Review and score projects assigned to you by the organizers.</p>
      </div>

      {/* ======================================================== */}
      {/* VISIBILITY SHIELD PANEL MATRIX BANNER                    */}
      {/* ======================================================== */}
      {assignedPanel && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md flex-shrink-0">
            <Shield size={24} />
          </div>
          <div className="space-y-1">
            <div className="font-black text-sm uppercase tracking-wider text-blue-900 flex items-center gap-2">
              🛡️ Visibility Shield Panel Matrix Active
            </div>
            <p className="text-sm text-blue-700">
              You are assigned to evaluate submissions under <span className="font-extrabold text-blue-900 text-base">Panel {assignedPanel}</span>. Your scores are sync-locked with your panel peers for strict consistency.
            </p>
            {Array.isArray(panelMembers) && panelMembers.length > 0 && (
              <p className="text-xs font-mono text-blue-600 pt-1">
                <span className="font-bold">Active Panel Group Reviewers:</span> {panelMembers.map((m: any) => m.fullName || m.email).join(", ")}
              </p>
            )}
          </div>
        </div>
      )}
      {/* ======================================================== */}

      {/* Stats Counter Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border p-6 shadow-sm">
          <p className="text-gray-600 text-sm font-semibold">Total Assignments</p>
          <p className="text-3xl font-black text-indigo-600">{assignments.length}</p>
        </div>
        <div className="bg-yellow-50 rounded-2xl border border-yellow-200 p-6">
          <p className="text-yellow-800 text-sm font-semibold">Pending (Draft)</p>
          <p className="text-3xl font-black text-yellow-600">{draftCount}</p>
        </div>
        <div className="bg-green-50 rounded-2xl border border-green-200 p-6">
          <p className="text-green-800 text-sm font-semibold">Completed</p>
          <p className="text-3xl font-black text-green-600">{submittedCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3 bg-white rounded-2xl border p-2 w-fit">
        {(["all", "draft", "submitted"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-6 py-2 font-bold rounded-lg transition ${
              filter === tab
                ? "bg-indigo-600 text-white"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment: any) => {
            if (!assignment) return null;
            
            // Safe Project Populate Guard Checking
            const projectData = assignment.projectId && typeof assignment.projectId === "object"
              ? assignment.projectId
              : { 
                  title: "Project Pending Synchronization", 
                  description: "Awaiting database synchronization parameters.", 
                  techStack: [] 
                };

            return (
              <div
                key={assignment._id}
                className="bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h2 className="text-xl font-bold text-gray-900">
                        {projectData.title || "Untitled Project"}
                      </h2>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          assignment.status === "draft"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {assignment.status === "draft" ? (
                          <>
                            <Clock size={14} /> Draft
                          </>
                        ) : (
                          <>
                            <CheckCircle size={14} /> Submitted
                          </>
                        )}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-3">
                      {projectData.description 
                        ? `${projectData.description.substring(0, 120)}...` 
                        : "No description log summary added."}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {projectData.techStack?.slice(0, 4).map((tech: string) => (
                        <span
                          key={tech}
                          className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-semibold"
                        >
                          {tech}
                        </span>
                      ))}
                      {projectData.techStack?.length > 4 && (
                        <span className="text-gray-600 text-xs px-2 py-1">
                          +{projectData.techStack.length - 4} more
                        </span>
                      )}
                    </div>

                    {assignment.totalScore > 0 && (
                      <div className="flex items-center gap-6 mt-2">
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">Your Score</p>
                          <p className="text-2xl font-black text-indigo-600">{assignment.totalScore}/100</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => router.push(`/judge/assignments/${assignment._id}`)}
                    className={`px-6 py-3 font-bold rounded-lg transition whitespace-nowrap h-fit ${
                      assignment.status === "draft"
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {assignment.status === "draft" ? "Score Now" : "View"}
                  </button>
                </div>

                {assignment.biasFlags && assignment.biasFlags.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-start gap-2 text-orange-700 bg-orange-50 p-3 rounded-lg border border-orange-200">
                      <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-semibold">
                        ⚠️ Bias Alert: {assignment.biasFlags.join(", ")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed">
            <AlertCircle className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600 font-semibold">No assignments to display</p>
            <p className="text-gray-500 text-sm mt-1">Check back later for new assigned projects.</p>
          </div>
        )}
      </div>
    </div>
  );
}