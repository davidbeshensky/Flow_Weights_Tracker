"use client";

import React from "react";

import HamburgerMenu from "./HamburgerMenu";
import ExerciseSearchBar from "./ExerciseSearchBar";
import LastWeekExerciseList from "./LastWeeksExerciseList";

const ExerciseManager: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-start bg-black/95 backdrop-blur-md text-white px-4">
      <div className="mx-auto w-full max-w-2xl p-2 rounded-lg">
        <div className="mt-4 flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-white">
            Get After It. Record Results.
          </h2>
          <div className="relative">
            <HamburgerMenu />
          </div>
        </div>
        <ExerciseSearchBar />
        <LastWeekExerciseList />
      </div>
    </div>
  );
};

export default ExerciseManager;
