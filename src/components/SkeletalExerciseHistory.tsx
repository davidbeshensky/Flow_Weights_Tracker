"use client";

import React from "react";

const SkeletalExerciseHistory: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gray-900 text-white rounded-lg max-w-3xl mx-auto shadow-lg p-6 overflow-y-auto z-50 animate-pulse">
      {/* Chart Placeholder */}
      <div className="w-full mt-24 p-6 bg-gray-800 rounded-lg shadow-lg mb-6">
        <div className="h-64 bg-gray-700 rounded-md"></div>
      </div>

      {/* Past Results Title */}
      <div className="h-6 bg-gray-700 rounded-md w-1/3 mb-4"></div>

      {/* List of Past Results */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="p-4 bg-gray-700 rounded-lg shadow flex justify-between space-x-4"
          >
            <div className="w-1/2">
              <div className="h-4 bg-gray-600 rounded-md mb-2"></div>
              <div className="h-4 bg-gray-600 rounded-md mb-2"></div>
              <div className="h-4 bg-gray-600 rounded-md"></div>
            </div>
            <div className="w-1/3 h-16 bg-gray-600 rounded-md"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletalExerciseHistory;
