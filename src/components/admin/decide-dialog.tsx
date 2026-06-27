"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";
import type { SubmissionState } from "@/lib/supabase";

interface DecideDialogProps {
  open: boolean;
  onClose: () => void;
  requestId: string;
  type: "accumulations" | "usage";
  teacherName: string;
  onDecided: () => void;
  /** Si se pasa, el dialog muestra modo edición con el estado actual */
  currentEstado?: SubmissionState;
  currentComentario?: string;
}

export function DecideDialog({
  open,
  onClose,
  requestId,
  type,
  teacherName,
  onDecided,
  currentEstado,
  currentComentario,
}: DecideDialogProps) {
  const isEdit = !!currentEstado && currentEstado !== "pendiente";
  const [comentario, setComentario] = useState(currentComentario ?? "");
  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState<"aprobar" | "rechazar" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar comentario si cambia el target
  useEffect(() => {
    setComentario(currentComentario ?? "");
    setSendEmail(true);
    setError(null);
  }, [requestId, currentComentario, open]);

  const decide = async (estado: "aprobada" | "rechazada") => {
    setLoading(estado === "aprobada" ? "aprobar" : "rechazar");
    setError(null);
    try {
      const res = await fetch(`/api/admin/${type}/${requestId}/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado, comentario_admin: comentario, send_email: sendEmail }),
      });
      if (res.ok) {
        onDecided();
        onClose();
      } else {
        setError("Ocurrió un error. Intente nuevamente.");
      }
    } finally {
      setLoading(null);
    }
  };

  const estadoBadge = (e: SubmissionState) =>
    e === "aprobada" ? (
      <Badge variant="aprobada">Aprobada</Badge>
    ) : (
      <Badge variant="rechazada">Rechazada</Badge>
    );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar decisión" : "Tomar decisión"}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Docente: <span className="font-medium text-foreground">{teacherName}</span>
        </p>

        {isEdit && (
          <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
            <span className="text-muted-foreground">Estado actual:</span>
            {estadoBadge(currentEstado!)}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="comentario">
            Comentario para el docente{" "}
            <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Textarea
            id="comentario"
            rows={3}
            maxLength={1000}
            placeholder="Ej: Solicitud aprobada. Recuerde coordinar con la administración."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
          />
        </div>

        {/* Opción de reenviar correo */}
        <label className="flex cursor-pointer items-center gap-2.5 rounded-md border border-border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50">
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>
            {isEdit ? "Reenviar correo al docente con la nueva decisión" : "Notificar al docente por correo"}
          </span>
        </label>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            disabled={!!loading}
            onClick={() => decide("aprobada")}
          >
            {loading === "aprobar" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            Aprobar
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-1.5 border-red-200 text-red-700 hover:bg-red-50"
            disabled={!!loading}
            onClick={() => decide("rechazada")}
          >
            {loading === "rechazar" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Rechazar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
