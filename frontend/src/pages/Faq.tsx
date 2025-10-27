import { Link } from "react-router-dom";

function Faq() {
  return (
    // Usamos un fragmento <>...</> para que se integre con el SimpleLayout.
    <>
      <h2 className="fw-bold mb-4">Preguntas Frecuentes (FAQ)</h2>
      <p className="text-muted">
        Encuentra aquí las respuestas a las consultas más comunes sobre el
        funcionamiento de PlantGuard.
      </p>
      <hr className="mb-4" />
      {/* --- Inicio del Acordeón de Bootstrap --- */}
      {/* Usamos un ID único para este acordeón para evitar conflictos */}
      <div className="accordion" id="faqPageAccordion">
        {/* Pregunta 1 */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="headingOne">
            <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
              ¿Cómo funciona el análisis de imágenes?
            </button>
          </h2>
          <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#faqPageAccordion">
            <div className="accordion-body">
              Nuestra aplicación utiliza un modelo de Inteligencia Artificial (una red neuronal convolucional) entrenado con miles de imágenes de plantas. Cuando subes una foto, el modelo la procesa y la compara con los patrones que ha aprendido para identificar el estado de salud o posibles enfermedades con un cierto grado de confianza.
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
          <div id="collapseTwo" className="accordion-collapse collapse" data-bs-parent="#faqPageAccordion">
            <div className="accordion-body">
              La precisión de nuestro modelo mejora constantemente. Ofrecemos un porcentaje de confianza con cada diagnóstico para que puedas tomar una decisión informada. Sin embargo, PlantGuard debe ser considerado como una herramienta de apoyo y no reemplaza la consulta con un agrónomo profesional en casos críticos.
            </div>
          </div>
        </div>
        {/* Pregunta 3 */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="headingThree">
            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree">
              ¿Mis datos y fotos están seguros?
            </button>
          </h2>
          <div id="collapseThree" className="accordion-collapse collapse" data-bs-parent="#faqPageAccordion">
            <div className="accordion-body">
              Sí. La seguridad de tu información es nuestra prioridad. Todas las imágenes y datos se transmiten de forma cifrada. Las imágenes se utilizan para el análisis y para el re-entrenamiento anónimo de nuestro modelo, pero nunca se comparten con terceros sin tu consentimiento explícito. Puedes leer más en nuestra Política de Privacidad.
            </div>
          </div>
        </div>
        {/* Pregunta 4 */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="headingFour">
            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour">
              ¿Qué tipo de plantas puedo analizar?
            </button>
          </h2>
          <div id="collapseFour" className="accordion-collapse collapse" data-bs-parent="#faqPageAccordion">
            <div className="accordion-body">
              Actualmente, nuestro modelo está especializado en una amplia variedad de cultivos hortícolas y plantas ornamentales comunes. Estamos trabajando constantemente para expandir nuestra base de datos y añadir más especies. Si tu planta no es reconocida, el sistema te lo notificará.
            </div>
          </div>
        </div>
        {/* Pregunta 5 */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="headingFive">
            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFive">
              ¿Necesito una conexión a internet para usar la app?
            </button>
          </h2>
          <div id="collapseFive" className="accordion-collapse collapse" data-bs-parent="#faqPageAccordion">
            <div className="accordion-body">
              Sí. Para realizar el análisis de una imagen, se requiere una conexión a internet, ya que la foto se envía a nuestros servidores para ser procesada por el modelo de IA. Sin embargo, puedes acceder a tu historial de análisis previos sin conexión si ya los habías cargado.
            </div>
          </div>
        </div>
      </div>
      {/* --- Fin del Acordeón --- */}
      <hr className="my-5" />
      <div className="text-center">
        <h5 className="fw-light">¿No encontraste lo que buscabas?</h5>
        <p className="text-muted">
          Visita nuestro Centro de Ayuda o contáctanos directamente.
        </p>
        <Link to="/Help" className="btn btn-outline-primary mt-2">
          Volver al Centro de Ayuda
        </Link>
      </div>
    </>
  );
}

export default Faq;
