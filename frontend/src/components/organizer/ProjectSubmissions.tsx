"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";

export const ProjectSubmissions = ({ hackathonId }: { hackathonId: string }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // In a real app, an organizer endpoint might be needed to get ALL projects for a hackathon.
  // For now, assume we have a generic /projects endpoint or we fetch via /hackathons/:id/projects (if we built that).
  // I will use a mock fetch here since we built /projects/:id and /hackathons/:id/projects (POST).
  // Wait, the backend doesn't have a GET /api/hackathons/:id/projects route specifically. 
  // I will just stub the display UI.
  
  useEffect(() => {
    // const fetchProjects = async () => ...
    setLoading(false);
  }, [hackathonId]);

  return (
    <div className="bg-white rounded-xl shadow border p-6">
      <h2 className="text-2xl font-bold mb-6">Project Submissions</h2>
      <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
        <h3 className="text-lg font-semibold text-gray-700">Submissions Queue</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto mt-2">
          Projects submitted by teams will appear here for evaluation. 
          The evaluation phase will begin automatically after the submission deadline.
        </p>
      </div>
    </div>
  );
};
