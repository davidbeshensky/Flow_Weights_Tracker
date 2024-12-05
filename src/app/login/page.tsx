'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Initialize router

  const handleLogin = async () => {
    setError(null);

    // Attempt to sign in
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Sign-in error:", error.message);
      setError(error.message);
      return;
    }

    // Confirm session exists
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Error fetching session:", sessionError.message);
      setError("Unexpected error. Please try again.");
      return;
    }

    if (session?.session?.user) {
      console.log("User logged in successfully, routing to the main page");
      router.push('/'); // Navigate to the main page
    } else {
      console.warn("Session not found after login");
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="animated-gradient relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-green-700 to-black text-white">
      <div className="relative z-10 w-full max-w-md px-6 text-center">
        <h1 className="text-4xl font-extrabold mb-4 tracking-wide">Welcome Back</h1>
        <p className="text-lg mb-6">Sign in to continue your journey.</p>

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
              placeholder="Enter your password"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleLogin}
            className="w-full py-4 bg-gradient-to-r from-green-800 to-purple-800 text-white font-medium rounded-lg shadow-md animated-gradient"
          >
            Sign In
          </button>
          <p className="text-sm text-gray-300 mt-4">
            Don&apos;t have an account?{' '}
            <button
              onClick={() => router.push('/signup')}
              className="text-purple-400 hover:underline"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
