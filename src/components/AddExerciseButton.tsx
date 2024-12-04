"use client";
import React from "react";

interface AddExerciseButtonProps {
  onClick: () => void;
}

const AddExerciseButton: React.FC<AddExerciseButtonProps> = ({ onClick }) => {
  return (
    <div className="flex">
      <button
        onClick={onClick}
        className="font-black"
        aria-label="Add Exercise"
      >
        Add Exercise
      </button>
    </div>
  );
};

export default AddExerciseButton;
