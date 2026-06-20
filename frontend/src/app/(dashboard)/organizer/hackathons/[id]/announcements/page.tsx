"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { Megaphone, Trash2, Plus } from "lucide-react";

export default function OrganizerAnnouncements() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [text, setText] = useState("");

  const { data: hackathon, isLoading } = useQuery({
    queryKey: ["hackathonMgmt", id],
    queryFn: () => api.get(`/hackathons/${id}`).then((res: any) => res.data.data),
  });

  const mutation = useMutation({
    mutationFn: (newText: string) => api.post(`/hackathons/${id}/announcements`, { text: newText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hackathonMgmt", id] });
      setIsModalOpen(false);
      setText("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (announcementId: string) => api.delete(`/hackathons/${id}/announcements/${announcementId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hackathonMgmt", id] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      mutation.mutate(text);
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
              <h2 className="text-xl font-black text-gray-900">Post Announcement</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:bg-gray-200 p-2 rounded-full">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={mutation.isPending || !text.trim()}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {mutation.isPending ? "Posting..." : "Post Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
