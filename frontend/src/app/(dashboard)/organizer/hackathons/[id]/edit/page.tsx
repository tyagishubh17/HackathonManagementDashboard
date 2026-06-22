"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { HackathonForm } from "@/components/organizer/HackathonForm";

// Helper to format ISO dates for datetime-local inputs
const formatDatesForForm = (hackathon: any) => {
  if (!hackathon?.timeline) return hackathon;
  
  const formattedTimeline = { ...hackathon.timeline };
  const dateFields = ["registrationStart", "registrationEnd", "hackathonStart", "hackathonEnd", "submissionDeadline"];
  
  for (const field of dateFields) {
    if (formattedTimeline[field]) {
      // Convert "2026-06-25T00:00:00.000Z" to "2026-06-25T00:00"
      formattedTimeline[field] = new Date(formattedTimeline[field]).toISOString().slice(0, 16);
    }
  }
  
  return {
    ...hackathon,
    timeline: formattedTimeline
  };
};

export default function EditHackathonPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: rawHackathon, isLoading } = useQuery({
    queryKey: ["hackathonMgmt", id],
    queryFn: () => api.get(`/hackathons/${id}`).then((res: any) => res.data.data),
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading hackathon data...</div>;
  if (!rawHackathon) return <div className="p-8 text-center text-red-500">Hackathon not found.</div>;

  const hackathon = formatDatesForForm(rawHackathon);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black text-gray-900">Edit Hackathon Settings</h1>
        <button 
          onClick={() => router.push(`/organizer/hackathons/${id}`)}
          className="text-gray-500 hover:text-gray-900 font-medium"
        >
          Cancel
        </button>
      </div>
      
      <HackathonForm 
        initialData={hackathon} 
        onSuccess={() => {
          router.push(`/organizer/hackathons/${id}`);
          router.refresh();
        }} 
      />
    </div>
  );
}
