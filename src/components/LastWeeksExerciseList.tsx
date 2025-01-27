import React, { useEffect, useState, useCallback } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import Link from "next/link";

interface WorkoutPresetExercise {
  exercise_id: string;
  exercises: { name: string }[]; // Array of objects
}

interface Preset {
  id: string;
  name: string;
  workout_preset_exercises: WorkoutPresetExercise[];
}

const ExerciseList: React.FC = () => {
  const [starredPresets, setStarredPresets] = useState<Preset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch starred presets from Supabase
  const fetchStarredPresets = useCallback(async () => {
    setLoading(true);
    try {
      const { data: session, error: sessionError } =
        await supabaseClient.auth.getSession();

      if (sessionError || !session?.session) {
        console.error("No valid session found.");
        setLoading(false);
        return;
      }

      const userId = session.session.user.id;

      const { data: presetData, error: presetError } = await supabaseClient
        .from("workout_presets")
        .select(
          `
          id,
          name,
          workout_preset_exercises (
            exercise_id,
            exercises (
              name
            )
          )
        `
        )
        .eq("user_id", userId)
        .eq("starred", true);

      if (presetError) {
        console.error("Error fetching presets:", presetError.message);
        setLoading(false);
        return;
      }

      setStarredPresets(presetData || []);
    } catch (err) {
      console.error("Error fetching starred presets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStarredPresets();
  }, [fetchStarredPresets]);

  // Load selected preset from local storage on initial load
  useEffect(() => {
    const storedPreset = localStorage.getItem("selectedPreset");
    if (storedPreset) {
      const parsedPreset = JSON.parse(storedPreset);
      setSelectedPreset(parsedPreset);
    }
  }, []);

  // Function to select a preset and save it to local storage
  const selectPreset = (preset: Preset) => {
    setSelectedPreset(preset);
    localStorage.setItem("selectedPreset", JSON.stringify(preset));
  };

  if (loading) {
    return (
      <div className="mt-4">
        <h3 className="text-lg font-bold text-white mb-2">
          Loading presets...
        </h3>
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!selectedPreset) {
    return (
      <div className="mt-4">
        <h3 className="text-lg font-bold text-white mb-4">Starred Presets</h3>
        <div className="flex flex-row gap-2">
          {starredPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => selectPreset(preset)}
              className="block bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">
          Exercises in {selectedPreset.name}
        </h3>
        <button
          onClick={() => {
            setSelectedPreset(null);
            localStorage.removeItem("selectedPreset"); // Clear local storage when deselecting
          }}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Back to Presets
        </button>
      </div>
      <ul className="space-y-1">
        {selectedPreset.workout_preset_exercises.map((exercise) => (
          <li key={exercise.exercise_id}>
            <Link
              href={`/exercises/${exercise.exercise_id}`}
              className="block bg-gray-700 rounded-md py-1 my-1 text-white hover:text-blue-500"
            >
              <div className="px-2">
                {(exercise.exercises as any).name || "Unnamed Exercise"}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExerciseList;
