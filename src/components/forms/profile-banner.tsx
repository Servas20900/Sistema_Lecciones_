"use client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { Teacher } from "@/lib/supabase";
import { fullName } from "@/lib/utils";

export function useTeacherProfile() {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setTeacher(data?.teacher ?? null))
      .finally(() => setLoading(false));
  }, []);

  return { teacher, loading };
}

export function ProfileBanner({ teacher }: { teacher: Teacher | null }) {
  if (!teacher) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando su perfil...
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-muted/50 px-4 py-3">
      <p className="text-sm font-medium">{fullName(teacher)}</p>
      <p className="text-xs text-muted-foreground">
        Cédula: {teacher.cedula} · {teacher.correo}
      </p>
    </div>
  );
}
