import Link from "next/link";

export function PublicNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
          <img
            src="https://res.cloudinary.com/dcwxslhjf/image/upload/v1782579288/LogoCircle_l4hiqu.png"
            alt="Logo Manuela Santa María"
            className="h-7 w-7 rounded-full object-cover"
          />
          Lecciones Acumuladas
        </Link>
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/acumular" className="rounded-md px-3 py-1.5 transition-colors hover:bg-accent hover:text-foreground">
            Acumular
          </Link>
          <Link href="/rebajar" className="rounded-md px-3 py-1.5 transition-colors hover:bg-accent hover:text-foreground">
            Rebajar
          </Link>
          <Link href="/consulta" className="rounded-md px-3 py-1.5 transition-colors hover:bg-accent hover:text-foreground">
            Consultar
          </Link>
        </nav>
      </div>
    </header>
  );
}
