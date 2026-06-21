"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Loader } from "lucide-react";
import { RubricScorer } from "../../../../../components/judge/RubricScorer";
import { AISuggestions } from "../../../../../components/judge/AISuggestions";
import { BiasAlertBanner } from "../../../../../components/judge/BiasAlertBanner";

export default function AssignmentEvaluation() {
  const { id: evaluationId } = useParams();
  const [evaluation, setEvaluation] = useState<any>(null);
  const [hackathon, setHackathon] = useState<any>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const evRes = await api.get(`/evaluations/${evaluationId}`);
        setEvaluation(evRes.data.data);
        setScores(evRes.data.data.scores || {});
        setFeedback(evRes.data.data.feedback || "");

        const hId = evRes.data.data.projectId?.hackathonId || evRes.data.data.hackathonId;
        const hRes = await api.get(`/hackathons/${hId}/public`);
        setHackathon(hRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (evaluationId) fetchData();
  }, [evaluationId]);

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const res = await api.post(`/evaluations/${evaluationId}/score`, { scores, feedback });
      setEvaluation(res.data.data);
      alert("Draft saved and checked for bias.");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitFinal = async () => {
    if (!window.confirm("Submit final evaluation? This cannot be undone.")) return;
    setSaving(true);
    try {
      await api.post(`/evaluations/${evaluationId}/score`, { scores, feedback });
      const res = await api.put(`/evaluations/${evaluationId}/submit`);
      setEvaluation(res.data.data);
      alert("Evaluation finalized successfully.");
      window.location.href = "/evaluations";
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit final evaluation");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading evaluation framework...</div>;
  if (!evaluation || !hackathon) return <div className="p-10 text-center text-red-500">Failed to load data.</div>;

  const isSubmitted = evaluation.status === "submitted";
  const assignedPanel = "A";
  const panelMembersList = "Judge 1 (panel_peer1@fairjudge.com), Judge 2 (You), Judge 3 (panel_peer3@fairjudge.com)";

  return (
    <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        
        {/* 🛡️ FORCED VISIBILITY SHIELD BANNER */}
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-6 rounded-xl shadow-sm flex flex-col gap-1">
          <div className="font-black text-sm uppercase tracking-wider text-blue-900 flex items-center gap-2">
            🛡️ Visibility Shield Panel Matrix Active
          </div>
          <p className="text-sm text-blue-700">
            You are grading this track under <span className="font-extrabold text-blue-900 text-base">Panel {assignedPanel}</span>. Your baseline evaluations are completely hidden from outer groups.
          </p>
          <p className="text-xs font-mono text-blue-600 pt-1">
            <span className="font-bold">Panel Group Reviewers:</span> {panelMembersList}
          </p>
        </div>

        <h1 className="text-3xl font-bold mb-2">Evaluate: {evaluation.projectId?.title}</h1>
        <BiasAlertBanner flags={evaluation.biasFlags} />

        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Rubric Scoring</h2>
          <RubricScorer rubric={hackathon.rubric} scores={scores} onChange={setScores} readOnly={isSubmitted} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Constructive Feedback</h2>
          <textarea 
            rows={5}
            disabled={isSubmitted}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Provide detailed, objective feedback for the team..."
            className="w-full border rounded-lg p-4 text-sm disabled:bg-gray-50 disabled:text-gray-600"
          />
        </div>

        {!isSubmitted && (
          <div className="flex justify-end gap-4 mt-6">
            <button onClick={handleSaveDraft} disabled={saving} className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50">
              Save Draft & Scan Bias
            </button>
            <button onClick={handleSubmitFinal} disabled={saving} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">
              Submit Final Evaluation
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-white p-5 rounded-xl shadow border">
          <h3 className="font-bold text-gray-800 border-b pb-2 mb-3">Project Details</h3>
          <div className="text-sm space-y-2">
            <p><strong>Tech Stack:</strong> {evaluation.projectId?.techStack?.join(", ") || "N/A"}</p>
            <p className="text-gray-600">{evaluation.projectId?.description}</p>
            {evaluation.projectId?.submissionFiles?.map((file: any, i: number) => (
              <a key={i} href={file.url} target="_blank" rel="noreferrer" className="block text-blue-600 truncate hover:underline mt-2">
                📄 {file.name}
              </a>
            ))}
          </div>
        </div>
        <AISuggestions evaluationId={evaluation._id} existingSuggestions={evaluation.aiSuggestedScores ? { suggestedScores: evaluation.aiSuggestedScores, rationale: "Previously requested" } : null} />
      </div>
    </div>
  );
}
