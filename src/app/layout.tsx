import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lecciones Acumuladas — Escuela Manuela Santa María",
  description: "Sistema de registro y gestión de lecciones acumuladas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
