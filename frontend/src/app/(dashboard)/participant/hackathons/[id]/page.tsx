"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { Calendar, Users, Target, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function HackathonDetails() {
  const { id } = useParams();
  const [registering, setRegistering] = useState(false);
  const [resume, setResume] = useState<File | null>(null);

  const { data: hackathon, isLoading } = useQuery({
    queryKey: ["hackathon", id],
    queryFn: () => api.get(`/hackathons/${id}/public`).then((res: any) => res.data.data),
  });

  const { data: myReg, refetch: refetchReg } = useQuery({
    queryKey: ["myRegistration", id],
    queryFn: () => api.get(`/hackathons/${id}/my-registration`).then((res: any) => res.data.data).catch(() => null),
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume) return alert("Please upload a resume");
    
    setRegistering(true);
    try {
      const formData = new FormData();
      formData.append("resume", resume);
      await api.post(`/hackathons/${id}/register`, formData);
      alert("Registration submitted! AI Duplicate check is running.");
      refetchReg();
    } catch (err: any) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading hackathon details...</div>;
  if (!hackathon) return <div className="p-8 text-center text-red-500">Hackathon not found.</div>;

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-white rounded-3xl overflow-hidden border shadow-sm">
        <div className="h-48 bg-gradient-to-r from-indigo-600 to-purple-800"></div>
        <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 -mt-16 relative z-10">
          <div className="bg-white p-6 rounded-2xl shadow-lg flex-1 border">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-3">
              {hackathon.status.replace("_", " ").toUpperCase()}
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">{hackathon.title}</h1>
            <p className="text-gray-600">{hackathon.description}</p>
          </div>

          <div className="w-full md:w-80 bg-white p-6 rounded-2xl shadow-lg border">
            {myReg ? (
              <div className={`p-4 rounded-xl text-center font-bold border ${
                myReg.status === "confirmed" ? "bg-green-50 text-green-700 border-green-200" :
                myReg.status === "pending_review" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                "bg-red-50 text-red-700 border-red-200"
              }`}>
                Registration Status: {myReg.status.toUpperCase()}
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <h3 className="font-bold text-gray-900">Register Now</h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Upload Resume (PDF/DOCX)</label>
                  <input 
                    type="file" 
                    accept=".pdf,.docx,.doc" 
                    onChange={(e) => setResume(e.target.files?.[0] || null)}
                    className="w-full text-sm border rounded-lg p-2" 
                    required 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={registering}
                  className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {registering ? "Submitting..." : "Submit Registration"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="text-indigo-600" /> Timeline
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <span className="font-semibold text-gray-700">Registration Closes</span>
                <span className="font-bold text-gray-900">{new Date(hackathon.timeline.registrationEnd).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <span className="font-semibold text-gray-700">Hackathon Starts</span>
                <span className="font-bold text-indigo-700">{new Date(hackathon.timeline.hackathonStart).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <span className="font-semibold text-gray-700">Submission Deadline</span>
                <span className="font-bold text-red-600">{new Date(hackathon.timeline.submissionDeadline).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="text-indigo-600" /> Problem Statements
            </h2>
            <div className="space-y-4">
              {hackathon.problemStatements?.length > 0 ? (
                hackathon.problemStatements.map((ps: any) => (
                  <div key={ps.id} className="p-4 border rounded-xl hover:border-indigo-300 transition">
                    <h3 className="font-bold text-lg text-gray-900">{ps.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{ps.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">Problem statements will be revealed closer to the event.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Event Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Max Participants</span>
                <span className="font-bold text-gray-900">{hackathon.config.maxParticipants}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Team Size</span>
                <span className="font-bold text-gray-900">{hackathon.config.minTeamSize} - {hackathon.config.maxTeamSize}</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-6">
            <ShieldCheck className="text-indigo-600 mb-3" size={32} />
            <h3 className="font-bold text-indigo-900 mb-2">Fairness Guarantee</h3>
            <p className="text-sm text-indigo-700">This event is protected by FairJudge AI to ensure unbiased evaluations and skill-balanced team matching.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
