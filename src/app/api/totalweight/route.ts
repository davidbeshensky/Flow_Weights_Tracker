import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
    const supabase = await supabaseServer();
  
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
  
      if (sessionError) {
        console.error("Error fetching session:", sessionError);
      }
  
      if (!session?.user) {
        console.warn("No user session found.");
        return NextResponse.json({ error: "Not logged in" }, { status: 401 });
      }
  
      const userId = session.user.id;
  
      const { data: exercises, error: queryError } = await supabase
        .from("exercises")
        .select("id, exercise_records(reps, weights)")
        .eq("user_id", userId);
  
      if (queryError) {
        console.error("Error querying exercises:", queryError);
        return NextResponse.json({ error: queryError.message }, { status: 500 });
      }
  
  
      let totalWeight = 0;
  
      if (exercises) {
        for (const exercise of exercises) {
          for (const record of exercise.exercise_records ?? []) {
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
    } catch (err) {
      console.error("Error in /api/totalweight:", err);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
  
