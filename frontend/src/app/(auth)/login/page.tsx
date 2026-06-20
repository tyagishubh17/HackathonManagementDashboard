"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../../hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError("");
    try {
      const loggedInUser = await login(data);
      if (!loggedInUser) {
        throw new Error("No user returned");
      }

      const rolePaths: Record<string, string> = {
        participant: "/participant",
        organizer: "/organizer",
        judge: "/judge",
        super_admin: "/super-admin"
      };

      const destination = rolePaths[loggedInUser.role] || "/dashboard-redirect";
      router.push(destination); 
    } catch (err: any) {
      setServerError(err.response?.data?.message || err.message || "Invalid email or password");
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
          <ShieldCheck size={24} />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Welcome Back</h2>
        <p className="text-gray-500 text-sm mt-2">Sign in to your FairJudge account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {serverError && (
          <div className="p-3 bg-red-50 text-red-700 text-sm font-semibold rounded-lg border border-red-200">
            {serverError}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <input 
            id="email"
            autoComplete="email"
            {...register("email")}
            type="email" 
            className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} focus:outline-none focus:ring-2`}
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password</label>
            <Link href="/forgot-password" className="text-xs text-indigo-600 font-bold hover:underline">
              Forgot password?
            </Link>
          </div>
          <input 
            id="password"
            autoComplete="current-password"
            {...register("password")}
            type="password" 
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link href="/register" className="text-indigo-600 font-bold hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}
