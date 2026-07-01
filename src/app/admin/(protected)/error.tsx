"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RotateCcw, Home, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

export default function AdminErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetail, setShowDetail] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    console.error(error);
  }, [error]);

  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => {
      setRetrying(false);
      reset();
    }, 600);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12">
      <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-5">
        <AlertTriangle className="w-7 h-7 text-amber-600" strokeWidth={1.75} />
      </div>

      <h2 className="text-lg font-semibold text-foreground mb-2 text-center">
        Algo salió mal
      </h2>
      <p className="text-muted-foreground text-center max-w-xs text-sm leading-relaxed mb-6">
        Ocurrió un error inesperado en esta sección. Puede reintentar o volver al panel de inicio.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleRetry} disabled={retrying} size="sm" className="gap-2">
          <RotateCcw className={`w-3.5 h-3.5 ${retrying ? "animate-spin" : ""}`} />
          {retrying ? "Reintentando…" : "Reintentar"}
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/inicio" className="gap-2">
            <Home className="w-3.5 h-3.5" /> Panel de inicio
          </Link>
        </Button>
      </div>

      <button
        onClick={() => setShowDetail((v) => !v)}
        className="mt-6 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {showDetail ? (
          <><ChevronUp className="w-3 h-3" /> Ocultar detalle</>
        ) : (
          <><ChevronDown className="w-3 h-3" /> Ver detalle</>
        )}
      </button>

      {showDetail && (
        <pre className="mt-2 text-xs bg-muted rounded-lg p-3 max-w-sm w-full overflow-x-auto text-muted-foreground border border-border">
          {error.message || "Error desconocido"}
          {error.digest ? `\nCódigo: ${error.digest}` : ""}
        </pre>
      )}
    </div>
  );
}
