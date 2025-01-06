"use client";

import React from "react";
import { useRouter } from "next/navigation";

const Splash: React.FC = () => {
  const router = useRouter();

  const navigateToLogin = () => {
    router.push("/login"); // Redirect to the login page
  };

  const navigateToSignup = () => {
    router.push("/signup"); // Redirect to the signup page
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6">
      {/* Header Section */}
      <header className="absolute top-0 w-full py-4 px-8 flex justify-between items-center bg-black/80 backdrop-blur-md border-b border-gray-800">
        <h1 className="text-xl font-semibold">Lockedingains</h1>
        <div>
          <button
            className="mr-4 text-sm text-gray-400 hover:text-white transition"
            onClick={navigateToLogin}
          >
            Lock In
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-sm font-medium rounded-md hover:bg-blue-700 transition"
            onClick={navigateToSignup}
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="text-center mt-20">
        <h1 className="text-5xl font-extrabold mb-4">Build a Better You</h1>
        <p className="text-lg text-gray-400 mb-6">
          Track your progress, build your strength, and unlock your potential.
        </p>
        <button
          onClick={navigateToLogin}
          className="px-6 py-3 bg-blue-600 text-lg font-medium rounded-md hover:bg-blue-700 transition"
        >
          Lock In
        </button>
      </main>

      {/* Footer Section */}
      <footer className="absolute bottom-0 w-full py-4 text-center text-sm text-gray-600 border-t border-gray-800">
        © 2024 Lockedingains. All rights reserved.
      </footer>
    </div>
  );
};

export default Splash;
