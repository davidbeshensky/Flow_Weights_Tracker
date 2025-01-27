import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

function extractPresetIdFromPathname(pathname: string): string | null {
  const segments = pathname.split("/"); // Split the pathname into parts
  const presetIdIndex = segments.indexOf("presets") + 1; // Find the index of "presets"
  return segments[presetIdIndex] || null; // Return the next segment as presetId
}

export async function PATCH(request: NextRequest) {
  const { pathname } = new URL(request.url);
  const presetId = extractPresetIdFromPathname(pathname);

  if (!presetId) {
    console.error("Missing presetId in URL pathname:", pathname);
    return NextResponse.json(
      { error: "Preset ID is required." },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { starred } = body;

    if (typeof starred !== "boolean") {
      return NextResponse.json(
        { error: "`starred` must be a boolean value." },
        { status: 400 }
      );
    }

    const supabase = await supabaseServer();
    const { data, error } = await supabase
      .from("workout_presets")
      .update({ starred })
      .eq("id", presetId)
      .select();

    if (error) {
      console.error("Error updating preset:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Unexpected error updating preset:", error.message);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
