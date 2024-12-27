import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const { exerciseId } = await req.json();

    if (!exerciseId) {
      return NextResponse.json(
        { error: "Exercise ID is required" },
        { status: 400 }
      );
    }

    // Step 1: Delete all records in `exercise_records` associated with the exercise
    const { error: recordsError } = await supabase
      .from("exercise_records")
      .delete()
      .eq("exercise_id", exerciseId);

    if (recordsError) {
      throw new Error(`Failed to delete associated exercise records: ${recordsError.message}`);
    }

    // Step 2: Delete the exercise itself in the `exercises` table
    const { error: exerciseError } = await supabase
      .from("exercises")
      .delete()
      .eq("id", exerciseId);

    if (exerciseError) {
      throw new Error(`Failed to delete exercise: ${exerciseError.message}`);
    }

    return NextResponse.json({ message: "Exercise and associated records deleted successfully" });
  } catch (error) {
    console.error("Error deleting exercise:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error occurred" },
      { status: 500 }
    );
  }
}
