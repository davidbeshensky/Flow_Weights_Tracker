import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
  // For usage in server components or route handlers
  export const supabaseServer = createRouteHandlerClient({ cookies });
