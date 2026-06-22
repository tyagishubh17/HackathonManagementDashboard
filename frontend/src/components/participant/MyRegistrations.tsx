"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";

export const MyRegistrations = () => {
  // Since we don't have a global /my-registrations endpoint specified in the prompt (it's /:id/my-registration),
  // a dashboard would typically map over known hackathons or we need a global endpoint.
  // For this component, we assume it's displayed inside a specific Hackathon context, or we fetch all.
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">My Registrations</h2>
      <div className="bg-white p-8 rounded-xl shadow border text-center text-gray-500">
        Feature stub: Connect to a global user registrations endpoint if available.
      </div>
    </div>
  );
};
