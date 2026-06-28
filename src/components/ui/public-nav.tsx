"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/acumular", label: "Acumular" },
  { href: "/rebajar", label: "Rebajar" },
  { href: "/consulta", label: "Consultar" },
];

export function PublicNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground"
          onClick={() => setOpen(false)}
        >
          <img
            src="https://res.cloudinary.com/dcwxslhjf/image/upload/v1782579288/LogoCircle_l4hiqu.png"
            alt="Logo"
            className="h-7 w-7 shrink-0 rounded-full object-cover"
          />
          <span className="hidden truncate sm:block">Lecciones Acumuladas</span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-1 text-sm text-muted-foreground sm:flex">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-3 py-1.5 transition-colors hover:bg-accent hover:text-foreground",
                pathname === href && "bg-accent text-foreground font-medium"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent sm:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menú"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-background px-4 pb-3 sm:hidden">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
                pathname === href ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
