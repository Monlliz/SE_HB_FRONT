//Texto=====================================================================
export function capitalizarPrimeraLetra(cadena) {
  if (!cadena) return cadena;
  return cadena[0].toUpperCase() + cadena.slice(1).toLowerCase();
}

//toma la primera palabra de una oracion
export function getFirstText (fullName) {
  if (!fullName) return '';
  return fullName.trim().split(' ')[0];
};

//pone en mayusculas la primera letra de cada palabra de una oracion 
export function capitalizarCadaPalabra(cadena) {
  if (!cadena) return cadena;

  return cadena
    .toLowerCase()          // 1. Convertir todo a minúsculas
    .split(' ')             // 2. Separar en un array de palabras
    .map(palabra =>         // 3. Recorrer cada palabra
      palabra.charAt(0).toUpperCase() + palabra.slice(1)
    )
    .join(' ');             // 4. Unir de nuevo con espacios
}
//Fechas======================================================================
export function obtenerFechaFormateada(mesyear = null) {
  const fechaActual = new Date();
  const completa = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const opciones = mesyear ? { month: 'long', year: 'numeric' } : completa;
  
  const fechaFormateada = fechaActual.toLocaleDateString('es-MX', opciones);
  return capitalizarPrimeraLetra(fechaFormateada);
}

//Fecha formateada dia de mes 
  export function formatearFechaISO(fechaISO) {
  if (!fechaISO) return "";

  // 1. Creamos el objeto Date directamente con el string completo
  const fecha = new Date(fechaISO);

  // 2. Configuramos las opciones. 
  // IMPORTANTE: 'timeZone: UTC' fuerza a que lea la fecha tal cual viene en el string (Z),
  // ignorando si en tu computadora es una hora diferente.
  const opciones = { 
    day: 'numeric', 
    month: 'long', 
    timeZone: 'UTC' 
  };

  // 3. Formateamos a español de México
  const resultado = fecha.toLocaleDateString('es-MX', opciones);

  return resultado
}

export function obtenerFechaYYYYMMDD(fechaISO) {
  if (!fechaISO) return "";

  const fecha = new Date(fechaISO);

  // 1. Obtenemos los datos en UTC para evitar el cambio de día
  const year = fecha.getUTCFullYear();
  
  // 2. Sumamos 1 al mes (porque enero es 0) y agregamos el '0' al inicio si hace falta
  const month = String(fecha.getUTCMonth() + 1).padStart(2, '0');
  
  // 3. Agregamos el '0' al día si hace falta
  const day = String(fecha.getUTCDate()).padStart(2, '0');

  // 4. Retornamos con guiones
  return `${year}-${month}-${day}`;
}


