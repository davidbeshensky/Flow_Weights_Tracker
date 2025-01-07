"use client";

import React, { useEffect, useState } from "react";
import CalendarHeatmap from "@/components/CalendarHeatmap";
import WeeklySets from "@/components/WeeklySets";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [totalWeight, setTotalWeight] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [loadingWeight, setLoadingWeight] = useState<boolean>(true);

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
      } finally {
        setLoadingWeight(false);
      }
    };

    fetchTotalWeight();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center bg-gray-900 text-white">
      {/* Back Button */}
      <button
        onClick={() => router.push("/")}
        className="border-2 rounded-lg p-2 self-start text-white bg-gray-600 hover:bg-gray-700 mt-2 mb-4 ml-3"
      >
        &larr; Back
      </button>
      <h1 className="text-4xl font-bold mb-4">Your Dashboard</h1>

      {error && <p className="text-red-500">{error}</p>}

      {/* If still loading totalWeight, show skeleton. Otherwise, show the actual value. */}
      {/* If still loading totalWeight, show skeleton. Otherwise, show the actual value. */}
      {loadingWeight ? (
        <div className="bg-gray-800 p-7 pt-8 pb-6 max-w-sm w-11/12 rounded-lg shadow-lg">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-600 rounded-t-md"></div>
            <div className="h-2 bg-gray-600 rounded-b-md"></div>
          </div>
        </div>
      ) : totalWeight !== null ? (
        <div className="bg-gray-800 p-6 mb-2 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold">
            Total Weight Lifted: {totalWeight.toFixed(2)} lbs
          </h2>
        </div>
      ) : null}

      <CalendarHeatmap />
      <WeeklySets />
    </div>
  );
}
