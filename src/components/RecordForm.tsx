"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ExerciseHistory from "./ExerciseHistory";
import { AnimatePresence } from "framer-motion";
import EditExerciseName from "./EditExerciseName";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import SkeletalRecordForm from "./SkeletalRecordForm";
import AddInformationModal from "./AddInformationModal";
import { useWorkoutContext } from "@/components/WorkoutContext";

interface RecordFormProps {
  exerciseId: string;
}
interface LocalData {
  exerciseName: string;
  sets: { reps: number; weight: number }[];
  date: string;
}

const RecordForm: React.FC<RecordFormProps> = ({ exerciseId }) => {
  const [exerciseName, setExerciseName] = useState<string>("");
  const [isEditingSets, setIsEditingSets] = useState(false);
  const [isEditingName, setIsEditingName] = useState<boolean>(false); // Tracks if EditExerciseName is active
  const [reps, setReps] = useState<number | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [sets, setSets] = useState<{ reps: number; weight: number, restTime: number }[]>([]);
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
  const { addExerciseToWorkout, workoutStarted } = useWorkoutContext();
  const [timeElapsed, setTimeElapsed] = useState(0); // Timer state
  const [timerActive, setTimerActive] = useState(false); // To control the timer
  const router = useRouter();

  // Helper function to format time in mm:ss
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    // Start the timer on component mount
    setTimerActive(true);
    const interval = setInterval(() => {
      if (timerActive) setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [timerActive]);

  useEffect(() => {
    const fetchAndLoadData = async () => {
      let localData: LocalData | undefined;

      // Step 1: Attempt to load from local storage
      try {
        const storedData = localStorage.getItem(`${exerciseId}_recentSets`);
        if (storedData) {
          localData = JSON.parse(storedData);
          console.log("Loaded data from local storage:", localData);

          // Populate state with local storage data
          setExerciseName(localData?.exerciseName || ""); // Defaults to empty string if missing

          setRecentSets(localData?.sets || []);
          setRecentSetsDate(localData?.date || "");

          if (localData?.sets && localData.sets?.length > 0) {
            setReps(localData.sets[0].reps || 0);
            setWeight(localData.sets[0].weight || 0);
          }
        }
      } catch (err) {
        console.error("Error reading from local storage:", err);
      }

      // Step 2: If no local data, fetch from the server
      if (!localData) {
        console.log("No local data found, fetching from server...");
        try {
          const exerciseRes = await fetch(`/api/exercises/${exerciseId}`);
          const exerciseData = await exerciseRes.json();
          if (!exerciseRes.ok) throw new Error(exerciseData.error);

          const recentRes = await fetch(`/api/exercises/${exerciseId}/recent`);
          const recentData = await recentRes.json();
          if (!recentRes.ok) throw new Error(recentData.error);

          // Populate state with fetched data
          setExerciseName(exerciseData.name);
          setRecentSets(recentData.sets || []);
          setRecentSetsDate(recentData.created_at);

          if (recentData.sets?.length > 0) {
            setReps(recentData.sets[0].reps || 0);
            setWeight(recentData.sets[0].weight || 0);
          }

          // Save fetched data to local storage
          localStorage.setItem(
            `${exerciseId}_recentSets`,
            JSON.stringify({
              exerciseName: exerciseData.name,
              sets: recentData.sets || [],
              date: recentData.created_at,
            })
          );
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.error("Error reading from server:", err.message);
          } else {
            console.error("Unknown error occurred:", err);
          }
        }
      }

      setIsLoading(false); // Ensure loading state is updated
    };

    fetchAndLoadData();
  }, [exerciseId]); // Missing closing parentheses were added here

  const handleAddSet = () => {
    if (!reps || !weight) {
      setError("Both reps and weight are required to add a set.");
      return;
    }
  
    // Add the current set to the sets array with the rest time included
    setSets((prev) => [...prev, { reps, weight, restTime: timeElapsed }]);
  
    // For the next set, default to the current set's values
    setReps(reps);
    setWeight(weight);
  
    // Reset the timer for the next set
    setTimeElapsed(0);
    setTimerActive(true);
  
    setError(null);
  };
  
  // Submit the current workout
  const handleSubmit = async () => {
    console.log("handleSubmit invoked");

    if (sets.length === 0) {
      setError("Please add at least one set before submitting.");
      return;
    }

    try {
      // Step 1: Create the exercise record
      const recordRes = await fetch(`/api/exercises/${exerciseId}/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }), // Send additional metadata if needed
      });

      const recordData = await recordRes.json();
      if (!recordRes.ok) throw new Error(recordData.error);

      const recordId = recordData.id; // Ensure the backend returns the new record ID
      if (!recordId) {
        throw new Error("Failed to retrieve exercise record ID.");
      }

      console.log("Record ID created:", recordId);
      console.log("sets",sets);
      // Step 2: Add sets to the exercise_set_records table
      const setsRes = await fetch(`/api/records/${recordId}/sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sets }),
      });

      const setsData = await setsRes.json();
      if (!setsRes.ok) throw new Error(setsData.error);

      // `setsData` should now include `exercise_set_record_id` for each set
      const populatedSets = setsData.sets.map((set: any, index: number) => ({
        reps: sets[index].reps, // Use original input reps
        weight: sets[index].weight, // Use original input weight
        exercise_set_record_id: set.id, // Use the ID returned by the backend
      }));

      console.log("Sets added:", populatedSets);

      // Step 3: Add the populated sets to the WorkoutContext
      if (workoutStarted) {
        addExerciseToWorkout({
          exercise_id: exerciseId,
          sets: populatedSets,
        });
        console.log("Exercise added to workout with populated sets!");
      }

      // Save to localStorage for history purposes
      const date = new Date().toISOString();
      localStorage.setItem(
        `${exerciseId}_recentSets`,
        JSON.stringify({
          sets: populatedSets,
          date,
          exerciseName,
        })
      );

      console.log("Data saved to localStorage:", {
        sets: populatedSets,
        date,
        exerciseName,
      });

      // Reset the form on success
      resetState();
    } catch (err: any) {
      console.error("Error during submission:", err.message);
      setError(err.message || "An error occurred.");
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
      <div className="flex items-center justify-between mb-4">
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
          className="w-full py-3 bg-gray-600 text-white font-medium rounded-md shadow-md hover:bg-gray-700 mb-4"
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
          className="w-full py-3 ml-2 bg-gray-600 text-white font-medium rounded-md shadow-md hover:bg-gray-700 mb-4"
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
      <div className="border-solid border-t-2 border-gray-800 mb-2 w-full"></div>
      {/* Timer Display */}
      <div className="text-lg justify-center flex font-medium mb-4">
        <span className="text-white">{formatTime(timeElapsed)}</span>
      </div>
      <div className="flex flex-row gap-2">
        {/* Reps Input */}
        <div className="mb-4">
          <label
            htmlFor="reps"
            className="block text-sm font-medium text-gray-400"
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
            className="mt-1 block w-full p-3 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-blue-600 appearance-none h-12"
            placeholder="Enter reps"
          />
        </div>
        {/* Weight Input */}
        <div className="mb-4">
          <label
            htmlFor="weight"
            className="block text-sm font-medium text-gray-400"
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
            className="mt-1 block p-3 w-full bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-blue-600 appearance-none h-12"
            placeholder="Enter weight"
          />
        </div>
        {/* Add Set Button */}
        <button
          onClick={handleAddSet}
          className="bg-blue-600 mt-6 text-white font-medium rounded-md shadow-md hover:bg-blue-700 transition-all mb-4 h-12 px-4 flex items-center justify-center"
        >
          Add Set
        </button>
      </div>

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
            <ul className="rounded-md bg-gray-800">
              {recentSets.map((set, index) => (
                <li key={index} className="p-1">
                  <div className="text-sm font-medium text-gray-400">
                    Set {index + 1}
                  </div>
                  <div>
                    {set.reps} reps x {set.weight} lbs
                  </div>
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
            <ul className="bg-gray-800 rounded-md">
              {sets.map((set, index) => (
                <li key={index} className="p-1">
                  {isEditingSets ? (
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-400">
                        Set {index + 1}
                      </div>
                      <div className="flex">
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
                          <label className="text-sm text-gray-300">lbs:</label>
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
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm font-medium text-gray-400">
                        Set {index + 1}
                        <div>
                          {!isEditingSets && (
                            <button
                              onClick={() => handleDeleteSet(index)}
                              className="bg-transparent rounded-md hover:text-red-500 focus:ring-2 focus:ring-red-500"
                            >
                              ✖
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div>
                          {set.reps} reps x {set.weight} lbs
                        </div>
                      </div>
                    </>
                  )}
                  {/* Delete Button */}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="border-solid border-t-2 border-gray-800 mb-2 w-full mt-4"></div>

      {/* Notes Input */}
      <div className="mt-4 mb-6">
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-400"
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
