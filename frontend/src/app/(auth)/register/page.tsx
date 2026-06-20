"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../../hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, User, Code, Gavel } from "lucide-react";

// Register multi-step logic
const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["participant", "organizer", "judge"]),
  organization: z.string().optional(),
  skills: z.string().optional(),
  experienceLevel: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<"participant" | "organizer" | "judge">("participant");
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting }, trigger, setValue } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "participant" }
  });

  const nextStep = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      const valid = await trigger(["fullName", "email", "password"]);
      if (valid) setStep(3);
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    setServerError("");
    try {
      let payload: any = {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
      };

      if (data.role === "participant") {
        payload.participantDetails = {
          skills: data.skills ? data.skills.split(",").map((s) => s.trim()) : [],
          experience: data.experienceLevel || "beginner",
        };
      } else if (data.role === "organizer") {
        payload.organizerDetails = {
          organization: data.organization,
        };
      } else if (data.role === "judge") {
        payload.judgeDetails = {
          expertise: data.skills ? data.skills.split(",").map((s) => s.trim()) : ["General"],
          yearsOfExperience: 2,
        };
      }

      const loggedInUser = await registerUser(payload);
      if (!loggedInUser) throw new Error("Registration failed, no user returned");

      const rolePaths: Record<string, string> = {
        participant: "/participant",
        organizer: "/organizer",
        judge: "/judge",
        super_admin: "/super-admin"
      };

      const destination = rolePaths[loggedInUser.role] || "/dashboard-redirect";
      router.push(destination);
    } catch (err: any) {
      setServerError(err.response?.data?.message || err.message || "Registration failed");
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-gray-900">Create Account</h2>
        <p className="text-gray-500 text-sm mt-1">Step {step} of 3</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {serverError && (
          <div className="p-3 bg-red-50 text-red-700 text-sm font-semibold rounded-lg border border-red-200">
            {serverError}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-700">Select your role</h3>
            
            <div 
              onClick={() => { setSelectedRole("participant"); setValue("role", "participant"); }}
              className={`p-4 border-2 rounded-xl cursor-pointer flex items-center gap-4 ${selectedRole === "participant" ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
            >
              <div className="bg-white p-2 rounded-full shadow-sm"><Code className="text-indigo-600" /></div>
              <div>
                <h4 className="font-bold text-gray-900">Participant</h4>
                <p className="text-xs text-gray-500">Join hackathons and build projects</p>
              </div>
            </div>

            <div 
              onClick={() => { setSelectedRole("organizer"); setValue("role", "organizer"); }}
              className={`p-4 border-2 rounded-xl cursor-pointer flex items-center gap-4 ${selectedRole === "organizer" ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
            >
              <div className="bg-white p-2 rounded-full shadow-sm"><ShieldCheck className="text-indigo-600" /></div>
              <div>
                <h4 className="font-bold text-gray-900">Organizer</h4>
                <p className="text-xs text-gray-500">Host and manage hackathons</p>
              </div>
            </div>

            <div 
              onClick={() => { setSelectedRole("judge"); setValue("role", "judge"); }}
              className={`p-4 border-2 rounded-xl cursor-pointer flex items-center gap-4 ${selectedRole === "judge" ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
            >
              <div className="bg-white p-2 rounded-full shadow-sm"><Gavel className="text-indigo-600" /></div>
              <div>
                <h4 className="font-bold text-gray-900">Judge</h4>
                <p className="text-xs text-gray-500">Evaluate projects using AI rubric</p>
              </div>
            </div>

            <button type="button" onClick={nextStep} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl mt-4">Continue</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 text-left">
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input id="fullName" autoComplete="name" {...register("fullName")} className="w-full px-4 py-3 rounded-xl border border-gray-300" placeholder="John Doe" />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input id="email" autoComplete="email" type="email" {...register("email")} className="w-full px-4 py-3 rounded-xl border border-gray-300" placeholder="you@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input id="password" autoComplete="new-password" type="password" {...register("password")} className="w-full px-4 py-3 rounded-xl border border-gray-300" placeholder="Min 8 characters" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(1)} className="w-1/3 bg-gray-200 text-gray-800 font-bold py-3 rounded-xl">Back</button>
              <button type="button" onClick={nextStep} className="w-2/3 bg-gray-900 text-white font-bold py-3 rounded-xl">Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-left">
            {selectedRole === "organizer" && (
              <div>
                <label htmlFor="organization" className="block text-sm font-semibold text-gray-700 mb-1">Organization Name</label>
                <input id="organization" autoComplete="organization" {...register("organization")} className="w-full px-4 py-3 rounded-xl border border-gray-300" placeholder="TechCorp Inc." />
              </div>
            )}
            
            {selectedRole === "participant" && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="skills" className="block text-sm font-semibold text-gray-700 mb-1">Key Skills (comma separated)</label>
                  <input id="skills" autoComplete="off" {...register("skills")} className="w-full px-4 py-3 rounded-xl border border-gray-300" placeholder="React, Python, Design" />
                </div>
                <div>
                  <label htmlFor="experienceLevel" className="block text-sm font-semibold text-gray-700 mb-1">Experience Level</label>
                  <select id="experienceLevel" {...register("experienceLevel")} className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white">
                    <option value="">Select Level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setStep(2)} className="w-1/3 bg-gray-200 text-gray-800 font-bold py-3 rounded-xl">Back</button>
              <button type="submit" disabled={isSubmitting} className="w-2/3 bg-indigo-600 text-white font-bold py-3 rounded-xl disabled:opacity-50">
                {isSubmitting ? "Creating..." : "Complete Registration"}
              </button>
            </div>
          </div>
        )}
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-600 font-bold hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
