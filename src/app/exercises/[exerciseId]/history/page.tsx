"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  VictoryChart,
  VictoryScatter,
  VictoryAxis,
  VictoryTooltip,
} from "victory";

interface HistoricalRecord {
  id: string;
  created_at: string;
  reps: number[];
  weights: number[];
}

const ExerciseHistory: React.FC = () => {
  const [records, setRecords] = useState<HistoricalRecord[]>([]);
  const router = useRouter();
  const { exerciseId } = useParams();
  const searchParams = useSearchParams();

  // Extract exercise name from query parameters
  const exerciseName = decodeURIComponent(
    searchParams.get("name") || "Exercise"
  );

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("exercise_records")
        .select("id, created_at, reps, weights")
        .eq("exercise_id", exerciseId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching historical records:", error);
      } else {
        setRecords(data || []);
      }
    };

    fetchData();
  }, [exerciseId]);

  // Transform data for VictoryScatter
  const scatterData = records.flatMap((record) =>
    record.weights.map((weight, index) => ({
      x: new Date(record.created_at).toLocaleDateString(), // Date as X-axis
      y: weight, // Weight as Y-axis
      reps: record.reps[index], // Reps for tooltip
    }))
  );

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-purple-900 via-green-700 to-black text-white">
      <div className="w-full max-w-4xl p-6 bg-black bg-opacity-50 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">
          <button
            onClick={() =>
              router.push(
                `/exercises/${exerciseId}?name=${encodeURIComponent(
                  exerciseName
                )}`
              )
            }
            className="py-2 px-4 mr-10 bg-purple-600 rounded-md hover:bg-purple-500 transition-all text-white"
          >
            Back to Record Form
          </button>
          {exerciseName} - History
        </h1>

        {/* Victory Scatter Plot */}
        <VictoryChart
          domainPadding={{ x: 20 }}
          padding={{ top: 50, bottom: 60, left: 60, right: 20 }}
        >
          {/* X-axis: Dates */}
          <VictoryAxis
            tickFormat={(t) => t} // Format date strings
            style={{
              tickLabels: { fill: "white", fontSize: 10, angle: 45 },
              axisLabel: { fill: "white" },
              grid: { stroke: "gray", opacity: 0.2 },
            }}
          />

          {/* Y-axis: Weights */}
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => `${t} lbs`}
            style={{
              tickLabels: { fill: "white", fontSize: 10 },
              grid: { stroke: "gray", opacity: 0.2 },
            }}
          />

          {/* Scatter Plot with Tooltips */}
          <VictoryScatter
            data={scatterData}
            size={5}
            style={{ data: { fill: "steelblue", opacity: 0.7 } }}
            labels={({ datum }) =>
              `Date: ${datum.x}\nWeight: ${datum.y} lbs\nReps: ${datum.reps}`
            }
            labelComponent={
              <VictoryTooltip
                flyoutStyle={{
                  fill: "white",
                  stroke: "gray",
                  pointerEvents: "none",
                }}
                style={{ fill: "black", fontSize: 10 }}
              />
            }
          />
        </VictoryChart>
      </div>
    </div>
  );
};

export default ExerciseHistory;
