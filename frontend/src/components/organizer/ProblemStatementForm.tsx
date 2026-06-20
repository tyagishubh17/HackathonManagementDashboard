"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";

interface ProblemStatementFormProps {
  hackathonId: string;
  problemStatements: any[];
  onUpdate: () => void;
}

export const ProblemStatementForm: React.FC<ProblemStatementFormProps> = ({ hackathonId, problemStatements, onUpdate }) => {
  const [formData, setFormData] = useState({ title: "", description: "", category: "Web", difficulty: "medium", maxTeams: 10 });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      await api.post(`/hackathons/${hackathonId}/problem-statements`, formData);
      setFormData({ title: "", description: "", category: "Web", difficulty: "medium", maxTeams: 10 });
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add problem statement");
    }
  };

  const handleDelete = async (problemId: string) => {
    try {
      await api.delete(`/hackathons/${hackathonId}/problem-statements/${problemId}`);
      onUpdate();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete. Teams might be assigned.");
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border mt-6">
      <h3 className="text-lg font-bold mb-4">Manage Problem Statements</h3>
      
      {/* Existing List */}
      <div className="space-y-3 mb-6">
        {problemStatements.map((ps) => (
          <div key={ps._id} className="flex justify-between items-center bg-white p-3 rounded shadow-sm border">
            <div>
              <p className="font-semibold">{ps.title} <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded ml-2">{ps.difficulty}</span></p>
              <p className="text-sm text-gray-600">{ps.category} - Max Teams: {ps.maxTeams}</p>
            </div>
            <button onClick={() => handleDelete(ps._id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
          </div>
        ))}
      </div>

      {/* Add New Form */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded border shadow-sm space-y-4">
        <h4 className="font-semibold border-b pb-2">Add New Problem</h4>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Title" className="w-full px-3 py-2 border rounded" />
        <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Description" className="w-full px-3 py-2 border rounded" rows={3}></textarea>
        
        <div className="grid grid-cols-3 gap-4">
          <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border rounded">
            {["Web", "App", "AI", "Blockchain", "Hardware", "Open Innovation"].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})} className="w-full px-3 py-2 border rounded">
            <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
          </select>
          <input type="number" required value={formData.maxTeams} onChange={e => setFormData({...formData, maxTeams: Number(e.target.value)})} placeholder="Max Teams" className="w-full px-3 py-2 border rounded" />
        </div>
        
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Add Problem Statement</button>
      </form>
    </div>
  );
};
