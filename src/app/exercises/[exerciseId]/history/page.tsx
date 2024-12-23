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
    <div className="min-h-screen flex flex-col items-center bg-black text-white py-6">
      {/* Title */}
      <h1 className="text-3xl font-bold text-center mb-6">
        {exerciseName} - History
      </h1>
            {/* Back Button */}
            <button
        onClick={() =>
          router.push(
            `/exercises/${exerciseId}?name=${encodeURIComponent(exerciseName)}`
          )
        }
        className="py-2 px-6 bg-gray-600 hover:bg-gray-700 rounded-lg shadow-md text-white transition-all mb-6"
      >
        Back to Record Form
      </button>
      {/* Conditionally Render Chart */}
      {records.length > 1 ? (
        <div className="w-full max-w-4xl p-6 bg-gray-900 rounded-lg shadow-lg mb-6">
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
                grid: { stroke: "#4a5568", opacity: 0.2 },
              }}
            />

            {/* Y-axis: Weights */}
            <VictoryAxis
              dependentAxis
              tickFormat={(t) => `${t} lbs`}
              style={{
                tickLabels: { fill: "white", fontSize: 10 },
                grid: { stroke: "#4a5568", opacity: 0.2 },
              }}
            />

            {/* Scatter Plot with Tooltips */}
            <VictoryScatter
              data={scatterData}
              size={5}
              style={{ data: { fill: "#2563eb", opacity: 0.9 } }}
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
      ) : (
        <div className="w-full max-w-4xl p-6 bg-gray-900 rounded-lg shadow-lg mb-6">
          <p className="text-center text-gray-400">
            Not enough data to display a historical graph. Add more records to
            see trends over time!
          </p>
        </div>
      )}

      {/* Records List */}
      <div className="w-full max-w-4xl bg-gray-900 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Past Results</h2>
        <div className="max-h-96 overflow-y-auto space-y-4">
          {records
            .slice() // Create a copy to avoid mutating the original array
            .reverse() // Reverse the order of the array
            .map((record) => (
              <div
                key={record.id}
                className="p-4 bg-gray-800 rounded-lg shadow"
              >
                <p className="text-blue-400 font-semibold mb-2">
                  {new Date(record.created_at).toLocaleDateString()}
                </p>
                {record.weights.map((weight, index) => (
                  <p key={index} className="text-sm text-gray-300">
                    Set {index + 1}: {weight} lbs for {record.reps[index]} reps
                  </p>
                ))}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ExerciseHistory;
