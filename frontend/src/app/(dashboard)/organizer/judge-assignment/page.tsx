"use client";

import Link from "next/link";
import { UserCheck } from "lucide-react";

export default function JudgeAssignmentPage() {
  return (
    <div className="bg-white rounded-2xl border p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <UserCheck className="text-indigo-600" size={28} />
        <h1 className="text-2xl font-black text-gray-900">Judge Assignment</h1>
      </div>
      <p className="text-gray-600 mb-6">
        AI reviewer assignment runs from each hackathon&apos;s reviewers tab after projects are submitted.
      </p>
      <Link href="/organizer/hackathons" className="text-indigo-600 font-bold hover:underline">
        Go to my hackathons →
      </Link>
    </div>
  );
}
