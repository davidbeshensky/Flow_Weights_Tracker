import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getMondayOfCurrentWeek, getSundayOfCurrentWeek } from "@/lib/dateUtils";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Get the current user session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get the date range for the current week
    const monday = getMondayOfCurrentWeek();
    const sunday = getSundayOfCurrentWeek(monday);

    // Fetch only the necessary data within the week range
    const { data, error } = await supabase
      .from("exercise_set_records")
      .select(
        `
          exercise_records (
            exercises (
              muscles_worked
            )
          )
        `
      )
      .eq("exercise_records.exercises.user_id", userId)
      .gte("created_at", monday.toISOString())
      .lte("created_at", sunday.toISOString()); // Current week range

    if (error) {
      console.error("Error fetching data:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Validate and process the data
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: "Unexpected data structure returned from Supabase" },
        { status: 500 }
      );
    }

    // Initialize a map to accumulate sets per muscle
    const setsPerMuscle: Record<string, number> = {};

    // Process each set record
    data.forEach((set: any) => {
      const { exercise_records } = set;

      // Check if `exercise_records.exercises` is null
      if (!exercise_records?.exercises) {
        console.warn("Unexpected structure of exercise_records:", exercise_records);
        return; // Skip this record
      }

      const { muscles_worked } = exercise_records.exercises;

      // Check if `muscles_worked` is null
      if (!muscles_worked) {
        console.warn("Unexpected structure of muscles_worked:", muscles_worked);
        return; // Skip this record
      }

      // Iterate through the muscles worked and update the count
      Object.entries(muscles_worked).forEach(([muscle, contribution]) => {
        if (typeof contribution === "number" && contribution > 0) {
          setsPerMuscle[muscle] = (setsPerMuscle[muscle] || 0) + contribution;
        }
      });
    });

    // Return the aggregated sets per muscle
    return NextResponse.json(setsPerMuscle, { status: 200 });
  } catch (err) {
    console.error("Error in route:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
