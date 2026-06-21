"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { Brain, Loader2, Sparkles, FileText, ExternalLink, AlertCircle, ArrowLeft } from "lucide-react";

export default function AssignmentEvaluationPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");

  // 1. Fetch active evaluation record context with populated fields
  const { data: evaluation, isLoading } = useQuery({
    queryKey: ["evaluation", id],
    queryFn: () => api.get(`/evaluations/${id}`).then((res: any) => res.data.data),
  });

  // 2. Mutation: Call AI backend logic to generate automated review scores
  const aiMutation = useMutation({
    queryKey: ["aiSuggestions", id],
    mutationFn: () => 
      api.post(`/evaluations/${id}/ai-suggestions`).then((res: any) => res.data.data),
    onSuccess: () => {
      alert("AI metrics calculated successfully!");
      queryClient.invalidateQueries({ queryKey: ["evaluation", id] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "AI pipeline processing timeout.");
    }
  });

  // Pre-fill fields once data loads
  useEffect(() => {
    if (evaluation?.scores) {
      setScores(evaluation.scores);
    }
    if (evaluation?.feedback) {
      setFeedback(evaluation.feedback);
    }
  }, [evaluation]);

  if (isLoading) {
    return (
      <div className="p-12 text-center animate-pulse">
        <Loader2 className="animate-spin mx-auto text-indigo-600 mb-4" size={40} />
        <p className="text-gray-600 font-bold">Unpacking evaluation pipeline schema...</p>
      </div>
    );
  }

  // Safe fallback extractions to guard layout fields against raw string data states
  const projectData = evaluation?.projectId && typeof evaluation.projectId === "object"
    ? evaluation.projectId
    : null;

  const rubric = evaluation?.hackathonId?.rubric || [];
  const aiSuggested = evaluation?.aiSuggestedScores || {};

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/evaluations/${id}/score`, { scores, feedback });
      await api.post(`/evaluations/${id}/submit`);
      alert("Evaluation matrix locked and submitted successfully!");
      router.push("/judge/assignments");
    } catch (err: any) {
      alert(err.response?.data?.message || "Submission failed.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      {/* Back navigation bar */}
      <button onClick={() => router.push("/judge/assignments")} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-indigo-600 transition">
        <ArrowLeft size={16} /> Back to My Assignments
      </button>

      {/* Title Banner */}
      <div className="bg-white rounded-2xl border p-8 shadow-sm">
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Evaluate: {projectData?.title || "Untitled Project"}
        </h1>
        <p className="text-gray-600 text-sm">
          {projectData?.description || "No project overview summary log provided."}
        </p>
      </div>

      {/* 📄 STUDENT SPECIFICATION PDF FILE UPLOADS PREVIEW LAYER */}
      <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <FileText className="text-indigo-600" size={20} /> Student Submitted Layout Specifications
        </h3>
        
        {projectData?.submissionFiles && projectData.submissionFiles.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              {projectData.submissionFiles.map((file: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border">
                  <span className="text-sm font-semibold text-gray-700 truncate max-w-xs md:max-w-md">{file.name}</span>
                  <a href={file.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 hover:underline bg-white border px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1">
                    Open Document Link <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </div>

            {/* Live iframe sandbox render view option */}
            <div className="border rounded-xl overflow-hidden h-[450px] bg-gray-50">
              <iframe
                src={`${projectData.submissionFiles[0].url}#toolbar=0`}
                className="w-full h-full border-0"
                title="Submission File Attachment Viewport"
              />
            </div>
          </div>
        ) : (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-2">
            <AlertCircle size={16} /> The student team hasn't appended an assignment specifications PDF document container yet.
          </div>
        )}
      </div>

      {/* 🧠 AI Copilot suggestion controller trigger */}
      <div className="bg-white rounded-2xl border p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-white to-indigo-50/20">
        <div>
          <h3 className="font-bold text-gray-900 mb-0.5">Need a baseline evaluation suggestion?</h3>
          <p className="text-xs text-gray-500">FairJudge AI will scan the layout attachment file text strings and calculate candidate benchmarks.</p>
        </div>
        <button
          type="button"
          onClick={() => aiMutation.mutate()}
          disabled={aiMutation.isPending || !projectData || !projectData.submissionFiles?.length}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 px-6 rounded-xl text-sm flex items-center gap-2 transition disabled:opacity-50 disabled:bg-gray-300 whitespace-nowrap self-stretch sm:self-auto justify-center"
        >
          {aiMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Brain size={18} />}
          {aiMutation.isPending ? "Extracting Text Strings..." : "Get AI Suggestions"}
        </button>
      </div>

      {/* 📊 Rubric Form Evaluation Cards */}
      <form onSubmit={handleFinalSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Scoring Schema Parameters</h3>
          
          {rubric.length > 0 ? (
            rubric.map((item: any) => {
              const criterionKey = item.criteria;
              const currentScore = scores[criterionKey] || 0;
              const aiScore = aiSuggested[criterionKey];

              return (
                <div key={item._id} className="space-y-2 p-4 bg-gray-50 rounded-xl border">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-900 capitalize">{criterionKey}</h4>
                      <p className="text-xs text-gray-500">Max bounds constraint: {item.maxScore} points</p>
                    </div>
                    {aiScore !== undefined && (
                      <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 font-bold px-3 py-1 rounded-lg text-xs">
                        <Sparkles size={14} /> AI Score: {aiScore}/{item.maxScore}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <input
                      type="range"
                      min="0"
                      max={item.maxScore}
                      value={currentScore}
                      onChange={(e) => setScores({ ...scores, [criterionKey]: parseInt(e.target.value) })}
                      className="flex-1 accent-indigo-600"
                    />
                    <span className="font-black text-lg text-indigo-600 w-12 text-right">{currentScore}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm italic text-gray-500 text-center">No structural rubric schema bound to this event container.</p>
          )}

          <div className="pt-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">Written Critique Feedback</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              required
              className="w-full border p-3 rounded-xl text-sm focus:outline-indigo-600"
              placeholder="Provide constructive review comments..."
            />
          </div>
        </div>

        <button type="submit" className="w-full sm:w-auto float-right bg-green-600 hover:bg-green-700 text-white font-black py-4 px-10 rounded-xl text-sm transition shadow-md shadow-green-100">
          Finalize & Lock Score Parameters
        </button>
      </form>
    </div>
  );
}
