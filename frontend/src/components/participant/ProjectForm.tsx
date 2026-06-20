"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { FileUploader } from "./FileUploader";

export const ProjectForm = ({ hackathonId, existingProject, onSuccess }: { hackathonId: string, existingProject?: any, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    title: existingProject?.title || "",
    description: existingProject?.description || "",
    techStack: existingProject?.techStack?.join(", ") || "",
    problemStatementId: existingProject?.problemStatementId || "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        techStack: formData.techStack.split(",").map((s: string) => s.trim()),
      };

      let projectId = existingProject?._id;

      if (!projectId) {
        const res = await api.post(`/hackathons/${hackathonId}/projects`, payload);
        projectId = res.data.data._id;
      } else {
        await api.put(`/projects/${projectId}`, payload);
      }

      if (files.length > 0) {
        const uploadData = new FormData();
        files.forEach(f => uploadData.append("files", f));
        await api.post(`/projects/${projectId}/files`, uploadData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border space-y-5">
      <h3 className="text-xl font-bold border-b pb-2">{existingProject ? "Update Project Draft" : "Create Project"}</h3>
      
      <div>
        <label className="block text-sm font-medium mb-1">Project Title</label>
        <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded px-3 py-2"></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tech Stack (comma separated)</label>
        <input required value={formData.techStack} onChange={e => setFormData({...formData, techStack: e.target.value})} className="w-full border rounded px-3 py-2" placeholder="React, Node.js, MongoDB" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Upload Submission Files</label>
        <FileUploader onFilesSelected={setFiles} />
      </div>

      <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 disabled:opacity-50">
        {loading ? "Saving..." : "Save Draft"}
      </button>
    </form>
  );
};
