"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

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
      // Attempt to sign up the user
      const response = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      // Log the response for debugging purposes
      console.log("Sign-up response:", JSON.stringify(response, null, 2));

      // Handle the sign-up response
      if (response.data && response.data.user) {
        if (
          response.data.user.identities &&
          response.data.user.identities.length > 0
        ) {
          console.log("Sign-up successful!");
          setSuccess(
            "Sign-up successful! Please check your email to activate your account."
          );
          setTimeout(() => router.push("/login"), 3000); // Redirect to login
        } else {
          console.log("Email address is already taken.");
          setError(
            "This email is already registered. If you forgot your password, reset it using the link below."
          );
        }
      } else if (response.error) {
        throw new Error(response.error.message);
      }
    } catch (err: unknown) {
      console.error("Sign-up error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6">
      <div className="bg-gray-900 p-8 rounded-lg relative z-10 w-full max-w-md">
        <h1 className="text-4xl font-extrabold text-center mb-4">
          Create Your Account
        </h1>
        <p className="text-lg text-gray-400 text-center mb-6">
          Start your journey today.
        </p>

        <div className="flex flex-col gap-4">
          {/* Email Field */}
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
              className="w-full p-4 rounded-md bg-gray-900 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter your email"
            />
          </div>

          {/* Password Field */}
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
              className="w-full p-4 rounded-md bg-gray-900 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Create a password"
            />
          </div>

          {/* Error or Success Message */}
          {error && (
            <div className="text-red-500 text-sm mt-2">
              <p>{error}</p>
              {error ===
                "This email is already registered. If you forgot your password, reset it using the link below." && (
                <p className="mt-2">
                  <button
                    onClick={() => router.push("/change-password")}
                    className="text-blue-400 hover:underline"
                  >
                    Reset your password here.
                  </button>
                </p>
              )}
            </div>
          )}
          {success && <p className="text-green-500 text-sm mt-2">{success}</p>}

          {/* Sign Up Button */}
          <button
            onClick={handleSignUp}
            className="w-full py-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300"
          >
            Sign Up
          </button>

          {/* Already Have an Account */}
          <p className="text-sm text-gray-400 text-center mt-4">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-blue-400 hover:underline"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
