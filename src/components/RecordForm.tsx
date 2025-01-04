"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import ExerciseHistory from "./ExerciseHistory";
import { AnimatePresence } from "framer-motion";
import EditExerciseName from "./EditExerciseName";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import SkeletalRecordForm from "./SkeletalRecordForm";
import AddInformationModal from "./AddInformationModal";

interface RecordFormProps {
  exerciseId: string;
}

interface ExerciseRecord {
  reps: number[]; // Array of repetitions for each set
  weights: number[]; // Array of weights for each set
  created_at: string; // Timestamp when the record was created
}

const RecordForm: React.FC<RecordFormProps> = ({ exerciseId }) => {
  const [exerciseName, setExerciseName] = useState<string>("");
  const [isEditingSets, setIsEditingSets] = useState(false);
  const [isEditingName, setIsEditingName] = useState<boolean>(false); // Tracks if EditExerciseName is active
  const [reps, setReps] = useState<number | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [sets, setSets] = useState<{ reps: number; weight: number }[]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [recentSets, setRecentSets] = useState<
    { reps: number; weight: number }[]
  >([]);
  const [showHistory, setShowHistory] = useState(false);
  const [recentSetsDate, setRecentSetsDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleOpenHistory = () => setShowHistory(true);
  const handleCloseHistory = () => setShowHistory(false);
  const [showAddInfoModal, setShowAddInfoModal] = useState(false);

  const router = useRouter();

  // Fetch exercise name and the most recent record for the exercise on component mount
  useEffect(() => {
    const fetchExerciseData = async () => {
      setIsLoading(true);
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
        }

        const { data: recentData, error: recentError } = await supabase
          .from("exercise_records")
          .select("reps, weights, created_at")
          .eq("exercise_id", exerciseId)
          .order("created_at", { ascending: false })
          .limit(1);

        if (recentError) {
          console.error("Error fetching recent sets:", recentError);
          return;
        }

        if (recentData && recentData.length > 0) {
          const { reps, weights, created_at } = recentData[0] as ExerciseRecord;
          const setsData = reps.map((rep: number, index: number) => ({
            reps: rep,
            weight: weights[index],
          }));
          setRecentSets(setsData);
          setRecentSetsDate(created_at);

          if (setsData.length > 0) {
            setReps(setsData[0].reps);
            setWeight(setsData[0].weight);
          }
        }
      } catch (err) {
        console.error("Unexpected error fetching data:", err);
        setError("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
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
      //default behavior if no sbsequent past records exist.
      setReps(reps);
      setWeight(weight);
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

  const resetState = () => {
    setSets([]);
    setReps(null);
    setWeight(null);
    setNotes("");
    setError(null);
    router.push("/");
  };

  const handleCancel = () => {
    if (sets.length > 0) {
      setShowCancelModal(true);
    } else {
      // If no sets are recorded, directly cancel without confirmation
      resetState();
    }
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    resetState();
  };

  const handleEditSets = (
    index: number,
    field: "reps" | "weight",
    value: number
  ) => {
    setSets((prevSets) =>
      prevSets.map((set, i) => (i === index ? { ...set, [field]: value } : set))
    );
  };

  const handleDeleteSet = (index: number) => {
    setSets((prevSets) => prevSets.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return <SkeletalRecordForm />;
  }

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
        {!isEditingName ? (
          <h1 className="text-3xl font-bold">{exerciseName || "Loading..."}</h1>
        ) : null}
        <EditExerciseName
          exerciseId={exerciseId}
          currentName={exerciseName}
          onUpdateName={(newName) => setExerciseName(newName)}
          onEditStateChange={(isEditing) => setIsEditingName(isEditing)} // Update isEditingName state
          buttonType="icon"
        />
      </div>
      {/* View History Button */}
      <div className="flex flex-inline">
        <button
          onClick={handleOpenHistory}
          className="w-full py-3 bg-gray-600 text-white font-medium rounded-md shadow-md hover:bg-gray-700 mb-6"
        >
          View History
        </button>

        <AnimatePresence>
          {showHistory && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
              <ExerciseHistory
                exerciseId={exerciseId}
                exerciseName={exerciseName}
                onClose={handleCloseHistory}
              />
            </div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setShowAddInfoModal(true)}
          className="w-full py-3 ml-2 bg-gray-600 text-white font-medium rounded-md shadow-md hover:bg-gray-700 mb-6"
        >
          Add Information
        </button>
        {showAddInfoModal && (
          <AddInformationModal
            exerciseId={exerciseId}
            exerciseName={exerciseName}
            onClose={() => setShowAddInfoModal(false)}
          />
        )}
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
      <div className="flex">
        {/* Previous results */}
        {recentSets.length > 0 && (
          <div className="w-1/2 mr-1">
            <h4 className="text-lg font-semibold mb-2">
              Results:{" "}
              {recentSetsDate
                ? new Date(recentSetsDate).toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "2-digit", // This will show the year as 2 digits (e.g., 24)
                  })
                : "Unknown Date"}
            </h4>
            <ul className="space-y-2">
              {recentSets.map((set, index) => (
                <li
                  key={index}
                  className="p-3 bg-gray-800 rounded-md shadow-md"
                >
                  S-{index + 1}: ({set.reps}, {set.weight})
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Added Sets */}
        {sets.length > 0 && (
          <div className="ml-1 w-1/2">
            <div className="flex justify-between mb-2">
              <h4 className="text-lg font-semibold">Today&apos;s Liftage</h4>
              <button
                onClick={() => setIsEditingSets(!isEditingSets)}
                className=" ml-2 bg-transparent text-white hover:bg-gray-800 rounded-md"
              >
                {isEditingSets ? <CheckIcon /> : <EditIcon fontSize="medium" />}
              </button>
            </div>
            <ul className="space-y-2">
              {sets.map((set, index) => (
                <li
                  key={index}
                  className="p-3 bg-gray-800 rounded-md shadow-md flex items-center justify-between"
                >
                  {isEditingSets ? (
                    <>
                      <div className="flex items-center gap-1">
                        <label className="text-sm text-gray-300">Reps:</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={set.reps}
                          onChange={(e) =>
                            handleEditSets(
                              index,
                              "reps",
                              Number(e.target.value)
                            )
                          }
                          className="mr-1 text-center w-8 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div className="flex items-center gap-1 ml-1">
                        <label className="text-sm text-gray-300">Lbs:</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={set.weight}
                          onChange={(e) =>
                            handleEditSets(
                              index,
                              "weight",
                              Number(e.target.value)
                            )
                          }
                          className="w-8 text-center bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      S-{index + 1}: ({set.reps}, {set.weight})
                    </>
                  )}
                  {/* Delete Button */}
                  {!isEditingSets && (
                    <button
                      onClick={() => handleDeleteSet(index)}
                      className="bg-transparent rounded-md hover:text-red-500 focus:ring-2 focus:ring-red-500"
                    >
                      ✖
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {/* Notes Input */}
      <div className="mt-6 mb-6">
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
          Lock-In
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
