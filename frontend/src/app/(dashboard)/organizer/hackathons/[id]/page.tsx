"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";

export default function HackathonOverview() {
  const { id } = useParams();

  const { data: hackathon, isLoading } = useQuery({
    queryKey: ["hackathonMgmt", id],
    queryFn: () => api.get(`/hackathons/${id}`).then((res: any) => res.data.data),
  });

  if (isLoading) return null; // Parent layout handles loading

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Event Details</h2>
          <a href={`/organizer/hackathons/${id}/edit`} className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition">
            Edit Details
          </a>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Description</p>
            <p className="font-medium mt-1">{hackathon.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Max Participants</p>
              <p className="font-bold">{hackathon.config.maxParticipants}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Team Size</p>
              <p className="font-bold">{hackathon.config.minTeamSize} - {hackathon.config.maxTeamSize}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Timeline</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <span className="text-sm font-semibold text-gray-600">Registration Ends</span>
            <span className="font-bold text-gray-900">{new Date(hackathon.timeline.registrationEnd).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <span className="text-sm font-semibold text-gray-600">Hackathon Starts</span>
            <span className="font-bold text-indigo-600">{new Date(hackathon.timeline.hackathonStart).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <span className="text-sm font-semibold text-gray-600">Submissions Due</span>
            <span className="font-bold text-red-600">{new Date(hackathon.timeline.submissionDeadline).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      <div className="md:col-span-2 bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Evaluation Rubric</h2>
        <div className="grid grid-cols-3 gap-4">
          {hackathon.rubric?.map((r: any, idx: number) => (
            <div key={idx} className="p-4 border rounded-xl text-center">
              <h3 className="font-bold text-indigo-900">{r.criteria}</h3>
              <p className="text-3xl font-black text-indigo-600 mt-2">{r.weight}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
