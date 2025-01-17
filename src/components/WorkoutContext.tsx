"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Type Definitions
interface WorkoutExercise {
  exercise_id: string;
  sets: { reps: number; weight: number }[];
}

interface WorkoutContextType {
  workoutStarted: boolean;
  elapsedTime: string;
  workoutExercises: WorkoutExercise[];
  addExerciseToWorkout: (exercise: WorkoutExercise) => void;
  startWorkout: () => void;
  endWorkout: () => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);

  // LocalStorage Keys
  const workoutStartedKey = "workoutStarted";
  const startTimeKey = "startTime";
  const workoutExercisesKey = "workoutExercises";

  // Start the workout
  const startWorkout = () => {
    const now = new Date();
    setWorkoutStarted(true);
    setStartTime(now);
    setWorkoutExercises([]);

    // Persist state to localStorage
    localStorage.setItem(workoutStartedKey, "true");
    localStorage.setItem(startTimeKey, now.toISOString());
    localStorage.setItem(workoutExercisesKey, JSON.stringify([]));
  };

  // End the workout
  const endWorkout = () => {
    console.log("Workout Ended!");
    console.log("Workout Exercises:", workoutExercises);

    setWorkoutStarted(false);
    setStartTime(null);
    setElapsedTime("00:00:00");
    setWorkoutExercises([]);

    // Clear state from localStorage
    localStorage.removeItem(workoutStartedKey);
    localStorage.removeItem(startTimeKey);
    localStorage.removeItem(workoutExercisesKey);
  };

  // Add exercise to the workout
  const addExerciseToWorkout = (exercise: WorkoutExercise) => {
    if (!workoutStarted) {
      console.warn("Cannot add exercises when workout is not started!");
      return;
    }

    setWorkoutExercises((prev) => {
      const existingIndex = prev.findIndex(
        (e) => e.exercise_id === exercise.exercise_id
      );

      if (existingIndex !== -1) {
        // Merge sets with an existing exercise
        const updatedExercise = {
          ...prev[existingIndex],
          sets: [...prev[existingIndex].sets, ...exercise.sets],
        };

        const updatedExercises = [
          ...prev.slice(0, existingIndex),
          updatedExercise,
          ...prev.slice(existingIndex + 1),
        ];

        localStorage.setItem(workoutExercisesKey, JSON.stringify(updatedExercises));
        return updatedExercises;
      }

      // Add as a new exercise
      const updatedExercises = [...prev, exercise];
      localStorage.setItem(workoutExercisesKey, JSON.stringify(updatedExercises));
      return updatedExercises;
    });
  };

  // Restore state from localStorage on mount
  useEffect(() => {
    const storedWorkoutStarted =
      localStorage.getItem(workoutStartedKey) === "true";
    const storedStartTime = localStorage.getItem(startTimeKey);
    const storedWorkoutExercises = localStorage.getItem(workoutExercisesKey);

    if (storedWorkoutStarted && storedStartTime) {
      setWorkoutStarted(true);
      setStartTime(new Date(storedStartTime));
    }

    if (storedWorkoutExercises) {
      setWorkoutExercises(JSON.parse(storedWorkoutExercises));
    }
  }, []);

  // Update elapsed time while the workout is active
  useEffect(() => {
    if (!workoutStarted || !startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);

      const hours = String(Math.floor(diff / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
      const seconds = String(diff % 60).padStart(2, "0");

      setElapsedTime(`${hours}:${minutes}:${seconds}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [workoutStarted, startTime]);

  // Debugging: Log `workoutStarted` and `workoutExercises` whenever they change
  useEffect(() => {
    console.log("workoutStarted:", workoutStarted);
  }, [workoutStarted]);

  useEffect(() => {
    console.log("workoutExercises:", workoutExercises);
  }, [workoutExercises]);

  return (
    <WorkoutContext.Provider
      value={{
        workoutStarted,
        workoutExercises,
        addExerciseToWorkout,
        startWorkout,
        endWorkout,
        elapsedTime
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkoutContext = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error("useWorkoutContext must be used within a WorkoutProvider");
  }
  return context;
};
