"use client";

import React, { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { getItem, setItem } from "@/lib/localStorageUtils";
import Fuse from "fuse.js";

type Exercise = {
  exercise_id: string;
  name: string;
  order?: number; // Optional, as it may not always be used
};

interface ExerciseSearchBarProps {
  onAddExercise: (exercise: Exercise) => void;
}

const ExerciseSearchBarPreset: React.FC<ExerciseSearchBarProps> = ({
  onAddExercise,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load exercises from localStorage or fetch from the database
  useEffect(() => {
    const loadExercises = async () => {
      try {
        const { data: session, error: sessionError } =
          await supabaseClient.auth.getSession();

        if (sessionError || !session?.session) {
          setError("You must be logged in to search exercises.");
          return;
        }

        const userId = session.session.user.id;
        const storageKey = `exercises_${userId}`;

        // Attempt to fetch exercises from localStorage
        const cachedExercises = await getItem(storageKey);
        if (cachedExercises && cachedExercises.length > 0) {
          setExercises(cachedExercises);
        } else {
          // Fetch exercises from the database
          const { data, error } = await supabaseClient
            .from("exercises")
            .select("id, name")
            .eq("user_id", userId);

          if (error) {
            setError(error.message);
            return;
          }

          const exercisesData = data || [];
          // Map the data to match the Exercise type
          const transformedExercises = exercisesData.map(
            (exercise: { id: string; name: string }) => ({
              exercise_id: exercise.id, // Map `id` to `exercise_id`
              name: exercise.name,
            })
          );

          // Cache exercises in localStorage
          setExercises(transformedExercises);
          await setItem(storageKey, transformedExercises);
        }
      } catch (err) {
        setError("An unexpected error occurred.");
        console.error("Error fetching exercises:", err);
      }
    };

    loadExercises();
  }, []);

  // Handle search
  const handleSearch = (query: string) => {
    setInputValue(query);

    if (!query.trim()) {
      setFilteredExercises([]); // Clear results if input is empty
      return;
    }

    const fuse = new Fuse(exercises, { keys: ["name"], threshold: 0.4 });
    const results = fuse.search(query).map((result) => result.item);
    setFilteredExercises(results);
  };

  // Handle exercise creation
  const handleCreateExercise = async () => {
    if (!inputValue.trim()) return;

    try {
      const { data: session } = await supabaseClient.auth.getSession();
      if (!session?.session) {
        setError("You must be logged in to create exercises.");
        return;
      }

      const userId = session.session.user.id;

      const { data, error } = await supabaseClient
        .from("exercises")
        .insert({
          user_id: userId,
          name: inputValue.trim(),
        })
        .select(); // Return created exercise

      if (error) {
        setError(error.message);
        return;
      }

      if (data && data[0]) {
        // Update local cache
        const newExercise = { exercise_id: data[0].id, name: data[0].name };
        const updatedExercises = [...exercises, newExercise];
        const storageKey = `exercises_${userId}`;

        setExercises(updatedExercises);
        await setItem(storageKey, updatedExercises);

        // Add to the preset immediately
        onAddExercise(newExercise);
        setInputValue("");
        setFilteredExercises([]);
      }
    } catch (err) {
      console.error("Error creating exercise:", err);
      setError("Failed to create exercise.");
    }
  };

  return (
    <div className="relative w-full mx-auto">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search exercises"
        value={inputValue}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full rounded-md px-4 py-2 bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
      />

      {/* Dropdown */}
      <div className="absolute rounded-md w-full bg-gray-800 mt-1 shadow-lg z-10">
        {filteredExercises.length > 0
          ? filteredExercises.map((exercise) => (
              <button
                key={exercise.exercise_id}
                onClick={() => {
                  onAddExercise(exercise); // Add to preset
                  setInputValue(""); // Clear input value
                  setFilteredExercises([]); // Clear dropdown
                }}
                className="block rounded-md px-4 py-2 hover:bg-gray-700 text-white text-left w-full"
              >
                {exercise.name}
              </button>
            ))
          : inputValue.trim() && (
              <div className="px-4 py-2 text-gray-400">No matches found.</div>
            )}
        {inputValue.trim() &&
          !exercises.some(
            (exercise) =>
              exercise.name.toLowerCase() === inputValue.trim().toLowerCase()
          ) && (
            <button
              onClick={handleCreateExercise}
              className="w-full px-4 py-2 text-left bg-blue-600 text-white hover:bg-blue-700"
            >
              Create &quot;{inputValue.trim()}&quot; Exercise
            </button>
          )}
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default ExerciseSearchBarPreset;
