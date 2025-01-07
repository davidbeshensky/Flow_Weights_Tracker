"use client";

import React from "react";
import { useRouter } from "next/navigation";

const Cancel: React.FC = () => {
  const router = useRouter();

  const handleBack = () => {
    router.back(); // Navigates back to the prior page
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-100">
      <h1 className="text-xl font-bold text-red-600 mb-4">
        Payment canceled. Maybe next time! ☕🙂
      </h1>
      <button
        onClick={handleBack}
        className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
      >
        Go Back
      </button>
    </div>
  );
};

export default Cancel;
