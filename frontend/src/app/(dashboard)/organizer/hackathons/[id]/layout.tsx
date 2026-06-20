"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Users, FileText, UserCheck, BarChart, Trophy, Megaphone } from "lucide-react";

export default function HackathonHubLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams();
  const pathname = usePathname();

  const { data: hackathon, isLoading } = useQuery({
    queryKey: ["hackathonMgmt", id],
    queryFn: () => api.get(`/hackathons/${id}`).then((res: any) => res.data.data),
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading management hub...</div>;
  if (!hackathon) return <div className="p-8 text-center text-red-500">Hackathon not found.</div>;

  const tabs = [
    { name: "Overview", href: `/organizer/hackathons/${id}` },
    { name: "Registrations", href: `/organizer/hackathons/${id}/registrations`, icon: Users },
    { name: "Teams", href: `/organizer/hackathons/${id}/teams`, icon: Users },
    { name: "Problems", href: `/organizer/hackathons/${id}/problem-statements`, icon: FileText },
    { name: "Reviewers", href: `/organizer/hackathons/${id}/reviewers`, icon: UserCheck },
    { name: "Evaluations", href: `/organizer/hackathons/${id}/evaluations`, icon: BarChart },
    { name: "Announcements", href: `/organizer/hackathons/${id}/announcements`, icon: Megaphone },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl overflow-hidden border shadow-sm">
        <div className="h-32 bg-gradient-to-r from-gray-800 to-gray-900 relative">
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {hackathon.status.replace("_", " ")}
          </div>
        </div>
        <div className="p-6 -mt-12 relative z-10">
          <div className="bg-white p-4 rounded-xl shadow-md border inline-block mb-4">
            <h1 className="text-2xl font-black text-gray-900">{hackathon.title}</h1>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4 border-b">
            {tabs.map(tab => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`px-4 py-3 font-semibold text-sm border-b-2 transition ${isActive ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'}`}
                >
                  <div className="flex items-center gap-2">
                    {tab.icon && <tab.icon size={16} />}
                    {tab.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}
