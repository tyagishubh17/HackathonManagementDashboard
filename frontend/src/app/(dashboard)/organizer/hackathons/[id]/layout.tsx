"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Users, FileText, UserCheck, BarChart, Trophy, Megaphone } from "lucide-react";

export default function HackathonHubLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [publishing, setPublishing] = useState(false);
  const [resubmissionNote, setResubmissionNote] = useState("");

  const { data: hackathon, isLoading } = useQuery({
    queryKey: ["hackathonMgmt", id],
    queryFn: () => api.get(`/hackathons/${id}`).then((res: any) => res.data.data),
  });

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await api.post(`/hackathons/${id}/publish`, { organizerFeedback: resubmissionNote });
      queryClient.invalidateQueries({ queryKey: ["hackathonMgmt", id] });
      alert("Hackathon submitted for verification successfully!");
      setResubmissionNote("");
      router.refresh();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit for verification. Make sure all settings and at least one problem statement are added.");
    } finally {
      setPublishing(false);
    }
  };

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
        {hackathon.verificationStatus === 'rejected' && !pathname.endsWith("/edit") && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 flex gap-4 items-start shadow-sm">
            <div className="bg-red-100 p-2 rounded-xl text-red-600 flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-grow">
              <h3 className="font-extrabold text-red-900 text-base">Verification Request Rejected</h3>
              <p className="text-sm text-red-700 mt-1 whitespace-pre-wrap">
                <strong>Feedback:</strong> {hackathon.rejectionReason || "No details provided."}
              </p>
              <p className="text-xs text-red-500 mt-3">
                Please review the feedback, update the hackathon details, and submit for verification again.
              </p>

              {/* Problem statement warning */}
              {(!hackathon.problemStatements || hackathon.problemStatements.length === 0) && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    At least one problem statement is required before you can submit for verification.
                  </p>
                  <Link
                    href={`/organizer/hackathons/${id}/problem-statements`}
                    className="inline-block mt-2 text-xs font-bold text-amber-700 underline hover:text-amber-900"
                  >
                    → Add Problem Statements
                  </Link>
                </div>
              )}

              <div className="mt-4 max-w-lg">
                <label className="block text-xs font-bold text-red-900 mb-1">
                  Message/Explanation for Super Admin (Optional):
                </label>
                <textarea
                  value={resubmissionNote}
                  onChange={(e) => setResubmissionNote(e.target.value)}
                  placeholder="Explain what changes were made in response to the feedback..."
                  rows={2}
                  className="w-full border border-red-200 rounded-xl p-2.5 text-xs bg-white focus:ring-1 focus:ring-red-500 outline-none text-gray-800 font-sans"
                />
              </div>
              <div className="mt-4 flex gap-3">
                <Link
                  href={`/organizer/hackathons/${id}/edit`}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
                >
                  Edit Details
                </Link>
                <button
                  onClick={handlePublish}
                  disabled={publishing || !hackathon.problemStatements || hackathon.problemStatements.length === 0}
                  title={(!hackathon.problemStatements || hackathon.problemStatements.length === 0) ? "Add at least one problem statement before submitting" : ""}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-4 py-2 rounded-xl text-xs transition"
                >
                  {publishing ? "Submitting..." : "Submit for Verification"}
                </button>
              </div>
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
