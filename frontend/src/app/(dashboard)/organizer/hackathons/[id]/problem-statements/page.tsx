"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { FileText, Calendar, Clock, Plus, Edit, Trash2 } from "lucide-react";

export default function OrganizerProblemStatements() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    category: "Web",
    difficulty: "medium",
    maxTeams: 10,
    scheduledAt: "",
    postNow: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: hackathon, isLoading } = useQuery({
    queryKey: ["hackathonMgmt", id],
    queryFn: () => api.get(`/hackathons/${id}`).then((res: any) => res.data.data),
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (editingId) {
        return api.put(`/hackathons/${id}/problem-statements/${editingId}`, data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      return api.post(`/hackathons/${id}/problem-statements`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hackathonMgmt", id] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (problemId: string) => api.delete(`/hackathons/${id}/problem-statements/${problemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hackathonMgmt", id] });
    },
  });

  const openModal = (problem?: any) => {
    if (problem) {
      setEditingId(problem._id);
      setFormData({
        title: problem.title,
        description: problem.description,
        category: problem.category || "Web",
        difficulty: problem.difficulty || "medium",
        maxTeams: problem.maxTeams || 10,
        scheduledAt: problem.scheduledAt ? new Date(problem.scheduledAt).toISOString().slice(0, 16) : "",
        postNow: !problem.scheduledAt || new Date(problem.scheduledAt) <= new Date(),
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        description: "",
        category: "Web",
        difficulty: "medium",
        maxTeams: 10,
        scheduledAt: "",
        postNow: true,
      });
    }
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setSelectedFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("description", formData.description);
    payload.append("category", formData.category);
    payload.append("difficulty", formData.difficulty);
    payload.append("maxTeams", String(formData.maxTeams));

    if (!formData.postNow && formData.scheduledAt) {
      payload.append("scheduledAt", new Date(formData.scheduledAt).toISOString());
    } else {
      // If "Post Now" is selected, we send the current date to immediately post it
      payload.append("scheduledAt", new Date().toISOString());
    }

    if (selectedFile) {
      payload.append("referenceFile", selectedFile);
    }

    mutation.mutate(payload);
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading problem statements...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Problem Statements</h2>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700"
        >
          <Plus size={18} />
          Add Statement
        </button>
      </div>

      {hackathon?.problemStatements?.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
          No problem statements added yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {hackathon?.problemStatements?.map((p: any) => {
            const isLive = p.scheduledAt && new Date(p.scheduledAt) <= new Date();
            const isScheduled = p.scheduledAt && new Date(p.scheduledAt) > new Date();

            return (
              <div key={p._id} className="bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-black text-gray-900">{p.title}</h3>
                      {isLive ? (
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">LIVE</span>
                      ) : isScheduled ? (
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                          <Clock size={12} /> Scheduled
                        </span>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">{p.category}</span>
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium capitalize">{p.difficulty}</span>
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">Max Teams: {p.maxTeams}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openModal(p)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this problem statement?")) deleteMutation.mutate(p._id);
                      }} 
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 whitespace-pre-wrap">{p.description}</p>
                
                {isScheduled && (
                  <p className="mt-4 text-sm font-semibold text-amber-700 flex items-center gap-2">
                    <Calendar size={16} /> Goes live on: {new Date(p.scheduledAt).toLocaleString()}
                  </p>
                )}

                {p.referenceFile && (
                  <div className="mt-4 flex items-center gap-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100 w-fit">
                    <FileText size={20} className="text-indigo-600" />
                    <div>
                      <p className="text-sm font-bold text-indigo-900">{p.referenceFile.fileName}</p>
                      <a href={`${api.defaults.baseURL}/hackathons/${id}/problem-statements/${p._id}/download`} className="text-xs text-indigo-600 hover:underline">Download File</a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur">
              <h2 className="text-2xl font-black text-gray-900">{editingId ? "Edit Statement" : "Add Statement"}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                <input 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea 
                  required rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white outline-none"
                  >
                    <option value="Web">Web</option>
                    <option value="App">App</option>
                    <option value="AI">AI</option>
                    <option value="Blockchain">Blockchain</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Open Innovation">Open Innovation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Difficulty</label>
                  <select 
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-bold text-gray-900 mb-4">Release Schedule</h3>
                
                <div className="flex items-center gap-4 mb-4 bg-gray-50 p-4 rounded-xl">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="postMode" 
                      checked={formData.postNow}
                      onChange={() => setFormData({...formData, postNow: true})}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="font-semibold text-gray-900">Post Now</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="postMode" 
                      checked={!formData.postNow}
                      onChange={() => setFormData({...formData, postNow: false})}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="font-semibold text-gray-900">Schedule Release</span>
                  </label>
                </div>

                {!formData.postNow && (
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Schedule At</label>
                    <input 
                      type="datetime-local"
                      required={!formData.postNow}
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData({...formData, scheduledAt: e.target.value})}
                      className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="border-t pt-6">
                <h3 className="font-bold text-gray-900 mb-4">Reference File (Optional)</h3>
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="text-xs text-gray-500 mt-2">Accepted formats: PDF, Word, Excel. Max 5MB.</p>
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-6 py-3 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={mutation.isPending}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {mutation.isPending ? "Saving..." : "Save Statement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
