"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Target, ShieldCheck, FileText, Clock, Megaphone, Upload, CheckCircle, AlertTriangle, Loader, Users, Trophy } from "lucide-react";
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
  const router = useRouter();

  // Project submission state flags
  const [team, setTeam] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [techStack, setTechStack] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [formError, setFormError] = useState("");

  const [registering, setRegistering] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Fetch hackathon public fields
  const { data: hackathon, isLoading } = useQuery({
    queryKey: ["hackathon", id],
    queryFn: () => api.get(`/hackathons/${id}/public`).then((res: any) => res.data.data),
  });

  // Fetch participant registration context
  const { data: myReg, refetch: refetchReg } = useQuery({
    queryKey: ["myRegistration", id],
    queryFn: () => api.get(`/hackathons/${id}/my-registration`).then((res: any) => res.data.data).catch(() => null),
  });

  // Fetch existing team/project profile structures if initialized
  useEffect(() => {
    async function loadProjectContext() {
      if (myReg && myReg.status === "confirmed") {
        try {
          const projectRes = await api.get(`/teams/my-teams`);
          const matchingTeam = projectRes.data.data.find((t: any) => t.hackathonId?._id === id);
          if (matchingTeam) {
            setTeam(matchingTeam);
            if (matchingTeam.project) {
              setProject(matchingTeam.project);
              setTitle(matchingTeam.project.title || "");
              setDescription(matchingTeam.project.summary || matchingTeam.project.description || "");
              setVideoLink(matchingTeam.project.videoLink || "");
              setTechStack(matchingTeam.project.techStack?.join(", ") || "");
            }
          }
        } catch (err) {
          console.log("No container initialized yet.");
        }
      }
    }
    loadProjectContext();
  }, [myReg, id]);

  useEffect(() => {
    if (hackathon?.resultsPublished) {
      api.get(`/hackathons/${id}/results`).then((res: any) => {
        setResults(res.data.data);
      }).catch(() => null);
    }
  }, [hackathon, id]);

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
      alert("Registration submitted successfully!");
      refetchReg();
    } catch (err: any) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  // Helper sync logic for baseline data payloads
  const saveProjectDraft = async () => {
    const payload = {
      title: title || "Untitled Solution",
      description: description || "No workspace overview log added.",
      summary: description || "No workspace overview log added.",
      videoLink: videoLink,
      techStack: techStack ? techStack.split(",").map((s) => s.trim()) : ["General"],
    };
    if (!project) {
      const res = await api.post(`/hackathons/${id}/projects`, payload);
      return res.data.data;
    } else {
      const res = await api.put(`/projects/${project._id}`, payload);
      return res.data.data;
    }
  };

  // Upload handles multipart document streaming straight into system buffers
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) return;
    try {
      setFormError("");
      setUploading(true);
      const targetProject = project ? project : await saveProjectDraft();
      const formData = new FormData();
      formData.append("ppt", selectedFiles[0]);
      
      const res = await api.post(`/projects/${targetProject._id}/files`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProject(res.data.data);
      setSelectedFiles(null);
      alert("PPT submittal recorded successfully!");
    } catch (err: any) {
      setFormError(err.response?.data?.message || "File upload processing error.");
    } finally {
      setUploading(false);
    }
  };

  // Dispatches pipeline analysis tasks across AI & human judge panels
  const handleSubmitProject = async () => {
    if (!project || !project.pptFile) {
      setFormError("Please upload a specification PPT prior to submission validation checkouts.");
      return;
    }
    try {
      setFormError("");
      setSubmitting(true);
      const targetProject = await saveProjectDraft();
      await api.post(`/projects/${targetProject._id}/submit`);
      alert("Submission locked! Project successfully routed to designated reviewer split panels.");
      refetchReg();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Pipeline execution failed.");
    } finally {
      setSubmitting(false);
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
            <div className="flex justify-center mb-6"><div className="bg-indigo-100 p-4 rounded-full text-indigo-600"><FileText size={48} /></div></div>
            <h2 className="text-2xl font-black text-center text-gray-900 mb-4">Problem Statement Updated!</h2>
            <p className="text-gray-600 text-center mb-8">The organizers updated problem details. Kindly review terms prior to coding configurations.</p>
            <button onClick={() => ackMutation.mutate()} disabled={ackMutation.isPending} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition shadow-lg">{ackMutation.isPending ? "Acknowledging..." : "OK, I understand"}</button>
          </div>
        </div>
      )}

      {/* Hero Banner Grid Section */}
      <div className="bg-white rounded-3xl overflow-hidden border shadow-sm">
        <div className="h-48 bg-gradient-to-r from-indigo-600 to-purple-800"></div>
        <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 -mt-16 relative z-10">
          <div className="bg-white p-6 rounded-2xl shadow-lg flex-1 border">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-3">{hackathon.status.replace("_", " ").toUpperCase()}</div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">{hackathon.title}</h1>
            <p className="text-gray-600">{hackathon.description}</p>
          </div>

          <div className="w-full md:w-80 bg-white p-6 rounded-2xl shadow-lg border">
            {myReg ? (
              <div className={`p-4 rounded-xl text-center font-bold border ${myReg.status === "confirmed" ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
                Registration Status: {myReg.status.toUpperCase()}
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <h3 className="font-bold text-gray-900">Register Now</h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Upload Resume (PDF/DOCX)</label>
                  <input type="file" accept=".pdf,.docx,.doc" onChange={(e) => setResume(e.target.files?.[0] || null)} className="w-full text-sm border rounded-lg p-2" required />
                </div>
                <button type="submit" disabled={registering} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition">{registering ? "Submitting..." : "Submit Registration"}</button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Hackathon Resource and Problem Statement Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Calendar className="text-indigo-600" /> Timeline</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl"><span className="font-semibold text-gray-700">Registration Closes</span><span className="font-bold text-gray-900">{new Date(hackathon.timeline.registrationEnd).toLocaleString()}</span></div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl"><span className="font-semibold text-gray-700">Hackathon Starts</span><span className="font-bold text-indigo-700">{new Date(hackathon.timeline.hackathonStart).toLocaleString()}</span></div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl"><span className="font-semibold text-gray-700">Submission Deadline</span><span className="font-bold text-red-600">{new Date(hackathon.timeline.submissionDeadline).toLocaleString()}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Target className="text-indigo-600" /> Problem Statements</h2>
            <div className="space-y-4">
              {hackathon.problemStatements?.length > 0 ? (
                hackathon.problemStatements.map((ps: any) => (
                  <div key={ps.id} className="p-6 border rounded-xl bg-white shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-xl text-gray-900">{ps.title}</h3>
                      <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">{ps.category}</span>
                    </div>
                    {ps.isUpcoming ? (
                      <div className="mt-4 p-6 bg-gray-50 border border-dashed rounded-xl text-center flex flex-col items-center">
                        <Clock size={32} className="text-gray-400 mb-3" />
                        <p className="text-gray-600 font-medium mb-3">Revealed in:</p>
                        <CountdownTimer targetDate={ps.scheduledAt} />
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-700 mt-3 whitespace-pre-wrap">{ps.description}</p>
                        {ps.referenceFile && (
                          <div className="mt-4 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="text-indigo-600" size={24} />
                              <div><p className="font-bold text-sm text-gray-900">{ps.referenceFile.fileName}</p><p className="text-xs text-gray-500">Resource Asset</p></div>
                            </div>
                            <a href={`${api.defaults.baseURL}/hackathons/${id}/problem-statements/${ps.id}/download`} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700">Download</a>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic p-4 text-center bg-gray-50 rounded-xl">No active statements.</p>
              )}
            </div>
          </div>

          {/* MY TEAM PANEL */}
          {myReg && myReg.status === "confirmed" && team && (
            <div className="bg-white rounded-2xl border p-8 shadow-sm space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  <Users className="text-indigo-600" /> My Team: {team.name}
                </h2>
                <p className="text-sm text-gray-500">Your registered team members for this hackathon.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {team.members?.map((member: any) => (
                  <div key={member._id} className="p-4 bg-gray-50 rounded-xl border flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                      {member.fullName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{member.fullName}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 📎 EMBEDDED PROJECT & PDF FILE UPLOAD WORKSPACE CARD */}
          {myReg && myReg.status === "confirmed" && team && (
            <div className="bg-white rounded-2xl border p-8 shadow-sm space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-2xl font-black text-gray-900">Project Workspace & Submission Panel</h2>
                <p className="text-sm text-gray-500">Manage descriptions, video links, and attach PPT files here.</p>
              </div>

              {formError && (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 border p-4 rounded-xl text-sm font-semibold">
                  <AlertTriangle size={18} /> {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Solution Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} disabled={project?.status === "submitted"} className="w-full border p-3 rounded-xl text-sm" placeholder="e.g., Task Automation Engine" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tech Stack (Commas)</label>
                  <input type="text" value={techStack} onChange={(e) => setTechStack(e.target.value)} disabled={project?.status === "submitted"} className="w-full border p-3 rounded-xl text-sm" placeholder="React, Python, Node.js" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Video Link (YouTube/Drive)</label>
                  <input type="url" value={videoLink} onChange={(e) => setVideoLink(e.target.value)} disabled={project?.status === "submitted"} className="w-full border p-3 rounded-xl text-sm" placeholder="https://youtube.com/..." />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">Overview Log Summary</label>
                  <span className="text-[10px] text-gray-400 font-bold tracking-wide uppercase">Min 50 Characters</span>
                </div>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} disabled={project?.status === "submitted"} rows={4} className="w-full border p-3 rounded-xl text-sm" placeholder="Provide a detailed summary of your project architecture, solution, and innovation (minimum 50 characters required)..." />
              </div>

              {project?.status !== "submitted" && (
                <form onSubmit={handleFileUpload} className="space-y-3 pt-2">
                  <div className="border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl p-4 text-center">
                    <Upload className="mx-auto text-gray-400 mb-1" size={24} />
                    <input type="file" accept=".ppt,.pptx" onChange={(e) => setSelectedFiles(e.target.files)} className="mx-auto block text-xs" />
                  </div>
                  <button type="submit" disabled={uploading || !selectedFiles} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-sm transition">
                    {uploading ? "Streaming PPT asset..." : "Upload Specification PPT"}
                  </button>
                </form>
              )}

              {project?.pptFile && (
                <div className="space-y-1.5 bg-gray-50 p-4 rounded-xl border">
                  <p className="text-xs font-bold text-gray-600">Attached Spec Asset:</p>
                  <div className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border">
                    <span className="font-semibold text-gray-700 truncate max-w-[200px]">{project.pptFile.fileName}</span>
                    <a href={project.pptFile.viewUrl} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">View Link</a>
                  </div>
                </div>
              )}

              {/* Final submission step box */}
              {project?.status !== "submitted" ? (
                <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-gray-500 leading-relaxed">Completing submissions closes edits, extracts text strings, and assigns split reviewer panels.</p>
                  <button onClick={handleSubmitProject} disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white font-black py-3 px-6 rounded-xl text-sm transition whitespace-nowrap">
                    {submitting ? "Processing pipeline..." : "Finalize & Submit Project"}
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl font-bold text-center text-sm flex items-center justify-center gap-2">
                  <CheckCircle size={18} /> Project submitted by your team successfully! Evaluators are reviewing your specification PPT.
                </div>
              )}
            </div>
          )}

          {/* RESULTS LEADERBOARD PANEL */}
          {hackathon?.resultsPublished && results && Array.isArray(results) && (
            <div className="bg-white rounded-2xl border p-8 shadow-sm space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  <Trophy className="text-amber-500" /> Final Leaderboard
                </h2>
                <p className="text-sm text-gray-500">The hackathon results have been published!</p>
              </div>
              <div className="space-y-3">
                {results.map((r: any, index: number) => (
                  <div key={r._id?._id || index} className="flex items-center justify-between p-4 rounded-xl border bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index === 0 ? "bg-amber-100 text-amber-700" : index === 1 ? "bg-slate-200 text-slate-700" : index === 2 ? "bg-orange-100 text-orange-800" : "bg-gray-200 text-gray-600"}`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{r._id?.title || "Unknown Project"}</p>
                        <p className="text-xs text-gray-500">Team: {r._id?.teamId?.name || "Unknown Team"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg text-indigo-700">{r.averageScore?.toFixed(2)}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Final Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info Section */}
        <div className="space-y-6">
          {hackathon.announcements?.length > 0 && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 shadow-sm">
              <h3 className="font-bold text-amber-900 mb-4 flex items-center gap-2"><Megaphone className="text-amber-600" size={20} /> Noticeboard</h3>
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
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Max Capacity</span><span className="font-bold text-gray-900">{hackathon.config.maxParticipants}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Team Size Boundary</span><span className="font-bold text-gray-900">{hackathon.config.minTeamSize} - {hackathon.config.maxTeamSize}</span></div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
            <ShieldCheck className="text-indigo-600 mb-3" size={32} />
            <h3 className="font-bold text-indigo-900 mb-2">Fairness Guarantee</h3>
            <p className="text-sm text-indigo-700">Protected by FairJudge AI to secure unbiased scoring analytics and split human judging matrices.</p>
          </div>
        </div>
      </div>
    </div>
  );
}