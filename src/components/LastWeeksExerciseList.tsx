"use client";

import React, { useCallback, useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import Link from "next/link";
import { SkeletonItem } from "./SkeletonItem";

interface Exercise {
  id: string;
  name: string;
}

interface ExerciseRecordWithExercise {
  exercise_id: string;
  exercises: {
    id: string;
    name: string;
  }[];
}

const LastWeekExerciseList: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function doesn't rely on anything but is defined once
  const getDateRangeForWeek = useCallback((weeksAgo: number) => {
    const today = new Date();
    const targetDay = new Date(today);
    targetDay.setDate(today.getDate() - 7 * weeksAgo);
    const startOfDay = new Date(
      targetDay.getFullYear(),
      targetDay.getMonth(),
      targetDay.getDate()
    );
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    return { start: startOfDay.toISOString(), end: endOfDay.toISOString() };
  }, []);

  const fetchExercisesForWeek = useCallback(
    async (weeksAgo: number): Promise<boolean> => {
      const { start, end } = getDateRangeForWeek(weeksAgo);
      try {
        const { data: session, error: sessionError } =
          await supabaseClient.auth.getSession();

        if (sessionError || !session?.session) {
          setError("You must be logged in to view exercise history.");
          setLoading(false);
          return false;
        }

        const { data, error } = await supabaseClient
          .from("exercise_records")
          .select("exercise_id, exercises!inner(id, name)")
          .gte("created_at", start)
          .lte("created_at", end)
          .eq("exercises.user_id", session.session.user.id);

        if (error) {
          setError(error.message);
          setLoading(false);
          return false;
        }

        if (data && data.length > 0) {
          const uniqueExercises = Array.from(
            new Map(
              (data as ExerciseRecordWithExercise[])
                // Flatten all exercises from each record
                .flatMap((record) => record.exercises)
                // Then map each exercise to the [id, { id, name }] tuple
                .map((exercise) => [
                  exercise.id,
                  { id: exercise.id, name: exercise.name },
                ])
            ).values()
          );
          setExercises(uniqueExercises);
          setLoading(false);
          return true;
        }
      } catch (err) {
        console.error("error fetching last weeks exercises:", err);
        setError("An unexpected error occurred.");
        setLoading(false);
        return false;
      }
      return false;
    },
    [getDateRangeForWeek, setError, setLoading, setExercises]
  );

  useEffect(() => {
    // Since fetchExercisesForWeek is stable (useCallback),
    // we can safely include it in the dependency array
    const fetchExercises = async () => {
      setLoading(true);
      setError(null);

      let weeksAgo = 1;
      let recordsFound = false;

      while (!recordsFound && weeksAgo <= 52) {
        recordsFound = await fetchExercisesForWeek(weeksAgo);
        weeksAgo++;
      }

      if (!recordsFound) {
        setError("No exercise records found in the past year.");
        setLoading(false);
      }
    };
    fetchExercises();
    // Include everything that "fetchExercises" touches
  }, [fetchExercisesForWeek, setError, setLoading]);

  if (loading) {
    return (
      <div className="mt-4">
        <h3 className="text-lg font-bold text-white mb-2">
          Exercises from last{" "}
          {new Date().toLocaleDateString("en-US", { weekday: "long" })}
        </h3>
        <ul className="space-y-1">
          {/* Render a fixed number of skeleton items to mimic the list */}
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonItem key={index} />
          ))}
        </ul>
      </div>
    );
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
