"use client";

import { useState } from "react";
import {
  Users,
  Trophy,
  FileText,
  Calendar,
  CheckCircle,
  Star,
  MessageCircle,
  Send,
  X,
} from "lucide-react";

export default function ParticipantDashboard() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="mb-8">
  <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl">

    <div className="flex flex-col lg:flex-row justify-between items-center">

      <div>
        <p className="text-blue-100 mb-2">
          Welcome Back 👋
        </p>

        <h1 className="text-5xl font-black">
          User
        </h1>

        <p className="mt-3 text-blue-100">
          AI Innovation Challenge 2026 Participant
        </p>

        <div className="flex gap-3 mt-5">

          <span className="bg-white/20 px-4 py-2 rounded-full">
            Team CodeCatalysts
          </span>
        

          <span className="bg-white/20 px-4 py-2 rounded-full">
            Rank #12
          </span>

        </div>
      </div>

      <div className="mt-8 lg:mt-0">

        <div className="w-36 h-36 rounded-full border-[10px] border-white/30 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold">
              85%
            </h2>

            <p className="text-sm">
              Complete
            </p>
          </div>
        </div>

      </div>

    </div>

  </div>
</div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

  <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition border-l-4 border-blue-500">
    <p className="text-black">
      Active Events
    </p>

    <h2 className="text-black text-4xl font-bold mt-2">
      04
    </h2>

    <p className="text-green-600 mt-2 text-sm">
      ↑ 20% increase
    </p>
  </div>

  <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition border-l-4 border-green-500">
    <p className="text-black">
      Team Members
    </p>

    <h2 className="text-black text-4xl font-bold mt-2">
      05
    </h2>

    <p className="text-green-600 mt-2 text-sm">
      Team Complete
    </p>
  </div>

  <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition border-l-4 border-orange-500">
    <p className="text-black">
      Submissions
    </p>

    <h2 className="text-black text-4xl font-bold mt-2">
      02
    </h2>

    <p className="text-orange-600 mt-2 text-sm">
      Review Pending
    </p>
  </div>

  <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition border-l-4 border-purple-500">
    <p className="text-black">
      Current Rank
    </p>

    <h2 className="text-black text-4xl font-bold mt-2">
      #12
    </h2>

    <p className="text-purple-600 mt-2 text-sm">
      Top 10%
    </p>
  </div>

</div>
    {/* Main Content */}
<div className="grid lg:grid-cols-3 gap-6">

  {/* Registration */}
  <div className="bg-white rounded-3xl p-6 shadow border">
    <h2 className="text-2xl font-bold text-slate-800 mb-4">
      Registration Status
    </h2>

    <div className="flex justify-between mb-2">
      <span className="text-slate-700">
        Profile Completion
      </span>

      <span className="font-semibold text-slate-800">
        85%
      </span>
    </div>

    <div className="w-full bg-slate-200 rounded-full h-3">
      <div className="bg-blue-600 h-3 rounded-full w-[85%]" />
    </div>

    <button className="mt-5 bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700">
      Complete Profile
    </button>
  </div>

  {/* Team Builder */}
  <div className="bg-white rounded-3xl p-6 shadow border">

    <h2 className="text-2xl font-bold text-slate-800 mb-5">
      Suggested Teammate
    </h2>

    <div className="flex items-center gap-4">

      <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
        RS
      </div>

      <div>
        <h3 className="font-bold text-lg text-slate-800">
          Rahul Sharma
        </h3>

        <p className="text-slate-500">
          AI Engineer
        </p>
      </div>

    </div>

    <div className="mt-4 flex flex-wrap gap-2">

      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
        React
      </span>

      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
        Node
      </span>

      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
        AI
      </span>

    </div>

    <div className="flex justify-between items-center mt-6">

      <span className="text-green-600 font-bold text-lg">
        92% Match
      </span>

      <button className="bg-blue-600 text-white px-5 py-2 rounded-xl">
        Invite
      </button>

    </div>

  </div>
  

  {/* Journey Timeline */}
  <div className="bg-white rounded-3xl p-6 shadow border">

    <h2 className="text-2xl font-bold text-slate-800 mb-6">
      Journey Timeline
    </h2>

    <div className="space-y-6">

      <div className="flex gap-4">
        <div className="w-4 h-4 bg-green-500 rounded-full mt-2"></div>

        <div>
          <h3 className="font-semibold text-slate-800">
            Registration Approved
          </h3>

          <p className="text-slate-500">
            Successfully verified.
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-4 h-4 bg-blue-500 rounded-full mt-2"></div>

        <div>
          <h3 className="font-semibold text-slate-800">
            Team Created
          </h3>

          <p className="text-slate-500">
            5 members joined.
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-4 h-4 bg-orange-500 rounded-full mt-2"></div>

        <div>
          <h3 className="font-semibold text-slate-800">
            PPT Uploaded
          </h3>

          <p className="text-slate-500">
            Waiting for judge review.
          </p>
        </div>
      </div>

    </div>

  </div>

</div>

{/* Submission + AI Insights */}
<div className="grid lg:grid-cols-2 gap-6 mt-6">

  <div className="bg-white rounded-3xl p-6 shadow border">
    <h2 className="text-2xl font-bold text-slate-800 mb-5">
      Submission Status
    </h2>

    <div className="space-y-4">

      <div className="flex items-center gap-3">
        <CheckCircle className="text-green-600" size={22}/>
        <span className="text-black">Project Proposal Submitted</span>
      </div>

      <div className="flex items-center gap-3">
        <CheckCircle className="text-green-600" size={22}/>
        <span className="text-black">Presentation Uploaded</span>
      </div>

      <div className="flex items-center gap-3">
        <Star className="text-yellow-500" size={22}/>
        <span className="text-black">Awaiting Judge Review</span>
      </div>

    </div>
  </div>

  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-3xl p-6 shadow-lg">

  <h2 className="text-2xl font-bold mb-5">
    AI Insights
  </h2>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

    <div>
      <p className="text-cyan-100">
        Skill Match
      </p>

      <h3 className="text-3xl font-bold">
        92%
      </h3>
    </div>

    <div>
      <p className="text-cyan-100">
        Diversity
      </p>

      <h3 className="text-3xl font-bold">
        High
      </h3>
    </div>

    <div>
      <p className="text-cyan-100">
        Success Rate
      </p>

      <h3 className="text-3xl font-bold">
        88%
      </h3>
    </div>

    <div>
      <p className="text-cyan-100">
        Team Diversity
      </p>

      <h3 className="text-3xl font-bold">
        8.9/10
      </h3>
    </div>

  </div>
 </div>
</div>
{/* Workflow Tracker */}
<div className="bg-white rounded-3xl p-6 shadow border mt-6">

  <h2 className="text-black text-xl font-bold mb-5">
     Workflow Progress
  </h2>

  <div className="flex flex-wrap gap-3">

    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full">
      ✓ Registration
    </span>

    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full">
      ✓ Skill Extraction
    </span>

    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full">
      ✓ Team Formation
    </span>

    <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full">
      ⏳ Judge Review
    </span>

    <span className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full">
      Results Pending
    </span>

  </div>

</div>
<div className="grid lg:grid-cols-3 gap-6 mt-6">

  {/* Skill Extraction */}
  <div className="bg-white rounded-3xl p-6 shadow border">

    <h2 className="text-xl font-bold text-slate-800 mb-4">
      AI Skill Extraction
    </h2>

    <div className="flex flex-wrap gap-2 mb-4">

      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
        React.js
      </span>

      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
        Node.js
      </span>

      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
        AI/ML
      </span>

      <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full">
        UI/UX
      </span>

    </div>

    <p className="text-black">
      Confidence Score
    </p>

    <h3 className="text-3xl font-bold text-green-600">
      94%
    </h3>

  </div>

  {/* Duplicate Detector */}
  <div className="bg-green-50 border border-green-200 rounded-3xl p-6 shadow">

    <h2 className="text-xl font-bold text-green-700 mb-4">
      AI Verification
    </h2>

    <p className="text-green-700 text-lg">
      ✓ No Duplicate Profile Found
    </p>

    <div className="mt-5">
      <p className="text-black">
        Detection Accuracy
      </p>

      <h3 className="text-3xl font-bold text-green-600">
        95%
      </h3>
    </div>

  </div>

  {/* Fairness Monitor */}
  <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 shadow">

    <h2 className="text-xl font-bold text-blue-700 mb-4">
      Fairness Monitor
    </h2>

    <p className="text-blue-700 text-lg">
      ✓ No Bias Alerts
    </p>

    <div className="mt-5">
      <p className="text-black">
        Monitoring Status
      </p>

      <h3 className="text-2xl font-bold text-blue-600">
        Active
      </h3>
    </div>

  </div>

</div>

{/* Bottom Section */}
<div className="grid lg:grid-cols-2 gap-6 mt-8">

  {/* Upcoming Hackathons */}
  <div className="bg-white rounded-3xl p-6 shadow border">

    <h2 className="text-2xl font-bold text-slate-800 mb-5">
      Upcoming Hackathons
    </h2>

    <div className="space-y-5">

      <div>
        <h3 className="font-semibold text-slate-800">
          AI Innovation Challenge
        </h3>

        <p className="text-slate-500">
          25 June 2026
        </p>
      </div>

      <hr />

      <div>
        <h3 className="font-semibold text-slate-800">
          Smart India Hackathon
        </h3>

        <p className="text-slate-500">
          02 July 2026
        </p>
      </div>

    </div>

  </div>

  {/* Upcoming Deadlines */}
  <div className="bg-white rounded-3xl p-6 shadow border">

    <h2 className="text-2xl font-bold text-slate-800 mb-5">
      Upcoming Deadlines
    </h2>

    <div className="space-y-5">

      <div className="flex justify-between">
        <span className="text-slate-700">
          PPT Submission
        </span>

        <span className="text-red-500 font-semibold">
          2 Days Left
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-slate-700">
          Final Evaluation
        </span>

        <span className="text-orange-500 font-semibold">
          5 Days Left
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-slate-700">
          Demo Presentation
        </span>

        <span className="text-green-500 font-semibold">
          Scheduled
        </span>
      </div>

    </div>

  </div>

</div>
      

      {/* Footer */}
      <footer className="mt-16 border-t pt-6 text-center">
        <p className="text-slate-500">
          © 2026 IdleHour. All Rights Reserved.
        </p>
      </footer>

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 flex items-center justify-center z-50"
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-28 right-8 w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl border overflow-hidden z-50">

          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">
                FAIRJUDGE AI Assistant
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

          <div className="h-[370px] overflow-y-auto bg-slate-50 p-4">
            <div className="bg-white p-3 rounded-xl shadow mb-3 text-slate-700">
              👋 Hello! I am FAIRJUDGE Assistant.
            </div>

            <div className="bg-white p-3 rounded-xl shadow text-slate-700">
              I can help you with:
              <br />
              • Registration
              <br />
              • Team Formation
              <br />
              • Project Submission
              <br />
              • Hackathon Rules
            </div>
          </div>

          <div className="border-t p-3 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border rounded-lg px-3 py-2 text-slate-800"
            />

            <button className="bg-blue-600 text-white px-4 rounded-lg">
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}