import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = await supabaseServer();

  try {
    // Get the current user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Error fetching session:", sessionError);
      return NextResponse.json({ error: sessionError.message }, { status: 500 });
    }

    if (!session?.user) {
      console.warn("No user session found.");
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch all `exercise_set_records` for the user's exercises
    const { data: setRecords, error: queryError } = await supabase
      .from("exercise_set_records")
      .select("reps, weight, exercise_records (exercises (user_id))")
      .eq("exercise_records.exercises.user_id", userId);

    if (queryError) {
      console.error("Error querying set records:", queryError);
      return NextResponse.json({ error: queryError.message }, { status: 500 });
    }

    if (!setRecords) {
      return NextResponse.json({ totalWeight: 0 }, { status: 200 });
    }

    // Calculate the total weight lifted
    let totalWeight = 0;
    for (const record of setRecords) {
      const { reps, weight } = record;

      if (typeof reps === "number" && typeof weight === "number") {
        totalWeight += reps * weight;
      }
    }

    return NextResponse.json({ totalWeight }, { status: 200 });
  } catch (err) {
    console.error("Error in /api/totalweight:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
