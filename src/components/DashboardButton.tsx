'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const DashboardButton: React.FC = () => {
  const router = useRouter();

  const handleGoToDash = async () => {

    router.push('/dashboard'); 
  };

  return (
    <button
      onClick={handleGoToDash}
      className="w-full py-2 px-1 mb-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg"
    >
      Dashboard
    </button>
  );
};

export default DashboardButton;
