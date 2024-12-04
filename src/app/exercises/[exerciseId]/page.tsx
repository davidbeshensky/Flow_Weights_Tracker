'use client'
import { useParams } from 'next/navigation';
import RecordForm from '@/components/RecordForm';

interface Params {
  exerciseId: string;
}

const ExercisePage = () => {
  const params = useParams() as unknown as Params; // Typecast the params to ensure proper inference

  const { exerciseId } = params;

  if (!exerciseId) {
    return <p>Exercise not found</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">Add Records for Exercise</h1>
      <RecordForm exerciseId={exerciseId} />
    </div>
  );
};

export default ExercisePage;

