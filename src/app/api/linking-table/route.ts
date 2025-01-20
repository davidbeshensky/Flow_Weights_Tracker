import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(request: NextRequest) {
  try {
    const linkingData = await request.json();
    console.log(linkingData);

    if (!Array.isArray(linkingData) || linkingData.length === 0) {
      return NextResponse.json(
        { error: "Invalid data for linking table." },
        { status: 400 }
      );
    }

    const supabase = await supabaseServer();

    // Insert linking data into the database
    const { error } = await supabase
      .from("workout_exercise_records") // Replace with your actual table name
      .insert(linkingData);

    if (error) {
      console.error("Error inserting linking data:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Linking data saved successfully." },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Unexpected error:", error.message);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
