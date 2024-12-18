'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const Splash: React.FC = () => {
  const router = useRouter();

  const navigateToLogin = () => {
    router.push('/login'); // Redirect to the login page
  };

  return (
    <div className="animated-gradient relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-green-700 to-black text-white overflow-hidden">
      {/* Foreground Content */}
      <div className="relative z-10 text-center px-6">
        <h1 className="text-4xl font-extrabold mb-4 tracking-wide">Ready to be</h1>
        <h1 className="text-4xl font-extrabold mb-4 tracking-wide">Locked In?</h1>
        <p className="text-lg mb-6">
          Track your progress. Build your strength. Start your journey now.
        </p>
        <button
          onClick={navigateToLogin}
          className="animated-gradient w-full max-w-xs border-0 bg-gradient-to-r from-green-800 to-purple-800 text-white font-medium py-3 px-6 rounded-lg shadow-lg"
        >
          Lock In
        </button>
      </div>
    </div>
  );
};

export default Splash;


