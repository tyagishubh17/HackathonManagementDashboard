"use client";

import React from "react";
import { EvaluationProgress } from "@/components/organizer/EvaluationProgress"; 

export default function NestedHackathonEvaluationsPage() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      
      {/* Metric Header title section */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h1 className="text-2xl font-black text-gray-900">
          📋 Hackathon Evaluations Pipeline Monitor
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review live scoring metrics distributed across Panel A and Panel B isolation tracks for this hackathon.
        </p>
      </div>

      {/* Embedded Component Progress Data Sheet Grid Canvas */}
      <div className="bg-white p-4 rounded-2xl border shadow-sm">
        <EvaluationProgress />
      </div>

    </div>
  );
}
