'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface Exercise {
  id: string;
  name: string;
}

interface SelectMenuProps {
  trigger: React.ReactNode;
}

const SelectMenu: React.FC<SelectMenuProps> = ({ trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]); // Explicitly type exercises
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

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

      const { data, error } = await supabase
        .from('exercises')
        .select('id, name')
        .eq('user_id', session.session.user.id);

      if (error) {
        setError(error.message);
        return;
      }

      setExercises(data || []);
    } catch (err) {
      setError('An unexpected error occurred.');
    }
  };

  const handleAddExercise = async () => {
    setError(null);

    if (!inputValue.trim()) {
      setError('Exercise name cannot be empty.');
      return;
    }

    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      setError('You must be logged in to add exercises.');
      return;
    }

    const { error } = await supabase.from('exercises').insert({
      user_id: session.session.user.id,
      name: inputValue.trim(),
    });

    if (error) {
      setError(error.message);
    } else {
      setInputValue('');
      fetchExercises(); // Refresh the list of exercises
    }
  };

  const handleExerciseClick = (exerciseId: string) => {
    router.push(`/exercises/${exerciseId}`);
  };

  useEffect(() => {
      fetchExercises();
  }, []);

  return (
    <div>
      <div onClick={handleToggle}>{trigger}</div>

      {isOpen && (
        <div className="p-4 bg-white border rounded shadow-md">
          <h2 className="text-lg font-bold mb-4">Add or Select an Exercise</h2>

          <input
            type="text"
            placeholder="Type to add a new exercise"
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
            {exercises.length > 0 ? (
              exercises.map((exercise) => (
                <li
                  key={exercise.id}
                  className="py-2 border-b cursor-pointer hover:bg-gray-100"
                  onClick={() => handleExerciseClick(exercise.id)}
                >
                  {exercise.name}
                </li>
              ))
            ) : (
              <li className="py-2 text-gray-500">No exercises found.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SelectMenu;
