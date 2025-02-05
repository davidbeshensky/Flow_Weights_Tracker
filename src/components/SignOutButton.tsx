"use client";

import React from "react";
import { useRouter } from "next/navigation";

const SignOutButton: React.FC = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
      });

      if (!response.ok) {
        const { error } = await response.json();
        console.error("Error signing out:", error);
        return;
      }

      // Redirect to the splash page after a successful sign-out
      router.push("/splash");
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="w-full py-2 px-1 bg-gray-600 hover:bg-gray-700 text-white text-md rounded-lg"
    >
      Sign Out
    </button>
  );
};

export default SignOutButton;
