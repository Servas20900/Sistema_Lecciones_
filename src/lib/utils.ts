import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("es-CR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Costa_Rica",
  });
}

export function fullName(teacher: { nombre: string; primer_apellido: string; segundo_apellido: string }) {
  return [teacher.nombre, teacher.primer_apellido, teacher.segundo_apellido].filter(Boolean).join(" ");
}
