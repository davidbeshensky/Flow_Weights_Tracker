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

    console.log("Fetching recent record for exercise ID:", exerciseId);

    // Fetch the most recent exercise record for the given exerciseId
    const { data: recordData, error: recordError } = await supabase
      .from("exercise_records")
      .select("id, created_at")
      .eq("exercise_id", exerciseId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Handle no recent records
    if (!recordData || recordError) {
      console.warn(
        `No recent records found for exercise ID: ${exerciseId}. Returning empty sets.`
      );
      return NextResponse.json({ created_at: null, sets: [] }, { status: 200 });
    }

    const { id: recordId, created_at } = recordData;

    // Fetch sets associated with the recent exercise record
    const { data: setsData, error: setsError } = await supabase
      .from("exercise_set_records")
      .select("set_number, reps, weight")
      .eq("exercise_record_id", recordId)
      .order("set_number", { ascending: true });

    if (setsError) {
      console.error(
        "Error fetching sets for recent record:",
        setsError.message
      );
      return NextResponse.json({ error: setsError.message }, { status: 400 });
    }

    console.log("Fetched sets data:", setsData);

    return NextResponse.json(
      { created_at, sets: setsData || [] },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Unexpected error:", error.message);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
