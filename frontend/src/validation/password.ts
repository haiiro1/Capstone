import { z } from "zod";

export const PASSWORD_MIN = 8;
export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

export const passwordField = z
  .string()
  .min(PASSWORD_MIN, `Mín ${PASSWORD_MIN} caracteres`)
  .refine((v) => passwordRegex.test(v), {
    message: "Debe incluir mayúscula, minúscula, número y símbolo.",
  });

export function confirmPasswordShape<T extends z.ZodRawShape>(shape: T) {
  return z
    .object(shape)
    .refine((data: any) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Las contraseñas no coinciden",
    });
}
