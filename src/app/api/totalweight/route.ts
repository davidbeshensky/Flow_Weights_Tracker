import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

// 1) Query all exercise records that belong to the user
// 2) Sum up the total weight = sum of (reps[i] * weights[i]) across all sets
export async function GET() {
  // 1. Create a Supabase server client using cookies
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 2. Check if user is logged in
  if (!session?.user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const userId = session.user.id;

  const { data: exercises, error } = await supabase
    .from("exercises")
    .select("id, exercise_records(reps, weights)")
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 4. Sum all reps * weight from the nested arrays
  let totalWeight = 0;

  if (exercises) {
    for (const exercise of exercises) {
      // exercise.exercise_records is an array of records
      // each record has reps[] and weights[].
      for (const record of exercise.exercise_records ?? []) {
        // safety check: ensure lengths match
        if (
          Array.isArray(record.reps) &&
          Array.isArray(record.weights) &&
          record.reps.length === record.weights.length
        ) {
          for (let i = 0; i < record.reps.length; i++) {
            totalWeight += record.reps[i] * record.weights[i];
          }
        }
      }
    }
  }

  return NextResponse.json({ totalWeight }, { status: 200 });
}
