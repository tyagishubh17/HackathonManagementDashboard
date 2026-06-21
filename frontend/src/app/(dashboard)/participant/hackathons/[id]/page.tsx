"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { Calendar, Users, Target, ShieldCheck, FileText, Clock, Megaphone } from "lucide-react";
import { useState, useEffect } from "react";

// Countdown component for upcoming problem statements
const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;
      
      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft("LIVE NOW! Please refresh.");
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [targetDate]);

  return <span className="font-mono font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">{timeLeft}</span>;
};

export default function HackathonDetails() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [registering, setRegistering] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const { data: hackathon, isLoading } = useQuery({
    queryKey: ["hackathon", id],
    queryFn: () => api.get(`/hackathons/${id}/public`).then((res: any) => res.data.data),
  });

  const { data: myReg, refetch: refetchReg } = useQuery({
    queryKey: ["myRegistration", id],
    queryFn: () => api.get(`/hackathons/${id}/my-registration`).then((res: any) => res.data.data).catch(() => null),
  });

  const { data: hackathonTeams } = useQuery({
    queryKey: ["hackathonTeams", id],
    queryFn: () => api.get(`/hackathons/${id}/teams`).then((res: any) => res.data.data).catch(() => []),
    enabled: !!myReg,
  });

  const ackMutation = useMutation({
    mutationFn: () => api.post(`/hackathons/${id}/registrations/my-registration/acknowledge-update`),
    onSuccess: () => {
      setShowUpdateModal(false);
      refetchReg();
    }
  });

  useEffect(() => {
    if (hackathon && myReg) {
      const lastSeen = new Date(myReg.lastSeenProblemUpdate || myReg.createdAt).getTime();
      const hasUnseenUpdate = hackathon.problemStatements?.some((ps: any) => {
        return ps.updatedAt && new Date(ps.updatedAt).getTime() > lastSeen;
      });
      if (hasUnseenUpdate) {
        setShowUpdateModal(true);
      }
    }
  }, [hackathon, myReg]);

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
      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-indigo-500 animate-in fade-in zoom-in">
            <div className="flex justify-center mb-6">
              <div className="bg-indigo-100 p-4 rounded-full text-indigo-600">
                <FileText size={48} />
              </div>
            </div>
            <h2 className="text-2xl font-black text-center text-gray-900 mb-4">Problem Statement Updated!</h2>
            <p className="text-gray-600 text-center mb-8">
              The organizers have updated the problem statement(s) for this hackathon. Kindly go through it once again to ensure you have the latest information.
            </p>
            <button 
              onClick={() => ackMutation.mutate()}
              disabled={ackMutation.isPending}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
            >
              {ackMutation.isPending ? "Acknowledging..." : "OK, I understand"}
            </button>
          </div>
        </div>
      )}

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
              <div className="space-y-4">
                <div className={`p-4 rounded-xl text-center font-bold border ${
                  myReg.status === "confirmed" ? "bg-green-50 text-green-700 border-green-200" :
                  myReg.status === "pending_review" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                  "bg-red-50 text-red-700 border-red-200"
                }`}>
                  Registration Status: {myReg.status.toUpperCase()}
                </div>
                {myReg.teamId && (
                  <div className="p-4 border rounded-xl bg-indigo-50/50 border-indigo-100 space-y-3 text-left">
                    <div className="flex items-center gap-2 text-indigo-900 font-bold">
                      <Users size={18} />
                      <span>{myReg.teamId.name}</span>
                    </div>
                    <div className="space-y-1.5">
                      {myReg.teamId.members?.map((m: any) => (
                        <div key={m._id} className="flex items-center gap-2 text-xs bg-white border p-2 rounded">
                          <div className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-[10px]">{m.fullName?.charAt(0)}</div>
                          <span className="truncate text-gray-700 font-medium">{m.fullName} {m._id === myReg.userId ? "(You)" : ""}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
              {myReg?.status === "confirmed" ? (
                hackathon.problemStatements?.length > 0 ? (
                  hackathon.problemStatements.map((ps: any) => (
                    <div key={ps.id} className="p-6 border rounded-xl hover:border-indigo-300 transition bg-white shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-xl text-gray-900">{ps.title}</h3>
                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">{ps.category}</span>
                      </div>
                      
                      {ps.isUpcoming ? (
                        <div className="mt-4 p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center flex flex-col items-center justify-center">
                          <Clock size={32} className="text-gray-400 mb-3" />
                          <p className="text-gray-600 font-medium mb-3">This problem statement will be revealed in:</p>
                          <CountdownTimer targetDate={ps.scheduledAt} />
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-700 mt-3 whitespace-pre-wrap">{ps.description}</p>
                          {ps.referenceFile && (
                            <div className="mt-4 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText className="text-indigo-600" size={24} />
                                <div>
                                  <p className="font-bold text-sm text-gray-900">{ps.referenceFile.fileName}</p>
                                  <p className="text-xs text-gray-500">Resource File</p>
                                </div>
                              </div>
                              <a 
                                href={`${api.defaults.baseURL}/hackathons/${id}/problem-statements/${ps.id}/download`} 
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700"
                              >
                                Download
                              </a>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic p-4 text-center bg-gray-50 rounded-xl">Problem statements will be revealed closer to the event.</p>
                )
              ) : (
                <p className="text-gray-500 italic p-4 text-center bg-gray-50 rounded-xl">Register successfully and get your registration confirmed to view problem statements.</p>
              )}
            </div>
          </div>

          {/* Teams list */}
          {myReg && hackathonTeams && hackathonTeams.length > 0 && (
            <div className="bg-white rounded-2xl border p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="text-indigo-600" /> Teams in this Hackathon ({hackathonTeams.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {hackathonTeams.map((team: any) => {
                  const isMyTeam = myReg.teamId && myReg.teamId._id === team._id;
                  return (
                    <div key={team._id} className={`p-5 border rounded-xl relative overflow-hidden bg-gray-50 hover:shadow-sm transition ${isMyTeam ? 'border-indigo-500 ring-2 ring-indigo-500/20' : ''}`}>
                      {isMyTeam && <span className="absolute top-0 right-0 bg-indigo-600 text-white px-2 py-0.5 text-[10px] font-bold rounded-bl-lg uppercase">My Team</span>}
                      <h4 className="font-bold text-lg text-gray-900 truncate mb-3">{team.name}</h4>
                      <div className="space-y-1.5">
                        {team.members?.map((m: any) => (
                          <div key={m._id} className="flex items-center gap-2 text-xs bg-white border px-2 py-1 rounded">
                            <span className="w-5 h-5 bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center font-bold text-[10px]">{m.fullName?.charAt(0)}</span>
                            <span className="truncate text-gray-700 font-medium">{m.fullName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {myReg?.status === "confirmed" && hackathon.announcements && hackathon.announcements.length > 0 && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 shadow-sm">
              <h3 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
                <Megaphone className="text-amber-600" size={20} /> Noticeboard
              </h3>
              <div className="space-y-4">
                {hackathon.announcements.map((a: any) => (
                  <div key={a.id} className="pb-4 border-b border-amber-200 last:border-0 last:pb-0">
                    <p className="text-xs font-bold text-amber-700 mb-1">{new Date(a.postedAt).toLocaleString()}</p>
                    <p className="text-sm text-amber-900 whitespace-pre-wrap">{a.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

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
