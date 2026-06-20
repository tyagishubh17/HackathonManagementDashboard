"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "../../hooks/useAuth";

export const HackathonDetail = ({ hackathonId }: { hackathonId: string }) => {
  const { user } = useAuth();
  const [hackathon, setHackathon] = useState<any>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/hackathons/${hackathonId}/public`);
        setHackathon(res.data.data);

        if (user) {
          try {
            const regRes = await api.get(`/hackathons/${hackathonId}/registrations/my-registration`);
            if (regRes.data.data) setIsRegistered(true);
          } catch (e) {
            // Not registered
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [hackathonId, user]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!hackathon) return <div className="p-10 text-center">Hackathon not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white mb-8 shadow-lg">
        <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-bold mb-4 backdrop-blur-sm">
          {hackathon.status.toUpperCase()}
        </div>
        <h1 className="text-4xl font-extrabold mb-4">{hackathon.title}</h1>
        <p className="text-blue-100 text-lg max-w-2xl">{hackathon.description}</p>
        
        <div className="mt-8 flex items-center gap-4">
          {isRegistered ? (
            <span className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold shadow flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              You are Registered
            </span>
          ) : hackathon.status === "registration_open" ? (
            <button 
              onClick={() => window.location.href = `/hackathons/${hackathon.id}/register`}
              className="bg-white text-blue-700 px-8 py-3 rounded-lg font-bold shadow hover:bg-blue-50 transition"
            >
              Register Now
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Problem Statements</h2>
            <div className="space-y-4">
              {hackathon.problemStatements.map((ps: any) => (
                <div key={ps.id} className="border p-4 rounded-xl bg-white shadow-sm">
                  <h3 className="font-bold text-lg">{ps.title}</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded mt-1 inline-block">{ps.category} - {ps.difficulty}</span>
                  <p className="text-gray-600 mt-2">{ps.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 border p-5 rounded-xl">
            <h3 className="font-bold border-b pb-2 mb-3">Important Dates</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="block text-gray-500 font-semibold">Registration Ends</span>
                <span>{new Date(hackathon.timeline.registrationEnd).toLocaleString()}</span>
              </div>
              <div>
                <span className="block text-gray-500 font-semibold">Hackathon Starts</span>
                <span>{new Date(hackathon.timeline.hackathonStart).toLocaleString()}</span>
              </div>
              <div>
                <span className="block text-gray-500 font-semibold">Submission Deadline</span>
                <span>{new Date(hackathon.timeline.submissionDeadline).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
