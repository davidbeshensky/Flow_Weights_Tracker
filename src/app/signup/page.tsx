"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false); // Tracks signup success
  const router = useRouter();

  const handleSignup = async () => {
    setError(null);

    try {
      const signupResponse = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        setError(signupData.error || "Signup failed.");
        return;
      }

      setSuccess(true); // Mark signup as successful
    } catch (err) {
      console.error("Unexpected error during signup:", err);
      setError("An unexpected error occurred. Please try again.");
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
        {!success ? (
          <>
            {/* Signup Form */}
            <h1 className="text-4xl font-extrabold text-center mb-4">
              Sign Up
            </h1>
            <p className="text-lg text-gray-400 text-center mb-6">
              Create an account to get started.
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

              {/* Error Message */}
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

              {/* Sign Up Button */}
              <button
                onClick={handleSignup}
                className="w-full py-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300"
              >
                Sign Up
              </button>

              {/* Sign In Redirect */}
              <p className="text-sm text-gray-400 text-center mt-4">
                Already have an account?{" "}
                <button
                  onClick={() => router.push("/login")}
                  className="text-blue-400 hover:underline"
                >
                  Lock in here
                </button>
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Success Message */}
            <h1 className="text-4xl font-extrabold text-center mb-4 text-blue-600">
              Success!
            </h1>
            <p className="text-lg text-gray-400 text-center mb-6">
              Check your email to activate your account.
            </p>

            <button
              onClick={() => router.push("/login")}
              className="w-full py-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300"
            >
              Go to Lock In
            </button>
          </>
        )}
      </div>
    </div>
  );
}
