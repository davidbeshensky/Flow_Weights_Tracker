"use client";

import React, { useState } from "react";
import { useWorkoutContext } from "@/components/WorkoutContext";
import { supabaseClient } from "@/lib/supabaseClient";

const WorkoutSession: React.FC = () => {
    const {
        workoutStarted,
        elapsedTime,
        startWorkout,
        endWorkout,
        exercises,
        setShowSummary,
      } = useWorkoutContext();
      const [showModal, setShowModal] = useState(false);
      const [showAbortConfirm, setShowAbortConfirm] = useState(false);
      const [rating, setRating] = useState<number>(5);
      const [notes, setNotes] = useState<string>("");
    

  const confirmEndWorkout = async () => {
    setShowModal(false);

    if (workoutStarted) {
      const endTime = new Date();
      const startTime = localStorage.getItem("startTime");
      let workoutSummary = null;

      try {
        const { data: session, error: sessionError } =
          await supabaseClient.auth.getSession();
        if (sessionError || !session?.session)
          throw new Error("No valid user session found");

        // Insert workout into the `workouts` table
        const { data: workout, error: workoutError } = await supabaseClient
          .from("workouts")
          .insert([
            {
              user_id: session.session.user.id,
              start_time: startTime,
              end_time: endTime.toISOString(),
              rating: rating,
              notes: notes.trim() || null,
            },
          ])
          .select()
          .single();

        if (workoutError)
          throw new Error(`Error inserting workout: ${workoutError.message}`);
        workoutSummary = workout;

        if (exercises && exercises.length > 0) {
          // Map exercises to `workout_exercise_records`
          const workoutExerciseLinks = exercises.map((record) => ({
            workout_id: workout.id,
            exercise_record_id: record.exercise_record_id,
          }));

          // Insert into `workout_exercise_records`
          const { error: linkError } = await supabaseClient
            .from("workout_exercise_records")
            .insert(workoutExerciseLinks);

          if (linkError)
            throw new Error(
              `Error inserting workout exercise records: ${linkError.message}`
            );
        } else {
          console.warn("No exercises found to link to the workout.");
        }

        // Store the workout summary and exercises in local storage
        localStorage.setItem("workoutSummary", JSON.stringify(workoutSummary));
        localStorage.setItem("workoutExercises", JSON.stringify(exercises));
      } catch (error) {
        console.error("Error saving workout and records:", error);
      } finally {
        // Clear exercise records after summary preparation
        endWorkout(); // Reset context state
        setShowSummary(true);
      }
    } else {
      console.warn("Workout not started. Nothing to end.");
    }
  };

  const abortWorkout = () => {
    setShowAbortConfirm(false);
    setShowModal(false);
    endWorkout(); // End the workout without saving
  };

  return (
    <div className="workout-session">
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
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAbortConfirm(true)} // Open abort confirmation modal
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Abort
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Abort confirmation modal */}
      {showAbortConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 p-6 rounded-md text-center w-96">
            <p className="text-white text-lg mb-4">
              Are you sure you want to abort the workout? This will not save any
              data.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={abortWorkout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Yes, Abort
              </button>
              <button
                onClick={() => setShowAbortConfirm(false)}
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
