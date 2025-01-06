import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function supabaseServer() {
  const cookieStore = cookies(); // No need to `await` cookies() in this context
  return createRouteHandlerClient({ cookies: () => cookieStore });
}
