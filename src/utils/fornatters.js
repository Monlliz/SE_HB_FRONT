export function capitalizarPrimeraLetra(cadena) {
  if (!cadena) return cadena;
  return cadena[0].toUpperCase() + cadena.slice(1);
}

export function obtenerFechaFormateada() {
  const fechaActual = new Date();
  const opciones = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const fechaFormateada = fechaActual.toLocaleDateString('es-MX', opciones);
  return capitalizarPrimeraLetra(fechaFormateada);
}