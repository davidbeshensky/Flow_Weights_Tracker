"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import {
  VictoryChart,
  VictoryScatter,
  VictoryAxis,
  VictoryLine,
  VictoryTooltip,
  VictoryBar,
} from "victory";
import SkeletalExerciseHistory from "./SkeletalExerciseHistory";

interface HistoricalRecord {
  id: string;
  created_at: string;
  reps: number[];
  weights: number[];
  notes?: string;
}

interface ExerciseHistoryProps {
  exerciseId: string;
  exerciseName: string;
  onClose: () => void; // Callback to close the modal
}

const ExerciseHistory: React.FC<ExerciseHistoryProps> = ({
  exerciseId,
  exerciseName,
  onClose,
}) => {
  const [records, setRecords] = useState<HistoricalRecord[]>([]);
  const [view, setView] = useState<"weightGraph" | "volumeGraph">(
    "weightGraph"
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      const { data, error } = await supabaseClient
        .from("exercise_records")
        .select("id, created_at, reps, weights, notes")
        .eq("exercise_id", exerciseId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching historical records:", error);
      } else {
        setRecords(data || []);
      }
    };
    setIsLoading(false);

    fetchData();
  }, [exerciseId]);

  const scatterData = records.map((record) => {
    // Calculate total reps and total weight
    const totalReps = record.reps.reduce((sum, reps) => sum + reps, 0);
    const totalWeight = record.weights.reduce(
      (sum, weight, index) => sum + weight * record.reps[index],
      0
    );

    // Calculate average weight normalized by reps
    const avgWeight = totalReps > 0 ? totalWeight / totalReps : 0;
    const totalSets = record.reps.length;
    const size = totalSets > 0 ? totalReps / totalSets : 1; // Avoid division by zero

    return {
      x: new Date(record.created_at).toLocaleDateString(), // Date as X-axis
      y: avgWeight, // Average weight as Y-axis
      size, // Size represents total reps
      totalReps,
      avgWeight,
    };
  });

  const volumeData = records.map((record) => {
    const totalReps = record.reps.reduce((sum, reps) => sum + reps, 0);

    return {
      x: new Date(record.created_at).toLocaleDateString(), // Date as X-axis
      y: totalReps, // Total reps as Y-axis
    };
  });

  if (isLoading) {
    return <SkeletalExerciseHistory />;
  }

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-gray-900 text-white rounded-lg max-w-3xl mx-auto shadow-lg p-6 overflow-y-auto z-50"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white bg-red-600 hover:bg-red-700 p-2 rounded-full"
      >
        ✕
      </button>
      <h1 className="text-3xl font-bold text-center mb-6">{exerciseName}</h1>

      {/* Toggle Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setView("weightGraph")}
          className={`px-4 py-2 rounded-lg ${
            view === "weightGraph"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          Average Weight Graph
        </button>
        <button
          onClick={() => setView("volumeGraph")}
          className={`px-4 py-2 rounded-lg ${
            view === "volumeGraph"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          Total Volume Graph
        </button>
      </div>

      {/* Render Graphs Based on Selected View */}
      {records.length > 0 ? (
        <div className="w-full p-6 bg-gray-800 rounded-lg shadow-lg mb-6">
          {view === "weightGraph" && (
            <VictoryChart
              domainPadding={{ x: 20, y: 20 }}
              padding={{ top: 50, bottom: 60, left: 60, right: 20 }}
            >
              {/* X-Axis: Dates */}
              <VictoryAxis
                tickFormat={(t) => t}
                style={{
                  tickLabels: { fill: "white", fontSize: 10, angle: 45 },
                  grid: { stroke: "#4a5568", opacity: 0.2 },
                }}
              />
              {/* Y-Axis: Average Weight */}
              <VictoryAxis
                dependentAxis
                tickFormat={(t) => `${t.toFixed(1)} lbs`}
                style={{
                  tickLabels: { fill: "white", fontSize: 10 },
                  grid: { stroke: "#4a5568", opacity: 0.2 },
                }}
              />
              {/* Scatter Plot */}
              <VictoryScatter
                data={scatterData}
                size={({ datum }) => Math.sqrt(datum.size) * 2}
                style={{
                  data: { fill: "#1E88E5" },
                }}
                labels={({ datum }) =>
                  `Date: ${datum.x}\nAvg Weight: ${datum.y.toFixed(
                    1
                  )} lbs\nTotal Reps: ${datum.totalReps}`
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
              {/* Line Connecting Points */}
              <VictoryLine
                data={scatterData}
                x="x"
                y="y"
                style={{
                  data: { stroke: "#1E88E5", strokeWidth: 2 },
                }}
              />
            </VictoryChart>
          )}

          {view === "volumeGraph" && (
            <VictoryChart
              domainPadding={{ x: 20, y: 20 }}
              padding={{ top: 50, bottom: 60, left: 60, right: 20 }}
            >
              {/* X-Axis: Dates */}
              <VictoryAxis
                tickFormat={(t) => t}
                style={{
                  tickLabels: { fill: "white", fontSize: 10, angle: 45 },
                  grid: { stroke: "#4a5568", opacity: 0.2 },
                }}
              />
              {/* Y-Axis: Total Volume */}
              <VictoryAxis
                dependentAxis
                tickFormat={(t) => `${t.toFixed(1)} reps`}
                style={{
                  tickLabels: { fill: "white", fontSize: 10 },
                  grid: { stroke: "#4a5568", opacity: 0.2 },
                }}
              />
              {/* Bar Chart */}
              <VictoryBar
                data={volumeData}
                x="x"
                y="y"
                style={{
                  data: { fill: "#1E88E5" },
                }}
                labels={({ datum }) =>
                  `Date: ${datum.x}\nVolume: ${datum.y.toFixed(1)} reps`
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
          )}
        </div>
      ) : (
        <div className="w-full bg-gray-800 p-6 rounded-lg shadow-lg">
          <p className="text-center text-gray-400">
            Not enough data to display the chart. Add more records to see trends
            over time!
          </p>
        </div>
      )}

      <div className="w-full bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Past Results</h2>
        <div className="space-y-4">
          {records
            .slice()
            .reverse()
            .map((record) => (
              <div
                key={record.id}
                className="p-4 bg-gray-700 rounded-lg shadow flex justify-between space-x-4"
              >
                {/* Left Section: Sets and Reps */}
                <div>
                  <p className="text-blue-400 font-semibold mb-2">
                    {new Date(record.created_at).toLocaleDateString()}
                  </p>
                  {record.weights.map((weight, index) => (
                    <p key={index} className="text-sm text-gray-300">
                      Set {index + 1}: {weight} lbs for {record.reps[index]}{" "}
                      reps
                    </p>
                  ))}
                </div>

                {/* Right Section: Notes */}
                <div className="flex-1 text-sm text-gray-400 italic bg-gray-600 p-3 rounded">
                  {record.notes ? record.notes : "No notes available"}
                </div>
              </div>
            ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ExerciseHistory;
