"use client";
import { useState } from "react";
import { PublicNav } from "@/components/ui/public-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Search } from "lucide-react";
import { formatDate, formatDateTime, fullName } from "@/lib/utils";
import type { AccumulationRequest, UsageRequest, TeacherBalance } from "@/lib/supabase";
import type { SubmissionState } from "@/lib/supabase";

type ConsultaResult = {
  found: boolean;
  teacher?: TeacherBalance;
  accumulations?: AccumulationRequest[];
  usages?: UsageRequest[];
};

function stateBadge(estado: SubmissionState) {
  const v = estado as "pendiente" | "aprobada" | "rechazada";
  const labels = { pendiente: "Pendiente", aprobada: "Aprobada", rechazada: "Rechazada" };
  return <Badge variant={v}>{labels[v]}</Badge>;
}

export default function ConsultaPage() {
  const [cedula, setCedula] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConsultaResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccum, setSelectedAccum] = useState<AccumulationRequest | null>(null);
  const [selectedUsage, setSelectedUsage] = useState<UsageRequest | null>(null);
  const [filterAccum, setFilterAccum] = useState<string>("all");
  const [filterUsage, setFilterUsage] = useState<string>("all");

  const handleConsulta = async () => {
    if (!/^\d{9}$/.test(cedula)) {
      setError("Ingrese una cédula de 9 dígitos.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/consulta?cedula=${cedula}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const filteredAccums = result?.accumulations?.filter(
    (a) => filterAccum === "all" || a.estado === filterAccum
  ) ?? [];
  const filteredUsages = result?.usages?.filter(
    (u) => filterUsage === "all" || u.estado === filterUsage
  ) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Consultar saldo y solicitudes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ingrese su número de cédula para ver su historial y lecciones disponibles.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 flex gap-3">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="cedula-consulta">Número de cédula</Label>
            <Input
              id="cedula-consulta"
              placeholder="123456789"
              maxLength={9}
              value={cedula}
              onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleConsulta()}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleConsulta} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2">Consultar</span>
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && !result.found && (
          <Alert variant="info" className="mb-6">
            <AlertDescription>
              No se encontraron registros para esta cédula. Si nunca ha enviado una solicitud, su
              información aún no está en el sistema.
            </AlertDescription>
          </Alert>
        )}

        {result?.found && result.teacher && (
          <div className="space-y-8">
            {/* Teacher info + balance */}
            <div className="rounded-lg border border-border p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="font-semibold">{fullName(result.teacher)}</h2>
                  <p className="text-sm text-muted-foreground">
                    Cédula: {result.teacher.cedula} · {result.teacher.correo}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Acumuladas", value: result.teacher.lecciones_acumuladas, color: "text-blue-600" },
                  { label: "Usadas", value: result.teacher.lecciones_usadas, color: "text-orange-600" },
                  { label: "Disponibles", value: result.teacher.saldo_disponible, color: "text-emerald-600" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-md bg-muted px-4 py-3 text-center">
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Accumulations table */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">Historial de acumulaciones</h3>
                <select
                  className="text-xs border border-border rounded px-2 py-1"
                  value={filterAccum}
                  onChange={(e) => setFilterAccum(e.target.value)}
                >
                  <option value="all">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="aprobada">Aprobada</option>
                  <option value="rechazada">Rechazada</option>
                </select>
              </div>
              {filteredAccums.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin registros.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                        <th className="px-4 py-2.5 text-left font-medium">Materia</th>
                        <th className="px-4 py-2.5 text-left font-medium">Fecha</th>
                        <th className="px-4 py-2.5 text-left font-medium">Lecciones</th>
                        <th className="px-4 py-2.5 text-left font-medium">Estado</th>
                        <th className="px-4 py-2.5 text-left font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAccums.map((a) => (
                        <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-3">{a.materia}</td>
                          <td className="px-4 py-3">{formatDate(a.fecha_acumulada)}</td>
                          <td className="px-4 py-3">{a.cantidad_lecciones}</td>
                          <td className="px-4 py-3">{stateBadge(a.estado)}</td>
                          <td className="px-4 py-3">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedAccum(a)}>
                              Ver
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Usage table */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">Historial de rebajos</h3>
                <select
                  className="text-xs border border-border rounded px-2 py-1"
                  value={filterUsage}
                  onChange={(e) => setFilterUsage(e.target.value)}
                >
                  <option value="all">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="aprobada">Aprobada</option>
                  <option value="rechazada">Rechazada</option>
                </select>
              </div>
              {filteredUsages.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin registros.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                        <th className="px-4 py-2.5 text-left font-medium">Fecha propuesta</th>
                        <th className="px-4 py-2.5 text-left font-medium">Hora salida</th>
                        <th className="px-4 py-2.5 text-left font-medium">Lecciones</th>
                        <th className="px-4 py-2.5 text-left font-medium">Estado</th>
                        <th className="px-4 py-2.5 text-left font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsages.map((u) => (
                        <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-3">{formatDate(u.fecha_rebajo_propuesta)}</td>
                          <td className="px-4 py-3">{u.hora_salida}</td>
                          <td className="px-4 py-3">{u.lecciones_a_usar}</td>
                          <td className="px-4 py-3">{stateBadge(u.estado)}</td>
                          <td className="px-4 py-3">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedUsage(u)}>
                              Ver
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Accumulation detail dialog */}
      <Dialog open={!!selectedAccum} onOpenChange={() => setSelectedAccum(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de acumulación</DialogTitle>
          </DialogHeader>
          {selectedAccum && (
            <div className="space-y-3 text-sm">
              <Row label="Materia" value={selectedAccum.materia} />
              <Row label="Fecha" value={formatDate(selectedAccum.fecha_acumulada)} />
              <Row label="Cantidad" value={`${selectedAccum.cantidad_lecciones} lección(es)`} />
              <Row label="Horarios" value={selectedAccum.lecciones.join(", ")} />
              <Row label="Observaciones" value={selectedAccum.detalle || "—"} />
              <Row label="Estado" value={stateBadge(selectedAccum.estado)} />
              {selectedAccum.fecha_decision && (
                <Row label="Fecha decisión" value={formatDateTime(selectedAccum.fecha_decision)} />
              )}
              <Row
                label="Comentario directora"
                value={selectedAccum.comentario_admin || "Sin comentario adicional."}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Usage detail dialog */}
      <Dialog open={!!selectedUsage} onOpenChange={() => setSelectedUsage(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de rebajo</DialogTitle>
          </DialogHeader>
          {selectedUsage && (
            <div className="space-y-3 text-sm">
              <Row label="Fecha propuesta" value={formatDate(selectedUsage.fecha_rebajo_propuesta)} />
              <Row label="Hora de salida" value={selectedUsage.hora_salida} />
              <Row label="Lecciones a usar" value={`${selectedUsage.lecciones_a_usar} lección(es)`} />
              <Row label="Motivo" value={selectedUsage.motivo} />
              {selectedUsage.detalle && <Row label="Detalle adicional" value={selectedUsage.detalle} />}
              <Row label="Estado" value={stateBadge(selectedUsage.estado)} />
              {selectedUsage.fecha_decision && (
                <Row label="Fecha decisión" value={formatDateTime(selectedUsage.fecha_decision)} />
              )}
              <Row
                label="Comentario directora"
                value={selectedUsage.comentario_admin || "Sin comentario adicional."}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="w-36 shrink-0 text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
