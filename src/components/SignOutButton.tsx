'use client';

import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

const SignOutButton: React.FC = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error.message);
      return;
    }

    router.push('/splash'); // Redirect to splash page after sign out
  };

  return (
    <button
      onClick={handleSignOut}
      className="py-2 px-6 bg-gradient-to-r from-red-600 to-red-800 text-white font-medium rounded-lg shadow-md hover:from-red-500 hover:to-red-700 transition-all duration-200"
    >
      Sign Out
    </button>
  );
};

export default SignOutButton;
