'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

const AuthenticationWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: session } = await supabase.auth.getSession();
      setIsAuthenticated(!!session?.session);

      if (!session?.session) {
        router.push('/splash'); // Redirect to login page if unauthenticated
      }
    };

    checkAuth();
  }, [router]);

  if (isAuthenticated === null) {
    return <p>Loading...</p>; // Render a loading state while checking authentication
  }

  return <>{isAuthenticated ? children : null}</>;
};

export default AuthenticationWrapper;
