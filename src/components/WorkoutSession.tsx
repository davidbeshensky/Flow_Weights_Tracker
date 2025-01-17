"use client";

import React, { useState, useEffect } from "react";
import { useWorkoutContext } from "@/components/WorkoutContext";

const WorkoutSession: React.FC = () => {
  const { workoutStarted, elapsedTime, startWorkout, endWorkout } =
    useWorkoutContext();
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState<string>("");

  // Log workoutStarted state whenever it changes
  useEffect(() => {
    console.log("Workout Started State:", workoutStarted);
  }, [workoutStarted]);

  const confirmEndWorkout = () => {
    setShowModal(false);

    if (workoutStarted) {
      console.log("Workout ended:");
      console.log("Rating:", rating);
      console.log("Notes:", notes);
      endWorkout();
    } else {
      console.warn("Workout not started. Nothing to end.");
    }
  };

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
