"use client";
import { useState } from "react";
import { PublicNav } from "@/components/ui/public-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, MailCheck } from "lucide-react";

export default function RecuperarPage() {
  const [correo, setCorreo] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!correo) {
      setError("Ingrese su correo.");
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });
      setSent(true);
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
          <h1 className="text-xl font-semibold tracking-tight">Recuperar contraseña</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Le enviaremos un enlace a su correo para crear una nueva contraseña.
          </p>
        </div>

        {sent ? (
          <Alert variant="success">
            <MailCheck className="h-4 w-4" />
            <AlertDescription>
              Si el correo está registrado, recibirá un enlace en unos minutos. Revise también la
              carpeta de spam.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="correo">Correo MEP</Label>
              <Input
                id="correo"
                type="email"
                placeholder="nombre@mep.go.cr"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar enlace"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
