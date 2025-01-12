import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
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
    const { notes } = await req.json();

    console.log("Creating exercise record for exercise ID:", exerciseId);

    const supabase = await supabaseServer();

    // Insert a new record into the exercise_records table
    const { data: record, error: recordError } = await supabase
      .from("exercise_records")
      .insert({
        exercise_id: exerciseId,
        notes,
        created_at: new Date().toISOString(),
      })
      .select() // Ensure the inserted record is returned
      .single(); // Ensure only a single record is returned

    if (recordError) {
      console.error("Error inserting exercise record:", recordError.message);
      return NextResponse.json({ error: recordError.message }, { status: 400 });
    }

    if (!record || !record.id) {
      console.error("Failed to retrieve inserted exercise record ID.");
      return NextResponse.json(
        { error: "Failed to retrieve exercise record ID." },
        { status: 500 }
      );
    }

    console.log("Created exercise record:", record);

    return NextResponse.json(record, { status: 201 });
  } catch (error: any) {
    console.error("Unexpected error creating exercise record:", error.message);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
