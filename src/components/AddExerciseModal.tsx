'use client'
import React from "react";
import AddExerciseButton from "./AddExerciseButton";
import SelectMenu from "./ExerciseSelectMenu";

const ExerciseSelectModal = () => {
  return (
    <div>
      <SelectMenu
        trigger={<AddExerciseButton onClick={() => {}} />}
      />
    </div>
  );
};

export default ExerciseSelectModal;
