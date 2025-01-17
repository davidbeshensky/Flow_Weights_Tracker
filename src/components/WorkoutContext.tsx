"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Type Definitions
interface WorkoutContextType {
  workoutStarted: boolean;
  startTime: Date | null;
  elapsedTime: string;
  startWorkout: () => void;
  endWorkout: () => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");

  // LocalStorage Keys
  const workoutStartedKey = "workoutStarted";
  const startTimeKey = "startTime";

  // Start the workout
  const startWorkout = () => {
    const now = new Date();
    setWorkoutStarted(true);
    setStartTime(now);

    // Persist state to localStorage
    localStorage.setItem(workoutStartedKey, "true");
    localStorage.setItem(startTimeKey, now.toISOString());
  };

  // End the workout
  const endWorkout = () => {
    setWorkoutStarted(false);
    setStartTime(null);
    setElapsedTime("00:00:00");

    // Clear state from localStorage
    localStorage.removeItem(workoutStartedKey);
    localStorage.removeItem(startTimeKey);
  };

  // Restore state from localStorage on mount
  useEffect(() => {
    const storedWorkoutStarted = localStorage.getItem(workoutStartedKey) === "true";
    const storedStartTime = localStorage.getItem(startTimeKey);

    if (storedWorkoutStarted && storedStartTime) {
      setWorkoutStarted(true);
      setStartTime(new Date(storedStartTime));
    }
  }, []);

  // Update elapsed time while the workout is active
  useEffect(() => {
    if (!workoutStarted || !startTime) {
      return;
    }

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

  // Debugging: Log `workoutStarted` whenever it changes
  useEffect(() => {
    console.log("workoutStarted:", workoutStarted);
  }, [workoutStarted]);

  return (
    <WorkoutContext.Provider
      value={{
        workoutStarted,
        startTime,
        elapsedTime,
        startWorkout,
        endWorkout,
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
