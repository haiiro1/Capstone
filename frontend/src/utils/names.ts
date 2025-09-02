// src/utils/names.ts
export function splitFullName(fullName: string) {
  // normaliza: quita espacios duplicados, trim a los bordes
  const cleaned = fullName.replace(/\s+/g, " ").trim();

  if (!cleaned) return { first_name: "", last_name: "" };

  const [first_name, ...rest] = cleaned.split(" ");
  // si no hay apellido, usamos el mismo first_name como fallback (backend exige ambos)
  const last_name = rest.length ? rest.join(" ") : first_name;

  return { first_name, last_name };
}
