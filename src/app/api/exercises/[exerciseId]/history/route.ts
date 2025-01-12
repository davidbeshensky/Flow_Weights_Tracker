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


    // Fetch all exercise records for the given exerciseId
    const { data: records, error: recordsError } = await supabase
      .from("exercise_records")
      .select("id, created_at, notes")
      .eq("exercise_id", exerciseId)
      .order("created_at", { ascending: true });

    if (recordsError) {
      console.error("Error fetching exercise records:", recordsError.message);
      return NextResponse.json(
        { error: recordsError.message },
        { status: 400 }
      );
    }

    // Handle no records found
    if (!records || records.length === 0) {
      console.warn(`No records found for exercise ID: ${exerciseId}`);
      return NextResponse.json([], { status: 200 });
    }

    // Fetch sets for each exercise record
    const recordsWithSets = await Promise.all(
      records.map(async (record) => {
        const { data: setsData, error: setsError } = await supabase
          .from("exercise_set_records")
          .select("set_number, reps, weight")
          .eq("exercise_record_id", record.id)
          .order("set_number", { ascending: true });

        if (setsError) {
          console.error(
            `Error fetching sets for record ID ${record.id}:`,
            setsError.message
          );
          return { ...record, sets: [] }; // Return the record with empty sets if there's an error
        }

        return { ...record, sets: setsData || [] }; // Add the fetched sets to the record
      })
    );


    return NextResponse.json(recordsWithSets, { status: 200 });
  } catch (error: any) {
    console.error("Unexpected error fetching exercise history:", error.message);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
