"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import SignOutButton from "./SignOutButton";
import Fuse from "fuse.js";
import Link from "next/link";

interface Exercise {
  id: string;
  name: string;
}

const ExerciseManager: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      setFilteredExercises(exercises); // Shows all exercises if input is empty
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the page from reloading
    handleAddExercise();
  };

  return (
    <div className="min-h-screen flex flex-col justify-start bg-black/95 backdrop-blur-md  text-white px-6">
      <div className="mx-auto w-full max-w-2xl p-2 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            Get After It. Record Results.
          </h2>
          <SignOutButton />
        </div>

        {/* Input for adding a new exercise/searching */}
        <form className="flex items-center gap-4 mb-6" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Search or add a new exercise"
            value={inputValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 p-3 rounded-md bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            type="submit"
            disabled={!isAddButtonHighlighted}
            className={`py-3 px-6 rounded-md shadow-md transition duration-300 ${
              isAddButtonHighlighted
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            Add
          </button>
        </form>

        {error && <p className="text-red-500 text-sm mb-6">{error}</p>}

        {/* List of existing exercises */}
        <div className="space-y-3">
          {filteredExercises.length > 0 ? (
            filteredExercises.map((exercise) => (
              <Link
                key={exercise.id}
                href={`/exercises/${exercise.id}?name=${encodeURIComponent(
                  exercise.name
                )}`}
                className="block p-4 bg-gray-800 rounded-md hover:bg-blue-700 transition duration-300"
              >
                {exercise.name}
              </Link>
            ))
          ) : (
            <div className="text-center text-gray-400">
              No exercises found. Start by adding one!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseManager;
