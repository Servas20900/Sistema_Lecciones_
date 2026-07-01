"use client";
import { useState } from "react";
import { PublicNav } from "@/components/ui/public-nav";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, User as UserIcon } from "lucide-react";
import { useTeacherProfile, ProfileBanner } from "@/components/forms/profile-banner";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { validatePassword, PASSWORD_HINT } from "@/lib/password";

export default function PerfilPage() {
  const { teacher, loading } = useTeacherProfile();

  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [nueva2, setNueva2] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChangePassword = async () => {
    setError(null);
    setSuccess(false);
    if (!actual) {
      setError("Ingrese su contraseña actual.");
      return;
    }
    const passwordError = validatePassword(nueva);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (nueva !== nueva2) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    if (!teacher?.correo) return;

    setSubmitting(true);
    try {
      const supabase = getBrowserSupabase();
      // Reautenticar con la contraseña actual antes de cambiarla
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: teacher.correo,
        password: actual,
      });
      if (reauthError) {
        setError("La contraseña actual no es correcta.");
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password: nueva });
      if (updateError) {
        setError("No se pudo actualizar la contraseña. Intente nuevamente.");
        return;
      }
      setSuccess(true);
      setActual(""); setNueva(""); setNueva2("");
    } catch {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <main className="mx-auto max-w-xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-8 flex items-center gap-2">
          <UserIcon className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-semibold tracking-tight">Mi perfil</h1>
        </div>

        <section className="mb-8 space-y-3">
          <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">
            Datos personales
          </h2>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando...
            </div>
          ) : (
            <ProfileBanner teacher={teacher} />
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">
            Cambiar contraseña
          </h2>

          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="success" className="py-2">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Contraseña actualizada correctamente.</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="actual">Contraseña actual</Label>
            <PasswordInput id="actual" value={actual} onChange={(e) => setActual(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nueva">Nueva contraseña</Label>
            <PasswordInput id="nueva" value={nueva} onChange={(e) => setNueva(e.target.value)} />
            <p className="text-xs text-muted-foreground">{PASSWORD_HINT}</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nueva2">Confirme la nueva contraseña</Label>
            <PasswordInput
              id="nueva2"
              value={nueva2}
              onChange={(e) => setNueva2(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleChangePassword()}
            />
          </div>
          <Button onClick={handleChangePassword} disabled={submitting || loading}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Actualizar contraseña"}
          </Button>
        </section>
      </main>
    </div>
  );
}
