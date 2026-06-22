"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import {
  Users,
  Trophy,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Background Blur Effects */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-300 rounded-full blur-3xl opacity-20"></div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Navbar */}
        <div className="flex justify-between items-center mb-16">
          <div className="text-2xl font-black text-indigo-900 tracking-tighter">FAIRJUDGE</div>
          <div>
            {user ? (
              <button 
                onClick={() => router.push("/dashboard-redirect")}
                className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-700 transition"
              >
                Go to Dashboard
              </button>
            ) : (
              <div className="space-x-4">
                <button 
                  onClick={() => router.push("/login")}
                  className="text-indigo-900 font-bold hover:text-indigo-600 transition"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => router.push("/register")}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium mb-6">
              <Sparkles size={18} />
              AI Powered Fair Evaluation Platform
            </div>
            <h1 className="text-6xl lg:text-7xl font-black text-slate-900 leading-tight">
              AI-Powered Hackathon Management
            </h1>
            <p className="mt-6 text-xl text-slate-600 leading-relaxed">
              Fair evaluations. Smart teams. Seamless hackathons.
              Revolutionizing hackathon evaluation with AI-powered reviewer assignment and bias detection.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              {!user && (
                <button 
                  onClick={() => router.push("/register")}
                  className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition"
                >
                  Create free account
                </button>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-[32px] shadow-2xl border p-8 grid grid-cols-2 gap-4">
               <div className="bg-blue-50 rounded-2xl p-6">
                 <h3 className="text-3xl font-black text-blue-600">95%</h3>
                 <p className="text-sm font-semibold text-blue-900 mt-1">Match Accuracy</p>
               </div>
               <div className="bg-green-50 rounded-2xl p-6">
                 <h3 className="text-3xl font-black text-green-600">96%</h3>
                 <p className="text-sm font-semibold text-green-900 mt-1">Bias Detection</p>
               </div>
               <div className="col-span-2 bg-indigo-50 rounded-2xl p-6">
                 <h3 className="text-3xl font-black text-indigo-600">100%</h3>
                 <p className="text-sm font-semibold text-indigo-900 mt-1">Transparency & Audit Trails</p>
               </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white rounded-3xl p-8 shadow-lg border">
            <Users className="text-blue-600 mb-4" size={40} />
            <h3 className="text-2xl font-bold text-slate-900">Smart Team Formation</h3>
            <p className="text-slate-600 mt-3">AI extracts participant skills and recommends diverse, balanced teams automatically.</p>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-lg border">
            <Trophy className="text-green-600 mb-4" size={40} />
            <h3 className="text-2xl font-bold text-slate-900">AI-Powered Fairness</h3>
            <p className="text-slate-600 mt-3">AI-powered reviewer assignment and score normalization ensure unbiased judging.</p>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-lg border">
            <ShieldCheck className="text-red-600 mb-4" size={40} />
            <h3 className="text-2xl font-bold text-slate-900">Real-time Analytics</h3>
            <p className="text-slate-600 mt-3">Live dashboards, bias alerts, and complete audit trails for full transparency.</p>
          </div>
        </div>

        {/* Workflow */}
        <div className="mt-20 bg-white rounded-[32px] shadow-xl border p-12">
          <h2 className="text-3xl font-black text-center text-slate-900 mb-10">How It Works</h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="text-center max-w-xs">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-4">1</div>
              <h4 className="font-bold text-lg">Create or Join</h4>
              <p className="text-sm text-gray-500 mt-2">Organizers set up hackathons, participants browse and register.</p>
            </div>
            <ArrowRight className="hidden md:block text-gray-300" size={32} />
            <div className="text-center max-w-xs">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-4">2</div>
              <h4 className="font-bold text-lg">Form Teams & Build</h4>
              <p className="text-sm text-gray-500 mt-2">Use AI matching to form squads, build projects, and submit to Drive.</p>
            </div>
            <ArrowRight className="hidden md:block text-gray-300" size={32} />
            <div className="text-center max-w-xs">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-4">3</div>
              <h4 className="font-bold text-lg">Fair Evaluations</h4>
              <p className="text-sm text-gray-500 mt-2">Judges score projects with AI copilot and bias detection enabled.</p>
            </div>
          </div>
        </div>

        <footer className="text-center mt-20 pb-8 border-t pt-8">
          <div className="text-xl font-black text-slate-300 mb-4">FAIRJUDGE</div>
          <div className="flex justify-center gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-indigo-600">About</a>
            <a href="#" className="hover:text-indigo-600">Contact</a>
            <a href="#" className="hover:text-indigo-600">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600">Terms of Service</a>
          </div>
        </footer>
      </div>
    </div>
  );
}