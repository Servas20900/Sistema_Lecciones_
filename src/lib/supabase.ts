// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type SubmissionState = "pendiente" | "aprobada" | "rechazada";

export interface Teacher {
  id: string;
  cedula: string;
  nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  correo: string | null;
  auth_user_id: string | null;
  activated_at: string | null;
  created_at: string;
}

export interface AccumulationRequest {
  id: string;
  teacher_id: string;
  fecha_acumulada: string;
  materia: string;
  lecciones: string[];
  cantidad_lecciones: number;
  detalle: string;
  estado: SubmissionState;
  comentario_admin: string;
  fecha_decision: string | null;
  created_at: string;
  teachers?: Teacher;
}

export interface UsageRequest {
  id: string;
  teacher_id: string;
  fecha_rebajo_propuesta: string;
  hora_salida: string;
  lecciones_a_usar: number;
  motivo: string;
  detalle: string;
  estado: SubmissionState;
  comentario_admin: string;
  fecha_decision: string | null;
  created_at: string;
  teachers?: Teacher;
}

export interface TeacherBalance {
  id: string;
  cedula: string;
  nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  correo: string;
  lecciones_acumuladas: number;
  lecciones_usadas: number;
  saldo_disponible: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: SupabaseClient<any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabase(): SupabaseClient<any> {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars not set");
  _client = createClient(url, key);
  return _client;
}

// Convenience alias — use only inside route handlers (never at module init time)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: SupabaseClient<any> = new Proxy({} as SupabaseClient<any>, {
  get(_t, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabase() as any;
    const val = client[prop];
    return typeof val === "function" ? val.bind(client) : val;
  },
});
