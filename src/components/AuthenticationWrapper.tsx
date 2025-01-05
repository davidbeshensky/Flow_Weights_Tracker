"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthenticationWrapper({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      setIsAuthenticated(!!sessionData?.session);

      if (!sessionData?.session) {
        router.push("/splash");
      }
    };

    checkAuth();
  }, [router, supabase]);

  if (isAuthenticated === null) {
    return <p>Loading...</p>;
  }

  return <>{isAuthenticated ? children : null}</>;
}
