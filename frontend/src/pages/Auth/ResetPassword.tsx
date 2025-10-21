// src/pages/ResetPassword.tsx (replace local state with react-hook-form + zod)
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api, { extractErrorMessage } from "../../lib/api";
import { passwordField, confirmPasswordShape } from "../../validation/password";

const base = {
  token: z.string().min(1, "Falta token"),
  password: passwordField,
  confirmPassword: z.string().min(1, "Confirma tu contraseña"),
};
const schema = confirmPasswordShape(base);
type ResetForm = z.infer<typeof schema>;

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({ resolver: zodResolver(schema), mode: "onBlur" });

  useEffect(() => {
    const t = params.get("token");
    if (t) setValue("token", t);
  }, [params, setValue]);

  const onSubmit = async (data: ResetForm) => {
    try {
      await api.post("api/auth/password/reset/confirm", {
        token: data.token,
        new_password: data.password,
      });
      navigate("/");
    } catch (e: any) {
      alert(extractErrorMessage(e));
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 560 }}>
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h2 className="fw-bold mb-3 text-center">Restablece tu contraseña</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input type="hidden" {...register("token")} />
            <div className="mb-3">
              <label className="form-label" htmlFor="password">
                Ingresa tu nueva contraseña
              </label>
              <input
                id="password"
                type="password"
                className={`form-control ${
                  errors.password ? "is-invalid" : ""
                }`}
                placeholder="********"
                {...register("password")}
              />
              {errors.password && (
                <div className="invalid-feedback">
                  {errors.password.message}
                </div>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="confirmPassword">
                Confirmar tu nueva contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={`form-control ${
                  errors.confirmPassword ? "is-invalid" : ""
                }`}
                placeholder="********"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <div className="invalid-feedback">
                  {errors.confirmPassword.message}
                </div>
              )}
            </div>
            <div className="d-grid">
              <button
                className="btn btn-primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Actualizando..." : "Actualizar!"}
              </button>
            </div>
            <p className="text-center small text-muted mt-3">
              ¿Recordaste tu contraseña? <Link to="/">Inicia sesión</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
