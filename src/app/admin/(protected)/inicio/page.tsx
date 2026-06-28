"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ClipboardList, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Counts {
  acumulaciones: number;
  rebajos: number;
}

const POLL_INTERVAL = 20_000; // 20 segundos

export default function AdminInicio() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCounts = useCallback(async () => {
    try {
      const [accRes, useRes] = await Promise.all([
        fetch("/api/admin/accumulations?estado=pendiente"),
        fetch("/api/admin/usage?estado=pendiente"),
      ]);
      const [acc, use] = await Promise.all([accRes.json(), useRes.json()]);
      setCounts({
        acumulaciones: acc.data?.length ?? 0,
        rebajos: use.data?.length ?? 0,
      });
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Solicitudes pendientes de revisiÃ³n.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button variant="ghost" size="sm" onClick={fetchCounts} className="gap-1.5 text-xs text-muted-foreground">
            <RefreshCw className="h-3.5 w-3.5" />
            Actualizar
          </Button>
          {lastUpdate && (
            <p className="text-xs text-muted-foreground">
              Actualizado {lastUpdate.toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              {" Â· "}prÃ³xima actualizaciÃ³n en 20 s
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Cargando...</span>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              label: "Acumulaciones pendientes",
              count: counts?.acumulaciones ?? 0,
              href: "/admin/acumulaciones",
              description: "Solicitudes de acumulaciÃ³n sin revisar",
            },
            {
              label: "Rebajos pendientes",
              count: counts?.rebajos ?? 0,
              href: "/admin/rebajos",
              description: "Solicitudes de rebajo sin revisar",
            },
          ].map(({ label, count, href, description }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-lg border border-border p-6 transition-colors hover:bg-accent"
            >
              <div className="mb-3 flex items-center justify-between">
                <ClipboardList className="h-5 w-5 text-muted-foreground" />
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="text-3xl font-bold text-foreground">
                {count === 0 ? (
                  <span className="text-muted-foreground">â€”</span>
                ) : (
                  <span className={count > 0 ? "text-amber-600" : ""}>{count}</span>
                )}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

