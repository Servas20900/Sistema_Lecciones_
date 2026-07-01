"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PublicNav } from "@/components/ui/public-nav";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { validatePassword, PASSWORD_HINT } from "@/lib/password";

export default function RestablecerPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async () => {
    setError(null);
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (password !== password2) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      const supabase = getBrowserSupabase();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError("No se pudo actualizar. El enlace pudo haber expirado, solicite uno nuevo.");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/mis-lecciones"), 1500);
    } catch {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <main className="mx-auto max-w-sm px-4 py-12 sm:px-6 sm:py-20">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold tracking-tight">Nueva contraseña</h1>
        </div>

        {done ? (
          <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Contraseña actualizada. Redirigiendo...</AlertDescription>
          </Alert>
        ) : !ready ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-8">
            <Loader2 className="h-4 w-4 animate-spin" /> Verificando enlace...
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="password">Nueva contraseña</Label>
              <PasswordInput
                id="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{PASSWORD_HINT}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password2">Confirme la contraseña</Label>
              <PasswordInput
                id="password2"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar nueva contraseña"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
