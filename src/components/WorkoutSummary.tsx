import React from "react";
import { useWorkoutContext } from "./WorkoutContext";

interface WorkoutSummaryProps {
  exercises: {
    exercise_id: string;
    sets: { reps: number; weight: number }[];
  }[];
  rating: number;
  notes: string;
  onClose: () => void; // Callback to handle closing the summary
}

const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({
  exercises,
  rating,
  notes,
  onClose,
}) => {
  const { endWorkout } = useWorkoutContext();
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="relative p-6 bg-gray-900 text-white rounded-lg max-w-3xl mx-auto shadow-lg">
        {/* Close Button */}
        <button
          onClick={() => {
            onClose(); // Trigger the onClose callback
            endWorkout(); // Call endWorkout from the context
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
        >
          ✖
        </button>

        <h1 className="text-3xl font-bold mb-4">Workout Summary</h1>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Rating</h2>
          <p className="text-lg">{rating}/10</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Notes</h2>
          <p className="text-lg">{notes || "No notes provided."}</p>
        </div>

        {exercises.length > 0 ? (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Exercises</h2>
            <ul className="space-y-4">
              {exercises.map((exercise, index) => (
                <li
                  key={index}
                  className="p-4 bg-gray-800 rounded-md shadow-md"
                >
                  <h3 className="text-lg font-bold mb-2">
                    Exercise {index + 1}
                  </h3>
                  <ul className="space-y-2">
                    {exercise.sets.map((set, setIndex) => (
                      <li key={setIndex} className="flex justify-between">
                        <span>Set {setIndex + 1}:</span>
                        <span>
                          {set.reps} reps @ {set.weight} lbs
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mb-6">
            <p className="text-lg font-semibold text-gray-400">
              No exercises were added to this workout.
            </p>
          </div>
        )}

        <button
          onClick={() => alert("Save to presets coming soon!")} // Placeholder functionality
          className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-all"
        >
          Save Workout to Presets
        </button>
      </div>
    </div>
  );
};

export default WorkoutSummary;
