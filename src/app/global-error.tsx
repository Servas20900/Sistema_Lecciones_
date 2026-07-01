"use client";
import { useState } from "react";
import { RotateCcw, Home, AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => {
      setRetrying(false);
      reset();
    }, 600);
  };

  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#fff" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "#fef3c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <AlertTriangle size={36} color="#d97706" strokeWidth={1.75} />
          </div>

          <h1 style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: 8, color: "#111" }}>
            Error crítico
          </h1>
          <p style={{ color: "#6b7280", maxWidth: 300, lineHeight: 1.6, marginBottom: 28, fontSize: "0.9rem" }}>
            Ocurrió un error grave al cargar la aplicación. Tus datos están seguros.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={handleRetry}
              disabled={retrying}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 20px",
                borderRadius: 8,
                background: "#111",
                color: "#fff",
                border: "none",
                cursor: retrying ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
                opacity: retrying ? 0.7 : 1,
              }}
            >
              <RotateCcw size={16} /> {retrying ? "Reintentando…" : "Reintentar"}
            </button>
            <button
              onClick={() => { window.location.href = "/"; }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 20px",
                borderRadius: 8,
                background: "transparent",
                color: "#111",
                border: "1px solid #d1d5db",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              <Home size={16} /> Ir al inicio
            </button>
          </div>

          {error.digest && (
            <p style={{ marginTop: 24, fontSize: "0.75rem", color: "#9ca3af" }}>
              Código: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
