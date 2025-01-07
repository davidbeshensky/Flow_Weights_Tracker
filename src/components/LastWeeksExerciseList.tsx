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
  const [loading, setLoading] = useState(true);

  // Helper function to calculate date ranges
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

  const checkForRecords = useCallback(async (): Promise<boolean> => {
    try {
      const { data: session, error: sessionError } =
        await supabaseClient.auth.getSession();

      if (sessionError || !session?.session) {
        setLoading(false);
        console.error("No valid session found.");
        return false;
      }

      // Loop through all days of the current week
      const today = new Date();
      for (let daysAgo = 0; daysAgo < 7; daysAgo++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() - daysAgo);
        const startOfDay = new Date(
          targetDate.getFullYear(),
          targetDate.getMonth(),
          targetDate.getDate()
        );
        const endOfDay = new Date(startOfDay);
        endOfDay.setHours(23, 59, 59, 999);

        const { data, error } = await supabaseClient
          .from("exercise_records")
          .select("id, exercises!inner(user_id)") // Join with exercises table
          .gte("created_at", startOfDay.toISOString())
          .lte("created_at", endOfDay.toISOString())
          .eq("exercises.user_id", session.session.user.id)
          .limit(1); // Only fetch a single record to check existence

        if (error) {
          console.error(
            `Error checking records for ${targetDate}:`,
            error.message
          );
          continue; // Skip this day if there's an error
        }

        if (data && data.length > 0) {
          console.log(`Records exist for the user on ${targetDate}:`, data);
          return true; // Records found for this day
        }
      }

      console.log("No records found for any day this week.");
      setLoading(false);
      return false; // No records found for the entire week
    } catch (err) {
      console.error("Error checking for records:", err);
      setLoading(false);
      return false;
    }
  }, []);

  const fetchExercisesForWeek = useCallback(
    async (weeksAgo: number): Promise<Exercise[]> => {
      const { start, end } = getDateRangeForWeek(weeksAgo);

      try {
        const { data: session, error: sessionError } =
          await supabaseClient.auth.getSession();

        if (sessionError || !session?.session) {
          console.error("No valid session found.");
          return [];
        }

        const { data, error } = await supabaseClient
          .from("exercise_records")
          .select("exercise_id, exercises!inner(id, name)")
          .gte("created_at", start)
          .lte("created_at", end)
          .eq("exercises.user_id", session.session.user.id);

        if (error) {
          console.error("Error fetching data:", error.message);
          return [];
        }

        if (!data || data.length === 0) {
          console.log("No exercises found for this period.");
          return [];
        }

        // Ensure `exercises` is treated as an array
        const deduplicatedExercises: Exercise[] = [];
        const uniqueExercises = new Set<string>();

        (data as ExerciseRecordWithExercise[]).forEach((record) => {
          // Handle cases where `exercises` is not an array
          const exercisesArray = Array.isArray(record.exercises)
            ? record.exercises
            : [record.exercises];

          exercisesArray.forEach((exercise) => {
            if (!uniqueExercises.has(exercise.id)) {
              uniqueExercises.add(exercise.id);
              deduplicatedExercises.push({
                id: exercise.id,
                name: exercise.name,
              });
            }
          });
        });

        return deduplicatedExercises;
      } catch (err) {
        console.error("Error fetching exercises:", err);
        return [];
      }
    },
    [getDateRangeForWeek]
  );

  // Main effect to fetch data
  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);

      const hasRecords = await checkForRecords(); // Async operation
      if (!hasRecords) {
        setLoading(false);
        return;
      }

      // Fetch weekly exercises
      let weeksAgo = 1;
      let allExercises: Exercise[] = [];
      let recordsFound = false;

      while (!recordsFound && weeksAgo <= 52) {
        const weeklyExercises = await fetchExercisesForWeek(weeksAgo);
        if (weeklyExercises.length > 0) {
          allExercises = weeklyExercises;
          recordsFound = true;
        } else {
          weeksAgo++;
        }
      }

      setExercises(allExercises); // Update state after async operation
      setLoading(false);
    };

    fetchExercises(); // Ensure async state updates are in effect
  }, [checkForRecords, fetchExercisesForWeek]);

  // Loading state with skeleton loader
  if (loading) {
    return (
      <div className="mt-4">
        <h3 className="text-lg font-bold text-white mb-2">
          Exercises from last{" "}
          {new Date().toLocaleDateString("en-US", { weekday: "long" })}
        </h3>
        <ul className="space-y-1">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonItem key={index} />
          ))}
        </ul>
      </div>
    );
  }

  // Show a friendly message if no exercises exist
  if (exercises.length === 0) {
    return (
      <div className="mt-4 text-center text-gray-400">
        <h3 className="text-lg font-bold text-white mb-2">Welcome!</h3>
        <p>
          You don&apos;t have any exercise records yet. Start tracking your
          workouts today!
        </p>
      </div>
    );
  }

  // Render exercises
  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold text-white mb-2">
        Exercises from last{" "}
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
        })}
      </h3>
      <ul className="space-y-1">
        {exercises.map((exercise, index) => (
          <li key={`${exercise.id}`}>
            {/* Use a unique key */}
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

export default LastWeekExerciseList;
