import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const { correo, password } = await req.json();

  if (!correo || !password) {
    return NextResponse.json({ error: "Complete correo y contraseña." }, { status: 422 });
  }

  const db = await getServerSupabase();
  const { error } = await db.auth.signInWithPassword({ email: correo, password });

  if (error) {
    return NextResponse.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
