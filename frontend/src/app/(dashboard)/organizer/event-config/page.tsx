"use client";

import Link from "next/link";
import { Settings } from "lucide-react";

export default function EventConfigPage() {
  return (
    <div className="bg-white rounded-2xl border p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Settings className="text-indigo-600" size={28} />
        <h1 className="text-2xl font-black text-gray-900">Event Configuration</h1>
      </div>
      <p className="text-gray-600 mb-6">
        Create or edit a hackathon to configure timelines, rubrics, and problem statements.
      </p>
      <Link href="/organizer/hackathons/create" className="text-indigo-600 font-bold hover:underline">
        Create a hackathon →
      </Link>
    </div>
  );
}
