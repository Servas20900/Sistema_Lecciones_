import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getTeacherSession } from "@/lib/teacher-auth";

export async function GET() {
  const teacher = await getTeacherSession();
  if (!teacher) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const db = getSupabase();

  const [balanceRes, accRes, usageRes] = await Promise.all([
    db.from("teacher_balances").select("*").eq("id", teacher.id).single(),
    db
      .from("accumulation_requests")
      .select("*")
      .eq("teacher_id", teacher.id)
      .order("created_at", { ascending: false }),
    db
      .from("usage_requests")
      .select("*")
      .eq("teacher_id", teacher.id)
      .order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({
    teacher: balanceRes.data ?? teacher,
    accumulations: accRes.data ?? [],
    usages: usageRes.data ?? [],
  });
}
