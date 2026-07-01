import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase con la sesión del usuario (anon key + cookies httpOnly).
 * Úsese en route handlers y server components — respeta RLS.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getServerSupabase(): Promise<SupabaseClient<any>> {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Supabase anon env vars not set");

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Llamado desde un Server Component sin permiso de escritura — ignorar.
        }
      },
    },
  });
}
