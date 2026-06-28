import Link from "next/link";
import { PublicNav } from "@/components/ui/public-nav";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Clock, Send } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-16">
        {/* Hero */}
        <div className="mb-10 space-y-4 sm:mb-16">
          <div className="flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/dcwxslhjf/image/upload/v1782579289/LogoManuelaNuevo_zlrwq7.png"
              alt="Escuela Manuela Santa María"
              className="h-10 w-auto object-contain"
            />
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Escuela Manuela Santa María
            </p>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Sistema de Lecciones Acumuladas
          </h1>
          <p className="max-w-xl text-base text-muted-foreground leading-relaxed">
            Registre las lecciones que trabajó fuera de su horario habitual, solicite rebajos
            cuando lo necesite, y consulte su saldo disponible en cualquier momento.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild>
              <Link href="/acumular">
                Registrar acumulación <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/rebajar">Solicitar rebajo</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/consulta">Consultar saldo</Link>
            </Button>
          </div>
        </div>

        {/* How it works */}
        <section className="mb-16">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Cómo funciona
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Send,
                step: "1",
                title: "Usted envía la solicitud",
                desc: "Complete el formulario con los datos de las lecciones acumuladas o del rebajo que desea usar. Recibirá una confirmación por correo.",
              },
              {
                icon: Clock,
                step: "2",
                title: "La directora revisa",
                desc: "La dirección institucional recibe una notificación y revisa su solicitud. Este proceso puede tomar algunos días hábiles.",
              },
              {
                icon: CheckCircle,
                step: "3",
                title: "Recibe la respuesta",
                desc: "Recibirá un correo con la decisión —aprobada o rechazada— y el comentario de la directora si hubiera alguno.",
              },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="rounded-lg border border-border p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {step}
                  </span>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick access cards */}
        <section>
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Acceso rápido
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href="/acumular"
              className="group rounded-lg border border-border p-5 transition-colors hover:bg-accent"
            >
              <p className="font-medium text-foreground group-hover:text-foreground">Acumular lecciones</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Registre lecciones trabajadas fuera de su horario.
              </p>
            </Link>
            <Link
              href="/rebajar"
              className="group rounded-lg border border-border p-5 transition-colors hover:bg-accent"
            >
              <p className="font-medium text-foreground">Solicitar rebajo</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Use su saldo acumulado para salir antes.
              </p>
            </Link>
            <Link
              href="/consulta"
              className="group rounded-lg border border-border p-5 transition-colors hover:bg-accent"
            >
              <p className="font-medium text-foreground">Consultar saldo</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Vea su historial y lecciones disponibles.
              </p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
