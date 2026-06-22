"use client";

import React from "react";
import { api } from "@/lib/api";

interface ExportButtonProps {
  hackathonId: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ hackathonId }) => {
  const handleExport = async () => {
    try {
      const response = await api.get(`/hackathons/${hackathonId}/registrations/export`, {
        responseType: "blob",
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      
      // Extract filename from header if possible, or fallback
      const disposition = response.headers["content-disposition"];
      let filename = "registrations.xlsx";
      if (disposition && disposition.indexOf("filename=") !== -1) {
        const matches = /filename="([^"]+)"/.exec(disposition);
        if (matches != null && matches[1]) filename = matches[1];
      }
      
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export registrations");
    }
  };

  return (
    <button 
      onClick={handleExport}
      className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 flex items-center gap-2 text-sm font-semibold"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
      Export Excel
    </button>
  );
};
