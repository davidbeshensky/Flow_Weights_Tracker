"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";

interface RecordFormProps {
  exerciseId: string;
}

const RecordForm: React.FC<RecordFormProps> = ({ exerciseId }) => {
  const [exerciseName, setExerciseName] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [reps, setReps] = useState<number | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [sets, setSets] = useState<{ reps: number; weight: number }[]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [recentSets, setRecentSets] = useState<
    { reps: number; weight: number }[]
  >([]);

  const router = useRouter();

  // Fetch exercise name and the most recent record for the exercise on component mount
  useEffect(() => {
    const fetchExerciseData = async () => {
      try {
        const { data: exerciseData, error: exerciseError } = await supabase
          .from("exercises")
          .select("name")
          .eq("id", exerciseId)
          .single();

        if (exerciseError) {
          console.error("Error fetching exercise name:", exerciseError);
          setError("Failed to load exercise data.");
          return;
        }

        if (exerciseData) {
          setExerciseName(exerciseData.name);
          setNewName(exerciseData.name); // Initialize the new name state
        }

        const { data: recentData, error: recentError } = await supabase
          .from("exercise_records")
          .select("reps, weights")
          .eq("exercise_id", exerciseId)
          .order("created_at", { ascending: false })
          .limit(1);

        if (recentError) {
          console.error("Error fetching recent sets:", recentError);
          return;
        }

        if (recentData && recentData.length > 0) {
          const { reps, weights } = recentData[0];
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
      } catch (err) {
        console.error("Unexpected error fetching data:", err);
        setError("An unexpected error occurred.");
      }
    };

    fetchExerciseData();
  }, [exerciseId]);

  const handleAddSet = () => {
    if (!reps || !weight) {
      setError("Both reps and weight are required to add a set.");
      return;
    }

    setSets((prev) => [...prev, { reps, weight }]);
    const nextSetIndex = sets.length + 1;

    // Autofill the next set with data from recentSets
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

  const handleEditName = async () => {
    if (!newName.trim()) {
      setError("Exercise name cannot be empty.");
      return;
    }

    const { error } = await supabase
      .from("exercises")
      .update({ name: newName.trim() })
      .eq("id", exerciseId);

    if (error) {
      setError("Failed to update exercise name.");
    } else {
      setExerciseName(newName.trim());
      setIsEditingName(false);
      setError(null);
    }
  };

  const handleViewHistory = () => {
    router.push(
      `/exercises/${exerciseId}/history?name=${encodeURIComponent(
        exerciseName || "default exercise"
      )}`
    );
  };

  const handleCancel = () => {
    if (sets.length > 0) {
      setShowCancelModal(true);
    } else {
      // If no sets are recorded, directly cancel without confirmation
      setSets([]);
      setReps(null);
      setWeight(null);
      setNotes("");
      setError(null);
      router.push("/");
    }
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    setSets([]);
    setReps(null);
    setWeight(null);
    setNotes("");
    setError(null);
    router.push("/");
  };

  return (
    <div className="p-6 bg-black/95 text-white rounded-lg max-w-3xl mx-auto shadow-lg">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-600 text-white rounded-md flex justify-between items-center">
          <p className="text-sm font-medium">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-white bg-transparent rounded-full w-6 h-6 flex items-center justify-center"
          >
            ✖
          </button>
        </div>
      )}
      {/* Editable Exercise Name */}
      <div className="flex items-center justify-between mb-6">
        {isEditingName ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="p-2 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-blue-600"
            />
            <button
              onClick={handleEditName}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditingName(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold">{newName}</h1>
            <button
              onClick={() => setIsEditingName(true)}
              className="p-2 ml-2 bg-transparent text-white hover:bg-gray-800 rounded-md"
            >
              <EditIcon fontSize="medium" />
            </button>
          </>
        )}
      </div>

      {/* View History Button */}
      <div className="flex flex-inline">
        <button
          onClick={handleViewHistory}
          className="w-full py-3 mr-1 bg-gray-600 text-white font-medium rounded-md shadow-md hover:bg-gray-700 mb-6"
        >
          Past Results
        </button>
        <button className="w-full py-3 ml-1 bg-gray-600 text-white font-medium rounded-md shadow-md hover:bg-gray-700 mb-6">
          Add Information
        </button>
      </div>
      {/* Reps Input */}
      <div className="mb-4">
        <label
          htmlFor="reps"
          className="block text-sm font-medium text-gray-300"
        >
          Reps
        </label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          id="reps"
          value={reps || ""}
          onChange={(e) => setReps(Number(e.target.value))}
          className="mt-1 block w-full p-3 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-blue-600 appearance-none"
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
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          id="weight"
          value={weight || ""}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="mt-1 block w-full p-3 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-blue-600 appearance-none"
          placeholder="Enter weight (lbs)"
        />
      </div>

      <button
        onClick={handleAddSet}
        className="w-full py-3 bg-blue-600 text-white font-medium rounded-md shadow-md hover:bg-blue-700 transition-all mb-6"
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
          className="mt-1 block w-full p-3 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-blue-600 resize-none"
          placeholder="Add any notes for this workout"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handleCancel}
          className="py-3 px-6 bg-gray-600 text-white rounded-md hover:bg-gray-500"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="py-3 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Submit
        </button>
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
                onClick={confirmCancel}
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
