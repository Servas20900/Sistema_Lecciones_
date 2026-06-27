import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { upsertTeacher } from "@/lib/teacher";
import { usageSchema } from "@/lib/validations";
import {
  sendUsageConfirmationToTeacher,
  sendUsageNotificationToDirector,
} from "@/lib/emails";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = usageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { cedula, nombre, primer_apellido, segundo_apellido, correo, ...reqData } = parsed.data;

  const { teacher, error: teacherError } = await upsertTeacher({
    cedula,
    nombre,
    primer_apellido,
    segundo_apellido: segundo_apellido ?? "",
    correo,
  });

  if (teacherError || !teacher) {
    console.error("Teacher error:", teacherError);
    return NextResponse.json({ error: "Error al guardar datos del docente" }, { status: 500 });
  }

  const db = getSupabase();

  // Verificar saldo
  const { data: balance } = await db
    .from("teacher_balances")
    .select("saldo_disponible")
    .eq("cedula", cedula)
    .single();

  const saldo = balance?.saldo_disponible ?? 0;
  if (reqData.lecciones_a_usar > saldo) {
    return NextResponse.json(
      {
        error: `No tiene suficientes lecciones disponibles. Saldo actual: ${saldo}.`,
        code: "INSUFFICIENT_BALANCE",
        saldo,
      },
      { status: 422 }
    );
  }

  const { data: request, error: reqError } = await db
    .from("usage_requests")
    .insert({
      teacher_id: teacher.id,
      fecha_rebajo_propuesta: reqData.fecha_rebajo_propuesta,
      hora_salida: reqData.hora_salida,
      lecciones_a_usar: reqData.lecciones_a_usar,
      motivo: reqData.motivo,
      detalle: reqData.detalle ?? "",
    })
    .select()
    .single();

  if (reqError || !request) {
    console.error("Usage insert error:", reqError);
    return NextResponse.json({ error: "Error al guardar la solicitud" }, { status: 500 });
  }

  await Promise.allSettled([
    sendUsageConfirmationToTeacher(teacher, request),
    sendUsageNotificationToDirector(teacher, request),
  ]);

  return NextResponse.json({ success: true, id: request.id }, { status: 201 });
}
