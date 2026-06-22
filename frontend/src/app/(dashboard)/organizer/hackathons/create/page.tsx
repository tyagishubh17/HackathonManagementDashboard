"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function CreateHackathon() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data: any) => {
    setError("");
    try {
      // Structure the data to match backend expectations
      const payload = {
        title: data.title,
        description: data.description,
        timeline: {
          registrationStart: data.registrationStart,
          registrationEnd: data.registrationEnd,
          hackathonStart: data.hackathonStart,
          hackathonEnd: data.hackathonEnd,
          submissionDeadline: data.submissionDeadline
        },
        config: {
          maxParticipants: Number(data.maxParticipants),
          minTeamSize: Number(data.minTeamSize),
          maxTeamSize: Number(data.maxTeamSize),
          requireResume: true,
          allowLateSubmissions: false
        },
        rubric: [
          { criteria: "Innovation", weight: Number(data.rubricInnovation) },
          { criteria: "Technical Execution", weight: Number(data.rubricExecution) },
          { criteria: "Business Value", weight: Number(data.rubricBusiness) }
        ]
      };

      const res = await api.post("/hackathons", payload);
      router.push(`/organizer/hackathons/${res.data.data._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create hackathon");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-black text-gray-900">Create Hackathon</h1>
      
      <div className="bg-white rounded-2xl border shadow-sm p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {error && <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold border-b pb-2">1. Basic Information</h3>
            <div>
              <label className="block text-sm font-semibold mb-1">Title</label>
              <input {...register("title", { required: true })} className="w-full border rounded-xl p-3" placeholder="Global AI Hackathon 2026" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Description</label>
              <textarea {...register("description", { required: true })} rows={4} className="w-full border rounded-xl p-3" placeholder="Describe the theme and goals..."></textarea>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold border-b pb-2">2. Timeline</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Registration Start</label>
                <input type="datetime-local" {...register("registrationStart", { required: true })} className="w-full border rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Registration End</label>
                <input type="datetime-local" {...register("registrationEnd", { required: true })} className="w-full border rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Hackathon Start</label>
                <input type="datetime-local" {...register("hackathonStart", { required: true })} className="w-full border rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Hackathon End</label>
                <input type="datetime-local" {...register("hackathonEnd", { required: true })} className="w-full border rounded-xl p-3" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1">Submission Deadline</label>
                <input type="datetime-local" {...register("submissionDeadline", { required: true })} className="w-full border rounded-xl p-3" />
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold border-b pb-2">3. Configuration</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Max Participants</label>
                <input type="number" {...register("maxParticipants")} defaultValue={100} className="w-full border rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Min Team Size</label>
                <input type="number" {...register("minTeamSize")} defaultValue={1} className="w-full border rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Max Team Size</label>
                <input type="number" {...register("maxTeamSize")} defaultValue={4} className="w-full border rounded-xl p-3" />
              </div>
            </div>
          </div>

          {/* Rubric */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold border-b pb-2">4. Evaluation Rubric (Weights must sum to 100)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Innovation %</label>
                <input type="number" {...register("rubricInnovation")} defaultValue={40} className="w-full border rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Technical Execution %</label>
                <input type="number" {...register("rubricExecution")} defaultValue={40} className="w-full border rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Business Value %</label>
                <input type="number" {...register("rubricBusiness")} defaultValue={20} className="w-full border rounded-xl p-3" />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 text-lg"
            >
              {isSubmitting ? "Creating..." : "Create Hackathon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
