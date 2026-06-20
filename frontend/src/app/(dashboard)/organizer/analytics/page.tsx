"use client";

import { BarChart3 } from "lucide-react";

export default function OrganizerAnalyticsPage() {
  return (
    <div className="bg-white rounded-2xl border p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <BarChart3 className="text-indigo-600" size={28} />
        <h1 className="text-2xl font-black text-gray-900">Event Analytics</h1>
      </div>
      <p className="text-gray-600">
        Registration stats and evaluation progress are available on each hackathon&apos;s management page.
      </p>
    </div>
  );
}
