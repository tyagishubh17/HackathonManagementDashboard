"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";

export const AssignedProjects = () => {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await api.get("/evaluations/my-assignments");
        setEvaluations(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading assignments...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">My Assigned Evaluations</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {evaluations.map((ev) => (
          <div key={ev._id} className="bg-white rounded-xl shadow-sm border p-6 flex flex-col hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">{ev.projectId?.title || "Unknown Project"}</h2>
                <p className="text-sm text-gray-500">{ev.projectId?.hackathonId?.title}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${ev.status === "submitted" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                {ev.status.toUpperCase()}
              </span>
            </div>
            
            <div className="mt-auto pt-4 flex justify-between items-center border-t">
              <span className="text-sm font-semibold">Score: {ev.status === "submitted" ? ev.totalScore : "--"}/100</span>
              <button 
                onClick={() => window.location.href = `/evaluations/${ev._id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-blue-700"
              >
                {ev.status === "submitted" ? "View" : "Evaluate"}
              </button>
            </div>
          </div>
        ))}
        {evaluations.length === 0 && <p className="col-span-full text-center text-gray-500">You have no pending assignments.</p>}
      </div>
    </div>
  );
};
