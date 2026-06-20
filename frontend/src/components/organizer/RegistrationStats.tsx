"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";

export const RegistrationStats = ({ hackathonId }: { hackathonId: string }) => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get(`/hackathons/${hackathonId}/registrations/stats`);
        setStats(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, [hackathonId]);

  if (!stats) return <div className="text-center p-4">Loading stats...</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.statusCounts?.map((s: any) => (
        <div key={s._id} className="bg-white p-4 rounded-xl shadow-sm border text-center">
          <div className="text-3xl font-bold text-gray-800">{s.count}</div>
          <div className="text-sm text-gray-500 font-semibold capitalize">{s._id.replace("_", " ")}</div>
        </div>
      ))}
    </div>
  );
};
