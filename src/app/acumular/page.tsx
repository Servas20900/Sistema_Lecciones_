"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PublicNav } from "@/components/ui/public-nav";
import { ProfileBanner, useTeacherProfile } from "@/components/forms/profile-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { accumulationSchema, type AccumulationInput } from "@/lib/validations";
import { LESSON_SLOTS, MATERIAS } from "@/lib/constants";
import { CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AcumularPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { teacher } = useTeacherProfile();

  const form = useForm<AccumulationInput>({
    resolver: zodResolver(accumulationSchema),
    defaultValues: {
      fecha_acumulada: "",
      materia: undefined,
      cantidad_lecciones: undefined,
      lecciones: [],
      detalle: "",
    },
  });

  const cantidadLecciones = form.watch("cantidad_lecciones");
  const leccionesSeleccionadas = form.watch("lecciones") ?? [];
  const maxSeleccionable = Number(cantidadLecciones) || 0;

  const toggleLeccion = (bloque: string) => {
    const current = leccionesSeleccionadas;
    if (current.includes(bloque)) {
      form.setValue("lecciones", current.filter((l) => l !== bloque), { shouldValidate: true });
    } else if (current.length < maxSeleccionable) {
      form.setValue("lecciones", [...current, bloque], { shouldValidate: true });
    }
  };

  const onSubmit = async (data: AccumulationInput) => {
    setServerError(null);
    const res = await fetch("/api/acumular", {
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
          form.setError(field as keyof AccumulationInput, {
            message: (msgs as string[])[0],
          });
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
            Recibirá una confirmación en su correo institucional. La directora revisará su solicitud
            y le notificará la decisión por correo.
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
          <h1 className="text-2xl font-semibold tracking-tight">Registrar acumulación de lecciones</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete el formulario con los datos de las lecciones trabajadas fuera de su horario.
          </p>
        </div>

        {serverError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Section: Personal data */}
          <section className="space-y-4">
            <div className="border-b border-border pb-2">
              <h2 className="text-sm font-semibold text-foreground">Datos personales</h2>
            </div>
            <ProfileBanner teacher={teacher} />
          </section>

          {/* Section: Accumulation detail */}
          <section className="space-y-4">
            <div className="border-b border-border pb-2">
              <h2 className="text-sm font-semibold text-foreground">Detalle de la acumulación</h2>
            </div>

            {/* Fecha */}
            <div className="space-y-1.5">
              <Label htmlFor="fecha_acumulada">Fecha de acumulación <span className="text-destructive">*</span></Label>
              <Input
                id="fecha_acumulada"
                type="date"
                max={new Date().toISOString().split("T")[0]}
                {...form.register("fecha_acumulada", {
                  onChange: (e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const day = new Date(val + "T12:00:00").getDay();
                    if (day === 0 || day === 6) {
                      form.setError("fecha_acumulada", {
                        message: "La fecha no puede caer en fin de semana.",
                      });
                    } else {
                      form.clearErrors("fecha_acumulada");
                    }
                  },
                })}
              />
              {form.formState.errors.fecha_acumulada && (
                <p className="text-xs text-destructive">{form.formState.errors.fecha_acumulada.message}</p>
              )}
            </div>

            {/* Materia */}
            <div className="space-y-1.5">
              <Label>Materia <span className="text-destructive">*</span></Label>
              <Select
                onValueChange={(v) => form.setValue("materia", v as AccumulationInput["materia"], { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una materia" />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.materia && (
                <p className="text-xs text-destructive">{form.formState.errors.materia.message}</p>
              )}
            </div>

            {/* Cantidad de lecciones */}
            <div className="space-y-1.5">
              <Label htmlFor="cantidad_lecciones">Cantidad de lecciones <span className="text-destructive">*</span></Label>
              <Input
                id="cantidad_lecciones"
                type="number"
                min={1}
                max={14}
                placeholder="Ej: 2"
                {...form.register("cantidad_lecciones", { valueAsNumber: true })}
                onChange={(e) => {
                  form.register("cantidad_lecciones").onChange(e);
                  // Reset selected slots when quantity changes
                  form.setValue("lecciones", []);
                }}
              />
              {form.formState.errors.cantidad_lecciones && (
                <p className="text-xs text-destructive">{form.formState.errors.cantidad_lecciones.message}</p>
              )}
            </div>

            {/* Lesson slots */}
            <div className="space-y-2">
              <Label>
                Horarios de lecciones <span className="text-destructive">*</span>
                {maxSeleccionable > 0 && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {leccionesSeleccionadas.length}/{maxSeleccionable} seleccionados
                  </span>
                )}
              </Label>

              {maxSeleccionable === 0 ? (
                <p className="text-sm text-muted-foreground rounded-md border border-dashed border-border p-3">
                  Primero ingrese la cantidad de lecciones.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {LESSON_SLOTS.map((slot) => {
                    const isSelected = leccionesSeleccionadas.includes(slot.bloque);
                    const isDisabled = !isSelected && leccionesSeleccionadas.length >= maxSeleccionable;
                    return (
                      <button
                        key={slot.numero}
                        type="button"
                        onClick={() => toggleLeccion(slot.bloque)}
                        disabled={isDisabled}
                        className={cn(
                          "rounded-md border px-3 py-2 text-left text-xs transition-colors",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : isDisabled
                            ? "border-border bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                            : "border-border bg-background hover:bg-accent cursor-pointer"
                        )}
                      >
                        <span className="font-medium">Lec. {slot.numero}</span>
                        <br />
                        {slot.bloque}
                      </button>
                    );
                  })}
                </div>
              )}
              {form.formState.errors.lecciones && (
                <p className="text-xs text-destructive">{form.formState.errors.lecciones.message}</p>
              )}
            </div>

            {/* Detalle */}
            <div className="space-y-1.5">
              <Label htmlFor="detalle">
                Observaciones <span className="text-destructive">*</span>
                <span className="ml-2 text-xs font-normal text-muted-foreground">(mínimo 20 caracteres)</span>
              </Label>
              <Textarea
                id="detalle"
                rows={4}
                placeholder="Describa brevemente el contexto de las lecciones acumuladas..."
                {...form.register("detalle")}
              />
              <div className="flex justify-between">
                {form.formState.errors.detalle ? (
                  <p className="text-xs text-destructive">{form.formState.errors.detalle.message}</p>
                ) : <span />}
                <span className="text-xs text-muted-foreground">
                  {form.watch("detalle")?.length ?? 0} caracteres
                </span>
              </div>
            </div>
          </section>

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
            ) : (
              "Enviar solicitud de acumulación"
            )}
          </Button>
        </form>
      </main>
    </div>
  );
}
