import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

function extractRecordIdFromPathname(pathname: string): string | null {
  const segments = pathname.split("/"); // Split the pathname into parts
  const recordIdIndex = segments.indexOf("records") + 1; // Find the index of "records"
  return segments[recordIdIndex] || null; // Return the next segment as recordId
}

export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);
  const recordId = extractRecordIdFromPathname(pathname);

  if (!recordId) {
    console.error("Missing recordId in URL pathname:", pathname);
    return NextResponse.json(
      { error: "recordId is required." },
      { status: 400 }
    );
  }

  try {
    const supabase = await supabaseServer();


    // Fetch sets associated with the given record ID
    const { data: sets, error } = await supabase
      .from("exercise_set_records")
      .select("set_number, reps, weight")
      .eq("exercise_record_id", recordId)
      .order("set_number", { ascending: true });

    if (error) {
      console.error("Error fetching sets:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }


    return NextResponse.json(sets, { status: 200 });
  } catch (error: any) {
    console.error("Unexpected error:", error.message);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { pathname } = new URL(request.url);
  const recordId = extractRecordIdFromPathname(pathname);

  if (!recordId) {
    console.error("Missing recordId in URL pathname:", pathname);
    return NextResponse.json(
      { error: "recordId is required." },
      { status: 400 }
    );
  }

  try {
    const { sets } = await request.json();


    // Validate that `sets` is an array and contains valid data
    if (!Array.isArray(sets) || sets.length === 0) {
      return NextResponse.json(
        { error: "Sets must be a non-empty array." },
        { status: 400 }
      );
    }

    const validatedSets = sets.map((set: any, index: number) => {
      if (
        typeof set.reps !== "number" ||
        (typeof set.weight !== "number" && set.weight !== null) ||
        (typeof set.restTime !== "number" && set.restTime !== null)
      ) {
        throw new Error(
          "Each set must have valid `reps` (integer) and `weight` (number or null)."
        );
      }

      return {
        exercise_record_id: recordId, // FK to exercise_records
        set_number: index + 1, // Position in the array
        reps: set.reps, // Required
        weight: set.weight || null, // Allow null for weight
        rest_time: set.restTime || null, // Include rest time
      };
    });


    const supabase = await supabaseServer();

    // Insert validated sets into the database
    const { data, error } = await supabase
      .from("exercise_set_records")
      .insert(validatedSets)
      .select(); // Return inserted rows for debugging

    if (error) {
      console.error("Error inserting sets:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }


    return NextResponse.json(
      { message: "Sets added successfully.", sets: data },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Unexpected error adding sets:", error.message);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
