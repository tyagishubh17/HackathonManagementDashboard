"use client";

import Link from "next/link";
import { Scale, ArrowLeft } from "lucide-react";

export default function AppealsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/fairness" className="text-indigo-600 hover:underline flex items-center gap-1 text-sm font-semibold">
          <ArrowLeft size={16} /> Back to Fairness Monitor
        </Link>
      </div>
      <div className="bg-white rounded-2xl border p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Scale className="text-indigo-600" size={28} />
          <h1 className="text-2xl font-black text-gray-900">Evaluation Appeals</h1>
        </div>
        <p className="text-gray-600">
          Appeals submitted by participants appear here for organizer review. Use the organizer hackathon
          results view to resolve appealed evaluations.
        </p>
      </div>
    </div>
  );
}
