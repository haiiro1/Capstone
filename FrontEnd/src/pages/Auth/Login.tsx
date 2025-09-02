// src/pages/Auth/Login.tsx
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
// usa el import relativo si no configuraste el alias "@"
import api, { extractErrorMessage, TOKEN_KEY } from "../../lib/api";



// schema Zod
const loginSchema = z.object({
  email: z.string().email("Formato de correo inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

// tipo para TS a partir del schema (o lo declaras manual)
type LoginForm = z.infer<typeof loginSchema>;

function Login() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError(null);
    try {
      const res = await api.post("/api/auth/login", data); // token
      const { access_token } = res.data;

      localStorage.setItem(TOKEN_KEY, access_token);
       api.defaults.headers.common.Authorization = `Bearer ${access_token}`;

      // 🔥 trae el usuario actual y guárdalo
      const me = await api.get("/api/auth/me");
      localStorage.setItem("pg_user", JSON.stringify(me.data));

      navigate("/home");
    } catch (err: any) {
      setServerError(extractErrorMessage(err) || "Email o contraseña inválidos");
    }
  };

  return (
    <div>
      <h2 className="fw-bold mb-2">Inicia sesión</h2>
      <p className="text-muted mb-4">
        Accede a tu panel para analizar y configurar alertas
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        {serverError && (
          <div className="alert alert-danger py-2">{serverError}</div>
        )}

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Correo</label>
          <input
            type="email"
            id="email"
            placeholder="tu@correo.com"
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
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
            id="password"
            placeholder="********"
            className={`form-control ${errors.password ? "is-invalid" : ""}`}
            {...register("password")}
          />
          {errors.password && (
            <div className="invalid-feedback">{errors.password.message}</div>
          )}
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="form-check">
            <input type="checkbox" className="form-check-input" id="rememberMe" />
            <label className="form-check-label" htmlFor="rememberMe">Recordarme</label>
          </div>
          <a href="#!" className="small">¿Olvidaste tu contraseña?</a>
        </div>

        <div className="d-grid mb-3">
          <button type="submit" className="btn btn-success" disabled={isSubmitting}>
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </form>

      <p className="text-center small text-muted">
        No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </div>
  );
}

export default Login;