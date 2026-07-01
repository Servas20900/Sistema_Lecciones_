import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getTeacherSession } from "@/lib/teacher-auth";
import { accumulationSchema } from "@/lib/validations";
import {
  sendAccumulationConfirmationToTeacher,
  sendAccumulationNotificationToDirector,
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

  const parsed = accumulationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const reqData = parsed.data;

  if (reqData.lecciones.length > reqData.cantidad_lecciones) {
    return NextResponse.json(
      { errors: { lecciones: ["Ha seleccionado más horarios que la cantidad indicada."] } },
      { status: 422 }
    );
  }

  const db = getSupabase();
  const { data: request, error: reqError } = await db
    .from("accumulation_requests")
    .insert({
      teacher_id: teacher.id,
      fecha_acumulada: reqData.fecha_acumulada,
      materia: reqData.materia,
      lecciones: reqData.lecciones,
      cantidad_lecciones: reqData.cantidad_lecciones,
      detalle: reqData.detalle,
    })
    .select()
    .single();

  if (reqError || !request) {
    console.error("Accumulation insert error:", reqError);
    return NextResponse.json({ error: "Error al guardar la solicitud" }, { status: 500 });
  }

  await Promise.allSettled([
    sendAccumulationConfirmationToTeacher(teacher, request),
    sendAccumulationNotificationToDirector(teacher, request),
  ]);

  return NextResponse.json({ success: true, id: request.id }, { status: 201 });
}
