import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getTeacherSession } from "@/lib/teacher-auth";
import { usageSchema } from "@/lib/validations";
import {
  sendUsageConfirmationToTeacher,
  sendUsageNotificationToDirector,
} from "@/lib/emails";

export async function POST(req: NextRequest) {
  const teacher = await getTeacherSession();
  if (!teacher) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

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

  const reqData = parsed.data;
  const db = getSupabase();

  // Verificar saldo
  const { data: balance } = await db
    .from("teacher_balances")
    .select("saldo_disponible")
    .eq("cedula", teacher.cedula)
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
