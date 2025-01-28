"use client";

import { useState, useEffect } from "react";
import ExerciseSearchBarPreset from "./ExerciseSearchBarPreset";

type Exercise = {
  exercise_id: string;
  name: string;
  order?: number; // Optional
};

type Preset = {
  id: string;
  name: string;
  description: string | null;
  starred: boolean;
  workout_preset_exercises: Exercise[];
};

type PresetEditorProps = {
  closeEditor: () => void;
};

export default function PresetEditor({ closeEditor }: PresetEditorProps) {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [newPreset, setNewPreset] = useState({ name: "", description: "" });
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPresets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/presets", { method: "GET" });
      const data = await res.json();
      setPresets(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStarred = async (id: string, starred: boolean) => {
    try {
      const res = await fetch(`/api/presets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starred: !starred }),
      });
      if (!res.ok) throw new Error("Failed to update preset");
      setPresets((prev) =>
        prev.map((preset) =>
          preset.id === id ? { ...preset, starred: !starred } : preset
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const createPreset = async () => {
    if (!newPreset.name.trim()) return alert("Preset name is required.");
    try {
      const res = await fetch("/api/presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPreset,
          exercises: selectedExercises, // Include exercises in the payload
        }),
      });
      if (!res.ok) throw new Error("Failed to create preset");
      const data = await res.json();
      setPresets((prev) => [...prev, data]);
      setNewPreset({ name: "", description: "" });
      setSelectedExercises([]);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPresets();
  }, []);

  const handleAddExercise = (exercise: Exercise) => {
    if (!selectedExercises.some((e) => e.exercise_id === exercise.exercise_id)) {
      setSelectedExercises((prev) => [...prev, exercise]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded shadow-lg p-6 w-full max-w-3xl relative overflow-y-auto max-h-[90vh] mt-8">
        {/* Close Button */}
        <button
          onClick={closeEditor}
          className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Close
        </button>

        <h1 className="text-2xl font-bold mb-4">Preset Editor</h1>

        {/* New Preset Form */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Create New Preset</h2>
          <input
            type="text"
            placeholder="Preset Name"
            value={newPreset.name}
            onChange={(e) =>
              setNewPreset({ ...newPreset, name: e.target.value })
            }
            className="placeholder-gray bg-gray-800 border border-gray-700 p-2 rounded w-full mb-2"
          />
          <textarea
            placeholder="Description (optional)"
            value={newPreset.description}
            onChange={(e) =>
              setNewPreset({ ...newPreset, description: e.target.value })
            }
            className="border border-gray-700 p-2 bg-gray-800 rounded w-full mb-2"
          />

          {/* Exercise Search Bar */}
          <ExerciseSearchBarPreset onAddExercise={handleAddExercise} />

          {/* Selected Exercises */}
          {selectedExercises.length > 0 && (
            <ul className="mt-4 space-y-2">
              {selectedExercises.map((exercise) => (
                <li
                  key={exercise.exercise_id}
                  className="flex justify-between items-center bg-gray-700 p-2 rounded"
                >
                  <span>{exercise.name}</span>
                  <button
                    onClick={() =>
                      setSelectedExercises((prev) =>
                        prev.filter((e) => e.exercise_id !== exercise.exercise_id)
                      )
                    }
                    className="text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={createPreset}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Preset
          </button>
        </div>

        {/* Presets List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Presets</h2>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <ul className="space-y-4">
              {presets.map((preset) => (
                <li
                  key={preset.id}
                  className="bg-gray-700 p-4 rounded shadow flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-lg font-bold">{preset.name}</h3>
                    <p className="text-gray-400">{preset.description || "-"}</p>
                  </div>
                  <button
                    onClick={() => toggleStarred(preset.id, preset.starred)}
                    className={`px-4 py-2 rounded ${
                      preset.starred
                        ? "bg-blue-500 text-white"
                        : "bg-gray-600 text-white"
                    }`}
                  >
                    {preset.starred ? "Unstar" : "Star"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
