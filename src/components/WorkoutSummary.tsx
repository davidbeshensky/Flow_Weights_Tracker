"use client";

import React from "react";
import { useWorkoutContext } from "@/components/WorkoutContext";

interface WorkoutSummaryProps {
  onClose: () => void;
}

const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({ onClose }) => {
  const { exercises } = useWorkoutContext();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-white">
        <h2 className="text-xl font-bold mb-4">Workout Summary</h2>
        <ul className="mb-4">
          {exercises.map((exercise, index) => (
            <li key={index} className="mb-2">
              <strong>Exercise ID:</strong> {exercise.exercise_id}
              <br />
              <strong>Reps:</strong> {exercise.reps.join(", ")}
              <br />
              <strong>Weights:</strong> {exercise.weights.join(", ")}
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default WorkoutSummary;
