"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";

export default function RubricScoringPage() {
  return (
    <div className="bg-white rounded-2xl border p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <ClipboardList className="text-indigo-600" size={28} />
        <h1 className="text-2xl font-black text-gray-900">Rubric Scoring</h1>
      </div>
      <p className="text-gray-600 mb-6">
        Select an assigned project to score it against the hackathon rubric.
      </p>
      <Link href="/judge/assignments" className="text-indigo-600 font-bold hover:underline">
        View my assignments →
      </Link>
    </div>
  );
}
