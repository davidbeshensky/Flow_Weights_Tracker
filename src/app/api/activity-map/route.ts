// app/api/activity-map/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const userId = session.user.id;

  // Call the RPC function
  const { data, error } = await supabase.rpc("activity_by_day", {
    user_id_input: userId, // Pass the user's ID to the RPC function
  });

  if (error) {
    console.error("Error calling activity_by_day RPC:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "No data found" }, { status: 404 });
  }

  // Transform the data to exclude total_weight (optional)
  const result = data.map(({ date, total_records }: { date: string; total_records: number }) => ({
    date,
    count: total_records,
  }));

  return NextResponse.json(result, { status: 200 });
}
