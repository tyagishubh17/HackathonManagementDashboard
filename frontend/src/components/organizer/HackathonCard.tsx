import React from "react";
import { HackathonStatusBadge } from "./HackathonStatusBadge";

interface HackathonCardProps {
  hackathon: any;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onPublish: (id: string) => void;
  onCancel: (id: string) => void;
}

export const HackathonCard: React.FC<HackathonCardProps> = ({ hackathon, onEdit, onView, onPublish, onCancel }) => {
  const isDraft = hackathon.status === "draft";
  const isUpcoming = hackathon.status === "upcoming";

  return (
    <div className="bg-white border rounded-xl shadow-sm p-5 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">{hackathon.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{hackathon.shortDescription}</p>
        </div>
        <HackathonStatusBadge status={hackathon.verificationStatus === "pending" ? "pending_verification" : hackathon.status} />
      </div>

      <div className="flex gap-4 text-sm text-gray-600 mb-6">
        <div>
          <span className="block font-semibold text-gray-900">Registrations</span>
          {hackathon.dynamicStats?.registrationCount || 0}
        </div>
        <div>
          <span className="block font-semibold text-gray-900">Teams</span>
          {hackathon.dynamicStats?.teamCount || 0}
        </div>
      </div>

      <div className="flex gap-2 border-t pt-4">
        <button onClick={() => onView(hackathon._id)} className="px-4 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md">View Details</button>
        <button onClick={() => onEdit(hackathon._id)} className="px-4 py-2 text-sm border hover:bg-gray-50 rounded-md">Edit</button>
        {isDraft && (
          <button onClick={() => onPublish(hackathon._id)} className="px-4 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-md ml-auto">Publish</button>
        )}
        {isUpcoming && (
          <button onClick={() => onCancel(hackathon._id)} className="px-4 py-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-md ml-auto">Cancel Event</button>
        )}
      </div>
    </div>
  );
};
