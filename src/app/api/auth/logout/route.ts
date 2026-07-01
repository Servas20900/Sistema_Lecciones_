import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";

export async function POST() {
  const db = await getServerSupabase();
  await db.auth.signOut();
  return NextResponse.json({ success: true });
}
