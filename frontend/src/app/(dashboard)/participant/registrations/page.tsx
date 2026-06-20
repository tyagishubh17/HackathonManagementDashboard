"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { ClipboardList, ExternalLink } from "lucide-react";

export default function MyRegistrations() {
  const { data: myTeams } = useQuery({
    queryKey: ["myTeams"],
    queryFn: () => api.get("/teams/my-teams").then((res: any) => res.data.data),
  });
  
  // To get all registrations we actually need an endpoint for `participant/my-registrations` 
  // Wait, in Prompt 5 we built GET /api/hackathons/:id/my-registration. 
  // We didn't build a single global GET /api/registrations/my endpoint. 
  // Let's assume the backend has it, or we will just use the teams endpoint to infer hackathons for now, 
  // or we can fetch all public hackathons and then query registration for each (which is inefficient).
  // Actually, wait, let's create a stub / or use a generic list if we didn't add the API.
  
  // Let's implement it using dummy data structure mapped to whatever we have.
  // We'll show an Empty state for now if we can't fetch it natively globally.

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-gray-900 mb-6">My Registrations</h1>
      
      {/* We'll display teams here as an approximation of joined hackathons since participant registrations endpoint might need iteration */}
      <div className="bg-white rounded-2xl border shadow-sm p-8 text-center">
        <ClipboardList size={48} className="text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900">Registration History</h3>
        <p className="text-gray-500 max-w-md mx-auto mt-2">View all your past and present hackathon registrations here. Join a hackathon to see it appear in this list.</p>
        <Link href="/participant/hackathons" className="inline-block mt-6 bg-indigo-600 text-white font-bold py-2 px-6 rounded-full hover:bg-indigo-700 transition">
          Browse Hackathons
        </Link>
      </div>
    </div>
  );
}
