"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../hooks/useAuth";
import { RoleSelector } from "./RoleSelector";

// Dynamic schema generation based on step/role can be complex, using a master schema here
const registerSchema = z.object({
  role: z.enum(["participant", "organizer", "judge", "super_admin"]),
  fullName: z.string().min(2, "Full Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[@$!%*?&]/, "Must contain a special character"),
  
  // Participant
  skills: z.string().optional(),
  experience: z.string().optional(),
  
  // Organizer
  organization: z.string().optional(),
  
  // Judge
  expertise: z.string().optional(),
  yearsOfExperience: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === "participant" && (!data.skills || !data.experience)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Skills and Experience are required for Participants", path: ["skills"] });
  }
  if (data.role === "organizer" && !data.organization) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Organization name is required", path: ["organization"] });
  }
  if (data.role === "judge" && (!data.expertise || !data.yearsOfExperience)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Expertise and Years of Experience required", path: ["expertise"] });
  }
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const { register: registerAuth } = useAuth();
  const [step, setStep] = useState(1);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "participant" },
  });

  const selectedRole = watch("role");

  const onNext = async () => {
    // Validate current step fields before moving on
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ["role"];
    if (step === 2) fieldsToValidate = ["fullName", "email", "password"];
    
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) setStep((s) => s + 1);
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setServerError("");
      
      // Transform flat data to backend expected nested structure
      const payload: any = {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
      };

      if (data.role === "participant") {
        payload.participantDetails = { skills: data.skills?.split(",").map(s => s.trim()), experience: data.experience };
      } else if (data.role === "organizer") {
        payload.organizerDetails = { organization: data.organization };
      } else if (data.role === "judge") {
        payload.judgeDetails = { expertise: data.expertise?.split(",").map(s => s.trim()), yearsOfExperience: parseInt(data.yearsOfExperience || "0", 10) };
      }

      await registerAuth(payload);
      window.location.href = "/dashboard-redirect";
    } catch (err: any) {
      setServerError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-2xl w-full mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-2 text-center">Create Account</h2>
      <p className="text-center text-gray-500 mb-6">Step {step} of 3</p>

      {serverError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* STEP 1: ROLE */}
        {step === 1 && (
          <div>
            <RoleSelector selectedRole={selectedRole} onSelect={(role) => setValue("role", role as any)} />
            <button type="button" onClick={onNext} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Continue</button>
          </div>
        )}

        {/* STEP 2: ACCOUNT INFO */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input {...register("fullName")} className="w-full px-4 py-2 border rounded-md" />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" {...register("email")} className="w-full px-4 py-2 border rounded-md" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" {...register("password")} className="w-full px-4 py-2 border rounded-md" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div className="flex justify-between mt-6">
              <button type="button" onClick={() => setStep(1)} className="px-4 py-2 text-gray-600 border rounded-md">Back</button>
              <button type="button" onClick={onNext} className="px-4 py-2 bg-blue-600 text-white rounded-md">Continue</button>
            </div>
          </div>
        )}

        {/* STEP 3: ROLE SPECIFIC */}
        {step === 3 && (
          <div className="space-y-4">
            {selectedRole === "participant" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
                  <input {...register("skills")} placeholder="React, Node, Python" className="w-full px-4 py-2 border rounded-md" />
                  {errors.skills && <p className="text-red-500 text-xs mt-1">{errors.skills.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Experience Level</label>
                  <select {...register("experience")} className="w-full px-4 py-2 border rounded-md">
                    <option value="">Select Level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </>
            )}

            {selectedRole === "organizer" && (
              <div>
                <label className="block text-sm font-medium mb-1">Organization Name</label>
                <input {...register("organization")} className="w-full px-4 py-2 border rounded-md" />
                {errors.organization && <p className="text-red-500 text-xs mt-1">{errors.organization.message}</p>}
              </div>
            )}

            {selectedRole === "judge" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Expertise (comma separated)</label>
                  <input {...register("expertise")} placeholder="AI, Blockchain, UI/UX" className="w-full px-4 py-2 border rounded-md" />
                  {errors.expertise && <p className="text-red-500 text-xs mt-1">{errors.expertise.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Years of Experience</label>
                  <input type="number" {...register("yearsOfExperience")} className="w-full px-4 py-2 border rounded-md" />
                </div>
              </>
            )}

            <div className="flex justify-between mt-6">
              <button type="button" onClick={() => setStep(2)} className="px-4 py-2 text-gray-600 border rounded-md">Back</button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50">
                {isSubmitting ? "Creating Account..." : "Complete Registration"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
