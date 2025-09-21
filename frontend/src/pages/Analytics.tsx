import MainContent from "../components/MainContent";

function Analytics() {
  return (
    <MainContent title="Analizar planta">
      <div className="row">
        {/* Columna principal izquierda */}
        <div className="col-lg-8 mb-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Sube una imagen</h5>
              <div className="text-center p-5 border-2 border-dashed rounded bg-light mt-3">
                <p className="text-muted">📷 Arrastra la foto aquí</p>
                <p className="small text-muted">o haz clic para seleccionar</p>
              </div>
              <div className="mt-3 text-end">
                <button className="btn btn-outline-secondary me-2">Limpiar</button>
                <button className="btn btn-dark">Analizar</button>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Sugerencias</h5>
              <ul>
                <li>Tomar la foto con buena luz natural.</li>
                <li>Enfocar hojas afectadas a 20-30 cm.</li>
                <li>Evitar fondos muy complejos.</li>
              </ul>
            </div>
          </div>
        </div>
        {/* Columna derecha para resultados */}
        <div className="col-lg-4 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Resultado (wireframe)</h5>
              <div className="mt-4">
                <p className="mb-1 text-muted small">Etiqueta</p>
                <h4>Sana ✅</h4>
                <hr />
                <p className="mb-1 text-muted small">Confianza del modelo</p>
                <p className="fw-bold">92%</p>
                <p className="mb-1 text-muted small">Notas</p>
                <p>No se observan manchas ni decoloraciones.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainContent>
  );
}

const Analizar = Analytics; 
export default Analizar;