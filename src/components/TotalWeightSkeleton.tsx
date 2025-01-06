// TotalWeightSkeleton.tsx (or inline in your component file)
export default function TotalWeightSkeleton() {
    return (
      <div className="bg-gray-800 p-6 mb-2 rounded-lg shadow-lg animate-pulse">
        {/* "Title" placeholder */}
        <div className="h-6 bg-gray-700 w-48 rounded mb-4" />
        {/* Optional second line (description placeholder) */}
        <div className="h-4 bg-gray-700 w-32 rounded" />
      </div>
    );
  }
  