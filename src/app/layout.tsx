import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lecciones Acumuladas — Escuela Manuela Santa María",
  description: "Sistema de registro y gestión de lecciones acumuladas",
  icons: {
    icon: "https://res.cloudinary.com/dcwxslhjf/image/upload/v1782579288/LogoCircle_l4hiqu.png",
    shortcut: "https://res.cloudinary.com/dcwxslhjf/image/upload/v1782579288/LogoCircle_l4hiqu.png",
    apple: "https://res.cloudinary.com/dcwxslhjf/image/upload/v1782579288/LogoCircle_l4hiqu.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
