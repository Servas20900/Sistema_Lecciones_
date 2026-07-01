"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RotateCcw, Home, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Icono animado */}
      <div className="relative mb-8">
        <span className="absolute inset-0 rounded-full bg-amber-200 animate-ping opacity-50" />
        <div className="relative w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center shadow-sm">
          <AlertTriangle className="w-9 h-9 text-amber-600" strokeWidth={1.75} />
        </div>
      </div>

      <h1 className="text-2xl font-semibold text-foreground mb-3 text-center">
        Ocurrió un error
      </h1>

      <p className="text-muted-foreground text-center max-w-xs leading-relaxed mb-8 text-sm sm:text-base">
        Algo salió mal en esta página. No te preocupes —{" "}
        <span className="font-medium text-foreground">tus datos están seguros</span>. Puedes
        reintentar o volver al inicio.
      </p>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-sm">
        <Button
          onClick={handleRetry}
          disabled={retrying}
          className="flex-1 gap-2"
        >
          <RotateCcw className={`w-4 h-4 ${retrying ? "animate-spin" : ""}`} />
          {retrying ? "Reintentando…" : "Reintentar"}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="flex-1 gap-2"
        >
          <Home className="w-4 h-4" />
          Ir al inicio
        </Button>
      </div>

      {/* Detalle colapsable */}
      <button
        onClick={() => setShowDetail((v) => !v)}
        className="mt-8 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {showDetail ? (
          <>
            <ChevronUp className="w-3.5 h-3.5" /> Ocultar detalle
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5" /> Ver detalle del error
          </>
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
