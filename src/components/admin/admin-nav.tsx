"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, LayoutDashboard, ClipboardList, History, LogOut, Download } from "lucide-react";
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

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  };

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-border bg-background sticky top-0">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <BookOpen className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Administración</span>
      </div>

      <nav className="flex-1 space-y-0.5 p-2 pt-3">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
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
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  );
}
