"use client";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import RecordForm from "@/components/RecordForm";

interface Params {
  exerciseId: string;
}

const ExercisePage = () => {
  const params = useParams() as unknown as Params;
  const searchParams = useSearchParams();
  const [exerciseName, setExerciseName] = useState("Exercise");
  const router = useRouter();

  // Extract exerciseId
  const exerciseId = params?.exerciseId;

  // Extract and decode exerciseName
  useEffect(() => {
    try {
      const name = decodeURIComponent(searchParams.get("name") || "Exercise");
      setExerciseName(name);
    } catch (err) {
      console.error("Error decoding exercise name:", err);
    }
  }, [searchParams]);

  const handleNameUpdate = (newName: string) => {
    setExerciseName(newName);
    // Update URL with the new name
    const encodedName = encodeURIComponent(newName);
    const url = `/exercises/${exerciseId}?name=${encodedName}`;
    router.replace(url);
  };

  if (!exerciseId) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-gradient bg-gradient-to-br from-purple-900 via-green-700 to-black text-white bg-opacity-10">
        <p className="text-xl font-bold text-center">Exercise not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-start animated-gradient bg-gradient-to-br from-purple-900 via-green-700 to-black text-whitee">
      <div className="mx-auto min-w-96 m-2">
        <h1 className="font-extrabold text-4xl mt-4 mb-4 text-center">
        </h1>
        <RecordForm exerciseId={exerciseId} exerciseName={exerciseName} onUpdateName={handleNameUpdate} />
      </div>
    </div>
  );
};

export default ExercisePage;
