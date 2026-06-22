"use client";

export default function Navbar() {
  return (
    <div className="bg-white border-b px-8 py-4 flex justify-between items-center">

      <h1 className="font-bold text-2xl">
        FAIRJUDGE
      </h1>

      <div className="flex gap-6">

        <button>
          Notifications
        </button>

        <button>
          Profile
        </button>

        <button>
          Logout
        </button>

      </div>

    </div>
  );
}