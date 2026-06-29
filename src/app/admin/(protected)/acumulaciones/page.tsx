"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DecideDialog } from "@/components/admin/decide-dialog";
import { formatDate, formatDateTime, fullName } from "@/lib/utils";
import type { AccumulationRequest, Teacher } from "@/lib/supabase";
import { Loader2, RefreshCw, Search } from "lucide-react";

type AugmentedRequest = AccumulationRequest & { teachers: Teacher };

export default function AcumulacionesPendientes() {
  const [data, setData] = useState<AugmentedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [search, setSearch] = useState("");
  const [selectedDetail, setSelectedDetail] = useState<AugmentedRequest | null>(null);
  const [decideTarget, setDecideTarget] = useState<AugmentedRequest | null>(null);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/admin/accumulations?estado=pendiente");
    const json = await res.json();
    setData(json.data ?? []);
    setLastUpdate(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filtered = data.filter((r) => {
    const q = search.toLowerCase();
    return !q || fullName(r.teachers).toLowerCase().includes(q) || r.teachers.cedula.includes(q);
  });

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Acumulaciones pendientes</h1>
          <p className="mt-1 text-sm text-muted-foreground">{data.length} solicitud(es) sin revisar</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button variant="ghost" size="sm" onClick={fetchData} className="gap-1.5 text-xs text-muted-foreground">
            <RefreshCw className="h-3.5 w-3.5" /> Actualizar
          </Button>
          {lastUpdate && (
            <p className="text-xs text-muted-foreground text-right">
              {lastUpdate.toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" })}
              {" · "}20 s
            </p>
          )}
        </div>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nombre o cédula..." className="pl-9 max-w-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-8">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {search ? "Sin resultados para la búsqueda." : "No hay solicitudes pendientes."}
          </p>
        </div>
      ) : (
        <>
          {/* Cards — móvil */}
          <div className="md:hidden space-y-3">
            {filtered.map((r) => (
              <div key={r.id} className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium leading-tight">{fullName(r.teachers)}</p>
                    <p className="text-xs text-muted-foreground">{r.teachers.cedula}</p>
                  </div>
                  <Badge variant="pendiente" className="shrink-0">Pendiente</Badge>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Materia</p>
                    <p className="font-medium">{r.materia}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Lecciones</p>
                    <p className="font-medium">{r.cantidad_lecciones}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Fecha acumulada</p>
                    <p>{formatDate(r.fecha_acumulada)}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedDetail(r)}>
                    Ver detalle
                  </Button>
                  <Button size="sm" className="flex-1" onClick={() => setDecideTarget(r)}>
                    Decidir
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Tabla — desktop */}
          <div className="hidden md:block rounded-lg border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 text-left font-medium">Docente</th>
                  <th className="px-4 py-2.5 text-left font-medium">Materia</th>
                  <th className="px-4 py-2.5 text-left font-medium">Fecha acumulada</th>
                  <th className="px-4 py-2.5 text-left font-medium">Lecciones</th>
                  <th className="px-4 py-2.5 text-left font-medium">Registrado</th>
                  <th className="px-4 py-2.5 text-left font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium">{fullName(r.teachers)}</p>
                      <p className="text-xs text-muted-foreground">{r.teachers.cedula}</p>
                    </td>
                    <td className="px-4 py-3">{r.materia}</td>
                    <td className="px-4 py-3">{formatDate(r.fecha_acumulada)}</td>
                    <td className="px-4 py-3">{r.cantidad_lecciones}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{formatDateTime(r.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedDetail(r)}>Ver</Button>
                        <Button variant="ghost" size="sm" className="text-emerald-700 hover:bg-emerald-50" onClick={() => setDecideTarget(r)}>
                          Decidir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Dialog open={!!selectedDetail} onOpenChange={() => setSelectedDetail(null)}>
        <DialogContent className="max-w-md w-[95vw]">
          <DialogHeader><DialogTitle>Detalle de solicitud</DialogTitle></DialogHeader>
          {selectedDetail && (
            <div className="space-y-3 text-sm">
              <Row label="Docente" value={fullName(selectedDetail.teachers)} />
              <Row label="Cédula" value={selectedDetail.teachers.cedula} />
              <Row label="Correo" value={selectedDetail.teachers.correo} />
              <Row label="Materia" value={selectedDetail.materia} />
              <Row label="Fecha acumulada" value={formatDate(selectedDetail.fecha_acumulada)} />
              <Row label="Lecciones" value={`${selectedDetail.cantidad_lecciones} lección(es)`} />
              <Row label="Horarios" value={selectedDetail.lecciones.join(", ")} />
              <Row label="Observaciones" value={selectedDetail.detalle || "—"} />
              <div className="pt-2 flex gap-2">
                <Button className="flex-1" onClick={() => { setSelectedDetail(null); setDecideTarget(selectedDetail); }}>
                  Tomar decisión
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {decideTarget && (
        <DecideDialog
          open={!!decideTarget}
          onClose={() => setDecideTarget(null)}
          requestId={decideTarget.id}
          type="accumulations"
          teacherName={fullName(decideTarget.teachers)}
          onDecided={fetchData}
        />
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="w-28 shrink-0 text-muted-foreground text-xs pt-0.5">{label}</span>
      <span className="flex-1 break-words">{value}</span>
    </div>
  );
}
