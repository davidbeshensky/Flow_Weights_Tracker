"use client";

import { useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ChangePassword() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handlePasswordReset = async () => {
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`, // Custom reset page
      });

      if (error) {
        throw new Error(error.message);
      }

      setSuccess("Password reset email sent! Please check your inbox.");
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
          Reset Your Password
        </h1>
        <p className="text-lg text-gray-400 text-center mb-6">
          Enter your email to receive a password reset link.
        </p>

        <div className="flex flex-col gap-4">
          {/* Email Input */}
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 rounded-md bg-gray-900 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          {/* Error or Success Message */}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          {/* Reset Password Button */}
          <button
            onClick={handlePasswordReset}
            className="w-full py-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300"
          >
            Send Password Reset Email
          </button>
        </div>
      </div>
    </div>
  );
}
