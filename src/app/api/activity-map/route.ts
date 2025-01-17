// app/api/activity-map/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  // Retrieve the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    console.log("Fetching exercises for user:", userId);

    // Step 1: Get all exercise IDs for the user
    const { data: exercises, error: exerciseError } = await supabase
      .from("exercises")
      .select("id")
      .eq("user_id", userId);

    if (exerciseError) {
      console.error("Error fetching exercises:", exerciseError.message);
      return NextResponse.json(
        { error: exerciseError.message },
        { status: 500 }
      );
    }

    if (!exercises || exercises.length === 0) {
      console.warn("No exercises found for user:", userId);
      return NextResponse.json([], { status: 200 }); // Return empty array if no exercises exist
    }

    const exerciseIds = exercises.map((exercise) => exercise.id);

    console.log("Fetched exercise IDs:", exerciseIds);

    // Step 2: Query exercise_records for these exercise IDs
    const { data: records, error: recordError } = await supabase
      .from("exercise_records")
      .select("created_at")
      .in("exercise_id", exerciseIds); // Use `in` to match multiple exercise IDs

    if (recordError) {
      console.error("Error fetching exercise records:", recordError.message);
      return NextResponse.json({ error: recordError.message }, { status: 500 });
    }

    if (!records || records.length === 0) {
      console.warn("No records found for the user's exercises");
      return NextResponse.json([], { status: 200 }); // Return empty array if no records exist
    }

    console.log("Fetched exercise records:", records);

    // Step 3: Aggregate counts by local date
    const activityMap: Record<string, number> = {};

    records.forEach((record) => {
      const utcDate = new Date(record.created_at); // Parse UTC date
      const localDate = new Date(
        utcDate.getTime() - utcDate.getTimezoneOffset() * 60 * 1000
      ); // Adjust to local timezone
      const localDateStr = localDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
      activityMap[localDateStr] = (activityMap[localDateStr] || 0) + 1;
    });

    // Transform the aggregated data into the expected format
    const result = Object.entries(activityMap).map(([date, count]) => ({
      date,
      count,
    }));

    console.log("Transformed activity data:", result);

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("Unexpected error fetching activity data:", err.message);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
