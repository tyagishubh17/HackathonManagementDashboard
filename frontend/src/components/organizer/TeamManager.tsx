"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";

export const TeamManager = ({ hackathonId }: { hackathonId: string }) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = async () => {
    try {
      const res = await api.get(`/hackathons/${hackathonId}/teams`);
      setTeams(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [hackathonId]);

  const handleDisband = async (teamId: string) => {
    if (!window.confirm("Disbanding the team will remove all members. Continue?")) return;
    try {
      await api.delete(`/hackathons/${hackathonId}/teams/${teamId}`);
      fetchTeams();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to disband team");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Teams ({teams.length})</h2>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center">Loading teams...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map(t => (
            <div key={t._id} className="border rounded-xl p-5 hover:shadow-md transition bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg truncate pr-4">{t.name}</h3>
                <button onClick={() => handleDisband(t._id)} className="text-red-500 hover:bg-red-100 p-1 rounded transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>

              <div className="space-y-2 mb-4">
                {t.members.map((m: any) => (
                  <div key={m._id} className="flex items-center gap-2 text-sm bg-white border p-2 rounded">
                    <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">{m.fullName?.charAt(0)}</div>
                    <span className="truncate">{m.fullName}</span>
                  </div>
                ))}
              </div>

              {t.problemStatementId && (
                <div className="text-xs text-gray-500 border-t pt-3">
                  <strong>Problem:</strong> {t.problemStatementId.title}
                </div>
              )}
            </div>
          ))}
          {teams.length === 0 && <p className="col-span-full text-center text-gray-500">No teams formed yet.</p>}
        </div>
      )}
    </div>
  );
};
