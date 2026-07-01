import { getServerSupabase } from "./supabase-server";
import type { Teacher } from "./supabase";

/**
 * Devuelve el docente autenticado en la sesión actual (vía cookies), o null.
 * Usar en route handlers / server components del lado de docente.
 */
export async function getTeacherSession(): Promise<Teacher | null> {
  const db = await getServerSupabase();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) return null;

  const { data: teacher } = await db
    .from("teachers")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return teacher ?? null;
}
