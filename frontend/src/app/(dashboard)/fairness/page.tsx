"use client";

import { useState } from "react";
import {
  Shield,
  AlertTriangle,
  Scale,
  FileSearch,
  MessageCircle,
  Send,
  X,
  CheckCircle,
} from "lucide-react";

export default function FairnessDashboard() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <div className="min-h-screen bg-slate-50 p-8">

      {/* Hero */}
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-3xl p-8 text-white shadow-xl mb-8">

        <h1 className="text-5xl font-black">
          Fairness Monitor
        </h1>

        <p className="mt-3 text-orange-100">
          Monitor bias detection, audit trails and appeals for transparent judging.
        </p>

      </div>
      {/* AI Fairness Metrics */}
<div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

  <div className="bg-green-50 border border-green-200 rounded-3xl p-6">
    <h3 className="text-green-700 font-bold">
      Fairness Index
    </h3>

    <h2 className="text-5xl font-black text-green-600 mt-3">
      94%
    </h2>
  </div>

  <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6">
    <h3 className="text-blue-700 font-bold">
      Judge Calibration
    </h3>

    <h2 className="text-5xl font-black text-blue-600 mt-3">
      96%
    </h2>
  </div>

  <div className="bg-purple-50 border border-purple-200 rounded-3xl p-6">
    <h3 className="text-purple-700 font-bold">
      Diversity Score
    </h3>

    <h2 className="text-5xl font-black text-purple-600 mt-3">
      8.8
    </h2>
  </div>

  <div className="bg-orange-50 border border-orange-200 rounded-3xl p-6">
    <h3 className="text-orange-700 font-bold">
      Duplicate Detection
    </h3>

    <h2 className="text-5xl font-black text-orange-600 mt-3">
      95%
    </h2>
  </div>

</div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

        <div className="bg-white rounded-3xl p-6 shadow border">
          <AlertTriangle className="text-red-500 mb-3" />
          <p className="text-slate-500">
            Active Alerts
          </p>

          <h2 className="text-4xl font-bold text-slate-800">
            5
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow border">
          <Shield className="text-blue-600 mb-3" />
          <p className="text-slate-500">
            Reviews Checked
          </p>

          <h2 className="text-4xl font-bold text-slate-800">
            128
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow border">
          <Scale className="text-purple-600 mb-3" />
          <p className="text-slate-500">
            Appeals Raised
          </p>

          <h2 className="text-4xl font-bold text-slate-800">
            7
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow border">
          <CheckCircle className="text-green-600 mb-3" />
          <p className="text-slate-500">
            Resolved Cases
          </p>

          <h2 className="text-4xl font-bold text-slate-800">
            21
          </h2>
        </div>

      </div>

      {/* Bias Alerts */}
      <div className="bg-white rounded-3xl p-6 shadow border mb-8">

        <h2 className="text-2xl font-bold text-slate-800 mb-5">
          Real-Time Bias Alerts
        </h2>

        <div className="space-y-4">

          <div className="p-4 bg-red-50 rounded-xl border border-red-200">
            <h3 className="font-semibold text-red-700">
              High Score Variance Detected
            </h3>

            <p className="text-slate-600">
              Judge A gave significantly different scores than other judges.
            </p>
          </div>

          <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <h3 className="font-semibold text-yellow-700">
              Potential Collaboration Conflict
            </h3>

            <p className="text-slate-600">
              Previous association detected between Judge B and Team VisionX.
            </p>
          </div>

        </div>

      </div>

      {/* Audit Trail + Appeals */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Audit Trail */}
        <div className="bg-white rounded-3xl p-6 shadow border">

          <h2 className="text-2xl font-bold text-slate-800 mb-5">
            Audit Trail
          </h2>

          <div className="space-y-5">

            <div className="flex gap-3">
              <FileSearch className="text-blue-600" />
              <p className="text-black">Judge Assigned</p>
            </div>

            <div className="flex gap-3">
              <FileSearch className="text-blue-600" />
              <p className="text-black">Review Submitted</p>
            </div>

            <div className="flex gap-3">
              <FileSearch className="text-blue-600" />
              <p className="text-black">AI Bias Analysis Performed</p>
            </div>

            <div className="flex gap-3">
              <FileSearch className="text-blue-600" />
              <p className="text-black">Score Normalized</p>
            </div>

            <div className="flex gap-3">
              <FileSearch className="text-blue-600" />
              <p className="text-black">Final Results Published</p>
            </div>

          </div>

        </div>

        {/* Appeals */}
        <div className="bg-white rounded-3xl p-6 shadow border">

          <h2 className="text-2xl font-bold text-slate-800 mb-5">
            Appeals Portal
          </h2>

          <div className="space-y-4">

            <div className="border rounded-xl p-4">

              <h3 className="font-semibold text-slate-800">
                Team VisionX
              </h3>

              <p className="text-slate-500">
                Appeal against score discrepancy.
              </p>

              <div className="flex gap-3 mt-4">

                <button className="bg-green-600 text-white px-4 py-2 rounded-xl">
                  Approve
                </button>

                <button className="bg-red-600 text-white px-4 py-2 rounded-xl">
                  Reject
                </button>

              </div>

            </div>

            <div className="border rounded-xl p-4">

              <h3 className="font-semibold text-slate-800">
                Team Alpha
              </h3>

              <p className="text-slate-500">
                Requesting review clarification.
              </p>

              <div className="flex gap-3 mt-4">

                <button className="bg-green-600 text-white px-4 py-2 rounded-xl">
                  Approve
                </button>

                <button className="bg-red-600 text-white px-4 py-2 rounded-xl">
                  Reject
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Fairness Analytics */}
      <div className="mt-8 bg-white rounded-3xl p-6 shadow border">

        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          Fairness Analytics
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-blue-50 rounded-2xl p-5">
            <h3 className="font-semibold text-black">
              Bias Detection Accuracy
            </h3>

            <p className="text-4xl font-bold text-blue-600 mt-3">
              96%
            </p>
          </div>

          <div className="bg-green-50 rounded-2xl p-5">
            <h3 className="font-semibold text-black">
              Fair Reviews
            </h3>

            <p className="text-4xl font-bold text-green-600 mt-3">
              91%
            </p>
          </div>

          <div className="bg-purple-50 rounded-2xl p-5">
            <h3 className="font-semibold text-black">
              Appeals Success Rate
            </h3>

            <p className="text-4xl font-bold text-purple-600 mt-3">
              14%
            </p>
          </div>

        </div>

      </div>
      <div className="grid lg:grid-cols-2 gap-6 mt-8">

  <div className="bg-white rounded-3xl p-6 shadow border">

    <h2 className="text-black text-2xl font-bold mb-5">
      Explainable AI
    </h2>

    <div className="space-y-4">

      <div className="bg-blue-50 p-4 rounded-xl">

        <h3 className="font-semibold text-blue-700">
          Why was bias flagged?
        </h3>

        <p className="text-black mt-2">
          Score variance exceeded platform threshold by 27%.
        </p>

      </div>

      <div className="bg-purple-50 p-4 rounded-xl">

        <h3 className="font-semibold text-purple-700">
          Why was score normalized?
        </h3>

        <p className="text-black mt-2">
          AI detected outlier review compared to peer judges.
        </p>

      </div>

    </div>

  </div>

  <div className="bg-white rounded-3xl p-6 shadow border">

    <h2 className="text-black text-2xl font-bold mb-5">
      Transparency Report
    </h2>

    <div className="space-y-4">

      <div className="flex justify-between">
        <span className="text-black">Reviews Audited</span>
        <span className="font-bold text-black">128</span>
      </div>

      <div className="flex justify-between">
        <span className="text-black">Bias Cases Found</span>
        <span className="font-bold text-red-500">
          5
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-black">Appeals Processed</span>
        <span className="font-bold text-green-600">
          21
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-black">Transparency Score</span>
        <span className="font-bold text-blue-600">
          98%
        </span>
      </div>

    </div>

  </div>

</div>

      {/* Footer */}
      <footer className="mt-12 border-t pt-6 text-center">
        <p className="text-slate-500">
          © 2026 IdleHour. All Rights Reserved.
        </p>
      </footer>

      {/* Floating AI Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="
        fixed
        bottom-8
        right-8
        bg-gradient-to-r
        from-red-600
        to-orange-500
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
        AI Fairness
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-28 right-8 w-[380px] h-[520px] bg-white rounded-3xl shadow-2xl border overflow-hidden z-50">

          <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white p-4 flex justify-between items-center">

            <div>
              <h3 className="font-bold">
                AI Fairness Assistant
              </h3>

              <p className="text-xs opacity-80">
                Online
              </p>
            </div>

            <button onClick={() => setIsChatOpen(false)}>
              <X size={20} />
            </button>

          </div>

          <div className="p-4 space-y-3">

            <div className="bg-slate-100 p-3 rounded-xl text-black">
              ⚠ Detect Hidden Bias
            </div>

            <div className="bg-slate-100 p-3 rounded-xl text-black">
              📊 Analyze Judge Behavior
            </div>

            <div className="bg-slate-100 p-3 rounded-xl text-black">
              🛡 Generate Audit Report
            </div>

            <div className="bg-slate-100 p-3 rounded-xl text-black">
              📄 Appeal Recommendation
            </div>

          </div>

          <div className="absolute bottom-0 w-full border-t p-3 flex gap-2">

            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask AI Fairness..."
              className="flex-1 border rounded-lg px-3 py-2 text-slate-800"
            />

            <button className="bg-red-600 text-white px-4 rounded-lg">
              <Send size={18} />
            </button>

          </div>

        </div>
      )}

    </div>
  );
}