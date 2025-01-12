import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request, { params }: { params: { exerciseId: string } }) {
  const { exerciseId } = params;

  try {
    const supabase = await supabaseServer();

    console.log("Fetching exercise data for ID:", exerciseId);

    // Fetch the exercise name from the "exercises" table
    const { data: exercise, error: exerciseError } = await supabase
      .from("exercises")
      .select("name")
      .eq("id", exerciseId)
      .single(); // Ensure we only fetch a single record

    if (exerciseError) {
      console.error("Error fetching exercise data:", exerciseError.message);
      return NextResponse.json({ error: exerciseError.message }, { status: 400 });
    }

    if (!exercise) {
      console.warn("No exercise found for ID:", exerciseId);
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    console.log("Fetched exercise:", exercise);

    return NextResponse.json({ id: exerciseId, name: exercise.name }, { status: 200 });
  } catch (err: any) {
    console.error("Unexpected error fetching exercise data:", err.message);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
