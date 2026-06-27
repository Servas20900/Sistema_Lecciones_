import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const cedula = req.nextUrl.searchParams.get("cedula");
  if (!cedula || !/^\d{9}$/.test(cedula)) {
    return NextResponse.json({ error: "Cédula inválida" }, { status: 400 });
  }

  const { data: balance } = await supabase
    .from("teacher_balances")
    .select("*")
    .eq("cedula", cedula)
    .single();

  if (!balance) {
    return NextResponse.json({ found: false });
  }

  const [accRes, usageRes] = await Promise.all([
    supabase
      .from("accumulation_requests")
      .select("*")
      .eq("teacher_id", balance.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("usage_requests")
      .select("*")
      .eq("teacher_id", balance.id)
      .order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({
    found: true,
    teacher: balance,
    accumulations: accRes.data ?? [],
    usages: usageRes.data ?? [],
  });
}
