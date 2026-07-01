import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="mb-6">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <FileQuestion className="w-9 h-9 text-muted-foreground" strokeWidth={1.5} />
        </div>
      </div>

      <p className="text-6xl font-bold text-foreground/20 mb-2 tracking-tight">404</p>

      <h1 className="text-xl font-semibold text-foreground mb-2 text-center">
        Página no encontrada
      </h1>
      <p className="text-muted-foreground text-center max-w-xs text-sm leading-relaxed mb-8">
        La dirección que buscas no existe o fue movida.
      </p>

      <Button asChild>
        <Link href="/" className="gap-2">
          <Home className="w-4 h-4" /> Volver al inicio
        </Link>
      </Button>
    </div>
  );
}
