"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async () => {
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const { msg } = await response.json();
        throw new Error(msg || "Failed to sign up.");
      }

      setSuccess("Sign-up successful! You can now log in.");
      setTimeout(() => router.push("/login"), 3000); // Redirect to login page after success
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Sign-up error:", err.message);
        setError(err.message);
      } else {
        console.error("Sign-up error: Unknown error", err);
        setError("An unexpected error occurred. Please try again.");
      }
    }
}

    return (
      <div className="animated-gradient relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-green-700 to-black text-white">
        <div className="relative z-10 w-full max-w-md px-6 text-center">
          <h1 className="text-4xl font-extrabold mb-4 tracking-wide">
            Create Your Account
          </h1>
          <p className="text-lg mb-6">Start your journey today.</p>

          <div className="w-full flex flex-col gap-4 shadow-lg bg-black bg-opacity-25 p-6 rounded-lg">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-4 rounded-md bg-gray-900 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your email"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-4 rounded-md bg-gray-900 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Create a password"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}

            <button
              onClick={handleSignUp}
              className="w-full py-4 bg-gradient-to-r from-green-800 to-purple-800 text-white font-medium rounded-lg shadow-md animated-gradient"
            >
              Sign Up
            </button>
            <p className="text-sm text-gray-300 mt-4">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/login")}
                className="text-purple-400 hover:underline"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  };
