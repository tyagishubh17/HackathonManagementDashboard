"use client";

import { useForm } from "react-hook-form";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const { register, handleSubmit } = useForm();
  const [sent, setSent] = useState(false);

  const onSubmit = async (data: any) => {
    try {
      await api.post("/auth/forgot-password", data);
      setSent(true);
    } catch (err) {
      setSent(true); // Always show success to prevent email enumeration
    }
  };

  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-black text-gray-900 mb-4">Reset Password</h2>
      
      {sent ? (
        <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-200">
          <p className="font-bold">Check your email!</p>
          <p className="text-sm mt-1">If an account exists, we've sent reset instructions.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          <p className="text-gray-500 text-sm mb-4">Enter your email and we'll send you a link to reset your password.</p>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input {...register("email")} type="email" className="w-full px-4 py-3 rounded-xl border" placeholder="you@example.com" required />
          </div>
          <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl">Send Reset Link</button>
        </form>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <Link href="/login" className="text-indigo-600 font-bold hover:underline">Back to login</Link>
      </div>
    </div>
  );
}
