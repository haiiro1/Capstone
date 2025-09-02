import * as yup from "yup";

export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

export const registerSchema = yup.object({
  email: yup.string().trim().email("Email inválido").required("Requerido"),
  first_name: yup.string().trim().min(2, "Mín 2").max(80, "Máx 80").required("Requerido"),
  last_name: yup.string().trim().min(2, "Mín 2").max(80, "Máx 80").required("Requerido"),
  password: yup
    .string()
    .matches(passwordRegex, "Min 8, mayús, minús, número y símbolo")
    .required("Requerido"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("password")], "No coincide")
    .required("Requerido"),
});

export const loginSchema = yup.object({
  email: yup.string().trim().email("Email inválido").required("Requerido"),
  password: yup.string().required("Requerido"),
});
