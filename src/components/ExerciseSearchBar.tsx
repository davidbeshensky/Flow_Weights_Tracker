"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Fuse from "fuse.js";
import Link from "next/link";

interface Exercise {
  id: string;
  name: string;
}

const ExerciseSearchBar: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch all exercises on mount
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const { data: session, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError || !session?.session) {
          setError("You must be logged in to search exercises.");
          return;
        }

        const { data, error } = await supabase
          .from("exercises")
          .select("id, name")
          .eq("user_id", session.session.user.id);

        if (error) {
          setError(error.message);
          return;
        }

        setExercises(data || []);
      } catch (err) {
        setError("An unexpected error occurred.");
        console.error("Error fetching exercises:", err);
      }
    };

    fetchExercises();
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
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        setError("You must be logged in to create exercises.");
        return;
      }

      const { data, error } = await supabase
        .from("exercises")
        .insert({
          user_id: session.session.user.id,
          name: inputValue.trim(),
        })
        .select(); // Return created exercise

      if (error) {
        setError(error.message);
        return;
      }

      // Redirect to the new exercise or refresh
      if (data && data[0]) {
        window.location.href = `/exercises/${data[0].id}?name=${encodeURIComponent(
          data[0].name
        )}`;
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
        {filteredExercises.length > 0 ? (
          filteredExercises.map((exercise) => (
            <Link
              key={exercise.id}
              href={`/exercises/${exercise.id}?name=${encodeURIComponent(
                exercise.name
              )}`}
              className="block rounded-md px-4 py-2 hover:bg-gray-700 text-white"
            >
              {exercise.name}
            </Link>
          ))
        ) : inputValue.trim() && (
          <div className="px-4 py-2 text-gray-400">
            No matches found.
          </div>
        )}
        {inputValue.trim() && !exercises.some(
          (exercise) =>
            exercise.name.toLowerCase() === inputValue.trim().toLowerCase()
        ) && (
          <button
            onClick={handleCreateExercise}
            className="w-full px-4 py-2 text-left bg-blue-600 text-white hover:bg-blue-700"
          >
            Create `&quot;`{inputValue.trim()}`&quot;` Exercise
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default ExerciseSearchBar;
