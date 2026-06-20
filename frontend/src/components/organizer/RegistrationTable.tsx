"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ExportButton } from "./ExportButton";
import { DuplicateReviewModal } from "./DuplicateReviewModal";

export const RegistrationTable = ({ hackathonId }: { hackathonId: string }) => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [reviewingReg, setReviewingReg] = useState<any>(null);

  const fetchRegs = async () => {
    try {
      const res = await api.get(`/hackathons/${hackathonId}/registrations`);
      setRegistrations(res.data.data.registrations || res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRegs();
  }, [hackathonId]);

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Registrations</h2>
        <ExportButton hackathonId={hackathonId} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-3">Participant</th>
              <th className="p-3">Experience</th>
              <th className="p-3">Status</th>
              <th className="p-3">AI Check</th>
              <th className="p-3">Resume</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((reg) => (
              <tr key={reg._id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <div className="font-semibold">{reg.userId?.fullName}</div>
                  <div className="text-xs text-gray-500">{reg.userId?.email}</div>
                </td>
                <td className="p-3 capitalize">{reg.experienceLevel}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    reg.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    reg.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {reg.status.replace("_", " ").toUpperCase()}
                  </span>
                </td>
                <td className="p-3">
                  {reg.duplicateCheckResult ? (
                    <span className={`text-xs font-bold ${reg.duplicateCheckResult.confidence >= 0.7 ? 'text-red-600' : 'text-green-600'}`}>
                      {(reg.duplicateCheckResult.confidence * 100).toFixed(0)}% Match
                    </span>
                  ) : "N/A"}
                </td>
                <td className="p-3">
                  {reg.resumeFile?.viewUrl ? (
                    <a href={reg.resumeFile.viewUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View File</a>
                  ) : "-"}
                </td>
                <td className="p-3">
                  {reg.status === "pending_review" && (
                    <button onClick={() => setReviewingReg(reg)} className="text-blue-600 font-semibold hover:underline">Review Flag</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {registrations.length === 0 && <p className="text-center p-6 text-gray-500">No registrations yet.</p>}
      </div>

      {reviewingReg && (
        <DuplicateReviewModal 
          registration={reviewingReg} 
          onClose={() => setReviewingReg(null)} 
          onRefresh={fetchRegs}
        />
      )}
    </div>
  );
};
