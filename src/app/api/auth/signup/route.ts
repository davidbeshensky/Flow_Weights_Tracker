import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Use a service role client to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Secure key for privileged operations
);

const defaultExercises = [
  { name: "Bench Press" },
  { name: "Deadlift" },
  { name: "Squat" },
  { name: "Bicep Curl" },
  { name: "Tricep Pushdown" },
  { name: "Shoulder Press" },
  { name: "Facepull" },
  { name: "Lateral Raise" },
  { name: "Romanian Deadlift" },
  { name: "Lat Pulldown" },
];

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    // Attempt to sign up the user
    const { data, error: signupError } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    // Handle signup errors
    if (signupError) {
      if (signupError.message.includes("already registered")) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: signupError.message },
        { status: 500 }
      );
    }

    // Validate the existence of `data.user`
    if (!data?.user) {
      console.error("Signup failed. No user object returned.");
      return NextResponse.json(
        { error: "Signup failed. No valid user returned." },
        { status: 500 }
      );
    }

    // Insert default exercises for the new user using the service role client
    const { id: userId } = data.user; // Destructure `id` safely
    const { error: insertError } = await supabaseAdmin.from("exercises").insert(
      defaultExercises.map((exercise) => ({
        ...exercise,
        user_id: userId, // Ensure correct foreign key is assigned
      }))
    );

    if (insertError) {
      console.error("Insert error:", insertError.message);
      console.error("Error details:", insertError);
      return NextResponse.json(
        { error: "Failed to add default exercises" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "User signed up successfully", user: data.user },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "An unexpected error occurred";

    console.error("Error during signup:", errorMessage);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
