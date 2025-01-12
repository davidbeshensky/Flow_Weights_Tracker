"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import {
  VictoryChart,
  VictoryScatter,
  VictoryAxis,
  VictoryLine,
  VictoryTooltip,
  VictoryBar,
} from "victory";
import SkeletalExerciseHistory from "./SkeletalExerciseHistory";

interface SetRecord {
  set_number: number;
  reps: number;
  weight: number;
}

interface HistoricalRecord {
  id: string;
  created_at: string;
  notes?: string | null;
  sets: SetRecord[];
}

interface ExerciseHistoryProps {
  exerciseId: string;
  exerciseName: string;
  onClose: () => void;
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
    const fetchExerciseHistory = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/exercises/${exerciseId}/history`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch exercise history.");
        }

        setRecords(data);
      } catch (error: any) {
        console.error("Error fetching exercise history:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExerciseHistory();
  }, [exerciseId]);

  // Calculate scatter data
  const scatterData = records.map((record) => {
    const totalReps = record.sets.reduce((sum, set) => sum + set.reps, 0);
    const totalWeight = record.sets.reduce(
      (sum, set) => sum + set.reps * set.weight,
      0
    );

    const avgWeight = totalReps > 0 ? totalWeight / totalReps : 0;
    const totalSets = record.sets.length;
    const size = totalSets > 0 ? totalReps / totalSets : 1;

    return {
      x: new Date(record.created_at).toLocaleDateString(),
      y: avgWeight,
      size,
      totalReps,
      avgWeight,
    };
  });

  // Calculate volume data
  const volumeData = records.map((record) => {
    const totalReps = record.sets.reduce((sum, set) => sum + set.reps, 0);

    return {
      x: new Date(record.created_at).toLocaleDateString(),
      y: totalReps,
    };
  });

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

      {isLoading ? (
        <SkeletalExerciseHistory />
      ) : (
        <>
          {/* Toggle Graph View */}
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

          {/* Graphs */}
          {records.length > 0 ? (
            <div className="w-full p-6 bg-gray-800 rounded-lg shadow-lg mb-6">
              {view === "weightGraph" && (
                <VictoryChart domainPadding={{ x: 20, y: 20 }}>
                  <VictoryAxis
                    tickFormat={(t) => t}
                    style={{
                      tickLabels: { fill: "white", fontSize: 10 },
                      grid: { stroke: "#4a5568", opacity: 0.2 },
                    }}
                  />
                  <VictoryAxis
                    dependentAxis
                    tickFormat={(t) => `${t.toFixed(1)} lbs`}
                    style={{
                      tickLabels: { fill: "white", fontSize: 10 },
                      grid: { stroke: "#4a5568", opacity: 0.2 },
                    }}
                  />
                  <VictoryScatter
                    data={scatterData}
                    size={({ datum }) => Math.sqrt(datum.size) * 2}
                    style={{ data: { fill: "#1E88E5" } }}
                    labels={({ datum }) =>
                      `Date: ${datum.x}\nAvg Weight: ${datum.y.toFixed(
                        1
                      )} lbs\nTotal Reps: ${datum.totalReps}`
                    }
                    labelComponent={<VictoryTooltip />}
                  />
                  <VictoryLine
                    data={scatterData}
                    style={{ data: { stroke: "#1E88E5", strokeWidth: 2 } }}
                  />
                </VictoryChart>
              )}
              {view === "volumeGraph" && (
                <VictoryChart domainPadding={{ x: 20, y: 20 }}>
                  <VictoryAxis
                    tickFormat={(t) => t}
                    style={{
                      tickLabels: { fill: "white", fontSize: 10 },
                      grid: { stroke: "#4a5568", opacity: 0.2 },
                    }}
                  />
                  <VictoryAxis
                    dependentAxis
                    tickFormat={(t) => `${t.toFixed(1)} reps`}
                    style={{
                      tickLabels: { fill: "white", fontSize: 10 },
                      grid: { stroke: "#4a5568", opacity: 0.2 },
                    }}
                  />
                  <VictoryBar
                    data={volumeData}
                    style={{ data: { fill: "#1E88E5" } }}
                    labels={({ datum }) =>
                      `Date: ${datum.x}\nVolume: ${datum.y.toFixed(1)} reps`
                    }
                    labelComponent={<VictoryTooltip />}
                  />
                </VictoryChart>
              )}
            </div>
          ) : (
            <div className="w-full bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
              <p className="text-center text-gray-400">
                Not enough data to display the chart. Add more records to see
                trends over time!
              </p>
            </div>
          )}

          {/* Historical Data */}
          <div className="w-full bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Past Results</h2>
            {records.length > 0 ? (
              <div className="space-y-4">
                {records
                  .slice()
                  .reverse()
                  .map((record) => (
                    <div
                      key={record.id}
                      className="p-4 bg-gray-700 rounded-lg shadow flex justify-between space-x-4"
                    >
                      <div>
                        <p className="text-blue-400 font-semibold mb-2">
                          {new Date(record.created_at).toLocaleDateString()}
                        </p>
                        {record.sets.map((set) => (
                          <p
                            key={set.set_number}
                            className="text-sm text-gray-300"
                          >
                            Set {set.set_number}: {set.weight} lbs for{" "}
                            {set.reps} reps
                          </p>
                        ))}
                      </div>
                      <div className="flex-1 text-sm text-gray-400 italic bg-gray-600 p-3 rounded">
                        {record.notes ? record.notes : "No notes available"}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-center text-gray-400">
                No data yet. Log some lifts!
              </p>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default ExerciseHistory;
