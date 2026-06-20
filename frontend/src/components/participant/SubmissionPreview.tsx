"use client";

import React from "react";
import { api } from "@/lib/api";

export const SubmissionPreview = ({ project, onRefresh }: { project: any, onRefresh: () => void }) => {
  const handleSubmitFinal = async () => {
    if (!window.confirm("Are you sure? Final submission cannot be edited.")) return;
    try {
      await api.post(`/projects/${project._id}/submit`);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <div className="flex justify-between items-start mb-6 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold">{project.title}</h2>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${project.status === 'submitted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {project.status.toUpperCase()}
          </span>
        </div>
        {project.status === "draft" && (
          <button onClick={handleSubmitFinal} className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 shadow-sm">
            Submit Final
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</h3>
          <p className="text-gray-800 whitespace-pre-wrap">{project.description}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Tech Stack</h3>
          <div className="flex flex-wrap gap-2">
            {project.techStack?.map((tech: string, i: number) => (
              <span key={i} className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded text-sm font-medium">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Attached Files ({project.submissionFiles?.length || 0})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {project.submissionFiles?.map((file: any, i: number) => (
              <a key={i} href={file.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 transition">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                <span className="text-sm font-medium text-blue-600 truncate">{file.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
