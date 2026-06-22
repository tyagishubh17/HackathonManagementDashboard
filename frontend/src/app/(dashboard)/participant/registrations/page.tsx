"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { ClipboardList, ExternalLink } from "lucide-react";

export default function MyRegistrations() {
  const { data: myRegistrations, isLoading } = useQuery({
    queryKey: ["myRegistrations"],
    queryFn: () => api.get("/hackathons/my-registrations").then((res: any) => res.data.data),
  });
  
  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading registrations...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-gray-900 mb-6">My Registrations</h1>
      
      {!myRegistrations || myRegistrations.length === 0 ? (
        <div className="bg-white rounded-2xl border shadow-sm p-8 text-center">
          <ClipboardList size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No Registrations Yet</h3>
          <p className="text-gray-500 max-w-md mx-auto mt-2">View all your past and present hackathon registrations here. Join a hackathon to see it appear in this list.</p>
          <Link href="/participant/hackathons" className="inline-block mt-6 bg-indigo-600 text-white font-bold py-2 px-6 rounded-full hover:bg-indigo-700 transition">
            Browse Hackathons
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myRegistrations.map((reg: any) => {
            const hack = reg.hackathonId;
            if (!hack) return null;
            return (
              <div key={reg._id} className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col">
                <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                  <div className={`absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold ${reg.status === "confirmed" ? "text-green-600" : "text-yellow-600"}`}>
                    {reg.status.toUpperCase()}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-bold text-xl text-gray-900 mb-2">{hack.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 flex-1">{hack.description}</p>
                  
                  <Link 
                    href={`/participant/hackathons/${hack._id}`}
                    className="mt-6 w-full text-center bg-indigo-50 text-indigo-700 font-bold py-3 rounded-xl hover:bg-indigo-100 border border-indigo-200 transition"
                  >
                    Go to Workspace
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
