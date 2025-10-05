import { Link } from "react-router-dom";

function Help() {
  return (
    <>
      <h2 className="fw-bold mb-4">Centro de Ayuda</h2>
      <p className="text-muted">Encuentra respuestas, guías y formas de contactarnos.</p>
      <hr className="mb-5"/>
      {/* --- Sección 1: Preguntas Frecuentes --- */}
      <h5 className="mb-3">❓ Preguntas Frecuentes (FAQ)</h5>
      <div className="accordion" id="faqAccordion">
        {/* Pregunta 1 */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="headingOne">
            <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
              ¿Cómo funciona el análisis de imágenes de PlantGuard?
            </button>
          </h2>
          <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
            <div className="accordion-body">
              Nuestra aplicación utiliza un modelo de Inteligencia Artificial entrenado con miles de imágenes. Cuando subes una foto, el modelo la procesa para identificar el estado de salud de la planta con un grado de confianza.
            </div>
          </div>
        </div>
        {/* Pregunta 2 */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="headingTwo">
            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo">
              ¿Qué tan preciso es el diagnóstico?
            </button>
          </h2>
          <div id="collapseTwo" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
            <div className="accordion-body">
              La precisión mejora constantemente. Ofrecemos un porcentaje de confianza con cada diagnóstico. PlantGuard debe ser considerado como una herramienta de apoyo y no reemplaza la consulta con un profesional.
            </div>
          </div>
        </div>
      </div>
      <div className="text-end mt-2">
        <Link to="/faq" className="small">
          Ver más preguntas →
        </Link>
      </div>
      <hr className="my-5"/>
      {/* --- Sección 2: Guías Rápidas --- */}
      <h5 className="mb-3">📚 Guías Rápidas</h5>
      <div className="list-group">
        <a href="#!" className="list-group-item list-group-item-action">Cómo tomar una buena foto para el análisis</a>
        <a href="#!" className="list-group-item list-group-item-action">Interpretando los resultados del diagnóstico</a>
        <a href="#!" className="list-group-item list-group-item-action">Configurando las alertas climáticas</a>
      </div>
      <hr className="my-5"/>
      {/* --- Sección 3: Contacto de Soporte --- */}
      <h5 className="mb-3">✉️ Contacto de Soporte</h5>
      <p>¿Tienes un problema técnico o una consulta que no encuentras aquí? Nuestro equipo de soporte está listo para ayudarte.</p>
      <ul className="list-unstyled">
        <li><strong>Email:</strong> soporte@plantguard.app</li>
        <li><strong>Horario:</strong> Lunes a Viernes, 9:00 - 18:00 (Hora de Chile)</li>
      </ul>
      <hr className="my-5"/>
    </>
  );
}

export default Help;
