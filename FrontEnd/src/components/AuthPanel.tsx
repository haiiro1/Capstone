import React from "react";

function AuthPanel() {
  // Estilo para el gradiente
  const panelStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #2AF598 0%, #009EFD 100%)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '4rem'
  };

  return (
    <div style={panelStyle} className="w-100">
      {/* Contenido Superior */}
      <div>
        <h4 className="fw-bold">🌱 PlantGuard</h4>
      </div>

      {/* Contenido Central */}
      <div>
        <h1 className="display-4 fw-bold mb-4">
          Protege tus cultivos con IA y alertas climáticas
        </h1>
        <p className="lead">
          Analiza imágenes, recibe riesgos por clima y gestiona tu historial desde un solo lugar.
        </p>
      </div>

      {/* Contenido Inferior (Footer específico) */}
      <div>
        <p className="small">© Datos protegidos y cifrados</p>
      </div>
    </div>
  );
}

export default AuthPanel;