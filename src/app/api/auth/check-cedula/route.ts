import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { cedula } = await req.json();

  if (!cedula || !/^\d{9}$/.test(cedula)) {
    return NextResponse.json({ error: "Cédula inválida" }, { status: 422 });
  }

  const db = getSupabase();
  const { data: teacher } = await db
    .from("teachers")
    .select("id, nombre, primer_apellido, segundo_apellido, auth_user_id")
    .eq("cedula", cedula)
    .maybeSingle();

  if (!teacher) {
    return NextResponse.json({ exists: false });
  }

  return NextResponse.json({
    exists: true,
    activated: !!teacher.auth_user_id,
    nombre: `${teacher.nombre} ${teacher.primer_apellido}`,
  });
}
