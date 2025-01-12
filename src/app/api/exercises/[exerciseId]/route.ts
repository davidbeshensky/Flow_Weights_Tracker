import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  // Extract `exerciseId` from the request URL
  const url = new URL(req.url);
  const pathSegments = url.pathname.split("/");
  const exerciseId = pathSegments[pathSegments.indexOf("exercises") + 1]; // Extract exerciseId dynamically

  if (!exerciseId) {
    return NextResponse.json(
      { error: "exerciseId is required." },
      { status: 400 }
    );
  }

  try {
    const supabase = await supabaseServer();


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


    return NextResponse.json({ id: exerciseId, name: exercise.name }, { status: 200 });
  } catch (err: any) {
    console.error("Unexpected error fetching exercise data:", err.message);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
