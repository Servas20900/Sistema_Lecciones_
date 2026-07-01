import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { z } from "zod";

const newTeacherSchema = z.object({
  cedula: z.string().regex(/^\d{9}$/, "La cédula debe tener exactamente 9 dígitos."),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  primer_apellido: z.string().min(2, "El primer apellido debe tener al menos 2 caracteres."),
  segundo_apellido: z.string().optional(),
});

export async function GET() {
  const db = getSupabase();
  const { data, error } = await db
    .from("teachers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = newTeacherSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  const { cedula, nombre, primer_apellido, segundo_apellido } = parsed.data;

  const db = getSupabase();

  const { data: existing } = await db
    .from("teachers")
    .select("id")
    .eq("cedula", cedula)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ errors: { cedula: ["Ya existe un docente con esta cédula."] } }, { status: 422 });
  }

  const { data: inserted, error } = await db
    .from("teachers")
    .insert({
      cedula,
      nombre,
      primer_apellido,
      segundo_apellido: segundo_apellido ?? "",
    })
    .select("*")
    .single();

  if (error || !inserted) {
    console.error("Insert teacher error:", error);
    return NextResponse.json({ error: "Error al registrar el docente" }, { status: 500 });
  }

  return NextResponse.json({ success: true, teacher: inserted }, { status: 201 });
}
