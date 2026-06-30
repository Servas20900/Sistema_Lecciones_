import { z } from "zod";
import { MATERIAS, LESSON_SLOTS } from "./constants";

const isWeekend = (dateStr: string) => {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDay();
  return day === 0 || day === 6;
};

export const teacherFieldsSchema = z.object({
  cedula: z
    .string()
    .regex(/^\d{9}$/, "La cédula debe tener exactamente 9 dígitos."),
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/, "El nombre solo puede contener letras."),
  primer_apellido: z
    .string()
    .min(2, "El primer apellido debe tener al menos 2 caracteres.")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/, "El primer apellido solo puede contener letras."),
  segundo_apellido: z
    .string()
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]*$/, "El segundo apellido solo puede contener letras."),
  correo: z
    .string()
    .email("Ingrese un correo válido.")
    .refine(
      (v) => v === "sebasmendeza09@gmail.com" || v.endsWith("@mep.go.cr"),
      "El correo debe terminar en @mep.go.cr."
    ),
});

export const accumulationSchema = teacherFieldsSchema.extend({
  fecha_acumulada: z
    .string()
    .refine((d) => new Date(d + "T12:00:00") <= new Date(), {
      message: "La fecha no puede ser futura.",
    })
    .refine((d) => !isWeekend(d), {
      message: "La fecha no puede caer en fin de semana.",
    }),
  materia: z.enum(MATERIAS, { error: "Seleccione una materia válida." }),
  cantidad_lecciones: z
    .number()
    .int("La cantidad debe ser un número entero.")
    .min(1, "La cantidad mínima es 1.")
    .max(14, "La cantidad máxima es 14."),
  lecciones: z
    .array(z.string())
    .min(1, "Seleccione al menos un horario.")
    .refine(
      (arr) => arr.every((l) => LESSON_SLOTS.some((s) => s.bloque === l)),
      "Horario no válido."
    ),
  detalle: z
    .string()
    .min(20, "El detalle debe tener al menos 20 caracteres.")
    .refine(
      (s) => {
        const letters = s.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]/g, "");
        const unique = new Set(letters.toLowerCase());
        return letters.length >= 10 && unique.size >= 3;
      },
      "El detalle debe ser descriptivo. Ingrese al menos 20 caracteres con información real."
    ),
});

export const usageSchema = teacherFieldsSchema.extend({
  fecha_rebajo_propuesta: z
    .string()
    .refine(
      (d) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(d + "T00:00:00") >= today;
      },
      "La fecha propuesta no puede ser en el pasado."
    )
    .refine((d) => !isWeekend(d), "No puede caer en fin de semana."),
  hora_salida: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "La hora de salida debe tener formato válido (HH:MM).")
    .refine((t) => {
      const [h, m] = t.split(":").map(Number);
      const mins = h * 60 + m;
      return mins >= 7 * 60 && mins <= 17 * 60 + 40;
    }, "La hora debe estar entre 07:00 y 17:40."),
  lecciones_a_usar: z
    .number()
    .int("Ingrese un número entero.")
    .min(1, "La cantidad mínima es 1.")
    .max(14, "La cantidad máxima es 14."),
  motivo: z.string().min(5, "El motivo debe tener al menos 5 caracteres."),
  detalle: z.string().max(1000, "El detalle no puede exceder 1000 caracteres."),
});

export const adminDecideSchema = z.object({
  estado: z.enum(["aprobada", "rechazada"]),
  comentario_admin: z.string().max(1000).optional(),
});

export type AccumulationInput = z.infer<typeof accumulationSchema>;
export type UsageInput = z.infer<typeof usageSchema>;
export type AdminDecideInput = z.infer<typeof adminDecideSchema>;
