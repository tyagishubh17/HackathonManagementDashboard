"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { useAuth } from "../../hooks/useAuth";

const regSchema = z.object({
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
  skills: z.string().min(2, "Required"),
  institution: z.string().min(2, "Required"),
  country: z.string().min(2, "Required"),
  gender: z.string().min(2, "Required"),
});

type RegFormData = z.infer<typeof regSchema>;

export const RegistrationForm = ({ hackathonId }: { hackathonId: string }) => {
  const { user } = useAuth();
  const [resume, setResume] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<RegFormData>({
    resolver: zodResolver(regSchema),
  });

  const onSubmit = async (data: RegFormData) => {
    if (!resume) return alert("Please upload a resume");
    setIsSubmitting(true);

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value as string));
    formData.append("resume", resume);

    try {
      const res = await api.post(`/hackathons/${hackathonId}/registrations/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white shadow-xl rounded-2xl text-center border">
        {result.status === "rejected" && (
          <div className="text-red-600">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <h2 className="text-2xl font-bold mb-2">Registration Blocked</h2>
            <p>Our AI system detected a very high probability that this is a duplicate registration.</p>
          </div>
        )}
        {result.status === "pending_review" && (
          <div className="text-yellow-600">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h2 className="text-2xl font-bold mb-2">Under Review</h2>
            <p>Your registration has been flagged for manual review by the organizers.</p>
          </div>
        )}
        {result.status === "confirmed" && (
          <div className="text-green-600">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h2 className="text-2xl font-bold mb-2">Registration Confirmed!</h2>
            <p>You are successfully registered for the hackathon.</p>
          </div>
        )}
        <button onClick={() => window.location.href = "/dashboard"} className="mt-8 bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800">Go to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-2xl border">
      <h2 className="text-2xl font-bold mb-6">Complete Registration</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input disabled value={user?.fullName || ""} className="w-full border rounded px-3 py-2 bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input disabled value={user?.email || ""} className="w-full border rounded px-3 py-2 bg-gray-100" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Institution / Company</label>
            <input {...register("institution")} className="w-full border rounded px-3 py-2" />
            {errors.institution && <p className="text-red-500 text-xs mt-1">{errors.institution.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <input {...register("country")} className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Experience Level</label>
            <select {...register("experienceLevel")} className="w-full border rounded px-3 py-2">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select {...register("gender")} className="w-full border rounded px-3 py-2">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
          <input {...register("skills")} placeholder="React, Node.js, Python" className="w-full border rounded px-3 py-2" />
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Resume (PDF/DOCX, Max 5MB)</label>
          <input 
            type="file" 
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResume(e.target.files ? e.target.files[0] : null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
          />
        </div>

        <button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
          {isSubmitting ? "Processing AI Duplicate Check..." : "Submit Registration"}
        </button>
      </form>
    </div>
  );
};
