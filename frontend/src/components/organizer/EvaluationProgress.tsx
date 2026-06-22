"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";

export const EvaluationProgress = ({ hackathonId }: { hackathonId: string }) => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await api.get(`/hackathons/${hackathonId}/reviewers/assignments`);
        setAssignments(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [hackathonId]);

  if (loading) return <div className="text-center py-4">Loading evaluation data...</div>;

  const total = assignments.length;
  const completed = assignments.filter(a => a.status === "submitted" || a.status === "resolved").length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  const judgeProgressMap = new Map();
  assignments.forEach(a => {
    const jName = a.reviewerId?.fullName || "Unknown Judge";
    if (!judgeProgressMap.has(jName)) {
      judgeProgressMap.set(jName, { total: 0, completed: 0 });
    }
    const stat = judgeProgressMap.get(jName);
    stat.total += 1;
    if (a.status === "submitted" || a.status === "resolved") {
      stat.completed += 1;
    }
  });
  const judgeProgress = Array.from(judgeProgressMap.entries()).map(([name, stats]) => ({ name, ...stats as any }));

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mb-8 space-y-8">
      {/* Judge Progress Overview */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          📊 Judge Progress Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {judgeProgress.map((jp, i) => {
            const jpPercent = jp.total === 0 ? 0 : Math.round((jp.completed / jp.total) * 100);
            return (
              <div key={i} className="p-4 border rounded-xl bg-gray-50 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800 text-sm truncate">{jp.name}</span>
                  <span className="text-xs font-bold text-gray-500">{jp.completed}/{jp.total} Scored</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all duration-500 ${jpPercent === 100 ? "bg-green-500" : "bg-blue-500"}`} style={{ width: `${jpPercent}%` }}></div>
                </div>
              </div>
            );
          })}
          {judgeProgress.length === 0 && <p className="text-sm text-gray-500">No reviewers are currently assigned.</p>}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Global Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">Detailed Evaluation Matrix</h2>
          <span className="font-bold text-gray-500 text-sm">{completed} / {total} Total Completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
          <div className="bg-green-500 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-3">Project</th>
              <th className="p-3">Assigned Judge</th>
              <th className="p-3">Status</th>
              <th className="p-3">Bias Flags</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(a => (
              <tr key={a._id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-semibold text-gray-800 truncate max-w-[200px]">{a.projectId?.title}</td>
                <td className="p-3 text-gray-600">{a.reviewerId?.fullName}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${a.status === 'submitted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {a.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-3">
                  {a.biasFlags?.length > 0 ? (
                    <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded text-xs border border-red-200">
                      ⚠️ {a.biasFlags.length} Flags
                    </span>
                  ) : "-"}
                </td>
                <td className="p-3">
                  {a.status !== "submitted" && (
                    <button className="text-blue-600 text-xs font-bold hover:underline">Reassign</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {assignments.length === 0 && <p className="text-center p-6 text-gray-500">No reviewers assigned yet.</p>}
      </div>
    </div>
  );
};
