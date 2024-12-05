"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface RecordFormProps {
  exerciseId: string;
}

interface HistoricalRecord {
  id: string;
  created_at: string | null;
  reps: number[];
  weights: number[];
  notes: string | null;
}

const RecordForm: React.FC<RecordFormProps> = ({ exerciseId }) => {
  const [reps, setReps] = useState<number | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [sets, setSets] = useState<{ reps: number; weight: number }[]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [historicalRecords, setHistoricalRecords] = useState<
    HistoricalRecord[]
  >([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const router = useRouter();

  const fetchHistoricalRecords = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("exercise_records")
        .select("id, created_at, reps, weights, notes")
        .eq("exercise_id", exerciseId)
        .order("created_at", { ascending: false })
        .limit(7);

      if (error || !data) {
        console.error("Error fetching records or no data returned:", error);
        setHistoricalRecords([]);
        return;
      }

      const validRecords = (data || []).filter(
        (record) => record.reps && record.weights
      );
      setHistoricalRecords(validRecords);
    } catch (err) {
      console.error("error fetching historical records:", err);
    }
  }, [exerciseId]);

  const handleAddSet = () => {
    if (!reps || !weight) {
      setError("Both reps and weight are required to add a set.");
      return;
    }

    setSets((prev) => [...prev, { reps, weight }]);
    setReps(null);
    setWeight(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (sets.length === 0) {
      setError("Please add at least one set before submitting.");
      return;
    }

    const repsArray = sets.map((set) => set.reps);
    const weightsArray = sets.map((set) => set.weight);

    const { error } = await supabase.from("exercise_records").insert({
      exercise_id: exerciseId,
      reps: repsArray,
      weights: weightsArray,
      notes: notes || null,
    });

    if (error) {
      setError(error.message);
    } else {
      setSets([]);
      setReps(null);
      setWeight(null);
      setNotes("");
      setError(null);
      fetchHistoricalRecords();
      router.push("/"); // Route to main page
    }
  };

  const handleCancel = () => {
    setSets([]);
    setReps(null);
    setWeight(null);
    setNotes("");
    setError(null);
    router.push("/");
  };

  useEffect(() => {
    fetchHistoricalRecords();
  }, [fetchHistoricalRecords]);

  return (
    <div className="rounded-lg animated-gradient flex justify-center bg-gradient-to-br from-purple-900 via-green-700 to-black text-white">
      <div className="w-full max-w-sm bg-black bg-opacity-50 p-6 rounded-lg shadow-lg">
        <div className="mt-2">
          <div
            onClick={() => setIsHistoryVisible((prev) => !prev)}
            className="cursor-pointer text-lg font-semibold text-purple-400 hover:text-purple-500 transition-all mb-4 text-center"
          >
            {isHistoryVisible
              ? "Hide Recent Results ▲"
              : "Show Recent Results ▼"}
          </div>

          {/* Collapsible Historical Records */}
          <div
            className={`transition-all overflow-hidden rounded-lg shadow-lg ${
              isHistoryVisible ? "max-h-40" : "max-h-0"
            }`}
          >
            <div className="overflow-x-auto overflow-y-auto h-44 flex space-x-4 p-4 bg-gray-900 rounded-lg shadow-md">
              {historicalRecords.map((record) => {
                const date =
                  record.created_at &&
                  !isNaN(new Date(record.created_at).getTime())
                    ? new Date(record.created_at).toLocaleDateString(
                        undefined,
                        {
                          month: "2-digit",
                          day: "2-digit",
                        }
                      )
                    : "Unknown Date";

                return (
                  <div
                    key={record.id}
                    className="min-w-[120px] h-fit p-2 bg-gray-800 rounded-md shadow-sm flex-shrink-0"
                  >
                    <h5 className="text-sm font-bold text-purple-400 mb-2 text-center">
                      {date}
                    </h5>
                    <div className="space-y-1 text-center">
                      {record.reps.map((rep, idx) => (
                        <p key={idx} className="text-xs text-white">
                          {record.weights[idx]} lbs, {rep} reps
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-6 mt-6 text-center">
          Record Your Progress
        </h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Reps Input */}
        <div className="mb-4">
          <label
            htmlFor="reps"
            className="block text-sm font-medium text-gray-300"
          >
            Reps
          </label>
          <input
            type="number"
            id="reps"
            value={reps || ""}
            onChange={(e) => setReps(Number(e.target.value))}
            className="mt-1 block w-full p-3 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-purple-500"
            placeholder="Enter reps"
          />
        </div>

        {/* Weight Input */}
        <div className="mb-4">
          <label
            htmlFor="weight"
            className="block text-sm font-medium text-gray-300"
          >
            Weight
          </label>
          <input
            type="number"
            id="weight"
            value={weight || ""}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="mt-1 block w-full p-3 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-purple-500"
            placeholder="Enter weight (lbs)"
          />
        </div>

        <button
          onClick={handleAddSet}
          className="animated-gradient w-full py-3 bg-gradient-to-r from-green-800 to-purple-800 text-white font-medium rounded-md shadow-md hover:from-green-700 hover:to-purple-700 transition-all mb-6"
        >
          Add Set
        </button>

        {/* Added Sets */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-4">Added Sets:</h4>
          <ul className="space-y-2">
            {sets.map((set, index) => (
              <li key={index} className="p-3 bg-gray-800 rounded-md shadow-md">
                Set {index + 1}: {set.reps} reps @ {set.weight} lbs
              </li>
            ))}
          </ul>
        </div>

        {/* Notes Input */}
        <div className="mb-6">
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-300"
          >
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full p-3 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-purple-500"
            placeholder="Add any notes for this workout"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => setShowCancelModal(true)}
            className="py-3 px-6 bg-gray-600 text-white rounded-md hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="animated-gradient py-3 px-6 bg-gradient-to-r from-green-800 to-purple-800 text-white font-medium rounded-md shadow-md hover:from-green-700 hover:to-purple-700 transition-all"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm">
            <p className="text-white mb-6">
              Are you sure you want to cancel? All unsaved data will be lost.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowCancelModal(false)}
                className="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-500 mr-2"
              >
                Go Back
              </button>
              <button
                onClick={handleCancel}
                className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-500"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordForm;
