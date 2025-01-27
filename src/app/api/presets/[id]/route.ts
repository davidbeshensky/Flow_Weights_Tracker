import { supabaseServer } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await supabaseServer();
    const { id } = params; // Get `id` from the URL
    const { starred } = await req.json(); // Get `starred` from the request body

    // Validate required fields
    if (!id || typeof starred !== "boolean") {
      return NextResponse.json(
        { error: "Preset ID and starred status are required." },
        { status: 400 }
      );
    }

    // Get the user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (!session || sessionError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user_id = session.user.id;

    // Update the preset
    const { error } = await supabase
      .from("workout_presets")
      .update({ starred })
      .eq("id", id)
      .eq("user_id", user_id);

    if (error) {
      console.error("Error updating preset:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Preset updated successfully." },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    console.error("Error updating preset:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
