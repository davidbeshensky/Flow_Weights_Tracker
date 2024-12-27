"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import SignOutButton from "./SignOutButton";
import Fuse from "fuse.js";
import Link from "next/link";
import EditExerciseName from "./EditExerciseName";

interface Exercise {
  id: string;
  name: string;
}

const ExerciseManager: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );

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

  const handleDeleteExercise = async () => {
    if (!selectedExercise) return;

    try {
      // Get the current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("You must be logged in to delete exercises.");
      }

      // Send delete request to the API
      const response = await fetch("/api/exercises/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`, // Use the token from the session
        },
        body: JSON.stringify({ exerciseId: selectedExercise.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete the exercise.");
      }

      // Update the exercises list after deletion
      setExercises((prev) =>
        prev.filter((exercise) => exercise.id !== selectedExercise.id)
      );
      setFilteredExercises((prev) =>
        prev.filter((exercise) => exercise.id !== selectedExercise.id)
      );

      // Close modals and reset state
      setMenuOpenId(null);
      setConfirmModalOpen(false);
      setSelectedExercise(null);
    } catch (err) {
      console.error("Error deleting exercise:", err);
      setError(err instanceof Error ? err.message : "Unexpected error.");
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const toggleMenu = (exerciseId: string) => {
    setMenuOpenId((prev) => (prev === exerciseId ? null : exerciseId));
  };

  const openConfirmModal = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setConfirmModalOpen(true);
    setMenuOpenId(null);
  };

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

  const handleUpdateName = (exerciseId: string, newName: string) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === exerciseId ? { ...ex, name: newName } : ex))
    );
  };

  return (
    <div className="min-h-screen flex flex-col justify-start bg-black/95 backdrop-blur-md  text-white px-4">
      <div className="mx-auto w-full max-w-2xl p-2 rounded-lg">
        <div className="mt-4 flex justify-between items-center mb-6">
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
              <div
                key={exercise.id}
                className="relative bg-gray-800 rounded-md p-4"
              >
                <Link
                  href={`/exercises/${exercise.id}?name=${encodeURIComponent(
                    exercise.name
                  )}`}
                  className="block text-white mr-4"
                >
                  {exercise.name}
                </Link>
                {/* Three-dot menu */}
                <button
                  onClick={() => toggleMenu(exercise.id)}
                  className="absolute text-2xl font-extrabold top-3 right-4 text-gray-400 hover:text-white"
                >
                  &#x22EE;
                </button>
                {menuOpenId === exercise.id && (
                  <div className="absolute top-8 right-4 z-10 bg-gray-700 p-2 rounded-md shadow-lg">
                    {/* Edit Exercise Name Component */}
                      <EditExerciseName
                        exerciseId={exercise.id}
                        currentName={exercise.name}
                        onUpdateName={(newName) => {
                          handleUpdateName(exercise.id, newName);
                        }}
                        buttonType="text"
                      />

                    {/* Delete Exercise Button */}
                    <button
                      onClick={() => openConfirmModal(exercise)}
                      className="block text-red-500 hover:text-red-700"
                    >
                      Delete Exercise
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400">
              No exercises found. Start by adding one!
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModalOpen && selectedExercise && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-md max-w-sm w-full text-center">
            <h2 className="text-xl font-bold text-white mb-4">
              Confirm Delete
            </h2>
            <p className="text-gray-400 mb-4">
              Deleting <strong>{selectedExercise.name}</strong> will remove all
              associated records. This action cannot be undone.
            </p>
            <input
              type="text"
              placeholder={`Type "DELETE" to confirm`}
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none mb-4"
            />
            <button
              onClick={handleDeleteExercise}
              disabled={confirmationInput !== "DELETE"}
              className={`w-full py-3 rounded-md ${
                confirmationInput === "DELETE"
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              Confirm Delete
            </button>
            <button
              onClick={() => setConfirmModalOpen(false)}
              className="mt-4 w-full py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseManager;
