import { supabaseServer } from "@/lib/supabaseServer"; // Adjust path as necessary
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const payload = await req.json();

    const { name, description, exercises } = payload;

    // Validate required fields
    if (!name || !exercises || exercises.length === 0) {
      return NextResponse.json(
        { error: "Name and exercises are required." },
        { status: 400 }
      );
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

    // Step 1: Insert into workout_presets table
    const { data: presetData, error: presetError } = await supabase
      .from("workout_presets")
      .insert({
        user_id,
        name,
        description,
      })
      .select("id")
      .single();

    if (presetError) {
      console.error("Error inserting workout preset:", presetError.message);
      return NextResponse.json(
        { error: presetError.message },
        { status: 500 }
      );
    }

    const workout_preset_id = presetData.id;

    // Step 2: Insert into workout_preset_exercises table
    const presetExercises = exercises.map((exercise: any, index: number) => ({
      workout_preset_id,
      exercise_id: exercise.exercise_id,
      order: index + 1, // Maintain order
    }));

    const { error: exercisesError } = await supabase
      .from("workout_preset_exercises")
      .insert(presetExercises);

    if (exercisesError) {
      console.error("Error inserting workout preset exercises:", exercisesError.message);
      return NextResponse.json(
        { error: exercisesError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Workout preset saved successfully." },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    console.error("Error saving workout preset:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await supabaseServer();

    // Get the user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (!session || sessionError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user_id = session.user.id;

    // Fetch all presets with their exercises
    const { data, error } = await supabase
      .from("workout_presets")
      .select(`
        id,
        name,
        description,
        starred,
        workout_preset_exercises (
          order,
          exercise_id,
          exercises (
            name
          )
        )
      `)
      .eq("user_id", user_id);

    if (error) {
      console.error("Error fetching presets:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    console.error("Error fetching presets:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}



