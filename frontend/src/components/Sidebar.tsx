"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="w-64 bg-white border-r min-h-screen p-6">

      <h1 className="text-3xl font-bold text-blue-600 mb-8">
        FAIRJUDGE
      </h1>

      <div className="space-y-4">

        <Link href="/participant">
          Participant
        </Link>

        <br />

        <Link href="/organizer">
          Organizer
        </Link>

        <br />

        <Link href="/judge">
          Judge
        </Link>

        <br />

        <Link href="/fairness">
          Fairness
        </Link>

      </div>

    </div>
  );
}