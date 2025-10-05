import MainContent from "../components/MainContent";

// Datos de ejemplo. Más adelante, esto vendrá de una API o una base de datos.
const historialData = [
  {
    id: 1,
    fecha: "2025-08-10",
    etiqueta: "Sana",
    confianza: "95%",
  },
  {
    id: 2,
    fecha: "2025-08-08",
    etiqueta: "Sospecha de hongo",
    confianza: "78%",
  },
  {
    id: 3,
    fecha: "2025-08-02",
    etiqueta: "Sana",
    confianza: "90%",
  },
];

function History() {
  return (
    <MainContent title="Historial de análisis">
      <div className="card">
        <div className="card-body">
          {/* Usaremos un list-group para simular la tabla */}
          <div className="list-group list-group-flush">
            {/* Cabecera de la "Tabla" */}
            <div className="list-group-item d-none d-md-flex">
              <div className="row w-100">
                <div className="col-md-3 fw-bold">Fecha</div>
                <div className="col-md-3 fw-bold">Etiqueta</div>
                <div className="col-md-3 fw-bold">Confianza</div>
                <div className="col-md-3 fw-bold">Acciones</div>
              </div>
            </div>
            {/* Filas de datos */}
            {/* Hacemos un "map" sobre los datos de ejemplo para crear una fila por cada uno */}
            {historialData.map((item) => (
              <div key={item.id} className="list-group-item list-group-item-action">
                <div className="row w-100 align-items-center">
                  <div className="col-md-3">
                    <span className="d-md-none fw-bold">Fecha: </span>{item.fecha}
                  </div>
                  <div className="col-md-3">
                    <span className="d-md-none fw-bold">Etiqueta: </span>{item.etiqueta}
                  </div>
                  <div className="col-md-3">
                    <span className="d-md-none fw-bold">Confianza: </span>{item.confianza}
                  </div>
                  <div className="col-md-3 text-md-start">
                    <button className="btn btn-outline-secondary btn-sm mt-2 mt-md-0">Ver</button>
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
    </MainContent>
  );
}

const Historial = History;
export default Historial;