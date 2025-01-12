import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(
  request: NextRequest,
  context: { params: { exerciseId: string } }
) {
  const { exerciseId } = context.params; // Access params correctly

  if (!exerciseId) {
    return NextResponse.json(
      { error: "exerciseId is required." },
      { status: 400 }
    );
  }

  try {
    const supabase = await supabaseServer();

    console.log("Fetching exercise history for ID:", exerciseId);

    // Fetch exercise records
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

    // If no records are found, return an empty array
    if (!records || records.length === 0) {
      console.warn("No records found for exercise ID:", exerciseId);
      return NextResponse.json([], { status: 200 });
    }

    // Fetch sets for each record
    const recordsWithSets = await Promise.all(
      records.map(async (record) => {
        const { data: sets, error: setsError } = await supabase
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

        return { ...record, sets: sets || [] }; // Add the fetched sets to the record
      })
    );

    console.log("Fetched exercise history with sets:", recordsWithSets);

    return NextResponse.json(recordsWithSets, { status: 200 });
  } catch (err: any) {
    console.error("Unexpected error fetching exercise history:", err.message);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
