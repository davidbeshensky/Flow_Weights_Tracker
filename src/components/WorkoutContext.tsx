"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Type Definitions
interface ExerciseRecord {
  exercise_record_id?: string; // Optional during local tracking
  exercise_id: string;
  reps: number[];
  weights: number[];
  timestamp: Date;
}

interface WorkoutContextType {
  workoutStarted: boolean;
  startTime: Date | null;
  elapsedTime: string;
  exercises: ExerciseRecord[];
  addExerciseRecord: (record: AddExerciseRecordInput) => void;
  clearExerciseRecords: () => void;
  startWorkout: () => void;
  endWorkout: () => void;
  showSummary: boolean;
  setShowSummary: (value: boolean) => void;
}

// Input type for adding exercise records
interface AddExerciseRecordInput {
  exercise_id: string;
  reps: number;
  weight: number;
  timestamp?: Date; // Optional, since context can add it if not provided
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");
  const [exercises, setExercises] = useState<ExerciseRecord[]>([]);
  const [showSummary, setShowSummary] = useState(false); // State for managing the workout summary visibility

  // Starts the workout session
  const startWorkout = () => {
    const now = new Date();
    setWorkoutStarted(true);
    setStartTime(now);
    setExercises([]); // Clear any leftover records
    setShowSummary(false); // Ensure the summary is hidden at the start
    localStorage.setItem("workoutStarted", "true");
    localStorage.setItem("startTime", now.toISOString());
  };

  // Ends the workout session
  const endWorkout = () => {
    setWorkoutStarted(false);
    setStartTime(null);
    localStorage.removeItem("workoutStarted");
    localStorage.removeItem("startTime");
  };

  const addExerciseRecord = (record: AddExerciseRecordInput) => {
    setExercises((prev) => {
      const existingRecordIndex = prev.findIndex(
        (r) => r.exercise_id === record.exercise_id
      );

      const timestamp = record.timestamp || new Date(); // Default to now

      if (existingRecordIndex !== -1) {
        // Update existing record
        const updatedRecord = { ...prev[existingRecordIndex] };
        updatedRecord.reps.push(record.reps);
        updatedRecord.weights.push(record.weight);

        return [
          ...prev.slice(0, existingRecordIndex),
          updatedRecord,
          ...prev.slice(existingRecordIndex + 1),
        ];
      }

      // Add a new record
      return [
        ...prev,
        {
          ...record,
          reps: [record.reps],
          weights: [record.weight],
          timestamp,
        },
      ];
    });
  };

  // Clears all exercise records (e.g., after saving or aborting a workout)
  const clearExerciseRecords = () => {
    setExercises([]);
  };

  // Calculates the elapsed time during the workout
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (workoutStarted && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);

        const hours = String(Math.floor(diff / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
        const seconds = String(diff % 60).padStart(2, "0");

        setElapsedTime(`${hours}:${minutes}:${seconds}`);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [workoutStarted, startTime]);

  // Restores state from localStorage (in case of page reload)
  useEffect(() => {
    const storedWorkoutStarted = localStorage.getItem("workoutStarted");
    const storedStartTime = localStorage.getItem("startTime");

    if (storedWorkoutStarted === "true" && storedStartTime) {
      setWorkoutStarted(true);
      setStartTime(new Date(storedStartTime));
    }
  }, []);

  return (
    <WorkoutContext.Provider
      value={{
        workoutStarted,
        startTime,
        elapsedTime,
        exercises,
        addExerciseRecord,
        clearExerciseRecords,
        startWorkout,
        endWorkout,
        showSummary,
        setShowSummary,
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
