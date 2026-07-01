import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { z } from "zod";

const editTeacherSchema = z.object({
  cedula: z.string().regex(/^\d{9}$/, "La cédula debe tener exactamente 9 dígitos."),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  primer_apellido: z.string().min(2, "El primer apellido debe tener al menos 2 caracteres."),
  segundo_apellido: z.string().optional(),
  correo: z.string().email("Ingrese un correo válido.").optional().or(z.literal("")),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = editTeacherSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  const { cedula, nombre, primer_apellido, segundo_apellido, correo } = parsed.data;

  const db = getSupabase();

  const { data: dupCedula } = await db
    .from("teachers")
    .select("id")
    .eq("cedula", cedula)
    .neq("id", id)
    .maybeSingle();
  if (dupCedula) {
    return NextResponse.json({ errors: { cedula: ["Ya existe otro docente con esta cédula."] } }, { status: 422 });
  }

  if (correo) {
    const { data: dupCorreo } = await db
      .from("teachers")
      .select("id")
      .eq("correo", correo)
      .neq("id", id)
      .maybeSingle();
    if (dupCorreo) {
      return NextResponse.json({ errors: { correo: ["Ya existe otro docente con este correo."] } }, { status: 422 });
    }
  }

  const { data: updated, error } = await db
    .from("teachers")
    .update({
      cedula,
      nombre,
      primer_apellido,
      segundo_apellido: segundo_apellido ?? "",
      correo: correo || null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !updated) {
    console.error("Update teacher error:", error);
    return NextResponse.json({ error: "Error al actualizar el docente" }, { status: 500 });
  }

  return NextResponse.json({ success: true, teacher: updated });
}
