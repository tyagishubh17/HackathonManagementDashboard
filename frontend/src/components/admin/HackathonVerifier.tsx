"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { HackathonDetailModal } from "./HackathonDetailModal";

export const HackathonVerifier = () => {
  const [pendingHackathons, setPendingHackathons] = useState<any[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState<any | null>(null);

  const fetchPending = async () => {
    try {
      const res = await api.get("/admin/hackathons/pending");
      setPendingHackathons(res.data.data);
    } catch (err) {
      console.error("Failed to fetch pending hackathons", err);
    }
  };

  useEffect(() => {
    fetchPending();
    // Simulate real-time updates for now with polling, or would use socket.io
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold">Verification Queue</h2>
        <span className="bg-yellow-100 text-yellow-800 font-bold px-3 py-1 rounded-full text-sm">
          {pendingHackathons.length} Pending
        </span>
      </div>

      {pendingHackathons.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No hackathons pending verification.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3 font-semibold text-sm">Hackathon Title</th>
                <th className="p-3 font-semibold text-sm">Organizer</th>
                <th className="p-3 font-semibold text-sm">Submitted At</th>
                <th className="p-3 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingHackathons.map((h) => (
                <tr key={h._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{h.title}</td>
                  <td className="p-3 text-sm text-gray-600">{h.organizerId?.fullName || "Unknown"}</td>
                  <td className="p-3 text-sm text-gray-500">{new Date(h.publishedAt || h.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedHackathon(h)}
                      className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedHackathon && (
        <HackathonDetailModal
          hackathon={selectedHackathon}
          onClose={() => setSelectedHackathon(null)}
          onVerified={() => {
            setSelectedHackathon(null);
            fetchPending();
          }}
        />
      )}
    </div>
  );
};
