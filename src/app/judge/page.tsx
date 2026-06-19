"use client";

import { useState } from "react";
import {
  FileText,
  Star,
  AlertTriangle,
  MessageCircle,
  Send,
  X,
  Trophy,
  ClipboardCheck,
} from "lucide-react";

export default function JudgeDashboard() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <div className="min-h-screen bg-slate-50 p-8">

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-8 text-white shadow-xl mb-8">

        <h1 className="text-5xl font-black">
          Judge Workspace
        </h1>

        <p className="mt-3 text-emerald-100">
          Review projects, evaluate teams and ensure fair judging
        </p>

      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

        <div className="bg-white rounded-3xl p-6 shadow border">
          <ClipboardCheck className="text-emerald-600 mb-3" />
          <p className="text-slate-500">
            Assigned Projects
          </p>

          <h2 className="text-4xl font-bold text-slate-800">
            12
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow border">
          <Star className="text-yellow-500 mb-3" />
          <p className="text-slate-500">
            Reviews Submitted
          </p>

          <h2 className="text-4xl font-bold text-slate-800">
            8
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow border">
          <Trophy className="text-purple-600 mb-3" />
          <p className="text-slate-500">
            Avg Score Given
          </p>

          <h2 className="text-4xl font-bold text-slate-800">
            8.7
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow border">
          <AlertTriangle className="text-orange-500 mb-3" />
          <p className="text-slate-500">
            Conflict Alerts
          </p>

          <h2 className="text-4xl font-bold text-slate-800">
            1
          </h2>
        </div>

      </div>

      {/* Main Grid */}
     <div className="grid xl:grid-cols-2 gap-6 mb-8">

        {/* Assigned Projects */}
        <div className="bg-white rounded-3xl p-6 shadow border">

          <h2 className="text-2xl font-bold text-slate-800 mb-5">
            Assigned Projects
          </h2>

          <div className="space-y-4">

            <div className="border rounded-2xl p-4">

              <h3 className="font-bold text-slate-800">
                Team Alpha
              </h3>

              <p className="text-slate-500">
                AI Based Fair Evaluation System
              </p>

              <button className="mt-3 bg-emerald-600 text-white px-4 py-2 rounded-xl">
                Review Project
              </button>

            </div>

            <div className="border rounded-2xl p-4">

              <h3 className="font-bold text-slate-800">
                Team VisionX
              </h3>

              <p className="text-slate-500">
                Smart Education Platform
              </p>

              <button className="mt-3 bg-emerald-600 text-white px-4 py-2 rounded-xl">
                Review Project
              </button>

            </div>

          </div>

        </div>

        {/* Conflict Check */}
        <div className="bg-white rounded-3xl p-6 shadow border">

          <h2 className="text-2xl font-bold text-slate-800 mb-5">
            Conflict Check
          </h2>

          <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl">

            <AlertTriangle className="text-orange-500 mt-1" />

            <div>

              <h3 className="font-semibold text-slate-800">
                Conflict Detected
              </h3>

              <p className="text-slate-600">
                Team VisionX has previous collaboration history with this judge.
              </p>

            </div>

          </div>

        </div>

      </div>
{/* AI Evaluation Section */}
<div className="mt-8">

  <div className="bg-gradient-to-r  from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-8 text-white shadow-xl mb-8">

    <h2 className="text-2xl font-bold mb-4">
      AI Evaluation Assistant
    </h2>

    <div className="grid grid-cols-3 gap-4">

      <div>
        <p className="text-blue-100">
          Assigned
        </p>

        <h3 className="text-3xl font-bold">
          8
        </h3>
      </div>

      <div>
        <p className="text-blue-100">
          Reviewed
        </p>

        <h3 className="text-3xl font-bold">
          5
        </h3>
      </div>

      <div>
        <p className="text-blue-100">
          Remaining
        </p>

        <h3 className="text-3xl font-bold">
          3
        </h3>
      </div>

    </div>

  </div>

  <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-6">

    <div className="bg-green-50 border border-green-200 rounded-3xl p-6 shadow">

      <h2 className="text-xl font-bold text-green-700">
        Conflict Check
      </h2>

      <p className="mt-3 text-green-700">
        ✓ No Conflict Found
      </p>

      <h3 className="text-3xl font-bold text-green-600 mt-4">
        100%
      </h3>

    </div>

    <div className="bg-purple-50 border border-purple-200 rounded-3xl p-6 shadow">

      <h2 className="text-xl font-bold text-purple-700">
        Bias Detection
      </h2>

      <p className="mt-3 text-purple-700">
        Monitoring Active
      </p>

      <h3 className="text-3xl font-bold text-purple-600 mt-4">
        97%
      </h3>

    </div>

    <div className="bg-orange-50 border border-orange-200 rounded-3xl p-6 shadow">

      <h2 className="text-xl font-bold text-orange-700">
        Score Calibration
      </h2>

      <p className="mt-3 text-orange-700">
        Cross Judge Sync
      </p>

      <h3 className="text-3xl font-bold text-orange-600 mt-4">
        95%
      </h3>

    </div>

    <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 shadow">

      <h2 className="text-xl font-bold text-blue-700">
        AI Suggested Score
      </h2>

      <p className="text-black mt-3">
        Innovation: 8.9
      </p>

      <p className="text-black">
        Technical: 9.1
      </p>

      <p className="text-black">
        UI/UX: 8.7
      </p>

      <h3 className="text-2xl font-bold text-blue-600 mt-4">
        8.9 / 10
      </h3>

    </div>

  </div>

</div>

      {/* Rubric Scoring */}
      <div className="mt-8 bg-white rounded-3xl p-6 shadow border">

        <h2 className="text-2xl font-bold text-black mb-6">
          Rubric Scoring
        </h2>

        <div className="space-y-6">

          <div>
            <label className="font-medium text-black">
              Innovation (8/10)
            </label>

            <input
              type="range"
              min="0"
              max="10"
              defaultValue="8"
              className="w-full"
            />
          </div>

          <div>
            <label className="font-medium text-black">
              Technical Complexity (9/10)
            </label>

            <input
              type="range"
              min="0"
              max="10"
              defaultValue="9"
              className="w-full"
            />
          </div>

          <div>
            <label className="font-medium text-black">
              UI / UX (8/10)
            </label>

            <input
              type="range"
              min="0"
              max="10"
              defaultValue="8"
              className="w-full"
            />
          </div>

          <div>
            <label className="font-medium text-black">
              Scalability (7/10)
            </label>

            <input
              type="range"
              min="0"
              max="10"
              defaultValue="7"
              className="w-full"
            />
          </div>

          <div>
            <label className="font-medium text-black">
              Impact (9/10)
            </label>

            <input
              type="range"
              min="0"
              max="10"
              defaultValue="9"
              className="w-full"
            />
          </div>

          <textarea 
            placeholder="Judge Feedback"
            className="w-full border rounded-xl p-4 text-black" 
            rows={4}
          />

          <button className="bg-emerald-600 text-white px-6 py-3 rounded-xl">
            Submit Review
          </button>

        </div>

      </div>

      {/* Recent Reviews */}
      <div className="mt-8 bg-white rounded-3xl p-6 shadow border">

        <h2 className="text-2xl font-bold text-black mb-5">
          Recent Reviews
        </h2>

        <div className="space-y-4">

          <div className="flex justify-between">
            <span className="text-black">
              Team Alpha
            </span>

            <span className="text-green-600 font-semibold">
              Submitted
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-black">
              Team VisionX
            </span>

            <span className="text-orange-500 font-semibold">
              Pending
            </span>
          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="mt-12 border-t pt-6 text-center">
        <p className="text-slate-500">
          © 2026 IdleHour. All Rights Reserved.
        </p>
      </footer>

      {/* AI Judge Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="
        fixed
        bottom-8
        right-8
        bg-gradient-to-r
        from-emerald-600
        to-teal-600
        text-white
        px-6
        py-4
        rounded-full
        shadow-2xl
        flex
        items-center
        gap-2
        z-50
        "
      >
        <MessageCircle size={20} />
        AI Judge
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-28 right-8 w-[380px] h-[520px] bg-white rounded-3xl shadow-2xl border overflow-hidden z-50">

          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 flex justify-between items-center">

            <div>
              <h3 className="font-bold">
                AI Judge Assistant
              </h3>

              <p className="text-xs opacity-80">
                Online
              </p>
            </div>

            <button
              onClick={() => setIsChatOpen(false)}
            >
              <X size={20} />
            </button>

          </div>

          <div className="p-4 space-y-3">

            <div className="bg-slate-100 p-3 rounded-xl text-black">
              🏆 Suggest Winner Candidates
            </div>

            <div className="bg-slate-100 p-3 rounded-xl text-black">
              📊 Review Score Distribution
            </div>

            <div className="bg-slate-100 p-3 rounded-xl text-black">
              ⚠ Detect Review Bias
            </div>

            <div className="bg-slate-100 p-3 rounded-xl text-black">
              📝 Generate Feedback Summary
            </div>

          </div>

          <div className="absolute bottom-0 w-full border-t p-3 flex gap-2">

            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask AI Judge..."
              className="flex-1 border rounded-lg px-3 py-2 text-slate-800"
            />

            <button className="bg-emerald-600 text-white px-4 rounded-lg">
              <Send size={18} />
            </button>

          </div>

        </div>
      )}

    </div>
  );
}