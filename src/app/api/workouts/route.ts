import { supabaseServer } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const payload = await req.json();
    console.log("Received Payload:", payload);

    const { rating, notes, start_time, end_time } = payload;

    if (!start_time || !end_time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get the user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (!session || sessionError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user_id = session.user.id;

    // Insert the workout into the database
    const { data, error } = await supabase
      .from("workouts")
      .insert({
        user_id: user_id,
        rating,
        notes,
        start_time,
        end_time,
      })
      .select("id") // Ensure the `id` is returned
      .single(); // Get only the single inserted record

    console.log("Insert Result:", data); // Debugging the inserted data

    if (error) {
      console.error("Supabase Insert Error:", error.message);
      throw error;
    }

    if (!data || !data.id) {
      throw new Error("Insert succeeded, but no ID returned.");
    }

    return NextResponse.json(
      { id: data.id, message: "Workout added successfully" },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    console.error("Backend Error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
