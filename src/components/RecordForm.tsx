"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface RecordFormProps {
  exerciseId: string;
  exerciseName: string;
}

const RecordForm: React.FC<RecordFormProps> = ({
  exerciseId,
  exerciseName,
}) => {
  const [reps, setReps] = useState<number | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [sets, setSets] = useState<{ reps: number; weight: number }[]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [recentSets, setRecentSets] = useState<{ reps: number; weight: number }[]>([]);

  const router = useRouter();

  // Fetch the most recent record for the exercise on component mount
  useEffect(() => {
    const fetchRecentSets = async () => {
      const { data, error } = await supabase
        .from("exercise_records")
        .select("reps, weights")
        .eq("exercise_id", exerciseId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching recent sets:", error);
        return;
      }

      if (data && data.length > 0) {
        const { reps, weights } = data[0];
        const setsData = reps.map((rep: number, index: number) => ({
          reps: rep,
          weight: weights[index],
        }));
        setRecentSets(setsData);
        if (setsData.length > 0) {
          setReps(setsData[0].reps);
          setWeight(setsData[0].weight);
        }
      }
    };

    fetchRecentSets();
  }, [exerciseId]);

  const handleViewHistory = () => {
    router.push(
      `/exercises/${exerciseId}/history?name=${encodeURIComponent(
        exerciseName
      )}`
    );
  };

  const handleAddSet = () => {
    if (!reps || !weight) {
      setError("Both reps and weight are required to add a set.");
      return;
    }

    setSets((prev) => [...prev, { reps, weight }]);
    const nextSetIndex = sets.length + 1;

    // Autofill the next set with data from `recentSets`
    if (recentSets.length > 0) {
      const nextSet =
        nextSetIndex < recentSets.length
          ? recentSets[nextSetIndex]
          : recentSets[recentSets.length - 1]; // Repeat the last set
      setReps(nextSet.reps);
      setWeight(nextSet.weight);
    } else {
      setReps(null);
      setWeight(null);
    }

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

  return (
    <div className="mx-auto h-fit flex justify-center animated-gradient bg-gradient-to-br from-purple-900 via-green-700 to-black text-white">
      <div className="w-full max-w-sm bg-black bg-opacity-30 p-6 m-6 rounded-lg shadow-lg">
        <div className="text-center">
          <button
            onClick={handleViewHistory}
            className="py-2 px-4 bg-purple-600 rounded-md hover:bg-purple-500 transition-all text-white"
          >
            View History
          </button>
        </div>
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
            onClick={() => {
              if (sets.length > 0) {
                setShowCancelModal(true); //showing modal only if sets exist
              } else {
                handleCancel();
              }
            }}
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
