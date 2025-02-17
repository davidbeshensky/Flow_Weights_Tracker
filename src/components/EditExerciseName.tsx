"use client";

import React, { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { getItem, setItem } from "@/lib/localStorageUtils";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

interface EditExerciseNameProps {
  exerciseId: string;
  currentName: string;
  onUpdateName: (newName: string) => void;
  onEditStateChange?: (isEditing: boolean) => void; // Notify parent about editing state
  buttonType: "icon" | "text"; // Button type to render
}

const EditExerciseName: React.FC<EditExerciseNameProps> = ({
  exerciseId,
  currentName,
  onUpdateName,
  onEditStateChange,
  buttonType,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);

  const handleEditName = async () => {
    if (!newName.trim()) {
      setError("Exercise name cannot be empty.");
      return;
    }

    try {
      // Update in Supabase
      const { error } = await supabaseClient
        .from("exercises")
        .update({ name: newName.trim() })
        .eq("id", exerciseId);

      if (error) {
        setError("Failed to update exercise name.");
        return;
      }

      // Update specific local storage key for this exercise
      const storedData = localStorage.getItem(`${exerciseId}_recentSets`);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        parsedData.exerciseName = newName.trim(); // Update the name
        localStorage.setItem(
          `${exerciseId}_recentSets`,
          JSON.stringify(parsedData)
        );
      }

      // Update localStorage cache
      const cachedExercises = await getItem("exercises");
      if (cachedExercises) {
        const updatedExercises = cachedExercises.map(
          (exercise: { id: string; name: string }) =>
            exercise.id === exerciseId
              ? { ...exercise, name: newName.trim() }
              : exercise
        );
        await setItem("exercises", updatedExercises);
      }

      setIsEditing(false);
      setError(null);
      onUpdateName(newName.trim());
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error("Error updating exercise name:", err);
    }
  };

  useEffect(() => {
    // Synchronize newName with currentName whenever currentName changes
    setNewName(currentName);
  }, [currentName]);

  useEffect(() => {
    // Notify parent about editing state
    onEditStateChange?.(isEditing);
  }, [isEditing, onEditStateChange]);

  return (
    <div>
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="p-2 w-3/6 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-blue-600"
          />
          <button
            onClick={handleEditName}
            className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700"
          >
            <CheckIcon />
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-500"
          >
            <CloseIcon />
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setIsEditing(true)}
            className={`${
              buttonType === "icon"
                ? "p-2 bg-transparent text-white hover:bg-gray-800 rounded-md"
                : "py-2 px-4 bg-gray-700 text-white rounded-md hover:bg-gray-800"
            }`}
          >
            {buttonType === "icon" ? <EditIcon /> : "Edit Name"}
          </button>
        </div>
      )}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default EditExerciseName;
