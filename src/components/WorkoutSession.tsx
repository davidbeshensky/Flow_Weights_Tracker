"use client";

import React, { useState } from "react";
import { useWorkoutContext } from "@/components/WorkoutContext";
import WorkoutSummary from "./WorkoutSummary";

const WorkoutSession: React.FC = () => {
  const {
    workoutStarted,
    elapsedTime,
    startWorkout,
    endWorkout,
    workoutExercises,
    startTime,
  } = useWorkoutContext();
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState<string>("");
  const [showSummary, setShowSummary] = useState<boolean>(false);

  const confirmEndWorkout = async () => {
    if (!workoutStarted) {
      console.warn("Workout not started. Nothing to end.");
      return;
    }

    if (!startTime) {
      console.error("Start time is missing. Cannot end the workout.");
      return;
    }

    try {
      // Step 1: Save the workout and get the workout_id
      const workoutData = {
        rating,
        notes,
        start_time: startTime.toISOString(),
        end_time: new Date().toISOString(),
      };

      const workoutResponse = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workoutData),
      });

      const workoutResult = await workoutResponse.json();
      if (!workoutResponse.ok) throw new Error(workoutResult.error);

      const workout_id = workoutResult.id; // Ensure `workout_id` is returned
      console.log("Workout saved with ID:", workout_id);

      // Handle case with no exercises
      if (workoutExercises.length === 0) {
        console.log("No exercises to link for this workout.");
        setShowModal(false); // Close the modal
        endWorkout(); // Reset the workout
        setShowSummary(true); // Show the summary
        return;
      }

      // Step 2: Construct the payload for the linking table
      const linkingData = workoutExercises.flatMap((exercise) =>
        exercise.sets.map((set) => ({
          workout_id, // FK to workouts table
          exercise_set_record_id: set.exercise_set_record_id, // FK to exercise_set_records
        }))
      );

      console.log("Linking table payload:", linkingData);

      // Step 3: Save the linking data
      const linkingResponse = await fetch("/api/linking-table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(linkingData),
      });

      const linkingResult = await linkingResponse.json();
      if (!linkingResponse.ok) throw new Error(linkingResult.error);

      console.log("Linking table populated successfully!");

      // Step 4: Reset the workout
      setShowModal(false);
      setShowSummary(true); // Show the summary
    } catch (error: any) {
      console.error("Error during workout submission:", error.message);
    }
  };

  const abortWorkout = () => {
    console.log("Workout aborted.");
    endWorkout(); // Reset workout state using `endWorkout` from context
    setShowModal(false); // Close the modal
  };

  if (showSummary) {
    return (
      <WorkoutSummary
        exercises={workoutExercises}
        rating={rating}
        notes={notes}
        onClose={() => setShowSummary(false)} // Close the summary
      />
    );
  }
  

  return (
    <div className="workout-session pt-4">
      {!workoutStarted ? (
        <button
          onClick={startWorkout}
          className="w-max-sm w-full mb-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Start Workout
        </button>
      ) : (
        <div className="grid grid-flow-col-dense mb-4">
          <p className="text-md font-mono py-2">{elapsedTime}</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gray-600 text-white rounded-md hover:bg-gray-700 py-2"
          >
            End Workout
          </button>
        </div>
      )}

      {/* Modal for ending workout */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 p-6 rounded-md text-center w-96">
            <p className="text-white text-lg mb-4">Rate your workout (1-10):</p>

            {/* Slider for rating */}
            <div className="flex flex-col items-center mb-4">
              <p className="text-white text-2xl font-bold mb-2">{rating}</p>
              <input
                type="range"
                min="1"
                max="10"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Notes textarea */}
            <div className="mb-4">
              <label
                htmlFor="notes"
                className="block text-white text-sm font-medium mb-2"
              >
                Notes (optional):
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional comments about your workout..."
                className="w-full px-3 py-2 text-white bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
                rows={4}
              />
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmEndWorkout}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={abortWorkout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Abort Workout
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutSession;
