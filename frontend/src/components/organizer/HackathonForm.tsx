"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";

const hackathonSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  shortDescription: z.string().max(150, "Max 150 characters").optional(),
  timeline: z.object({
    registrationStart: z.string().min(1, "Required"),
    registrationEnd: z.string().min(1, "Required"),
    hackathonStart: z.string().min(1, "Required"),
    hackathonEnd: z.string().min(1, "Required"),
    submissionDeadline: z.string().min(1, "Required"),
  }),
  config: z.object({
    maxTeamSize: z.number().min(1, "At least 1"),
    minTeamSize: z.number().min(1, "At least 1"),
    allowIndividual: z.boolean(),
  }),
  rubric: z.array(z.object({
    criteria: z.string().min(1, "Criteria name is required"),
    weight: z.number().min(0).max(100),
    description: z.string().optional(),
  })),
});

type HackathonFormData = z.infer<typeof hackathonSchema>;

export const HackathonForm = ({ initialData, onSuccess }: { initialData?: any, onSuccess: () => void }) => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const { register, control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<HackathonFormData>({
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

  // Determine which steps have errors for the step indicator
  const stepHasError = {
    1: !!(errors.title || errors.description || errors.shortDescription),
    2: !!(errors.timeline),
    3: !!(errors.config),
    4: !!(errors.rubric),
  };

  // When form validation fails, auto-navigate to the first failing step
  const onInvalid = (formErrors: any) => {
    if (formErrors.title || formErrors.description || formErrors.shortDescription) {
      setStep(1);
      setError("Please fix the errors in Step 1 (Basic Information).");
    } else if (formErrors.timeline) {
      setStep(2);
      setError("Please fix the errors in Step 2 (Timeline).");
    } else if (formErrors.config) {
      setStep(3);
      setError("Please fix the errors in Step 3 (Configuration).");
    } else if (formErrors.rubric) {
      setStep(4);
      setError("Please fix the rubric errors in Step 4 — check that all criteria names are filled in.");
    } else {
      setError("Please fix all validation errors before saving.");
    }
  };

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

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4 mb-6 border-b pb-4">
        {([1, 2, 3, 4] as const).map(num => (
          <button
            key={num}
            type="button"
            onClick={() => setStep(num)}
            className={`relative px-4 py-2 rounded-full text-sm font-semibold transition ${
              step === num ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            Step {num}
            {stepHasError[num] && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Basic Information</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Title <span className="text-red-500">*</span></label>
              <input {...register("title")} className={`w-full border rounded px-3 py-2 ${errors.title ? 'border-red-400 bg-red-50' : ''}`} />
              {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Short Description</label>
              <input {...register("shortDescription")} className={`w-full border rounded px-3 py-2 ${errors.shortDescription ? 'border-red-400 bg-red-50' : ''}`} />
              {errors.shortDescription && <p className="text-red-600 text-xs mt-1">{errors.shortDescription.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Full Description <span className="text-red-500">*</span></label>
              <textarea {...register("description")} rows={5} className={`w-full border rounded px-3 py-2 ${errors.description ? 'border-red-400 bg-red-50' : ''}`}></textarea>
              {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Timeline</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Registration Start</label>
                <input type="datetime-local" {...register("timeline.registrationStart")} className={`w-full border rounded px-3 py-2 ${errors.timeline?.registrationStart ? 'border-red-400 bg-red-50' : ''}`} />
                {errors.timeline?.registrationStart && <p className="text-red-600 text-xs mt-1">{errors.timeline.registrationStart.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Registration End</label>
                <input type="datetime-local" {...register("timeline.registrationEnd")} className={`w-full border rounded px-3 py-2 ${errors.timeline?.registrationEnd ? 'border-red-400 bg-red-50' : ''}`} />
                {errors.timeline?.registrationEnd && <p className="text-red-600 text-xs mt-1">{errors.timeline.registrationEnd.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hackathon Start</label>
                <input type="datetime-local" {...register("timeline.hackathonStart")} className={`w-full border rounded px-3 py-2 ${errors.timeline?.hackathonStart ? 'border-red-400 bg-red-50' : ''}`} />
                {errors.timeline?.hackathonStart && <p className="text-red-600 text-xs mt-1">{errors.timeline.hackathonStart.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hackathon End</label>
                <input type="datetime-local" {...register("timeline.hackathonEnd")} className={`w-full border rounded px-3 py-2 ${errors.timeline?.hackathonEnd ? 'border-red-400 bg-red-50' : ''}`} />
                {errors.timeline?.hackathonEnd && <p className="text-red-600 text-xs mt-1">{errors.timeline.hackathonEnd.message}</p>}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Submission Deadline</label>
                <input type="datetime-local" {...register("timeline.submissionDeadline")} className={`w-full border rounded px-3 py-2 ${errors.timeline?.submissionDeadline ? 'border-red-400 bg-red-50' : ''}`} />
                {errors.timeline?.submissionDeadline && <p className="text-red-600 text-xs mt-1">{errors.timeline.submissionDeadline.message}</p>}
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

            <div className="bg-gray-100 p-3 rounded text-sm">
              <strong>Total Weight:</strong> {rubricSum}%
              {rubricSum !== 100 && <span className="text-red-600 ml-2">(Must equal 100%)</span>}
            </div>

            {rubricFields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start bg-gray-50 p-4 border rounded">
                <div className="flex-1 space-y-3">
                  <input
                    {...register(`rubric.${index}.criteria` as const)}
                    placeholder="Criteria Name (e.g. Innovation)"
                    className={`w-full border rounded px-3 py-2 ${(errors.rubric as any)?.[index]?.criteria ? 'border-red-400 bg-red-50' : ''}`}
                  />
                  {(errors.rubric as any)?.[index]?.criteria && (
                    <p className="text-red-600 text-xs">{(errors.rubric as any)[index].criteria.message}</p>
                  )}
                  <input {...register(`rubric.${index}.description` as const)} placeholder="Description (optional)" className="w-full border rounded px-3 py-2" />
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

            <div className="pt-6 border-t mt-4 flex justify-end">
              <button
                type="submit"
                disabled={rubricSum !== 100 || isSubmitting}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
                {isSubmitting ? "Saving..." : (initialData ? "Update Hackathon" : "Create Draft")}
              </button>
            </div>
          </div>
        )}

      </form>
    </div>
  );
};
