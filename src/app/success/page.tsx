"use client";

import React from "react";
import { useRouter } from "next/navigation";

const Success: React.FC = () => {
  const router = useRouter();

  const handleBack = () => {
    router.push("/"); // Navigates back to the home page
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100">
      <h1 className="text-xl font-bold text-green-600 mb-4">
        Thank you for your support! ☕❤️
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

export default Success;
