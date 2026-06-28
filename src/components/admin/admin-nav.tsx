"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, ClipboardList, History,
  LogOut, Download, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/admin/inicio", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/acumulaciones", label: "Acumulaciones", icon: ClipboardList },
  { href: "/admin/acumulaciones/historial", label: "Historial acumulaciones", icon: History },
  { href: "/admin/rebajos", label: "Rebajos", icon: ClipboardList },
  { href: "/admin/rebajos/historial", label: "Historial rebajos", icon: History },
  { href: "/admin/exportar", label: "Exportar datos", icon: Download },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  };

  const NavLinks = () => (
    <>
      <nav className="flex-1 space-y-0.5 p-2 pt-3">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
              pathname === href
                ? "bg-accent text-foreground font-medium"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Mobile top bar ── */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background px-4 md:hidden">
        <button
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
        <img
          src="https://res.cloudinary.com/dcwxslhjf/image/upload/v1782579288/LogoCircle_l4hiqu.png"
          alt="Logo"
          className="h-7 w-7 shrink-0 rounded-full object-cover"
        />
        <span className="text-sm font-semibold">Administración</span>
      </header>

      {/* ── Mobile backdrop ── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-56 shrink-0 flex-col border-r border-border bg-background transition-transform duration-200",
          "md:sticky md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2.5">
            <img
              src="https://res.cloudinary.com/dcwxslhjf/image/upload/v1782579288/LogoCircle_l4hiqu.png"
              alt="Logo"
              className="h-7 w-7 shrink-0 rounded-full object-cover"
            />
            <span className="text-sm font-semibold">Administración</span>
          </div>
          {/* Close button — only on mobile */}
          <button
            onClick={() => setOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent md:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <NavLinks />
      </aside>
    </>
  );
}
