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
  const completed = assignments.filter(a => a.status === "submitted").length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Evaluation Progress</h2>
        <span className="font-bold text-gray-500">{completed} / {total} Completed</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
        <div className="bg-green-500 h-4 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
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
