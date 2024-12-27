"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handlePasswordUpdate = async () => {
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      setSuccess("Password updated successfully! Redirecting to sign-in...");
      setTimeout(() => {
        router.push("/login"); // Redirect to the login page
      }, 1500);
    } catch (err: unknown) {
      setError(
        (err as Error)?.message || "An error occurred. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6">
      {/* Header Section */}
      <header className="absolute top-0 w-full py-4 px-8 flex justify-between items-center bg-black/80 backdrop-blur-md border-b border-gray-800">
        <button
          onClick={() => router.push("/splash")}
          className="text-xl font-semibold"
        >
          Lockedingains
        </button>
      </header>
      <div className="relative z-10 w-full max-w-md">
        <h1 className="text-4xl font-extrabold text-center mb-4">
          Set a New Password
        </h1>
        <p className="text-lg text-gray-400 text-center mb-6">
          Enter your new password below.
        </p>

        <div className="flex flex-col gap-4">
          {/* New Password Input */}
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 rounded-md bg-gray-900 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          {/* Error or Success Message */}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          {/* Update Password Button */}
          <button
            onClick={handlePasswordUpdate}
            className="w-full py-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}
