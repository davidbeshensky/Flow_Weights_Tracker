import React, { useEffect, useState, useCallback } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import Link from "next/link";

interface Exercise {
  id: string;
  name: string;
}

const ExerciseList: React.FC = () => {
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [recentExercises, setRecentExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecentOnly, setShowRecentOnly] = useState(false);

  const getStorageKey = (userId: string) => `exercises_${userId}`;

  // Fetch recent records for exercises
  const fetchRecentRecords = useCallback(async (exercises: Exercise[]) => {
    try {
      const { data: session } = await supabaseClient.auth.getSession();
      if (!session?.session) return;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: records, error } = await supabaseClient
        .from("exercise_records")
        .select("exercise_id, created_at")
        .in(
          "exercise_id",
          exercises.map((exercise) => exercise.id)
        );

      if (error) {
        console.error("Error fetching records:", error.message);
        return;
      }

      const recentIds = new Set(
        records
          ?.filter((record) => new Date(record.created_at) >= oneWeekAgo)
          .map((record) => record.exercise_id)
      );

      const recentExercises = exercises.filter((exercise) =>
        recentIds.has(exercise.id)
      );

      setRecentExercises(recentExercises);
    } catch (err) {
      console.error("Error fetching recent records:", err);
    }
  }, []);

  // Fetch exercises from Supabase
  const fetchExercises = useCallback(async () => {
    setLoading(true);

    try {
      const { data: session, error: sessionError } =
        await supabaseClient.auth.getSession();

      if (sessionError || !session?.session) {
        console.error("No valid session found.");
        setLoading(false);
        return;
      }

      const userId = session.session.user.id;
      const { data: exerciseData, error: exerciseError } = await supabaseClient
        .from("exercises")
        .select("id, name")
        .eq("user_id", userId);

      if (exerciseError) {
        console.error("Error fetching exercises:", exerciseError.message);
        setLoading(false);
        return;
      }

      if (exerciseData) {
        setAllExercises(exerciseData);
        localStorage.setItem(getStorageKey(userId), JSON.stringify(exerciseData));
        fetchRecentRecords(exerciseData);
      }
    } catch (err) {
      console.error("Error fetching exercises:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchRecentRecords]);

  // Load exercises from localStorage
  useEffect(() => {
    const loadExercises = async () => {
      const { data: session } = await supabaseClient.auth.getSession();
      if (!session?.session) {
        setAllExercises([]);
        setRecentExercises([]);
        return;
      }

      const userId = session.session.user.id;
      const cachedExercises = localStorage.getItem(getStorageKey(userId));

      if (cachedExercises) {
        const parsedExercises = JSON.parse(cachedExercises);
        setAllExercises(parsedExercises);
        setLoading(false);
        fetchRecentRecords(parsedExercises);
      } else {
        fetchExercises();
      }
    };

    loadExercises();
  }, [fetchExercises, fetchRecentRecords]);

  const displayedExercises = showRecentOnly ? recentExercises : allExercises;

  if (loading) {
    return (
      <div className="mt-4">
        <h3 className="text-lg font-bold text-white mb-2">
          Loading exercises...
        </h3>
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (allExercises.length === 0) {
    return (
      <div className="mt-4 text-center text-gray-400">
        <h3 className="text-lg font-bold text-white mb-2">
          No Exercises Found
        </h3>
        <p>Start tracking your workouts to see them here!</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">Your Exercises</h3>
        <button
          onClick={() => setShowRecentOnly((prev) => !prev)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {showRecentOnly ? "Show All" : "Show Recent"}
        </button>
      </div>
      <ul className="space-y-1">
        {displayedExercises.map((exercise) => (
          <li key={exercise.id}>
            <Link
              href={`/exercises/${exercise.id}`}
              className="block bg-gray-700 rounded-md py-1 my-1 text-white hover:text-blue-500"
            >
              <div className="px-2">{exercise.name}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExerciseList;
