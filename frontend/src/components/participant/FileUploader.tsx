"use client";

import React, { useState } from "react";

export const FileUploader = ({ onFilesSelected }: { onFilesSelected: (files: File[]) => void }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
      onFilesSelected(filesArray);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50 hover:bg-gray-100 transition">
      <label className="block cursor-pointer">
        <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
        <span className="text-sm font-semibold text-blue-600">Click to upload</span>
        <span className="text-sm text-gray-500 block mt-1">PDF, DOCX, ZIP up to 10MB each</span>
        <input 
          type="file" 
          multiple 
          onChange={handleFileChange}
          className="hidden" 
        />
      </label>
      
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2 text-left">
          <p className="text-xs font-bold text-gray-700">Selected Files:</p>
          {selectedFiles.map((f, i) => (
            <div key={i} className="text-xs bg-white p-2 rounded border truncate">
              {f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
