function Privacy() {
  return (
    <>
      <h2 className="fw-bold mb-4">Política de Privacidad</h2>
      <p className="text-muted">Última actualización: 21 de septiembre de 2025</p>
      <hr className="mb-4"/>

      <h5>1. Información que Recopilamos</h5>
      <p>Para proporcionarle el servicio PlantGuard, recopilamos la siguiente información:</p>
      <ul>
        <li><strong>Información de la cuenta:</strong> Nombre, dirección de correo electrónico y contraseña encriptada.</li>
        <li><strong>Datos de uso:</strong> Información sobre cómo interactúa con nuestra aplicación, como las funciones que utiliza y la frecuencia de sus análisis.</li>
        <li><strong>Imágenes de plantas:</strong> Las imágenes que sube para su análisis.</li>
      </ul>

      <h5>2. Cómo Usamos su Información</h5>
      <p>Utilizamos la información que recopilamos para los siguientes propósitos:</p>
      <ul>
        <li>Para operar y mantener el Servicio.</li>
        <li>Para personalizar y mejorar su experiencia.</li>
        <li>Para comunicarnos con usted, incluyendo el envío de notificaciones de servicio y alertas climáticas.</li>
        <li><strong>Para mejorar nuestro modelo de IA:</strong> Las imágenes que sube se utilizan de forma anónima para re-entrenar y mejorar la precisión de nuestro sistema de diagnóstico.</li>
      </ul>

      <h5>3. Seguridad de los Datos</h5>
      <p>Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos personales contra el acceso no autorizado, la alteración, la divulgación o la destrucción. Todas las comunicaciones con nuestros servidores están cifradas mediante SSL/TLS.</p>

      <hr className="mt-5"/>

    </>
  );
}

export default Privacy;