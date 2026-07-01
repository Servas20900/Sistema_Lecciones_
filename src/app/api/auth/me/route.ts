import { NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/teacher-auth";

export async function GET() {
  const teacher = await getTeacherSession();
  if (!teacher) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  return NextResponse.json({ teacher });
}
