"use client";

import React, { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import Link from "next/link";

interface Exercise {
  id: string;
  name: string;
}

interface ExerciseRecordWithExercise {
  exercise_id: string;
  exercises: {
    id: string;
    name: string;
  };
}

const LastWeekExerciseList: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculate last week's same day
  const getLastWeekDateRange = () => {
    const today = new Date();
    const lastWeekSameDay = new Date(today);
    lastWeekSameDay.setDate(today.getDate() - 7); // Go back 7 days
    const startOfDay = new Date(
      lastWeekSameDay.getFullYear(),
      lastWeekSameDay.getMonth(),
      lastWeekSameDay.getDate()
    );
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    return { start: startOfDay.toISOString(), end: endOfDay.toISOString() };
  };

  useEffect(() => {
    const fetchLastWeekExercises = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: session, error: sessionError } =
          await supabaseClient.auth.getSession();

        if (sessionError || !session?.session) {
          setError("You must be logged in to view exercise history.");
          setLoading(false);
          return;
        }

        const { start, end } = getLastWeekDateRange();
        console.log("Fetching records for date range:", { start, end });

        // Query exercise records and join with exercises
        const { data, error } = await supabaseClient
          .from("exercise_records")
          .select("exercise_id, exercises!inner(id, name)")
          .gte("created_at", start)
          .lte("created_at", end)
          .eq("exercises.user_id", session.session.user.id); // Filter by user_id from exercises

        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }

        if (!data) {
          setExercises([]);
          setLoading(false);
          return;
        }

        // Map data to extract unique exercise names and ids
        const uniqueExercises = Array.from(
          new Map(
            (data as unknown as ExerciseRecordWithExercise[]).map((record) => [
              record.exercise_id,
              { id: record.exercises.id, name: record.exercises.name },
            ])
          ).values()
        );

        setExercises(uniqueExercises);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching last week's exercises:", err);
        setError("An unexpected error occurred.");
        setLoading(false);
      }
    };

    fetchLastWeekExercises();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-400">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="mt-4">
      {exercises.length > 0 ? (
        <div>
          <h3 className="text-lg font-bold text-white mb-2">
            Exercises from last{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
            })}
          </h3>
          <ul className="space-y-1">
            {exercises.map((exercise) => (
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
      ) : (
        <p className="text-center text-gray-400">
          No exercise data from last{" "}
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
          })}
        </p>
      )}
    </div>
  );
};

export default LastWeekExerciseList;
