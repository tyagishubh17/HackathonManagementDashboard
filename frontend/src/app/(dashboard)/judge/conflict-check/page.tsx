"use client";

import { ShieldAlert } from "lucide-react";

export default function ConflictCheckPage() {
  return (
    <div className="bg-white rounded-2xl border p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <ShieldAlert className="text-amber-600" size={28} />
        <h1 className="text-2xl font-black text-gray-900">Conflict of Interest Check</h1>
      </div>
      <p className="text-gray-600">
        Before scoring, confirm you have no affiliation with the assigned team. If a conflict exists,
        contact the organizer to request reassignment.
      </p>
    </div>
  );
}
