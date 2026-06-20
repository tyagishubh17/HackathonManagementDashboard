import React from "react";

interface RoleSelectorProps {
  selectedRole: string;
  onSelect: (role: string) => void;
}

const roles = [
  { id: "participant", title: "Participant", desc: "Join hackathons, form teams, build projects." },
  { id: "organizer", title: "Organizer", desc: "Host events, manage timeline, and assignments." },
  { id: "judge", title: "Judge", desc: "Evaluate projects, provide feedback via rubric." },
];

export const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {roles.map((role) => (
        <div
          key={role.id}
          onClick={() => onSelect(role.id)}
          className={`cursor-pointer border-2 rounded-xl p-4 transition-all duration-200 ${
            selectedRole === role.id
              ? "border-blue-500 bg-blue-50 shadow-md"
              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
          }`}
        >
          <h3 className="font-bold text-lg mb-1">{role.title}</h3>
          <p className="text-sm text-gray-600">{role.desc}</p>
        </div>
      ))}
    </div>
  );
};
