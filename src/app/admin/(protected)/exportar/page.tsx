"use client";
import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Loader2, FileSpreadsheet, CheckCircle } from "lucide-react";
import { formatDate, formatDateTime, fullName } from "@/lib/utils";
import type { TeacherBalance, AccumulationRequest, UsageRequest } from "@/lib/supabase";

const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
};

export default function ExportarPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastExport, setLastExport] = useState<Date | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/export");
      if (!res.ok) throw new Error("Error al obtener los datos");

      const { teachers, accumulations, usages } = await res.json() as {
        teachers: TeacherBalance[];
        accumulations: AccumulationRequest[];
        usages: UsageRequest[];
      };

      if (teachers.length === 0) {
        setError("No hay docentes registrados para exportar.");
        return;
      }

      const wb = XLSX.utils.book_new();

      // --- Hoja resumen general ---
      const summaryRows = [
        ["Resumen de saldos â€” Escuela Manuela Santa MarÃ­a"],
        [`Generado: ${new Date().toLocaleString("es-CR")}`],
        [],
        ["CÃ©dula", "Nombre completo", "Correo", "Acumuladas", "Usadas", "Disponibles"],
        ...teachers.map((t) => [
          t.cedula,
          fullName(t),
          t.correo,
          t.lecciones_acumuladas,
          t.lecciones_usadas,
          t.saldo_disponible,
        ]),
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
      styleSheet(wsSummary, summaryRows);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen");

      // --- Una hoja por docente ---
      for (const teacher of teachers) {
        const teacherAccums = accumulations.filter((a) => a.teacher_id === teacher.id);
        const teacherUsages = usages.filter((u) => u.teacher_id === teacher.id);

        const rows: (string | number | null)[][] = [];

        // Encabezado del docente
        rows.push([`Docente: ${fullName(teacher)}`]);
        rows.push([`CÃ©dula: ${teacher.cedula}    Correo: ${teacher.correo}`]);
        rows.push([
          `Lecciones acumuladas: ${teacher.lecciones_acumuladas}`,
          "",
          `Usadas: ${teacher.lecciones_usadas}`,
          "",
          `Disponibles: ${teacher.saldo_disponible}`,
        ]);
        rows.push([]);

        // SecciÃ³n acumulaciones
        rows.push(["ACUMULACIONES"]);
        rows.push([
          "Fecha acumulada",
          "Materia",
          "Cantidad",
          "Horarios",
          "Detalle",
          "Estado",
          "Fecha decisiÃ³n",
          "Comentario directora",
        ]);

        if (teacherAccums.length === 0) {
          rows.push(["Sin registros", "", "", "", "", "", "", ""]);
        } else {
          for (const a of teacherAccums) {
            rows.push([
              formatDate(a.fecha_acumulada),
              a.materia,
              a.cantidad_lecciones,
              a.lecciones.join(", "),
              a.detalle || "â€”",
              ESTADO_LABEL[a.estado] ?? a.estado,
              a.fecha_decision ? formatDateTime(a.fecha_decision) : "â€”",
              a.comentario_admin || "â€”",
            ]);
          }
        }

        rows.push([]);

        // SecciÃ³n rebajos
        rows.push(["REBAJOS"]);
        rows.push([
          "Fecha propuesta",
          "Hora salida",
          "Lecciones usadas",
          "Motivo",
          "Detalle",
          "Estado",
          "Fecha decisiÃ³n",
          "Comentario directora",
        ]);

        if (teacherUsages.length === 0) {
          rows.push(["Sin registros", "", "", "", "", "", "", ""]);
        } else {
          for (const u of teacherUsages) {
            rows.push([
              formatDate(u.fecha_rebajo_propuesta),
              u.hora_salida,
              u.lecciones_a_usar,
              u.motivo,
              u.detalle || "â€”",
              ESTADO_LABEL[u.estado] ?? u.estado,
              u.fecha_decision ? formatDateTime(u.fecha_decision) : "â€”",
              u.comentario_admin || "â€”",
            ]);
          }
        }

        const ws = XLSX.utils.aoa_to_sheet(rows);
        styleSheet(ws, rows);

        // Nombre de hoja: apellido + nombre (mÃ¡x 31 chars, sin caracteres invÃ¡lidos)
        const sheetName = `${teacher.primer_apellido} ${teacher.nombre}`
          .replace(/[\\/:*?[\]]/g, "")
          .slice(0, 31);

        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      }

      // Descargar
      const date = new Date().toISOString().split("T")[0];
      XLSX.writeFile(wb, `lecciones_acumuladas_${date}.xlsx`);
      setLastExport(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Exportar datos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Genera un archivo Excel con el historial completo de cada docente.
        </p>
      </div>

      <div className="rounded-lg border border-border p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">ExportaciÃ³n completa (.xlsx)</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Incluye todas las acumulaciones y rebajos de todos los docentes.
              Una hoja por docente con nombre y cÃ©dula como encabezado, mÃ¡s una
              hoja resumen con los saldos actuales.
            </p>
          </div>
        </div>

        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {[
            "Hoja \"Resumen\": saldo disponible de todos los docentes",
            "Una hoja por docente con su historial completo",
            "Secciones de acumulaciones y rebajos separadas",
            "Estados, fechas de decisiÃ³n y comentarios incluidos",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {lastExport && !error && (
          <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Archivo descargado correctamente el{" "}
              {lastExport.toLocaleString("es-CR", {
                day: "2-digit",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </AlertDescription>
          </Alert>
        )}

        <Button onClick={handleExport} disabled={loading} className="w-full gap-2">
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Generando archivo...</>
          ) : (
            <><Download className="h-4 w-4" /> Exportar Excel</>
          )}
        </Button>
      </div>
    </div>
  );
}

/** Aplica ancho mÃ­nimo de columna basado en el contenido */
function styleSheet(ws: XLSX.WorkSheet, rows: (string | number | null)[][]) {
  const colWidths: number[] = [];
  for (const row of rows) {
    row.forEach((cell, i) => {
      const len = String(cell ?? "").length;
      colWidths[i] = Math.max(colWidths[i] ?? 10, Math.min(len + 2, 50));
    });
  }
  ws["!cols"] = colWidths.map((w) => ({ wch: w }));
}

