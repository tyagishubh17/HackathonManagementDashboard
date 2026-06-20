"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";

const hackathonSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  shortDescription: z.string().max(150).optional(),
  timeline: z.object({
    registrationStart: z.string(),
    registrationEnd: z.string(),
    hackathonStart: z.string(),
    hackathonEnd: z.string(),
    submissionDeadline: z.string(),
  }),
  config: z.object({
    maxTeamSize: z.number().min(1),
    minTeamSize: z.number().min(1),
    allowIndividual: z.boolean(),
  }),
  rubric: z.array(z.object({
    criteria: z.string(),
    weight: z.number().min(0).max(100),
    description: z.string(),
  })),
  editReason: z.string().optional(),
});

type HackathonFormData = z.infer<typeof hackathonSchema>;

export const HackathonForm = ({ initialData, onSuccess }: { initialData?: any, onSuccess: () => void }) => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<HackathonFormData>({
    resolver: zodResolver(hackathonSchema),
    defaultValues: initialData || {
      timeline: {},
      config: { maxTeamSize: 4, minTeamSize: 1, allowIndividual: false },
      rubric: [{ criteria: "Innovation", weight: 50, description: "" }, { criteria: "Execution", weight: 50, description: "" }]
    }
  });

  const { fields: rubricFields, append: appendRubric, remove: removeRubric } = useFieldArray({ control, name: "rubric" });
  const watchRubric = watch("rubric");
  const rubricSum = watchRubric?.reduce((acc, curr) => acc + (Number(curr.weight) || 0), 0) || 0;

  const onSubmit = async (data: HackathonFormData) => {
    if (rubricSum !== 100) return setError("Rubric weights must sum exactly to 100%");
    
    try {
      setError("");
      if (initialData?._id) {
        await api.put(`/hackathons/${initialData._id}`, data);
      } else {
        await api.post("/hackathons", data);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save hackathon");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">{initialData ? "Edit Hackathon" : "Create Hackathon"}</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

      <div className="flex gap-4 mb-6 border-b pb-4">
        {[1, 2, 3, 4].map(num => (
          <button key={num} onClick={() => setStep(num)} className={`px-4 py-2 rounded-full text-sm font-semibold ${step === num ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"}`}>
            Step {num}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Basic Information</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input {...register("title")} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Short Description</label>
              <input {...register("shortDescription")} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Full Description</label>
              <textarea {...register("description")} rows={5} className="w-full border rounded px-3 py-2"></textarea>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Timeline</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Registration Start</label>
                <input type="datetime-local" {...register("timeline.registrationStart")} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Registration End</label>
                <input type="datetime-local" {...register("timeline.registrationEnd")} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hackathon Start</label>
                <input type="datetime-local" {...register("timeline.hackathonStart")} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hackathon End</label>
                <input type="datetime-local" {...register("timeline.hackathonEnd")} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Submission Deadline</label>
                <input type="datetime-local" {...register("timeline.submissionDeadline")} className="w-full border rounded px-3 py-2" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Configuration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Min Team Size</label>
                <input type="number" {...register("config.minTeamSize", { valueAsNumber: true })} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Team Size</label>
                <input type="number" {...register("config.maxTeamSize", { valueAsNumber: true })} className="w-full border rounded px-3 py-2" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" {...register("config.allowIndividual")} id="allowInd" />
              <label htmlFor="allowInd" className="text-sm font-medium">Allow Individual Participants</label>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Rubric Builder</h3>
            
            <div className="bg-gray-100 p-3 rounded text-sm mb-4">
              <strong>Total Weight:</strong> {rubricSum}% 
              {rubricSum !== 100 && <span className="text-red-600 ml-2">(Must equal 100%)</span>}
            </div>

            {rubricFields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start bg-gray-50 p-4 border rounded">
                <div className="flex-1 space-y-3">
                  <input {...register(`rubric.${index}.criteria` as const)} placeholder="Criteria Name (e.g. Innovation)" className="w-full border rounded px-3 py-2" />
                  <input {...register(`rubric.${index}.description` as const)} placeholder="Description" className="w-full border rounded px-3 py-2" />
                </div>
                <div className="w-24">
                  <input type="number" {...register(`rubric.${index}.weight` as const, { valueAsNumber: true })} placeholder="Weight %" className="w-full border rounded px-3 py-2" />
                </div>
                <button type="button" onClick={() => removeRubric(index)} className="text-red-500 hover:bg-red-50 px-3 py-2 rounded">Delete</button>
              </div>
            ))}
            <button type="button" onClick={() => appendRubric({ criteria: "", weight: 0, description: "" })} className="text-blue-600 border border-blue-600 px-4 py-2 rounded hover:bg-blue-50">
              + Add Criterion
            </button>
            
            <div className="pt-6 border-t mt-8">
              {initialData?.verificationStatus === "verified" && (
                <div className="mb-6 bg-amber-50 p-4 border border-amber-200 rounded-xl">
                  <h4 className="font-bold text-amber-900 mb-2">Reason for Edit</h4>
                  <p className="text-sm text-amber-800 mb-3">Since this hackathon is already verified and published, you must provide a reason for these changes. They will be immediately applied but flagged for review by a Super Admin.</p>
                  <textarea 
                    {...register("editReason")} 
                    rows={3} 
                    className="w-full border rounded px-3 py-2" 
                    placeholder="Briefly explain what was changed and why..."
                    required
                  ></textarea>
                </div>
              )}
              <div className="flex justify-end">
                <button type="submit" disabled={rubricSum !== 100} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  {initialData ? "Update Hackathon" : "Create Draft"}
                </button>
              </div>
            </div>
          </div>
        )}

      </form>
    </div>
  );
};
