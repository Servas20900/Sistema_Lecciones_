"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Search, CheckCircle, UserPlus, Pencil } from "lucide-react";
import type { Teacher } from "@/lib/supabase";
import { fullName } from "@/lib/utils";

export default function DocentesPage() {
  const [data, setData] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [cedula, setCedula] = useState("");
  const [nombre, setNombre] = useState("");
  const [primerApellido, setPrimerApellido] = useState("");
  const [segundoApellido, setSegundoApellido] = useState("");
  const [lookupState, setLookupState] = useState<"idle" | "loading" | "found" | "not-found">("idle");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [editTarget, setEditTarget] = useState<Teacher | null>(null);
  const [editCedula, setEditCedula] = useState("");
  const [editNombre, setEditNombre] = useState("");
  const [editPrimerApellido, setEditPrimerApellido] = useState("");
  const [editSegundoApellido, setEditSegundoApellido] = useState("");
  const [editCorreo, setEditCorreo] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/admin/teachers");
    const json = await res.json();
    setData(json.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!/^\d{9}$/.test(cedula)) {
      setLookupState("idle");
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLookupState("loading");
      try {
        const res = await fetch(`/api/hacienda?cedula=${cedula}`);
        const result = await res.json();
        if (result.found) {
          setNombre(result.nombre);
          setPrimerApellido(result.primer_apellido);
          setSegundoApellido(result.segundo_apellido ?? "");
          setLookupState("found");
        } else {
          setLookupState("not-found");
        }
      } catch {
        setLookupState("not-found");
      }
    }, 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [cedula]);

  const filtered = data.filter((t) => {
    const q = search.toLowerCase();
    return !q || fullName(t).toLowerCase().includes(q) || t.cedula.includes(q);
  });

  const handleSubmit = async () => {
    setFormError(null);
    setSuccess(null);
    if (!/^\d{9}$/.test(cedula)) {
      setFormError("La cédula debe tener 9 dígitos.");
      return;
    }
    if (!nombre || !primerApellido) {
      setFormError("Complete nombre y primer apellido.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cedula,
          nombre,
          primer_apellido: primerApellido,
          segundo_apellido: segundoApellido,
        }),
      });
      const body = await res.json();
      if (res.ok) {
        setSuccess(`Docente registrado. Ya puede activar su cuenta desde /login con la cédula ${cedula}.`);
        setCedula(""); setNombre(""); setPrimerApellido(""); setSegundoApellido("");
        setLookupState("idle");
        fetchData();
      } else if (body.errors) {
        setFormError(Object.values(body.errors).flat().join(" "));
      } else {
        setFormError(body.error ?? "No se pudo registrar el docente.");
      }
    } catch {
      setFormError("Error de conexión. Intente nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (t: Teacher) => {
    setEditTarget(t);
    setEditCedula(t.cedula);
    setEditNombre(t.nombre);
    setEditPrimerApellido(t.primer_apellido);
    setEditSegundoApellido(t.segundo_apellido);
    setEditCorreo(t.correo ?? "");
    setEditError(null);
  };

  const handleEditSubmit = async () => {
    if (!editTarget) return;
    setEditError(null);
    if (!/^\d{9}$/.test(editCedula)) {
      setEditError("La cédula debe tener 9 dígitos.");
      return;
    }
    if (!editNombre || !editPrimerApellido) {
      setEditError("Complete nombre y primer apellido.");
      return;
    }
    setEditSubmitting(true);
    try {
      const res = await fetch(`/api/admin/teachers/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cedula: editCedula,
          nombre: editNombre,
          primer_apellido: editPrimerApellido,
          segundo_apellido: editSegundoApellido,
          correo: editCorreo,
        }),
      });
      const body = await res.json();
      if (res.ok) {
        setEditTarget(null);
        fetchData();
      } else if (body.errors) {
        setEditError(Object.values(body.errors).flat().join(" "));
      } else {
        setEditError(body.error ?? "No se pudo actualizar el docente.");
      }
    } catch {
      setEditError("Error de conexión. Intente nuevamente.");
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Docentes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registre personal nuevo para que pueda activar su cuenta, y consulte quién ya activó la suya.
        </p>
      </div>

      {/* Alta de docente */}
      <div className="mb-8 rounded-lg border border-border p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Registrar docente nuevo</h2>
        </div>

        {formError && (
          <Alert variant="destructive" className="py-2">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="py-2">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="cedula">Cédula</Label>
          <div className="relative max-w-xs">
            <Input
              id="cedula"
              placeholder="123456789"
              maxLength={9}
              value={cedula}
              onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
            />
            {lookupState === "loading" && (
              <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {lookupState === "found" && (
              <CheckCircle className="absolute right-3 top-2.5 h-4 w-4 text-emerald-600" />
            )}
          </div>
          {lookupState === "not-found" && (
            <p className="text-xs text-muted-foreground">No se encontró en el Registro Nacional. Complete los datos manualmente.</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre(s)</Label>
            <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="primer_apellido">Primer apellido</Label>
            <Input id="primer_apellido" value={primerApellido} onChange={(e) => setPrimerApellido(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="segundo_apellido">Segundo apellido</Label>
            <Input id="segundo_apellido" value={segundoApellido} onChange={(e) => setSegundoApellido(e.target.value)} />
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrar docente"}
        </Button>
      </div>

      {/* Listado */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nombre o cédula..." className="pl-9 max-w-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-8">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando...
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                <th className="px-4 py-2.5 text-left font-medium">Docente</th>
                <th className="px-4 py-2.5 text-left font-medium">Cédula</th>
                <th className="px-4 py-2.5 text-left font-medium">Correo</th>
                <th className="px-4 py-2.5 text-left font-medium">Estado</th>
                <th className="px-4 py-2.5 text-left font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{fullName(t)}</td>
                  <td className="px-4 py-3">{t.cedula}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.correo ?? "—"}</td>
                  <td className="px-4 py-3">
                    {t.auth_user_id ? (
                      <Badge variant="aprobada">Activado</Badge>
                    ) : (
                      <Badge variant="pendiente">Sin activar</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => openEdit(t)}>
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="max-w-md w-[95vw]">
          <DialogHeader><DialogTitle>Editar docente</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {editError && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription>{editError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="edit_cedula">Cédula</Label>
              <Input
                id="edit_cedula"
                maxLength={9}
                value={editCedula}
                onChange={(e) => setEditCedula(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit_nombre">Nombre(s)</Label>
                <Input id="edit_nombre" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit_primer_apellido">Primer apellido</Label>
                <Input id="edit_primer_apellido" value={editPrimerApellido} onChange={(e) => setEditPrimerApellido(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit_segundo_apellido">Segundo apellido</Label>
                <Input id="edit_segundo_apellido" value={editSegundoApellido} onChange={(e) => setEditSegundoApellido(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit_correo">Correo</Label>
                <Input id="edit_correo" type="email" value={editCorreo} onChange={(e) => setEditCorreo(e.target.value)} />
              </div>
            </div>
            {editTarget?.auth_user_id && (
              <p className="text-xs text-muted-foreground">
                Este docente ya activó su cuenta. Si cambia el correo aquí, no se actualiza su acceso de inicio de sesión —
                solo el dato de contacto. Para eso debe restablecer su contraseña desde /recuperar.
              </p>
            )}
            <Button className="w-full" onClick={handleEditSubmit} disabled={editSubmitting}>
              {editSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar cambios"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
