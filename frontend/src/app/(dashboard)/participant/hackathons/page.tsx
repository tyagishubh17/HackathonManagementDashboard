"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { Search } from "lucide-react";

export default function BrowseHackathons() {
  const { data: hackathons, isLoading } = useQuery({
    queryKey: ["publicHackathons"],
    queryFn: () => api.get("/hackathons").then((res: any) => res.data.data),
  });

  const { data: myRegistrations } = useQuery({
    queryKey: ["myRegistrations"],
    queryFn: () => api.get("/hackathons/my-registrations").then((res: any) => res.data.data),
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading hackathons...</div>;

  const getRegistrationStatus = (hackId: string) => {
    if (!myRegistrations) return null;
    const reg = myRegistrations.find((r: any) => r.hackathonId?._id === hackId || r.hackathonId === hackId);
    return reg ? reg.status : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-gray-900">Browse Hackathons</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search hackathons..." className="pl-10 pr-4 py-2 border rounded-full text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hackathons?.map((hack: any) => {
          const regStatus = getRegistrationStatus(hack.id || hack._id);
          
          return (
            <div key={hack.id || hack._id} className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col relative">
              {regStatus && (
                <div className="absolute top-4 left-4 z-10 bg-green-100 text-green-700 text-xs font-black px-3 py-1 rounded-full shadow-sm border border-green-200">
                  {regStatus === "confirmed" ? "REGISTERED" : "PENDING REGISTRATION"}
                </div>
              )}
              <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-700">
                  {hack.status?.replace("_", " ")}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-bold text-xl text-gray-900 mb-2">{hack.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 flex-1">{hack.description}</p>
              
              <div className="mt-6 pt-4 border-t space-y-2 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>Registration Ends</span>
                  <span className="font-semibold text-gray-900">{new Date(hack.timeline.registrationEnd).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hackathon Date</span>
                  <span className="font-semibold text-gray-900">{new Date(hack.timeline.hackathonStart).toLocaleDateString()}</span>
                </div>
              </div>

              <Link 
                href={`/participant/hackathons/${hack.id}`}
                className="mt-6 w-full text-center bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-indigo-600 transition"
              >
                View Details
              </Link>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
