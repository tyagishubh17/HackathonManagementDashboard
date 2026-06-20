"use client";

import React from "react";

export const RubricScorer = ({ rubric, scores, onChange, readOnly }: { rubric: any[], scores: Record<string, number>, onChange: (s: Record<string, number>) => void, readOnly?: boolean }) => {
  const handleScoreChange = (criteria: string, val: number) => {
    if (readOnly) return;
    onChange({ ...scores, [criteria]: val });
  };

  return (
    <div className="space-y-4">
      {rubric.map((item, idx) => (
        <div key={idx} className="bg-gray-50 border p-4 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold">{item.criteria}</h4>
            <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">Max: {item.maxScore}</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{item.description}</p>
          
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="0" 
              max={item.maxScore} 
              step="1"
              disabled={readOnly}
              value={scores[item.criteria] || 0}
              onChange={(e) => handleScoreChange(item.criteria, parseInt(e.target.value))}
              className="w-full cursor-pointer disabled:opacity-50"
            />
            <span className="font-bold text-lg min-w-[30px] text-center">{scores[item.criteria] || 0}</span>
          </div>
        </div>
      ))}
      <div className="bg-gray-900 text-white p-4 rounded-xl flex justify-between items-center font-bold text-lg">
        <span>Total Score</span>
        <span>{Object.values(scores).reduce((a, b) => a + b, 0)} / {rubric.reduce((a, b) => a + b.maxScore, 0)}</span>
      </div>
    </div>
  );
};
