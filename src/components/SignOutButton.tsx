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
      className="w-full py-2 px-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg"
    >
      Sign Out
    </button>
  );
};

export default SignOutButton;
