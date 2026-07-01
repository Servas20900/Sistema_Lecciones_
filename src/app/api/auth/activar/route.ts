import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getServerSupabase } from "@/lib/supabase-server";
import { validatePassword } from "@/lib/password";
import { z } from "zod";

const activarSchema = z.object({
  cedula: z.string().regex(/^\d{9}$/, "Cédula inválida."),
  correo: z
    .string()
    .email("Ingrese un correo válido.")
    .refine(
      (v) => v === "sebasmendeza09@gmail.com" || v.endsWith("@mep.go.cr"),
      "El correo debe terminar en @mep.go.cr."
    ),
  password: z.string().superRefine((v, ctx) => {
    const error = validatePassword(v);
    if (error) ctx.addIssue({ code: "custom", message: error });
  }),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = activarSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  const { cedula, correo, password } = parsed.data;

  const admin = getSupabase();

  const { data: teacher } = await admin
    .from("teachers")
    .select("*")
    .eq("cedula", cedula)
    .maybeSingle();

  if (!teacher) {
    return NextResponse.json({ error: "No está registrado en el sistema. Contacte a dirección." }, { status: 404 });
  }
  if (teacher.auth_user_id) {
    return NextResponse.json({ error: "Esta cuenta ya fue activada. Inicie sesión normalmente." }, { status: 409 });
  }

  // Evitar correo duplicado en otra cuenta
  const { data: correoEnUso } = await admin
    .from("teachers")
    .select("id")
    .eq("correo", correo)
    .neq("id", teacher.id)
    .maybeSingle();
  if (correoEnUso) {
    return NextResponse.json({ errors: { correo: ["Este correo ya está asociado a otra cuenta."] } }, { status: 422 });
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: correo,
    password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    if (createError?.message?.toLowerCase().includes("already")) {
      return NextResponse.json({ errors: { correo: ["Este correo ya tiene una cuenta."] } }, { status: 422 });
    }
    console.error("createUser error:", createError);
    return NextResponse.json({ error: "No se pudo crear la cuenta. Intente nuevamente." }, { status: 500 });
  }

  const { error: updateError } = await admin
    .from("teachers")
    .update({
      correo,
      auth_user_id: created.user.id,
      activated_at: new Date().toISOString(),
    })
    .eq("id", teacher.id);

  if (updateError) {
    console.error("Link teacher error:", updateError);
    return NextResponse.json({ error: "Cuenta creada pero no se pudo vincular. Contacte soporte." }, { status: 500 });
  }

  // Iniciar sesión inmediatamente, dejando las cookies puestas
  const sessionClient = await getServerSupabase();
  const { error: signInError } = await sessionClient.auth.signInWithPassword({ email: correo, password });
  if (signInError) {
    return NextResponse.json({ error: "Cuenta activada. Inicie sesión manualmente." }, { status: 200 });
  }

  return NextResponse.json({ success: true });
}
