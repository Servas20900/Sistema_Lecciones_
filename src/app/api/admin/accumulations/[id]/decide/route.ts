import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabase } from "@/lib/supabase";
import { adminDecideSchema } from "@/lib/validations";
import { sendDecisionToTeacher } from "@/lib/emails";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { send_email = true, ...rest } = body;

  const parsed = adminDecideSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { estado, comentario_admin } = parsed.data;
  const fecha_decision = new Date().toISOString();
  const db = getSupabase();

  const { data: updated, error } = await db
    .from("accumulation_requests")
    .update({ estado, comentario_admin: comentario_admin ?? "", fecha_decision })
    .eq("id", id)
    .select("*, teachers(*)")
    .single();

  if (error || !updated) {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }

  if (send_email && updated.teachers) {
    await Promise.allSettled([
      sendDecisionToTeacher(
        updated.teachers,
        "acumulacion",
        estado,
        comentario_admin ?? "",
        fecha_decision
      ),
    ]);
  }

  return NextResponse.json({ success: true });
}
