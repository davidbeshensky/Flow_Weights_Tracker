import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Initialize Supabase with public credentials
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Public client for authentication
);

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      console.warn("Validation failed. Missing fields:", { email, password });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
    });


    if (signupError) {
      console.error("Supabase signup error:", signupError.message);
      return NextResponse.json(
        { error: signupError.message || "Signup failed." },
        { status: 500 }
      );
    }

    if (!data?.user) {
      console.error("No user object returned.");
      return NextResponse.json(
        { error: "Signup failed. No valid user returned." },
        { status: 500 }
      );
    }


    return NextResponse.json(
      { message: "User signed up successfully", userId: data.user.id },
      { status: 201 }
    );
  } catch (err) {
    console.error("Unexpected error during signup:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
