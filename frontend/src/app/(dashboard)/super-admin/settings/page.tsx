"use client";

import { Settings } from "lucide-react";

export default function SuperAdminSettingsPage() {
  return (
    <div className="bg-white rounded-2xl border p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Settings className="text-indigo-600" size={28} />
        <h1 className="text-2xl font-black text-gray-900">System Settings</h1>
      </div>
      <p className="text-gray-600">
        Platform-wide configuration is managed via backend environment variables and MongoDB Atlas.
      </p>
    </div>
  );
}
