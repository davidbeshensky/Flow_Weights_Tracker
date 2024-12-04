"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface SelectMenuProps {
  trigger: React.ReactNode;
}

const SelectMenu: React.FC<SelectMenuProps> = ({ trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [exercises, setExercises] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const fetchExercises = async () => {
    try {
      setError(null);
      const { data: session, error: sessionError } = await supabase.auth.getSession();
  
      if (sessionError || !session?.session) {
        setError('You must be logged in to view exercises.');
        return;
      }
  
      console.log('User ID:', session.session.user.id); // Log user ID to confirm
  
      const { data, error } = await supabase
        .from('exercises')
        .select('name')
        .eq('user_id', session.session.user.id);
  
      if (error) {
        console.error('Error fetching exercises:', error.message); // Log error if it occurs
        setError(error.message);
        return;
      }
  
      console.log('Fetched exercises:', data); // Log fetched data
      setExercises(data.map((exercise) => exercise.name));
    } catch (err) {
      console.error('Unexpected error fetching exercises:', err); // Handle unexpected errors
      setError('An unexpected error occurred.');
    }
  };
  

  // Add a new exercise for the authenticated user
  const handleAddExercise = async () => {
    setError(null);

    if (!inputValue.trim()) {
      setError("Exercise name cannot be empty.");
      return;
    }

    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      setError("You must be logged in to add exercises.");
      return;
    }

    const { error } = await supabase.from("exercises").insert({
      user_id: session.session.user.id,
      name: inputValue.trim(),
    });

    if (error) {
      setError(error.message);
    } else {
      setInputValue("");
      fetchExercises(); // Refresh the list of exercises
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchExercises();
    }
  }, [isOpen]);

  return (
    <div>
      {/* Render the trigger button */}
      <div onClick={handleToggle}>{trigger}</div>

      {/* Conditional rendering of the menu */}
      {isOpen && (
        <div className="p-4 bg-white border rounded shadow-md">
          <h2 className="text-lg font-bold mb-2">Add or Select Exercise</h2>
          <input
            type="text"
            placeholder="Type to search or add"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-2"
          />
          <button
            onClick={handleAddExercise}
            className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
          >
            Add Exercise
          </button>
          {error && <p className="text-red-500">{error}</p>}
          <ul>
            {exercises.map((exercise, index) => (
              <li key={index} className="py-2 border-b">
                {exercise}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SelectMenu;
