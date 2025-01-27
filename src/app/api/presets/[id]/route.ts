import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params; // Extract the dynamic route parameter
  if (!id) {
    return NextResponse.json({ error: "Preset ID is required." }, { status: 400 });
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

    const supabase = supabaseServer();
    const { data, error } = await (await supabase)
      .from("workout_presets")
      .update({ starred })
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update preset." },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error." },
      { status: 500 }
    );
  }
}
