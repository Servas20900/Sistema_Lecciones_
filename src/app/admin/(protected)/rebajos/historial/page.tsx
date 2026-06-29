"use client";
import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DecideDialog } from "@/components/admin/decide-dialog";
import { formatDate, formatDateTime, fullName } from "@/lib/utils";
import type { UsageRequest, Teacher, SubmissionState } from "@/lib/supabase";
import { Search } from "lucide-react";

type AugmentedRequest = UsageRequest & { teachers: Teacher };

function stateBadge(estado: SubmissionState) {
  const v = estado as "pendiente" | "aprobada" | "rechazada";
  const labels = { pendiente: "Pendiente", aprobada: "Aprobada", rechazada: "Rechazada" };
  return <Badge variant={v}>{labels[v]}</Badge>;
}

export default function HistorialRebajos() {
  const [data, setData] = useState<AugmentedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("all");
  const [selected, setSelected] = useState<AugmentedRequest | null>(null);
  const [editTarget, setEditTarget] = useState<AugmentedRequest | null>(null);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/admin/usage");
    const json = await res.json();
    setData((json.data ?? []).filter((r: AugmentedRequest) => r.estado !== "pendiente"));
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = data.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || fullName(r.teachers).toLowerCase().includes(q) || r.teachers.cedula.includes(q);
    const matchEstado = filterEstado === "all" || r.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Historial de rebajos</h1>
        <p className="mt-1 text-sm text-muted-foreground">Rebajos ya procesados.</p>
      </div>

      <div className="mb-4 flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select
          className="text-sm border border-border rounded-md px-3"
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
        >
          <option value="all">Todos</option>
          <option value="aprobada">Aprobados</option>
          <option value="rechazada">Rechazados</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground py-8">Cargando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">Sin registros.</p>
      ) : (
        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                <th className="px-4 py-2.5 text-left font-medium">Docente</th>
                <th className="px-4 py-2.5 text-left font-medium">Fecha propuesta</th>
                <th className="px-4 py-2.5 text-left font-medium">Hora salida</th>
                <th className="px-4 py-2.5 text-left font-medium">Lecciones</th>
                <th className="px-4 py-2.5 text-left font-medium">Estado</th>
                <th className="px-4 py-2.5 text-left font-medium">Fecha decisión</th>
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
                  <td className="px-4 py-3">{stateBadge(r.estado)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {r.fecha_decision ? formatDateTime(r.fecha_decision) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(r)}>Ver</Button>
                      <Button variant="ghost" size="sm" className="text-blue-700 hover:bg-blue-50" onClick={() => setEditTarget(r)}>
                        Editar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md w-[95vw]">
          <DialogHeader><DialogTitle>Detalle de rebajo</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <Row label="Docente" value={fullName(selected.teachers)} />
              <Row label="Cédula" value={selected.teachers.cedula} />
              <Row label="Fecha propuesta" value={formatDate(selected.fecha_rebajo_propuesta)} />
              <Row label="Hora de salida" value={selected.hora_salida} />
              <Row label="Lecciones" value={`${selected.lecciones_a_usar} lección(es)`} />
              <Row label="Motivo" value={selected.motivo} />
              {selected.detalle && <Row label="Detalle" value={selected.detalle} />}
              <Row label="Estado" value={stateBadge(selected.estado)} />
              {selected.fecha_decision && <Row label="Fecha decisión" value={formatDateTime(selected.fecha_decision)} />}
              <Row label="Comentario" value={selected.comentario_admin || "Sin comentario."} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {editTarget && (
        <DecideDialog
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          requestId={editTarget.id}
          type="usage"
          teacherName={fullName(editTarget.teachers)}
          onDecided={fetchData}
          currentEstado={editTarget.estado}
          currentComentario={editTarget.comentario_admin}
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

