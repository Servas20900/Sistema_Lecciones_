"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PublicNav } from "@/components/ui/public-nav";
import { CedulaFields } from "@/components/forms/cedula-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usageSchema, type UsageInput } from "@/lib/validations";
import { CheckCircle, Loader2 } from "lucide-react";

export default function RebajarPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<UsageInput>({
    resolver: zodResolver(usageSchema),
    defaultValues: {
      cedula: "",
      nombre: "",
      primer_apellido: "",
      segundo_apellido: "",
      correo: "",
      fecha_rebajo_propuesta: "",
      hora_salida: "",
      lecciones_a_usar: undefined,
      motivo: "",
      detalle: "",
    },
  });

  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  const onSubmit = async (data: UsageInput) => {
    setServerError(null);
    const res = await fetch("/api/rebajar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      const body = await res.json();
      if (body.errors) {
        Object.entries(body.errors).forEach(([field, msgs]) => {
          form.setError(field as keyof UsageInput, { message: (msgs as string[])[0] });
        });
      } else {
        setServerError(body.error ?? "Ocurrió un error. Intente nuevamente.");
      }
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNav />
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <div className="mb-5 flex flex-col items-center gap-3">
            <img
              src="https://res.cloudinary.com/dcwxslhjf/image/upload/v1782579289/LogoManuelaNuevo_zlrwq7.png"
              alt="Escuela Manuela Santa María"
              className="h-12 w-auto object-contain opacity-80"
            />
            <CheckCircle className="h-10 w-10 text-emerald-500" />
          </div>
          <h1 className="mb-2 text-2xl font-semibold">Solicitud enviada</h1>
          <p className="mb-6 text-muted-foreground">
            Recibirá una confirmación en su correo. La directora revisará su solicitud de rebajo y
            le notificará la decisión.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={() => { setSubmitted(false); form.reset(); }}>
              Enviar otra solicitud
            </Button>
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Solicitar rebajo de lecciones</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use su saldo de lecciones acumuladas para solicitar salir antes en una fecha futura.
          </p>
        </div>

        {serverError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <section className="space-y-4">
            <div className="border-b border-border pb-2">
              <h2 className="text-sm font-semibold">Datos personales</h2>
              <p className="text-xs text-muted-foreground">Ingrese su cédula para autocompletar su información.</p>
            </div>
            <CedulaFields form={form} />
          </section>

          <section className="space-y-4">
            <div className="border-b border-border pb-2">
              <h2 className="text-sm font-semibold">Detalle del rebajo</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fecha_rebajo_propuesta">Fecha propuesta <span className="text-destructive">*</span></Label>
                <Input
                  id="fecha_rebajo_propuesta"
                  type="date"
                  min={minDate}
                  {...form.register("fecha_rebajo_propuesta", {
                    onChange: (e) => {
                      const val = e.target.value;
                      if (!val) return;
                      const day = new Date(val + "T12:00:00").getDay();
                      if (day === 0 || day === 6) {
                        form.setError("fecha_rebajo_propuesta", {
                          message: "No puede caer en fin de semana.",
                        });
                      } else {
                        form.clearErrors("fecha_rebajo_propuesta");
                      }
                    },
                  })}
                />
                {form.formState.errors.fecha_rebajo_propuesta && (
                  <p className="text-xs text-destructive">{form.formState.errors.fecha_rebajo_propuesta.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hora_salida">Hora de salida <span className="text-destructive">*</span></Label>
                <Input
                  id="hora_salida"
                  type="time"
                  min="07:00"
                  max="17:40"
                  {...form.register("hora_salida")}
                />
                <p className="text-xs text-muted-foreground">Entre 07:00 y 17:40</p>
                {form.formState.errors.hora_salida && (
                  <p className="text-xs text-destructive">{form.formState.errors.hora_salida.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lecciones_a_usar">Lecciones a usar <span className="text-destructive">*</span></Label>
              <Input
                id="lecciones_a_usar"
                type="number"
                min={1}
                max={14}
                placeholder="Ej: 2"
                {...form.register("lecciones_a_usar", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                El sistema verificará que no exceda su saldo disponible.
              </p>
              {form.formState.errors.lecciones_a_usar && (
                <p className="text-xs text-destructive">{form.formState.errors.lecciones_a_usar.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="motivo">Motivo <span className="text-destructive">*</span></Label>
              <Input
                id="motivo"
                placeholder="Ej: Cita médica"
                {...form.register("motivo")}
              />
              {form.formState.errors.motivo && (
                <p className="text-xs text-destructive">{form.formState.errors.motivo.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="detalle">
                Detalle adicional
                <span className="ml-2 text-xs font-normal text-muted-foreground">(opcional)</span>
              </Label>
              <Textarea
                id="detalle"
                rows={3}
                maxLength={1000}
                placeholder="Información adicional que desee compartir con la directora..."
                {...form.register("detalle")}
              />
              <div className="flex justify-end">
                <span className="text-xs text-muted-foreground">
                  {form.watch("detalle")?.length ?? 0}/1000
                </span>
              </div>
              {form.formState.errors.detalle && (
                <p className="text-xs text-destructive">{form.formState.errors.detalle.message}</p>
              )}
            </div>
          </section>

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
            ) : (
              "Enviar solicitud de rebajo"
            )}
          </Button>
        </form>
      </main>
    </div>
  );
}
