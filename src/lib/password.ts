export function validatePassword(password: string): string | null {
  if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (!/[a-z]/.test(password)) return "Debe incluir al menos una letra minúscula.";
  if (!/[A-Z]/.test(password)) return "Debe incluir al menos una letra mayúscula.";
  if (!/[0-9]/.test(password)) return "Debe incluir al menos un número.";
  return null;
}

export const PASSWORD_HINT = "Mínimo 8 caracteres, con mayúscula, minúscula y número.";
