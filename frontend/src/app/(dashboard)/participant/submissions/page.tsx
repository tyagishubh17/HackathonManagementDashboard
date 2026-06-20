"use client";

import Link from "next/link";
import { Upload } from "lucide-react";

export default function SubmissionsPage() {
  return (
    <div className="bg-white rounded-2xl border p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Upload className="text-indigo-600" size={28} />
        <h1 className="text-2xl font-black text-gray-900">Project Submissions</h1>
      </div>
      <p className="text-gray-600 mb-6">
        Submit your team project from the hackathon detail page once registration is confirmed and teams are formed.
      </p>
      <Link href="/participant/hackathons" className="text-indigo-600 font-bold hover:underline">
        Browse hackathons →
      </Link>
    </div>
  );
}
