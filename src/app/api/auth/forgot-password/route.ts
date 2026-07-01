import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const { correo } = await req.json();
  if (!correo) {
    return NextResponse.json({ error: "Ingrese su correo." }, { status: 422 });
  }

  const db = await getServerSupabase();
  // No revelamos si el correo existe o no — siempre respondemos éxito.
  await db.auth.resetPasswordForEmail(correo, {
    redirectTo: `${req.nextUrl.origin}/restablecer`,
  });

  return NextResponse.json({ success: true });
}
