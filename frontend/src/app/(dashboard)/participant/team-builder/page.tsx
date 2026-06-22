"use client";

import Link from "next/link";
import { Users } from "lucide-react";

export default function TeamBuilderPage() {
  return (
    <div className="bg-white rounded-2xl border p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Users className="text-indigo-600" size={28} />
        <h1 className="text-2xl font-black text-gray-900">Team Builder</h1>
      </div>
      <p className="text-gray-600 mb-6">
        View and join teams from your teams page after you are confirmed for a hackathon.
      </p>
      <Link href="/participant/teams" className="text-indigo-600 font-bold hover:underline">
        View my teams →
      </Link>
    </div>
  );
}
