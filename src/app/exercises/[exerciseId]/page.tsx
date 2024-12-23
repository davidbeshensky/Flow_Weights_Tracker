"use client";
import { useParams } from "next/navigation";
import RecordForm from "@/components/RecordForm";

interface Params {
  exerciseId: string;
}

const ExercisePage = () => {
  const params = useParams() as unknown as Params;

  // Extract exerciseId
  const exerciseId = params?.exerciseId;

  if (!exerciseId) {
    return (
      <div className="min-h-screen flex items-center justify-center  bg-black/95 backdrop-blur-lg text-white">
        <p className="text-xl font-bold text-center">Exercise not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-start  bg-black/95 backdrop-blur-lg  text-white">
      <div className="mx-auto min-w-96 m-2">
        <RecordForm exerciseId={exerciseId} />
      </div>
    </div>
  );
};

export default ExercisePage;
