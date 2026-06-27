import { getSupabase } from "./supabase";
import type { Teacher } from "./supabase";

interface TeacherData {
  cedula: string;
  nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  correo: string;
}

/**
 * Busca el docente por cédula. Si existe, actualiza correo y nombre.
 * Si no existe, lo inserta. Devuelve el registro resultante.
 * Evita upsert con onConflict que genera PGRST125 en algunas versiones de PostgREST.
 */
export async function upsertTeacher(data: TeacherData): Promise<{ teacher: Teacher | null; error: string | null }> {
  const db = getSupabase();

  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

  // 1. Buscar por cédula
  const { data: existing, error: selectError } = await db
    .from("teachers")
    .select("*")
    .eq("cedula", data.cedula)
    .maybeSingle();

  if (selectError) {
    console.error("Select error full:", JSON.stringify(selectError));
    return { teacher: null, error: selectError.message };
  }

  if (existing) {
    // 2a. Actualizar campos que pueden cambiar (correo, nombre)
    const { data: updated, error } = await db
      .from("teachers")
      .update({
        nombre: data.nombre,
        primer_apellido: data.primer_apellido,
        segundo_apellido: data.segundo_apellido,
        correo: data.correo,
      })
      .eq("cedula", data.cedula)
      .select("*")
      .single();

    if (error) return { teacher: null, error: error.message };
    return { teacher: updated, error: null };
  }

  // 2b. Insertar nuevo docente
  const { data: inserted, error } = await db
    .from("teachers")
    .insert(data)
    .select("*")
    .single();

  if (error) return { teacher: null, error: error.message };
  return { teacher: inserted, error: null };
}
