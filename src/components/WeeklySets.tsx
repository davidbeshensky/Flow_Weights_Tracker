"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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

// The shape returned by our Postgres function
type MuscleSetsRow = {
  muscle: string;
  total_weighted_sets: number;
};

export default function WeeklySets() {
  const [setsPerGroup, setSetsPerGroup] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClientComponentClient();

    (async () => {
      try {
        // 1) Get the current user (if using auth-helpers session)
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw new Error(userError.message);
        if (!user) throw new Error("No user session found.");

        // 2) Call the Postgres function
        //    This will run the WITH current_week ... query on the DB side
        const { data, error: rpcError } = await supabase.rpc(
          "get_weighted_sets_for_current_week",
          {
            p_user_id: user.id,
          }
        );

        if (rpcError) throw new Error(rpcError.message);

        // 'data' should be an array of { muscle: string, total_sets: number }
        // We'll map it into a dictionary so we can show each muscle from muscleOptions
        const setsMap: Record<string, number> = {};
        [...upperBodyMuscles, ...lowerBodyMuscles].forEach((m) => {
          setsMap[m] = 0;
        });

        (data ?? []).forEach((row: MuscleSetsRow) => {
          // muscle in DB might be lowercased or differ; ensure we match keys properly
          const mg = row.muscle?.toLowerCase();
          if (setsMap[mg] !== undefined) {
            setsMap[mg] = row.total_weighted_sets;
          }
        });

        setSetsPerGroup(setsMap);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-4 w-11/12">
        <h2 className="text-xl font-semibold mb-4">
          Total Sets Per Muscle This Week
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Upper Body Section Skeleton */}
          <div>
            <h3 className="text-lg font-medium mb-2">Upper Body</h3>
            <ul className="space-y-1">
              {upperBodyMuscles.map((m, index) => (
                <li
                  key={`skeleton-upper-${index}`}
                  className="flex justify-between border-b pb-1"
                >
                  <span className="capitalize w-1/2 h-4 bg-gray-300 rounded animate-pulse"></span>
                  <span className="w-10 h-4 bg-gray-300 rounded animate-pulse"></span>
                </li>
              ))}
            </ul>
          </div>

          {/* Lower Body Section Skeleton */}
          <div>
            <h3 className="text-lg font-medium mb-2">Lower Body</h3>
            <ul className="space-y-1">
              {lowerBodyMuscles.map((m, index) => (
                <li
                  key={`skeleton-lower-${index}`}
                  className="flex justify-between border-b pb-1"
                >
                  <span className="capitalize w-1/2 h-4 bg-gray-300 rounded animate-pulse"></span>
                  <span className="w-10 h-4 bg-gray-300 rounded animate-pulse"></span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

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
            {upperBodyMuscles.map((m) => (
              <li key={m} className="flex justify-between border-b pb-1">
                <span className="capitalize">{m}</span>
                <span>{setsPerGroup[m] ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Lower Body Section */}
        <div>
          <h3 className="text-lg font-medium mb-2">Lower Body</h3>
          <ul className="space-y-1">
            {lowerBodyMuscles.map((m) => (
              <li key={m} className="flex justify-between border-b pb-1">
                <span className="capitalize">{m}</span>
                <span>{setsPerGroup[m] ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
