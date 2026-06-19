"use client";

import { useState } from "react";
import {
  Users,
  Trophy,
  ClipboardCheck,
  BarChart3,
  MessageCircle,
  Send,
  X,
} from "lucide-react";

export default function OrganizerDashboard() {

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <div className="min-h-screen bg-slate-50 p-8">

      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-8 text-white shadow-xl mb-8">
        <h1 className="text-4xl font-black">
          Organizer Console
        </h1>

        <p className="mt-2 text-blue-100">
          Manage events, judges and hackathon analytics.
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

        <div className="bg-white rounded-3xl p-6 shadow border">
          <Users className="text-blue-600 mb-3" />
          <h3 className="text-black">Participants</h3>
          <p className="text-black text-4xl font-bold">250</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow border">
          <Trophy className="text-green-600 mb-3" />
          <h3 className="text-black">Teams</h3>
          <p className="text-black text-4xl font-bold">68</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow border">
          <ClipboardCheck className="text-orange-500 mb-3" />
          <h3 className="text-black">Judges</h3>
          <p className="text-black text-4xl font-bold">15</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow border">
          <BarChart3 className="text-purple-600 mb-3" />
          <h3 className="text-black">Projects</h3>
          <p className="text-black text-4xl font-bold">72</p>
        </div>

      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Event Config */}
        <div className="bg-white rounded-3xl p-6 shadow border">

          <h2 className="text-black text-2xl font-bold mb-5">
            Event Configuration
          </h2>

          <div className="space-y-4">

            <input
              placeholder="Event Name"
              className="w-full border p-3 rounded-xl text-black"
            />

            <input
              type="date"
              className="w-full border p-3 rounded-xl text-black"
            />

            <input
              placeholder="Max Team Size"
              className="w-full border p-3 rounded-xl text-black"
            />

            <textarea
              placeholder="Evaluation Criteria"
              className="w-full border p-3 rounded-xl text-black"
            />

            <button className="bg-blue-600 text-white px-5 py-3 rounded-xl">
              Create Event
            </button>

          </div>

        </div>
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-3xl p-6 shadow-lg">

  <h2 className="text-2xl font-bold mb-4">
    AI Assignment Engine
  </h2>

  <div className="grid md:grid-cols-3 gap-4">

    <div>
      <p className="text-purple-100">
        Match Accuracy
      </p>

      <h3 className="text-3xl font-bold">
        94%
      </h3>
    </div>

    <div>
      <p className="text-purple-100">
        Active Judges
      </p>

      <h3 className="text-3xl font-bold">
        15
      </h3>
    </div>

    <div>
      <p className="text-purple-100">
        Conflict Free
      </p>

      <h3 className="text-3xl font-bold">
        100%
      </h3>
    </div>

  </div>

</div>
<div className="bg-red-50 border border-red-200 rounded-3xl p-6 shadow">

  <h2 className="text-xl font-bold text-red-700 mb-4">
    Fairness Monitor
  </h2>

  <p className="text-red-700">
    No Bias Alerts Detected
  </p>

  <div className="mt-4">

    <p className="text-black">
      Fairness Score
    </p>

    <h3 className="text-3xl font-bold text-red-600">
      98%
    </h3>

  </div>

</div>
<div className="bg-white rounded-3xl p-6 shadow border">

  <h2 className="text-black text-xl font-bold mb-5">
    Live Event Status
  </h2>

  <div className="space-y-4">

    <div className="flex justify-between">
      <span className="text-black">Registrations</span>
      <span className="font-bold text-blue-600">
        250
      </span>
    </div>

    <div className="flex justify-between">
      <span className="text-black">Projects Submitted</span>
      <span className="font-bold text-green-600">
        72
      </span>
    </div>

    <div className="flex justify-between">
      <span className="text-black">Reviews Completed</span>
      <span className="font-bold text-purple-600">
        61
      </span>
    </div>

  </div>

</div>
<div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 shadow">

  <h2 className="text-xl font-bold text-blue-700 mb-4">
    AI Predictions
  </h2>

  <p className="text-black">
    Expected Completion
  </p>

  <h3 className="text-3xl font-bold text-blue-600">
    96%
  </h3>

  <p className="mt-4 text-black">
    Predicted Top Teams
  </p>

  <h3 className="text-2xl font-bold text-blue-600">
    12
  </h3>

</div>

        {/* Judge Assignment */}
        <div className="bg-white rounded-3xl p-6 shadow border">

          <h2 className="text-black text-2xl font-bold mb-5">
            Judge Assignment
          </h2>

          <table className="w-full">

            <thead>
              <tr className="text-left border-b">
                <th className="py-3 text-black">Judge</th>
                <th className="text-black">Domain</th>
                <th className="text-black">Teams</th>
              </tr>
            </thead>

            <tbody>

              <tr>
                <td className="py-3 text-black">Dr. Sharma</td>
                <td className="text-black">AI/ML</td>
                <td className="text-black">8</td>
              </tr>

              <tr>
                <td className="py-3 text-black">Prof. Singh</td>
                <td className="text-black">Web Dev</td>
                <td className="text-black">10</td>
              </tr>

            </tbody>

          </table>

          <button className="mt-5 bg-green-600 text-white px-5 py-3 rounded-xl">
            Assign Judge
          </button>

        </div>

      </div>

      {/* Analytics */}
    <div className="mt-8">
  <h2 className="text-3xl font-bold text-slate-800 mb-6">
    Analytics Overview
  </h2>

  <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

    <div className="bg-white rounded-3xl p-6 shadow border">
      <h3 className="font-semibold text-slate-700">
        Submission Trend
      </h3>

      <div className="mt-4 h-3 bg-slate-200 rounded-full">
        <div className="h-3 bg-blue-600 rounded-full w-[75%]"></div>
      </div>

      <p className="mt-3 text-blue-600 font-bold">
        +18%
      </p>
    </div>

    <div className="bg-white rounded-3xl p-6 shadow border">
      <h3 className="font-semibold text-slate-700">
        Participation Growth
      </h3>

      <div className="mt-4 h-3 bg-slate-200 rounded-full">
        <div className="h-3 bg-green-500 rounded-full w-[85%]"></div>
      </div>

      <p className="mt-3 text-green-600 font-bold">
        +25%
      </p>
    </div>

    <div className="bg-white rounded-3xl p-6 shadow border">
      <h3 className="font-semibold text-slate-700">
        Judge Activity
      </h3>

      <div className="mt-4 h-3 bg-slate-200 rounded-full">
        <div className="h-3 bg-purple-500 rounded-full w-[70%]"></div>
      </div>

      <p className="mt-3 text-purple-600 font-bold">
        12 Active
      </p>
    </div>

    <div className="bg-white rounded-3xl p-6 shadow border">
      <h3 className="font-semibold text-slate-700">
        Average Score
      </h3>

      <p className="text-5xl font-black text-orange-500 mt-4">
        8.7
      </p>
    </div>

  </div>
</div>

{/* Recent Activity */}
<div className="mt-8 bg-white rounded-3xl p-6 shadow border">

  <h2 className="text-2xl font-bold text-slate-800 mb-5">
    Recent Activity
  </h2>

  <div className="space-y-4">

    <div className="flex gap-3">
      <span>✅</span>
      <p className="text-slate-700">
        Team Alpha submitted final project
      </p>
    </div>

    <div className="flex gap-3">
      <span>👨‍⚖️</span>
      <p className="text-slate-700">
        Judge Sharma assigned to 8 teams
      </p>
    </div>

    <div className="flex gap-3">
      <span>⚠️</span>
      <p className="text-slate-700">
        Appeal raised by Team VisionX
      </p>
    </div>

    <div className="flex gap-3">
      <span>📊</span>
      <p className="text-slate-700">
        Scores published successfully
      </p>
    </div>

  </div>

</div>

{/* Quick Actions */}
<div className="grid md:grid-cols-4 gap-6 mt-8">

  <button className="bg-white rounded-3xl p-6 shadow border hover:shadow-xl transition text-left">
    📊
    <h3 className="font-bold text-slate-800 mt-3">
      Generate Report
    </h3>
  </button>

  <button className="bg-white rounded-3xl p-6 shadow border hover:shadow-xl transition text-left">
    👨‍⚖️
    <h3 className="font-bold text-slate-800 mt-3">
      Assign Judges
    </h3>
  </button>

  <button className="bg-white rounded-3xl p-6 shadow border hover:shadow-xl transition text-left">
    🏆
    <h3 className="font-bold text-slate-800 mt-3">
      Leaderboard
    </h3>
  </button>

  <button className="bg-white rounded-3xl p-6 shadow border hover:shadow-xl transition text-left">
    ⚠️
    <h3 className="font-bold text-slate-800 mt-3">
      Fairness Check
    </h3>
  </button>

</div>

{/* Footer */}
<footer className="mt-12 border-t pt-6 text-center">
  <p className="text-slate-500">
    © 2026 IdleHour. All Rights Reserved.
  </p>
</footer>

{/* Floating AI Organizer */}
<button
  onClick={() => setIsChatOpen(true)}
  className="
  fixed
  bottom-8
  right-8
  bg-gradient-to-r
  from-indigo-600
  to-purple-600
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
  AI Organizer
</button>

{/* Chat Window */}
{isChatOpen && (
  <div className="fixed bottom-28 right-8 w-[380px] h-[520px] bg-white rounded-3xl shadow-2xl border overflow-hidden z-50">

    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex justify-between items-center">

      <div>
        <h3 className="font-bold">
          AI Organizer Assistant
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
        📊 Generate Event Report
      </div>

      <div className="bg-slate-100 p-3 rounded-xl text-black">
        👨‍⚖️ Auto Assign Judges
      </div>

      <div className="bg-slate-100 p-3 rounded-xl text-black">
        ⚠ Detect Judge Overload
      </div>

      <div className="bg-slate-100 p-3 rounded-xl text-black">
        🏆 Predict Top Teams
      </div>

    </div>

    <div className="absolute bottom-0 w-full border-t p-3 flex gap-2">

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask organizer AI..."
        className="flex-1 border rounded-lg px-3 py-2 text-slate-800"
      />

      <button className="bg-indigo-600 text-white px-4 rounded-lg">
        <Send size={18} />
      </button>

    </div>

  </div>
)}
    </div>
  );
}