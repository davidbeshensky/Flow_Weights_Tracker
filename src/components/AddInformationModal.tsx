import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabaseClient } from "@/lib/supabaseClient";
import Fuse from "fuse.js";
import CloseIcon from "@mui/icons-material/Close";

interface AddInformationModalProps {
  exerciseId: string;
  exerciseName: string;
  onClose: () => void; // Callback to close the modal
}

const AddInformationModal: React.FC<AddInformationModalProps> = ({
  exerciseId,
  exerciseName,
  onClose,
}) => {
  const [notes, setNotes] = useState("");
  const [muscleContributions, setMuscleContributions] = useState<{
    [muscle: string]: number;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMuscles, setFilteredMuscles] = useState<string[]>([]);

  const muscleOptions = [
    "biceps",
    "triceps",
    "forearms",
    "quadriceps",
    "hamstrings",
    "glutes",
    "chest",
    "traps",
    "lats",
    "front delts",
    "side delts",
    "rear delts",
    "calves",
    "abs",
  ];

  const fuse = new Fuse(muscleOptions, { threshold: 0.4 });

  useEffect(() => {
    const fetchExerciseData = async () => {
      try {
        const { data, error } = await supabaseClient
          .from("exercises")
          .select("notes, muscles_worked")
          .eq("id", exerciseId)
          .single();

        if (error) {
          console.error("Error fetching exercise data:", error);
          setError("Failed to load exercise information.");
          return;
        }

        if (data) {
          setNotes(data.notes || ""); // Pre-fill notes
          setMuscleContributions(data.muscles_worked || {}); // Pre-fill muscles worked
        }
      } catch (err) {
        console.error("Unexpected error fetching data:", err);
        setError("An unexpected error occurred.");
      }
    };

    fetchExerciseData();
  }, [exerciseId]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = fuse.search(query).map((result) => result.item);
      setFilteredMuscles(results);
    } else {
      setFilteredMuscles([]);
    }
  };

  const addMuscle = (muscle: string) => {
    if (!muscleContributions[muscle]) {
      setMuscleContributions((prev) => ({ ...prev, [muscle]: 1 }));
    }
    setSearchQuery("");
    setFilteredMuscles([]);
  };

  const handleMuscleContributionChange = (
    muscle: string,
    contribution: number
  ) => {
    if (contribution >= 0.01 && contribution <= 1) {
      setMuscleContributions((prev) => ({
        ...prev,
        [muscle]: contribution,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!notes.trim() && Object.keys(muscleContributions).length === 0) {
      setError("Please provide at least one note or muscle contribution.");
      return;
    }

    try {
      const { error } = await supabaseClient
        .from("exercises")
        .update({
          notes: notes.trim() || null,
          muscles_worked: muscleContributions,
        })
        .eq("id", exerciseId);

      if (error) {
        console.error("Error updating exercise information:", error);
        setError("Failed to update exercise information.");
      } else {
        onClose(); // Close the modal after successful update
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred.");
    }
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-gray-900 text-white rounded-lg max-w-3xl mx-auto shadow-lg p-6 overflow-y-auto z-50"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white bg-red-600 hover:bg-red-700 p-2 rounded-full"
      >
        <CloseIcon />
      </button>
      <h1 className="text-3xl font-bold text-center mb-6">
        Edit Information - {exerciseName}
      </h1>

      {/* Notes Input */}
      <div className="mb-6">
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-3 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-blue-600 resize-none"
          placeholder="Add exercise set-up information"
        />
      </div>

      {/* Muscle Contributions */}
      <div className="mb-6">
        <label
          htmlFor="muscleSearch"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Add Muscles Worked
        </label>
        <input
          id="muscleSearch"
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search muscles (e.g., Chest, Triceps)"
          className="w-full p-3 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-blue-600"
        />
        <div className="mt-2 space-y-1">
          {filteredMuscles.map((muscle) => (
            <button
              key={muscle}
              onClick={() => addMuscle(muscle)}
              className="block w-full text-left px-4 py-2 bg-gray-700 hover:bg-blue-700 text-white rounded-md"
            >
              {muscle}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 space-y-4">
        {Object.keys(muscleContributions).map((muscle) => (
          <div key={muscle} className="flex items-center gap-4">
            <span className="w-32 text-gray-300">{muscle}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.25"
              value={muscleContributions[muscle]}
              onChange={(e) =>
                handleMuscleContributionChange(
                  muscle,
                  parseFloat(e.target.value) || 0
                )
              }
              className="slider w-full appearance-none h-2 bg-gray-700 rounded-full"
            />
            <span className="w-12 text-gray-300 text-center">
              {muscleContributions[muscle]}
            </span>
            <button
              onClick={() =>
                setMuscleContributions((prev) => {
                  const updated = { ...prev };
                  delete updated[muscle];
                  return updated;
                })
              }
              className="text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-600 text-white rounded-md">{error}</div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-all"
      >
        Save Information
      </button>
    </motion.div>
  );
};

export default AddInformationModal;
