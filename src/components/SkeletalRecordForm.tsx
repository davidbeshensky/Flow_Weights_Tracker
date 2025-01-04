const SkeletalRecordForm: React.FC = () => {
    return (
      <div className="p-6 bg-black/95 text-white rounded-lg max-w-3xl mx-auto shadow-lg animate-pulse">
        {/* Exercise Name Placeholder */}
        <div className="h-8 bg-gray-700 rounded-md w-1/3 mb-6"></div>
  
        {/* History and Add Information Buttons */}
        <div className="flex gap-4 mb-6">
          <div className="h-12 bg-gray-700 rounded-md w-1/2"></div>
          <div className="h-12 bg-gray-700 rounded-md w-1/2"></div>
        </div>
  
        {/* Reps Input Placeholder */}
        <div className="mb-4">
          <div className="h-6 bg-gray-600 rounded-md w-1/4 mb-2"></div>
          <div className="h-12 bg-gray-700 rounded-md w-full"></div>
        </div>
  
        {/* Weight Input Placeholder */}
        <div className="mb-4">
          <div className="h-6 bg-gray-600 rounded-md w-1/4 mb-2"></div>
          <div className="h-12 bg-gray-700 rounded-md w-full"></div>
        </div>
  
        {/* Add Set Button */}
        <div className="h-12 bg-gray-700 rounded-md w-full mb-6"></div>
  
        {/* Recent Sets Placeholder */}
        <div className="h-6 bg-gray-600 rounded-md w-1/3 mb-4"></div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-10 bg-gray-700 rounded-md w-full"
            ></div>
          ))}
        </div>
  
        {/* Notes Input Placeholder */}
        <div className="mt-6 mb-6">
          <div className="h-6 bg-gray-600 rounded-md w-1/4 mb-2"></div>
          <div className="h-20 bg-gray-700 rounded-md w-full"></div>
        </div>
  
        {/* Action Buttons */}
        <div className="flex gap-4">
          <div className="h-12 bg-gray-700 rounded-md w-1/2"></div>
          <div className="h-12 bg-gray-700 rounded-md w-1/2"></div>
        </div>
      </div>
    );
  };
  
  export default SkeletalRecordForm;
  