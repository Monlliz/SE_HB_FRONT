// Función para codificar (objeto -> string raro)
export const codificarParams = (id, type) => {
  const data = JSON.stringify({ id, type });
  return btoa(data); // Convierte a Base64
};

// Función para decodificar (string raro -> objeto)
export const decodificarParams = (encodedStr) => {
  try {
    const jsonStr = atob(encodedStr); // Decodifica Base64
    return JSON.parse(jsonStr);
  } catch (e) {
    return { id: null, type: null }; // Si la URL está rota o manipulada
  }
};