"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import SignOutButton from "./SignOutButton";
import Fuse from "fuse.js";

interface Exercise {
  id: string;
  name: string;
}

const ExerciseManager: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Fetch exercises for the authenticated user
  const fetchExercises = useCallback(async () => {
    try {
      setError(null);

      const { data: session, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !session?.session) {
        setError("You must be logged in to view exercises.");
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
      setFilteredExercises(data || []);
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error("error:", err);
    }
  }, []);

  const handleSearch = (query: string) => {
    setInputValue(query);

    if (!query.trim()) {
      setFilteredExercises(exercises); //shows all if input is
      return;
    }

    const fuse = new Fuse(exercises, { keys: ["name"], threshold: 0.4 });
    const results = fuse.search(query).map((result) => result.item);
    setFilteredExercises(results);
  };

  // Add a new exercise for the authenticated user
  const handleAddExercise = async () => {
    setError(null);

    if (!inputValue.trim()) {
      setError("Exercise name cannot be empty.");
      return;
    }

    const existingExercise = exercises.some(
      (exercise) =>
        exercise.name.toLowerCase() === inputValue.trim().toLowerCase()
    );

    if (existingExercise) {
      setError("This exercise already exists");
      return;
    }

    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      setError("You must be logged in to add exercises.");
      return;
    }

    const { error } = await supabase.from("exercises").insert({
      user_id: session.session.user.id,
      name: inputValue.trim(),
    });

    if (error) {
      setError(error.message);
    } else {
      setInputValue("");
      fetchExercises(); // Refresh the list of exercises
    }
  };

  // Navigate to the record creation page for the clicked exercise
  const handleExerciseClick = (exerciseId: string, exerciseName: string) => {
    router.push(
      `/exercises/${exerciseId}?name=${encodeURIComponent(exerciseName)}`
    );
  };

  // Fetch exercises on component mount
  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const isAddButtonHighlighted =
    inputValue.trim() &&
    !exercises.some(
      (exercise) =>
        exercise.name.toLowerCase() === inputValue.trim().toLowerCase()
    );

  return (
    <div className="animated-gradient min-h-screen flex flex-col justify-start bg-gradient-to-br from-purple-900 via-green-700 to-black text-white">
      <div className="w-full max-w-2xl px-6 py-4 bg-black bg-opacity-10 shadow-lg rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl text-pretty font-bold">Get After It. Record Results.</h2>
          <SignOutButton /> {/* Using the SignOutButton component */}
        </div>
        {/* Input for adding a new exercise/searching */}
        <div className="flex items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Search or add a new exercise"
            value={inputValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 p-3 rounded-md bg-gray-800 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleAddExercise}
            disabled={!isAddButtonHighlighted}
            className={`py-3 px-6 rounded-lg shadow-md ${
              isAddButtonHighlighted
                ? "bg-gradient-to-r from-green-800 to-purple-800 text-white"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            Add
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-6">{error}</p>}

        {/* List of existing exercises */}
        <ul className="space-y-3">
          {filteredExercises.length > 0 ? (
            filteredExercises.map((exercise) => (
              <li
                key={exercise.id}
                className="p-4 bg-gray-800 rounded-lg hover:bg-purple-700 cursor-pointer"
                onClick={() => handleExerciseClick(exercise.id, exercise.name)}
              >
                {exercise.name}
              </li>
            ))
          ) : (
            <li className="text-center text-gray-400">
              No exercises found. Start by adding one!
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ExerciseManager;
