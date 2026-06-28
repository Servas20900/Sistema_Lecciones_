"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DecideDialog } from "@/components/admin/decide-dialog";
import { formatDate, formatDateTime, fullName } from "@/lib/utils";
import type { UsageRequest, Teacher } from "@/lib/supabase";
import { Loader2, RefreshCw, Search } from "lucide-react";

type AugmentedRequest = UsageRequest & { teachers: Teacher };

export default function RebajosPendientes() {
  const [data, setData] = useState<AugmentedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [search, setSearch] = useState("");
  const [selectedDetail, setSelectedDetail] = useState<AugmentedRequest | null>(null);
  const [decideTarget, setDecideTarget] = useState<AugmentedRequest | null>(null);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/admin/usage?estado=pendiente");
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
          <h1 className="text-2xl font-semibold tracking-tight">Rebajos pendientes</h1>
          <p className="mt-1 text-sm text-muted-foreground">{data.length} solicitud(es) sin revisar</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button variant="ghost" size="sm" onClick={fetchData} className="gap-1.5 text-xs text-muted-foreground">
            <RefreshCw className="h-3.5 w-3.5" /> Actualizar
          </Button>
          {lastUpdate && (
            <p className="text-xs text-muted-foreground">
              {lastUpdate.toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              {" Â· "}prÃ³x. actualizaciÃ³n 20 s
            </p>
          )}
        </div>
      </div>

      <div className="mb-4 relative max-w-xs">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nombre o cÃ©dula..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-8">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {search ? "Sin resultados." : "No hay rebajos pendientes."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                <th className="px-4 py-2.5 text-left font-medium">Docente</th>
                <th className="px-4 py-2.5 text-left font-medium">Fecha propuesta</th>
                <th className="px-4 py-2.5 text-left font-medium">Hora salida</th>
                <th className="px-4 py-2.5 text-left font-medium">Lecciones</th>
                <th className="px-4 py-2.5 text-left font-medium">Motivo</th>
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
                  <td className="px-4 py-3">{formatDate(r.fecha_rebajo_propuesta)}</td>
                  <td className="px-4 py-3">{r.hora_salida}</td>
                  <td className="px-4 py-3">{r.lecciones_a_usar}</td>
                  <td className="px-4 py-3 max-w-[160px] truncate" title={r.motivo}>{r.motivo}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTime(r.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedDetail(r)}>Ver</Button>
                      <Button variant="ghost" size="sm" className="text-emerald-700 hover:bg-emerald-50" onClick={() => setDecideTarget(r)}>Decidir</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!selectedDetail} onOpenChange={() => setSelectedDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Detalle de rebajo</DialogTitle></DialogHeader>
          {selectedDetail && (
            <div className="space-y-3 text-sm">
              <Row label="Docente" value={fullName(selectedDetail.teachers)} />
              <Row label="CÃ©dula" value={selectedDetail.teachers.cedula} />
              <Row label="Correo" value={selectedDetail.teachers.correo} />
              <Row label="Fecha propuesta" value={formatDate(selectedDetail.fecha_rebajo_propuesta)} />
              <Row label="Hora de salida" value={selectedDetail.hora_salida} />
              <Row label="Lecciones a usar" value={`${selectedDetail.lecciones_a_usar} lecciÃ³n(es)`} />
              <Row label="Motivo" value={selectedDetail.motivo} />
              {selectedDetail.detalle && <Row label="Detalle" value={selectedDetail.detalle} />}
              <div className="pt-2">
                <Button className="w-full" onClick={() => { setSelectedDetail(null); setDecideTarget(selectedDetail); }}>
                  Tomar decisiÃ³n
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
          type="usage"
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
      <span className="w-36 shrink-0 text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

