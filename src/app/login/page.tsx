"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Initialize router

  async function handleLogin() {
    setError(null);

    try {
      // Make a request to our new /api/login route
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        // e.g., 401
        console.error("Login error:", data.error);
        setError(data.error);
        return;
      }

      // On success, the server has set a cookie.
      // The user is now "logged in" from the server's perspective.

      // Optionally navigate to the main page or wherever
      router.push("/");
    } catch (err: unknown) {
      console.error("Unexpected error during login:", err);
      setError("Unexpected error. Please try again.");
    }
  }

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
          Welcome Back
        </h1>
        <p className="text-lg text-gray-400 text-center mb-6">
          Lock in to continue your journey.
        </p>

        <div className="w-full flex flex-col gap-4 bg-gray-900 p-6 rounded-lg border border-gray-800">
          {/* Email Input */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-4 rounded-md bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter your email"
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-4 rounded-md bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter your password"
            />
          </div>

          {/* Forgot Password Link */}
          <p className="text-sm text-gray-400 text-right">
            <button
              onClick={() => router.push("/change-password")}
              className="text-blue-400 hover:underline"
            >
              Forgot your password?
            </button>
          </p>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {/* Sign In Button */}
          <button
            onClick={handleLogin}
            className="w-full py-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300"
          >
            Lock In
          </button>

          {/* Sign Up Redirect */}
          <p className="text-sm text-gray-400 text-center mt-4">
            Don&apos;t have an account?{" "}
            <button
              onClick={() => router.push("/signup")}
              className="text-blue-400 hover:underline"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
