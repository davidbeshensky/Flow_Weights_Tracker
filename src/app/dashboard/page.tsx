"use client";

import React, { useEffect, useState } from "react";
import CalendarHeatmap from "@/components/CalendarHeatmap";

export default function Dashboard() {
  const [totalWeight, setTotalWeight] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTotalWeight = async () => {
      try {
        // The user is logged in with cookies, so a normal fetch will send them automatically
        const response = await fetch("/api/totalweight");

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch total weight");
        }

        const { totalWeight } = await response.json();
        setTotalWeight(totalWeight);
      } catch (err: unknown) {
        console.error("Error fetching total weight:", err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred."
        );
      }
    };

    fetchTotalWeight();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Your Dashboard</h1>

      {error && <p className="text-red-500">{error}</p>}

      {totalWeight !== null ? (
        <div className="bg-gray-800 p-6 mb-2 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold">
            Total Weight Lifted: {totalWeight.toFixed(2)} lbs
          </h2>
        </div>
      ) : (
        <p>Loading...</p>
      )}

      <CalendarHeatmap />
    </div>
  );
}
