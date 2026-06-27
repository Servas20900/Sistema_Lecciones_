import { NextRequest, NextResponse } from "next/server";

const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hora

export async function GET(req: NextRequest) {
  const cedula = req.nextUrl.searchParams.get("cedula");
  if (!cedula || !/^\d{9}$/.test(cedula)) {
    return NextResponse.json({ error: "Cédula inválida" }, { status: 400 });
  }

  const cached = cache.get(cedula);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const res = await fetch(
      `https://api.hacienda.go.cr/fe/ae?identificacion=${cedula}`,
      { signal: AbortSignal.timeout(6000) }
    );

    if (!res.ok) {
      return NextResponse.json({ found: false }, { status: 200 });
    }

    const raw = await res.json();

    if (!raw?.nombre) {
      return NextResponse.json({ found: false }, { status: 200 });
    }

    // La API devuelve: "NOMBRE(S) APELLIDO1 APELLIDO2"
    // Los últimos 2 tokens son los apellidos, el resto es el nombre
    const parts: string[] = raw.nombre.trim().split(/\s+/);
    const segundo_apellido = parts.length >= 2 ? (parts[parts.length - 1] ?? "") : "";
    const primer_apellido = parts.length >= 2 ? (parts[parts.length - 2] ?? "") : (parts[0] ?? "");
    const nombre = parts.slice(0, Math.max(parts.length - 2, 1)).join(" ");

    const data = { found: true, nombre, primer_apellido, segundo_apellido };
    cache.set(cedula, { data, ts: Date.now() });

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ found: false }, { status: 200 });
  }
}
