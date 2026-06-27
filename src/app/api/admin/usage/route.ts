import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const estado = req.nextUrl.searchParams.get("estado");

  let query = supabase
    .from("usage_requests")
    .select("*, teachers(*)")
    .order("created_at", { ascending: false });

  if (estado && ["pendiente", "aprobada", "rechazada"].includes(estado)) {
    query = query.eq("estado", estado);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}
