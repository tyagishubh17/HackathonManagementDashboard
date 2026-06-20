"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { HackathonStatusBadge } from "../organizer/HackathonStatusBadge";

export const HackathonDiscovery = () => {
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublic = async () => {
      try {
        const res = await api.get(`/hackathons?search=${search}`);
        setHackathons(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    // debounce search
    const timer = setTimeout(fetchPublic, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Discover Hackathons</h1>
        <input 
          type="text" 
          placeholder="Search..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-full px-4 py-2 w-64 shadow-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-10">Loading events...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hackathons.map((h) => (
            <div key={h.id} className="bg-white border rounded-2xl shadow-sm hover:shadow-lg transition p-5 flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <HackathonStatusBadge status={h.status} />
                <span className="text-xs font-bold text-gray-500">{h.stats.participantsCount} / {h.config.maxParticipants || "∞"} Joined</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{h.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{h.shortDescription || h.description}</p>
              
              <div className="mt-auto pt-4 border-t flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  <span className="block font-semibold">Starts</span>
                  {new Date(h.timeline.hackathonStart).toLocaleDateString()}
                </div>
                <button 
                  onClick={() => window.location.href = `/hackathons/${h.id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
          {hackathons.length === 0 && <p className="col-span-full text-center text-gray-500">No hackathons found.</p>}
        </div>
      )}
    </div>
  );
};
