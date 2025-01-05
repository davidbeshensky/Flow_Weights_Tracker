"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const muscleOptions = [
  "biceps",
  "triceps",
  "forearms",
  "quadriceps",
  "hamstrings",
  "glutes",
  "chest",
  "traps",
  "lats",
  "front delts",
  "side delts",
  "rear delts",
  "calves",
  "abs",
];

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

        console.log("RPC data:", data);

        if (rpcError) throw new Error(rpcError.message);

        // 'data' should be an array of { muscle: string, total_sets: number }
        // We'll map it into a dictionary so we can show each muscle from muscleOptions
        const setsMap: Record<string, number> = {};
        muscleOptions.forEach((m) => {
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

  if (loading) return <div>Loading weekly sets...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div>
      <h2>This Week’s Total Sets</h2>
      <ul>
        {muscleOptions.map((m) => (
          <li key={m}>
            <strong>{m}:</strong> {setsPerGroup[m] ?? 0}
          </li>
        ))}
      </ul>
    </div>
  );
}
