import React, { useEffect, useState } from "react";
import { useWorkoutContext } from "./WorkoutContext";
import { supabaseClient } from "@/lib/supabaseClient";

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
  const [exerciseDetails, setExerciseDetails] = useState<
    {
      name: string;
      exercise_id: string;
      sets: { reps: number; weight: number }[];
    }[]
  >([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const {
        data: { session },
        error,
      } = await supabaseClient.auth.getSession();

      if (error) {
        console.error("Error fetching session:", error.message);
        return;
      }

      if (session?.user) {
        setUserId(session.user.id); // Save the user ID
      } else {
        console.warn("No user session found.");
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const storedExercises = localStorage.getItem(`exercises_${userId}`);
    if (storedExercises) {
      const parsedExercises = JSON.parse(storedExercises);

      // Map workout exercises to include exercise names
      const updatedDetails = exercises.map((exercise) => {
        const matchedExercise = parsedExercises.find(
          (e: { id: string }) => e.id === exercise.exercise_id
        );
        return {
          exercise_id: exercise.exercise_id,
          name: matchedExercise?.name || "Unknown Exercise", // Fallback if name isn't found
          sets: exercise.sets,
        };
      });

      setExerciseDetails(updatedDetails);
    }
  }, [exercises, userId]);

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

        {exerciseDetails.length > 0 ? (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Exercises</h2>
            <ul className="space-y-4">
              {exerciseDetails.map((exercise) => (
                <li
                  key={exercise.exercise_id}
                  className="p-4 bg-gray-800 rounded-md shadow-md"
                >
                  <h3 className="text-lg font-bold mb-2">{exercise.name}</h3>
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
          onClick={async () => {
            const presetName = prompt("Enter a name for this workout preset:");
            if (!presetName) {
              alert("Preset name is required.");
              return;
            }

            const description =
              prompt("Add a description for the preset (optional):") || "";

            const exercisesPayload = exercises.map((exercise) => ({
              exercise_id: exercise.exercise_id,
            }));

            try {
              const response = await fetch("/api/presets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: presetName,
                  description,
                  exercises: exercisesPayload,
                }),
              });

              const result = await response.json();

              if (!response.ok) {
                throw new Error(result.error);
              }

              alert("Workout preset saved successfully!");
            } catch (error: any) {
              console.error("Error saving preset:", error.message);
              alert("Failed to save workout preset.");
            }
          }}
          className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-all"
        >
          Save Workout to Presets
        </button>
      </div>
    </div>
  );
};

export default WorkoutSummary;
