"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PublicNav } from "@/components/ui/public-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle } from "lucide-react";
import { validatePassword, PASSWORD_HINT } from "@/lib/password";

type Step = "cedula" | "login" | "activar";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("cedula");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");

  const [cedula, setCedula] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const handleCedula = async () => {
    if (!/^\d{9}$/.test(cedula)) {
      setError("Ingrese una cédula de 9 dígitos.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/check-cedula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cedula }),
      });
      const data = await res.json();
      if (!data.exists) {
        setError("No está registrado en el sistema. Contacte a dirección para que lo agreguen.");
        return;
      }
      setNombre(data.nombre);
      setStep(data.activated ? "login" : "activar");
    } catch {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });
      if (res.ok) {
        router.push("/mis-lecciones");
        router.refresh();
      } else {
        const body = await res.json();
        setError(body.error ?? "No se pudo iniciar sesión.");
      }
    } catch {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleActivar = async () => {
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
      const res = await fetch("/api/auth/activar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cedula, correo, password }),
      });
      const body = await res.json();
      if (res.ok) {
        router.push("/mis-lecciones");
        router.refresh();
      } else if (body.errors) {
        setError(Object.values(body.errors).flat().join(" "));
      } else {
        setError(body.error ?? "No se pudo activar la cuenta.");
      }
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
          <img
            src="https://res.cloudinary.com/dcwxslhjf/image/upload/v1782579289/LogoManuelaNuevo_zlrwq7.png"
            alt="Escuela Manuela Santa María"
            className="mx-auto mb-4 h-12 w-auto object-contain"
          />
          <h1 className="text-xl font-semibold tracking-tight">
            {step === "cedula" && "Ingresar al sistema"}
            {step === "login" && "Bienvenido/a de nuevo"}
            {step === "activar" && "Active su cuenta"}
          </h1>
          {step !== "cedula" && nombre && (
            <p className="mt-1 text-sm text-muted-foreground">{nombre}</p>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-5">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === "cedula" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cedula">Número de cédula</Label>
              <Input
                id="cedula"
                placeholder="123456789"
                maxLength={9}
                value={cedula}
                onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && handleCedula()}
              />
            </div>
            <Button className="w-full" onClick={handleCedula} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continuar"}
            </Button>
          </div>
        )}

        {step === "login" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="correo">Correo MEP</Label>
              <Input
                id="correo"
                type="email"
                placeholder="nombre@mep.go.cr"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <Button className="w-full" onClick={handleLogin} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Iniciar sesión"}
            </Button>
            <div className="flex justify-between text-xs text-muted-foreground">
              <button onClick={() => setStep("cedula")} className="hover:underline">
                ← Cambiar cédula
              </button>
              <Link href="/recuperar" className="hover:underline">
                Olvidé mi contraseña
              </Link>
            </div>
          </div>
        )}

        {step === "activar" && (
          <div className="space-y-4">
            <Alert variant="info" className="py-2">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Primer ingreso: cree su cuenta.</AlertDescription>
            </Alert>
            <div className="space-y-1.5">
              <Label htmlFor="correo">Correo MEP</Label>
              <Input
                id="correo"
                type="email"
                placeholder="nombre@mep.go.cr"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Cree una contraseña</Label>
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
                onKeyDown={(e) => e.key === "Enter" && handleActivar()}
              />
            </div>
            <Button className="w-full" onClick={handleActivar} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear cuenta y continuar"}
            </Button>
            <button onClick={() => setStep("cedula")} className="text-xs text-muted-foreground hover:underline">
              ← Cambiar cédula
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
