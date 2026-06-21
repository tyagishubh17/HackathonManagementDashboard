"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { Megaphone, Trash2, Plus, CheckSquare, Square } from "lucide-react";

export default function OrganizerAnnouncements() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [text, setText] = useState("");
  const [subject, setSubject] = useState("");
  const [mode, setMode] = useState<"webapp" | "email">("webapp");
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([]);

  const { data: hackathon, isLoading } = useQuery({
    queryKey: ["hackathonMgmt", id],
    queryFn: () => api.get(`/hackathons/${id}`).then((res: any) => res.data.data),
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ["hackathonRegistrations", id],
    queryFn: () => api.get(`/hackathons/${id}/registrations`).then((res: any) => res.data.data.registrations),
  });

  const webappMutation = useMutation({
    mutationFn: (newText: string) => api.post(`/hackathons/${id}/announcements`, { text: newText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hackathonMgmt", id] });
      closeModal();
    },
  });

  const emailMutation = useMutation({
    mutationFn: ({ subject, message, registrationIds }: { subject: string, message: string, registrationIds: string[] }) => 
      api.post(`/hackathons/${id}/registrations/email`, { subject, message, registrationIds }),
    onSuccess: () => {
      closeModal();
      alert("Emails sent successfully!");
    },
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setText("");
    setSubject("");
    setSelectedRegistrations([]);
    setMode("webapp");
  };

  const toggleParticipant = (regId: string) => {
    setSelectedRegistrations(prev => 
      prev.includes(regId) ? prev.filter(id => id !== regId) : [...prev, regId]
    );
  };

  const selectAll = () => {
    setSelectedRegistrations(registrations.map((r: any) => r._id));
  };

  const deleteMutation = useMutation({
    mutationFn: (announcementId: string) => api.delete(`/hackathons/${id}/announcements/${announcementId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hackathonMgmt", id] });
    },
  });

  const handleAnnounce = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (mode === "webapp") {
      webappMutation.mutate(text);
    } else {
      if (!subject.trim() || selectedRegistrations.length === 0) return;
      emailMutation.mutate({ subject, message: text, registrationIds: selectedRegistrations });
    }
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading announcements...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Announcements</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700"
        >
          <Plus size={18} />
          New Announcement
        </button>
      </div>

      {hackathon?.announcements?.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
          No announcements made yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {hackathon?.announcements?.map((a: any) => (
            <div key={a._id} className="bg-white rounded-2xl border p-6 shadow-sm flex items-start gap-4">
              <div className="bg-indigo-100 p-3 rounded-full text-indigo-600 shrink-0">
                <Megaphone size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-gray-500">
                    {new Date(a.postedAt).toLocaleString()}
                  </span>
                  <button 
                    onClick={() => {
                      if (confirm("Delete this announcement?")) deleteMutation.mutate(a._id);
                    }} 
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <p className="text-gray-900 whitespace-pre-wrap">{a.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-black text-gray-900">Make Announcement</h2>
              <button onClick={closeModal} className="text-gray-500 hover:bg-gray-200 p-2 rounded-full">✕</button>
            </div>
            
            <form className="p-6 space-y-4">
              <div className="flex gap-4 mb-4 border-b pb-2">
                <button
                  type="button"
                  onClick={() => setMode("webapp")}
                  className={`font-bold pb-2 ${mode === "webapp" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500"}`}
                >
                  Post to Noticeboard
                </button>
                <button
                  type="button"
                  onClick={() => setMode("email")}
                  className={`font-bold pb-2 ${mode === "email" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500"}`}
                >
                  Send via Email
                </button>
              </div>

              {mode === "email" && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                    <input 
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Email Subject"
                      className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-bold text-gray-700">Select Participants</label>
                      <button type="button" onClick={selectAll} className="text-sm text-indigo-600 font-bold hover:underline">Select All</button>
                    </div>
                    <div className="max-h-48 overflow-y-auto border rounded-xl divide-y bg-gray-50">
                      {registrations.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500 text-center">No participants found.</div>
                      ) : (
                        registrations.map((reg: any) => (
                          <div 
                            key={reg._id} 
                            onClick={() => toggleParticipant(reg._id)}
                            className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer"
                          >
                            {selectedRegistrations.includes(reg._id) ? (
                              <CheckSquare className="text-indigo-600" size={18} />
                            ) : (
                              <Square className="text-gray-400" size={18} />
                            )}
                            <div>
                              <div className="font-bold text-sm">{reg.userId?.name || "Unknown"}</div>
                              <div className="text-xs text-gray-500">{reg.userId?.email || "No Email"} - {reg.status}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                <textarea 
                  required rows={5}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type your announcement here..."
                  className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-6 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleAnnounce}
                  disabled={
                    mode === "webapp" 
                      ? (webappMutation.isPending || !text.trim())
                      : (emailMutation.isPending || !text.trim() || !subject.trim() || selectedRegistrations.length === 0)
                  }
                  className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {mode === "webapp" ? (webappMutation.isPending ? "Posting..." : "Post Announcement") : (emailMutation.isPending ? "Sending..." : "Send Email")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
