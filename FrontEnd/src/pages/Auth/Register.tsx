import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import api, { extractErrorMessage } from "../../lib/api"; 
import { splitFullName } from "../../utils/names";

const PASSWORD_MIN = 8;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/; // mín 8, 1 mayus, 1 minus, 1 dígito, 1 símbolo

const schema = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre completo"),
  email: z.string().trim().toLowerCase().email("Correo inválido"),
  password: z
    .string()
    .min(PASSWORD_MIN, `Mín ${PASSWORD_MIN} caracteres`)
    .refine((v) => passwordRegex.test(v), {
      message: "Debe incluir mayúscula, minúscula, número y símbolo.",
    }),
  confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  terms: z.literal(true, { message: "Debes aceptar los términos" }),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Las contraseñas no coinciden",
});

type RegisterForm = z.infer<typeof schema>;

function Register() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  const onSubmit = async (data: RegisterForm) => {
    setServerError(null);

    // dejamos mas robusto el tratamiento del nombre
    const { first_name, last_name } = splitFullName(data.name);

    const payload = {
      email: data.email,
      password: data.password,
      first_name,
      last_name,
    };

    try {
      await api.post("/api/auth/register", payload);
      navigate("/"); // vuelve al login
    } catch (err: any) {
      setServerError(extractErrorMessage(err));
    }
  };

  return (
    <div>
      <h2 className="fw-bold mb-2">Registro de usuario</h2>
      <p className="text-muted mb-4">
        Crea tu cuenta para acceder al panel
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        {serverError && (
          <div className="alert alert-danger py-2">{serverError}</div>
        )}

        <div className="mb-3">
          <label htmlFor="name" className="form-label">Nombre</label>
          <input
            type="text"
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            id="name"
            placeholder="Tu nombre completo"
            {...register("name")}
          />
          {errors.name && (
            <div className="invalid-feedback">{errors.name.message}</div>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Correo</label>
          <input
            type="email"
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            id="email"
            placeholder="tu@correo.com"
            {...register("email")}
          />
        {errors.email && (
          <div className="invalid-feedback">{errors.email.message}</div>
        )}
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">Contraseña</label>
          <input
            type="password"
            className={`form-control ${errors.password ? "is-invalid" : ""}`}
            id="password"
            placeholder="********"
            {...register("password")}
          />
          {errors.password && (
            <div className="invalid-feedback">{errors.password.message}</div>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">Confirmar contraseña</label>
          <input
            type="password"
            className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
            id="confirmPassword"
            placeholder="********"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <div className="invalid-feedback">{errors.confirmPassword.message}</div>
          )}
        </div>

        <div className="form-check mb-3">
          <input
            type="checkbox"
            className={`form-check-input ${errors.terms ? "is-invalid" : ""}`}
            id="terms"
            {...register("terms")}
          />
          <label className="form-check-label" htmlFor="terms">
            Acepto los <a href="#!">Términos</a> y la <a href="#!">Política de privacidad</a>
          </label>
          {errors.terms && (
            <div className="invalid-feedback d-block">{errors.terms.message}</div>
          )}
        </div>

        <div className="d-grid mb-3">
          <button type="submit" className="btn btn-success" disabled={isSubmitting}>
            {isSubmitting ? "Registrando..." : "Registrarme"}
          </button>
        </div>
      </form>

      <p className="text-center small text-muted">
        ¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link>
      </p>
    </div>
  );
}

export default Register;