"use client";

import { useEffect, useState } from "react";

const upperBodyMuscles = [
  "biceps",
  "triceps",
  "forearms",
  "chest",
  "traps",
  "lats",
  "front delts",
  "side delts",
  "rear delts",
  "abs",
];
const lowerBodyMuscles = ["quadriceps", "hamstrings", "glutes", "calves"];

export default function WeeklySets() {
  const [setsPerGroup, setSetsPerGroup] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch data from the `weekly-sets` endpoint
        const response = await fetch("/api/weekly-sets");
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const data: Record<string, number> = await response.json();

        // Initialize a map for all muscle groups
        const setsMap: Record<string, number> = {};
        [...upperBodyMuscles, ...lowerBodyMuscles].forEach((muscle) => {
          setsMap[muscle] = 0;
        });

        // Populate the setsMap with data from the API
        Object.entries(data).forEach(([muscle, count]) => {
          if (muscle in setsMap) {
            setsMap[muscle] = count;
          }
        });

        setSetsPerGroup(setsMap);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-4 max-w-sm w-11/12">
        <h2 className="text-xl font-semibold mb-4">
          Total Sets Per Muscle This Week
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Skeleton Loader */}
          {["Upper Body", "Lower Body"].map((section, index) => (
            <div key={index}>
              <h3 className="text-lg font-medium mb-2">{section}</h3>
              <ul className="space-y-1">
                {(section === "Upper Body"
                  ? upperBodyMuscles
                  : lowerBodyMuscles
                ).map((m, idx) => (
                  <li
                    key={`skeleton-${m}-${idx}`}
                    className="flex justify-between border-b pb-1"
                  >
                    <span className="capitalize w-1/2 h-4 bg-gray-300 rounded animate-pulse"></span>
                    <span className="w-10 h-4 bg-gray-300 rounded animate-pulse"></span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div style={{ color: "red" }}>Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">
        Total Sets Per Muscle This Week
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upper Body Section */}
        <div>
          <h3 className="text-lg font-medium mb-2">Upper Body</h3>
          <ul className="space-y-1">
            {upperBodyMuscles.map((muscle) => (
              <li key={muscle} className="flex justify-between border-b pb-1">
                <span className="capitalize">{muscle}</span>
                <span>{setsPerGroup[muscle] ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Lower Body Section */}
        <div>
          <h3 className="text-lg font-medium mb-2">Lower Body</h3>
          <ul className="space-y-1">
            {lowerBodyMuscles.map((muscle) => (
              <li key={muscle} className="flex justify-between border-b pb-1">
                <span className="capitalize">{muscle}</span>
                <span>{setsPerGroup[muscle] ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
