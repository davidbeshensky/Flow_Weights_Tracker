import React, { useEffect, useState, useCallback } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import Link from "next/link";

interface Exercise {
  id: string;
  name: string;
}

const UserExerciseList: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("isExerciseListMinimized") === "true";
    }
    return false;
  });

  const fetchUserExercises = useCallback(async () => {
    setLoading(true);
    try {
      const { data: session } = await supabaseClient.auth.getSession();
      if (!session?.session) {
        console.error("No valid session found.");
        return;
      }

      const userId = session.session.user.id;

      const { data: exerciseData, error } = await supabaseClient
        .from("exercises")
        .select("id, name")
        .eq("user_id", userId);

      if (error) throw error;
      setExercises(exerciseData || []);
    } catch (err) {
      console.error("Error fetching exercises:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserExercises();
  }, [fetchUserExercises]);

  const toggleMinimize = () => {
    setIsMinimized((prev) => {
      const newState = !prev;
      localStorage.setItem("isExerciseListMinimized", newState.toString());
      return newState;
    });
  };

  if (loading) {
    return <p className="text-gray-400">Loading Exercises...</p>;
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">Your Exercises</h3>
        <button
          onClick={toggleMinimize}
          className="bg-gray-600 text-white rounded-md px-2 py-1 hover:bg-gray-700"
        >
          {isMinimized ? "▶" : "▼"}
        </button>
      </div>
      {!isMinimized && (
        <ul className="space-y-2">
          {exercises.map((exercise) => (
            <li key={exercise.id}>
              <Link
                href={`/exercises/${exercise.id}`}
                className="block bg-gray-700 rounded-md py-2 px-4 text-white hover:text-blue-500 hover:bg-gray-600"
              >
                {exercise.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserExerciseList;
