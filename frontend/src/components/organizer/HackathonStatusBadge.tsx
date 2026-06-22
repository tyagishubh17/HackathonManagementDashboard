import React from "react";

interface StatusBadgeProps {
  status: string;
}

export const HackathonStatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeStyles = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "pending_verification": return "bg-yellow-100 text-yellow-800";
      case "upcoming": return "bg-blue-100 text-blue-800";
      case "registration_open": return "bg-cyan-100 text-cyan-800";
      case "ongoing": return "bg-green-100 text-green-800";
      case "evaluating": return "bg-orange-100 text-orange-800";
      case "completed": return "bg-purple-100 text-purple-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formattedStatus = status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getBadgeStyles(status)}`}>
      {formattedStatus}
    </span>
  );
};
