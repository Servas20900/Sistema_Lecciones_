export const LESSON_SLOTS = [
  { numero: 1, bloque: "07:00 - 07:40 A.M" },
  { numero: 2, bloque: "07:40 - 08:20 A.M" },
  { numero: 3, bloque: "08:35 - 09:15 A.M" },
  { numero: 4, bloque: "09:15 - 09:55 A.M" },
  { numero: 5, bloque: "10:05 - 10:45 A.M" },
  { numero: 6, bloque: "10:45 - 11:25 A.M" },
  { numero: 7, bloque: "11:30 - 12:10 A.M" },
  { numero: 8, bloque: "12:30 - 01:10 P.M" },
  { numero: 9, bloque: "01:10 - 01:50 P.M" },
  { numero: 10, bloque: "02:05 - 02:45 P.M" },
  { numero: 11, bloque: "02:45 - 03:25 P.M" },
  { numero: 12, bloque: "03:35 - 04:15 P.M" },
  { numero: 13, bloque: "04:15 - 04:55 P.M" },
  { numero: 14, bloque: "05:00 - 05:40 P.M" },
] as const;

export const MATERIAS = [
  "Español",
  "Ciencias",
  "Matemáticas",
  "Estudios Sociales",
  "Inglés",
  "Física",
  "Hogar",
  "Religión",
  "Formación Tecnológica",
  "Lección libre",
] as const;

export type Materia = (typeof MATERIAS)[number];
