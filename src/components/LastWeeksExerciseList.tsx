import React, { useEffect, useState, useCallback } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import Link from "next/link";
import PresetEditor from "./PresetEditor";

interface WorkoutPresetExercise {
  exercise_id: string;
  exercises: { name: string }[];
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
  const [isEditorVisible, setIsEditorVisible] = useState(false);

  const fetchStarredPresets = useCallback(async () => {
    setLoading(true);
    try {
      const { data: session } = await supabaseClient.auth.getSession();
      if (!session?.session) {
        console.error("No valid session found.");
        return;
      }

      const userId = session.session.user.id;

      const { data: presetData, error } = await supabaseClient
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

      if (error) throw error;
      setStarredPresets(presetData || []);
    } catch (err) {
      console.error("Error fetching presets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStarredPresets();
  }, [fetchStarredPresets]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedPreset = localStorage.getItem("selectedPreset");
      if (storedPreset) {
        setSelectedPreset(JSON.parse(storedPreset));
      }
    }
  }, []);

  const selectPreset = (preset: Preset) => {
    setSelectedPreset(preset);
    localStorage.setItem("selectedPreset", JSON.stringify(preset));
  };

  const handleEditorOpen = () => setIsEditorVisible(true);
  const handleEditorClose = () => setIsEditorVisible(false);

  if (loading) {
    return <p className="text-gray-400">Loading presets...</p>;
  }

  if (!selectedPreset) {
    return (
      <div className="mt-4">
        <h3 className="text-lg font-bold text-white mb-4">Starred Presets</h3>
        {starredPresets.length === 0 ? (
          <p className="text-gray-400">No starred presets found.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {starredPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => selectPreset(preset)}
                className="block bg-blue-600 text-white rounded-md px-4 py-4 hover:bg-blue-700"
              >
                {preset.name}
              </button>
            ))}
            <button
              onClick={handleEditorOpen}
              className="bg-gray-600 text-white rounded-md hover:bg-gray-700 p-4 w-full"
            >
              Add a Preset +
            </button>
            {isEditorVisible && (
              <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
                <PresetEditor closeEditor={handleEditorClose} />
              </div>
            )}
          </div>
        )}
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
            localStorage.removeItem("selectedPreset");
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
