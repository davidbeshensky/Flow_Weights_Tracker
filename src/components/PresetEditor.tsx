"use client";

import { useState, useEffect } from "react";

type Exercise = {
  [x: string]: any;
  exercise_id: string;
  order: number;
  name: string;
};

type Preset = {
  id: string;
  name: string;
  description: string | null;
  starred: boolean;
  workout_preset_exercises: Exercise[];
};

type PresetEditorProps = {
  closeEditor: () => void; // Define the prop type
};

export default function PresetEditor({ closeEditor }: PresetEditorProps) {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [newPreset, setNewPreset] = useState({ name: "", description: "" });
  const [isLoading, setIsLoading] = useState(false);

  const fetchPresets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/presets", { method: "GET" });
      const data = await res.json();
      console.log("Fetched presets:", data); // Log the data structure
      setPresets(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle toggle starred
  const toggleStarred = async (id: string, starred: boolean) => {
    try {
      const res = await fetch(`/api/presets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starred: !starred }),
      });
      if (!res.ok) throw new Error("Failed to update preset");
      // Update UI
      setPresets((prev) =>
        prev.map((preset) =>
          preset.id === id ? { ...preset, starred: !starred } : preset
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  // Handle create new preset
  const createPreset = async () => {
    if (!newPreset.name) return alert("Preset name is required.");
    try {
      const res = await fetch("/api/presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPreset),
      });
      if (!res.ok) throw new Error("Failed to create preset");
      const data = await res.json();
      // Update UI
      setPresets((prev) => [...prev, data[0]]);
      setNewPreset({ name: "", description: "" });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPresets();
  }, []);

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
            color="black"
            placeholder="Preset Name"
            value={newPreset.name}
            onChange={(e) =>
              setNewPreset({ ...newPreset, name: e.target.value })
            }
            className="placeholder-gray border p-2 rounded w-full mb-2"
          />
          <textarea
            placeholder="Description (optional)"
            value={newPreset.description}
            onChange={(e) =>
              setNewPreset({ ...newPreset, description: e.target.value })
            }
            className="border p-2 rounded w-full mb-2"
          />
          <button
            onClick={createPreset}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Preset
          </button>
        </div>

        {/* Presets List */}
        {/* Presets List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Presets</h2>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <ul className="space-y-4">
              {presets.map((preset) => (
                <li key={preset.id} className="bg-white p-4 rounded shadow">
                  {/* Preset Info */}
                  <div>
                    <h3 className="text-black font-bold">{preset.name}</h3>
                    <p className="text-gray-500">{preset.description || "-"}</p>
                  </div>

                  {/* Exercises List */}
                  <ul className="mt-4 border-t pt-4 space-y-2">
                    {preset.workout_preset_exercises
                      .sort((a, b) => a.order - b.order) // Ensure exercises are sorted by order
                      .map((exercise) => (
                        <li
                          key={exercise.exercise_id}
                          className="flex items-center justify-between text-gray-800"
                        >
                          <span>
                            {exercise.order}.{" "}
                            {exercise.exercises.name || "Unnamed Exercise"}
                          </span>
                        </li>
                      ))}
                  </ul>

                  {/* Star/Unstar Button */}
                  <button
                    onClick={() => toggleStarred(preset.id, preset.starred)}
                    className={`mt-4 px-4 py-2 rounded ${
                      preset.starred
                        ? "bg-yellow-400 text-black"
                        : "bg-gray-300 text-gray-800"
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
