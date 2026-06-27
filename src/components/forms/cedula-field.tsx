"use client";
import { useState, useEffect, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Unlock, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CedulaFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

type LookupState = "idle" | "loading" | "found" | "not-found" | "error";

export function CedulaFields({ form }: CedulaFieldProps) {
  const [lookupState, setLookupState] = useState<LookupState>("idle");
  const [locked, setLocked] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cedula = form.watch("cedula");

  useEffect(() => {
    if (!cedula || !/^\d{9}$/.test(cedula)) {
      setLookupState("idle");
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLookupState("loading");
      try {
        const res = await fetch(`/api/hacienda?cedula=${cedula}`);
        const data = await res.json();
        if (data.found) {
          form.setValue("nombre", data.nombre, { shouldValidate: true });
          form.setValue("primer_apellido", data.primer_apellido, { shouldValidate: true });
          form.setValue("segundo_apellido", data.segundo_apellido ?? "", { shouldValidate: true });
          setLookupState("found");
          setLocked(true);
        } else {
          setLookupState("not-found");
          setLocked(false);
        }
      } catch {
        setLookupState("error");
        setLocked(false);
      }
    }, 600);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [cedula, form]);

  const handleUnlock = () => {
    setLocked(false);
    setLookupState("idle");
    form.setValue("nombre", "");
    form.setValue("primer_apellido", "");
    form.setValue("segundo_apellido", "");
  };

  const fieldClass = (name: string) =>
    cn(locked && "bg-muted text-muted-foreground cursor-not-allowed");

  return (
    <div className="space-y-4">
      {/* Cédula */}
      <div className="space-y-1.5">
        <Label htmlFor="cedula">Número de cédula <span className="text-destructive">*</span></Label>
        <div className="relative">
          <Input
            id="cedula"
            placeholder="123456789"
            maxLength={9}
            {...form.register("cedula")}
          />
          {lookupState === "loading" && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {lookupState === "found" && (
            <CheckCircle className="absolute right-3 top-2.5 h-4 w-4 text-emerald-600" />
          )}
        </div>
        {form.formState.errors.cedula && (
          <p className="text-xs text-destructive">{String(form.formState.errors.cedula.message)}</p>
        )}
      </div>

      {/* Autocomplete feedback */}
      {lookupState === "found" && (
        <Alert variant="success" className="py-2">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Datos completados desde el Registro Nacional.</span>
            <Button type="button" variant="ghost" size="sm" onClick={handleUnlock} className="h-7 gap-1 text-xs">
              <Unlock className="h-3 w-3" /> Editar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {(lookupState === "not-found" || lookupState === "error") && (
        <Alert variant="warning" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Cédula no encontrada en el Registro Nacional. Complete los datos manualmente.
            <p className="mt-1 text-xs opacity-80">Asegúrese de que el nombre coincida exactamente con su cédula para evitar duplicados.</p>
          </AlertDescription>
        </Alert>
      )}

      {/* Nombre fields */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="nombre">Nombre(s) <span className="text-destructive">*</span></Label>
          <div className="relative">
            <Input
              id="nombre"
              placeholder="María"
              readOnly={locked}
              className={fieldClass("nombre")}
              {...form.register("nombre")}
            />
            {locked && <Lock className="absolute right-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />}
          </div>
          {form.formState.errors.nombre && (
            <p className="text-xs text-destructive">{String(form.formState.errors.nombre.message)}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="primer_apellido">Primer apellido <span className="text-destructive">*</span></Label>
          <div className="relative">
            <Input
              id="primer_apellido"
              placeholder="González"
              readOnly={locked}
              className={fieldClass("primer_apellido")}
              {...form.register("primer_apellido")}
            />
            {locked && <Lock className="absolute right-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />}
          </div>
          {form.formState.errors.primer_apellido && (
            <p className="text-xs text-destructive">{String(form.formState.errors.primer_apellido.message)}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="segundo_apellido">Segundo apellido</Label>
          <div className="relative">
            <Input
              id="segundo_apellido"
              placeholder="Mora"
              readOnly={locked}
              className={fieldClass("segundo_apellido")}
              {...form.register("segundo_apellido")}
            />
            {locked && <Lock className="absolute right-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />}
          </div>
          {form.formState.errors.segundo_apellido && (
            <p className="text-xs text-destructive">{String(form.formState.errors.segundo_apellido.message)}</p>
          )}
        </div>
      </div>

      {/* Correo */}
      <div className="space-y-1.5">
        <Label htmlFor="correo">Correo institucional <span className="text-destructive">*</span></Label>
        <Input
          id="correo"
          type="email"
          placeholder="nombre@mep.go.cr"
          {...form.register("correo")}
        />
        {form.formState.errors.correo && (
          <p className="text-xs text-destructive">{String(form.formState.errors.correo.message)}</p>
        )}
      </div>
    </div>
  );
}
