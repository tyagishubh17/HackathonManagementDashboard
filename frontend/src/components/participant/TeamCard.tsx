"use client";

import React from "react";
import { api } from "@/lib/api";
import { useAuth } from "../../hooks/useAuth";

export const TeamCard = ({ team, onLeave }: { team: any; onLeave?: () => void }) => {
  const { user } = useAuth();
  
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg">{team.name}</h3>
          <p className="text-xs text-gray-500">{team.hackathonId?.title}</p>
        </div>
        {onLeave && team.members.some((m: any) => m._id === user?._id) && (
          <button 
            onClick={onLeave}
            className="text-red-600 text-xs font-semibold hover:underline"
          >
            Leave Team
          </button>
        )}
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold border-b pb-1">Members ({team.members.length})</h4>
        <div className="grid grid-cols-1 gap-2">
          {team.members.map((m: any) => (
            <div key={m._id} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
              <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold text-xs">
                {m.fullName?.charAt(0)}
              </div>
              <span>{m.fullName}</span>
              {m._id === user?._id && <span className="ml-auto text-xs text-green-600 font-semibold">(You)</span>}
            </div>
          ))}
        </div>
      </div>
      
      {team.problemStatementId && (
        <div className="mt-4 pt-3 border-t text-sm">
          <span className="font-semibold block">Target Problem:</span>
          <span className="text-gray-600">{team.problemStatementId.title || "Selected Problem"}</span>
        </div>
      )}
    </div>
  );
};
