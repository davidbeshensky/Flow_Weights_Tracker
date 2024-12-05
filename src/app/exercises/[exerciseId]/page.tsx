'use client';

import { useParams, useSearchParams } from 'next/navigation';
import RecordForm from '@/components/RecordForm';

interface Params {
  exerciseId: string;
}

const ExercisePage = () => {
  const params = useParams() as unknown as Params;
  const searchParams = useSearchParams();

  // Extract the exercise ID from the route params
  const exerciseId = params?.exerciseId;

  // Decode the exercise name from the query parameters
  const exerciseName = decodeURIComponent(searchParams.get('name') || 'Exercise');

  if (!exerciseId) {
    return (
      <div className="animated-gradient min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-green-700 to-black text-white">
        <p className="text-xl font-bold text-center">Exercise not found</p>
      </div>
    );
  }

  return (
    <div className="animated-gradient min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-green-700 to-black text-white">
      <div className="w-fit bg-opacity-10 p-6 rounded-lg shadow-lg">
        <h1 className="font-extrabold text-4xl mb-6 text-center">
            <span className="text-purple-900">{exerciseName}</span>
        </h1>
        <RecordForm exerciseId={exerciseId} />
      </div>
    </div>
  );
};

export default ExercisePage;
