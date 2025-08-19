import { Link } from "react-router-dom";

function Register() {
    return (
        <div>
            <h2 className="fw-bold mb-2">Registro de usuario</h2>
            <p className="text-muted mb-4">
                Crea tu cuenta para acceder al panel
            </p>

            <form>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Nombre</label>
                    <input type="text" className="form-control" id="name" placeholder="Tu nombre completo" />
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Correo</label>
                    <input type="email" className="form-control" id="email" placeholder="tu@correo.com" />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Contraseña</label>
                    <input type="password" className="form-control" id="password" placeholder="********" />
                </div>
                <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirmar contraseña</label>
                    <input type="password" className="form-control" id="confirmPassword" placeholder="********" />
                </div>
                <div className="form-check mb-3">
                    <input type="checkbox" className="form-check-input" id="terms" />
                    <label className="form-check-label" htmlFor="terms">
                        Acepto los <a href="#!">Términos</a> y la <a href="#!">Política de privacidad</a>
                    </label>
                </div>
                <div className="d-grid mb-3">
                    <button type="submit" className="btn btn-success">Registrarme</button>
                </div>
            </form>

            <p className="text-center small text-muted">¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link></p>
        </div>
    );
}

export default Register;