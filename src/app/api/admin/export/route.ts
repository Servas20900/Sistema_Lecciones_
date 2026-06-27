import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const db = getSupabase();

  const [teachersRes, accumRes, usageRes] = await Promise.all([
    db.from("teacher_balances").select("*").order("primer_apellido"),
    db.from("accumulation_requests").select("*").order("fecha_acumulada", { ascending: false }),
    db.from("usage_requests").select("*").order("fecha_rebajo_propuesta", { ascending: false }),
  ]);

  return NextResponse.json({
    teachers: teachersRes.data ?? [],
    accumulations: accumRes.data ?? [],
    usages: usageRes.data ?? [],
  });
}
