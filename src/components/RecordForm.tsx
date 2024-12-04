'use client'
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface RecordFormProps {
  exerciseId: string;
}

const RecordForm: React.FC<RecordFormProps> = ({ exerciseId }) => {
  const [reps, setReps] = useState<number[]>([]);
  const [weights, setWeights] = useState<number[]>([]);
  const [currentReps, setCurrentReps] = useState<number | null>(null);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAddSet = () => {
    if (currentReps !== null && currentWeight !== null) {
      setReps((prev) => [...prev, currentReps]);
      setWeights((prev) => [...prev, currentWeight]);
      setCurrentReps(null);
      setCurrentWeight(null);
    } else {
      setError('Please enter both reps and weight for the set.');
    }
  };

  const handleSubmit = async () => {
    if (reps.length === 0 || weights.length === 0) {
      setError('Please add at least one set.');
      return;
    }

    const { error } = await supabase.from('exercise_records').insert({
      exercise_id: exerciseId,
      reps,
      weights,
      notes: notes || null,
    });

    if (error) {
      setError(error.message);
    } else {
      setReps([]);
      setWeights([]);
      setNotes('');
      setError(null);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Add Record</h3>
      {error && <p className="text-red-500">{error}</p>}

      {/* Add Set Form */}
      <div className="mb-4">
        <input
          type="number"
          placeholder="Reps"
          value={currentReps || ''}
          onChange={(e) => setCurrentReps(Number(e.target.value))}
          className="p-2 border border-gray-300 rounded mr-2"
        />
        <input
          type="number"
          placeholder="Weight"
          value={currentWeight || ''}
          onChange={(e) => setCurrentWeight(Number(e.target.value))}
          className="p-2 border border-gray-300 rounded mr-2"
        />
        <button onClick={handleAddSet} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Set
        </button>
      </div>

      {/* List of Added Sets */}
      <ul className="mb-4">
        {reps.map((rep, index) => (
          <li key={index}>
            Set {index + 1}: {rep} reps @ {weights[index]} lbs
          </li>
        ))}
      </ul>

      {/* Notes */}
      <textarea
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-4"
      />

      {/* Submit Button */}
      <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded">
        Submit Record
      </button>
    </div>
  );
};

export default RecordForm;
