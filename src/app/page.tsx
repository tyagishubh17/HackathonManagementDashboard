"use client";

import { useRouter } from "next/navigation";
import {
  Users,
  Trophy,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">

      {/* Background Blur Effects */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-300 rounded-full blur-3xl opacity-20"></div>

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left */}
          <div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium mb-6">
              <Sparkles size={18} />
              AI Powered Fair Evaluation Platform
            </div>

            <h1 className="text-6xl lg:text-7xl font-black text-slate-900 leading-tight">
              FAIRJUDGE
            </h1>

            <p className="mt-6 text-xl text-slate-600 leading-relaxed">
              Revolutionizing hackathon evaluation with AI-powered
              reviewer assignment, bias detection, fairness monitoring,
              score normalization and transparent audit trails.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">

              <div className="bg-white rounded-2xl shadow-md px-6 py-4 border">
                <h3 className="text-3xl font-black text-blue-600">
                  95%
                </h3>
                <p className="text-slate-500">
                  Match Accuracy
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-md px-6 py-4 border">
                <h3 className="text-3xl font-black text-green-600">
                  96%
                </h3>
                <p className="text-slate-500">
                  Bias Detection
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-md px-6 py-4 border">
                <h3 className="text-3xl font-black text-purple-600">
                  100%
                </h3>
                <p className="text-slate-500">
                  Transparency
                </p>
              </div>

            </div>

          </div>

          {/* Right Login Card */}
          <div>

            <div className="bg-white rounded-[32px] shadow-2xl border p-8">

              <h2 className="text-4xl font-black text-center text-slate-900 mb-3">
                Welcome
              </h2>

              <p className="text-center text-slate-500 mb-8">
                Select your dashboard
              </p>

              <div className="space-y-5">

                <button
                  onClick={() => router.push("/participant")}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-semibold text-lg hover:scale-105 transition"
                >
                  Login as Participant
                </button>

                <button
                  onClick={() => router.push("/organizer")}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-semibold text-lg hover:scale-105 transition"
                >
                  Login as Organizer
                </button>

                <button
                  onClick={() => router.push("/judge")}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-semibold text-lg hover:scale-105 transition"
                >
                  Login as Judge
                </button>

                <button
                  onClick={() => router.push("/fairness")}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white py-4 rounded-2xl font-semibold text-lg hover:scale-105 transition"
                >
                  Login as Fairness Monitor
                </button>

              </div>

            </div>

          </div>

        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">

          <div className="bg-white rounded-3xl p-8 shadow-lg border">

            <Users className="text-blue-600 mb-4" size={40} />

            <h3 className="text-2xl font-bold text-slate-900">
              Smart Team Formation
            </h3>

            <p className="text-slate-600 mt-3">
              AI extracts participant skills and recommends
              diverse, balanced teams automatically.
            </p>

          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg border">

            <Trophy className="text-green-600 mb-4" size={40} />

            <h3 className="text-2xl font-bold text-slate-900">
              Fair Evaluation
            </h3>

            <p className="text-slate-600 mt-3">
              AI-powered reviewer assignment and score
              normalization ensure unbiased judging.
            </p>

          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg border">

            <ShieldCheck className="text-red-600 mb-4" size={40} />

            <h3 className="text-2xl font-bold text-slate-900">
              Transparency
            </h3>

            <p className="text-slate-600 mt-3">
              Complete audit trail with fairness reports,
              bias alerts and appeal management.
            </p>

          </div>

        </div>

        {/* Workflow */}
        <div className="mt-20 bg-white rounded-[32px] shadow-xl border p-8">

          <h2 className="text-4xl font-black text-center text-slate-900 mb-10">
            FAIRJUDGE Workflow
          </h2>

          <div className="flex flex-wrap justify-center items-center gap-4">

            <div className="bg-blue-100 text-blue-700 px-5 py-3 rounded-full font-semibold">
              Registration
            </div>

            <ArrowRight />

            <div className="bg-green-100 text-green-700 px-5 py-3 rounded-full font-semibold">
              Skill Extraction
            </div>

            <ArrowRight />

            <div className="bg-purple-100 text-purple-700 px-5 py-3 rounded-full font-semibold">
              Team Formation
            </div>

            <ArrowRight />

            <div className="bg-orange-100 text-orange-700 px-5 py-3 rounded-full font-semibold">
              Judge Assignment
            </div>

            <ArrowRight />

            <div className="bg-red-100 text-red-700 px-5 py-3 rounded-full font-semibold">
              Bias Detection
            </div>

            <ArrowRight />

            <div className="bg-cyan-100 text-cyan-700 px-5 py-3 rounded-full font-semibold">
              Results
            </div>

          </div>

        </div>

        {/* Footer */}
        <footer className="text-center mt-20 pb-8">

          <h3 className="text-2xl font-black text-slate-900">
            FAIRJUDGE
          </h3>

          <p className="text-slate-500 mt-2">
            AI Enhanced Fair Hackathon Evaluation Platform
          </p>

          <p className="text-slate-400 mt-4">
            © 2026 IdleHour. All Rights Reserved.
          </p>

        </footer>

      </div>
    </div>
  );
}