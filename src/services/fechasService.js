const apiUrl = import.meta.env.VITE_API_URL;

export const fetchFechasGet = async (token) => {
  try {
    const resFechas = await fetch(`${apiUrl}/fechas`, {
      headers: {
        "x-auth-token": token,
      },
    });

    if (!resFechas.ok) {
      if (resFechas.status === 401) {
        throw new Error(
          "Autorización rechazada. Por favor, inicia sesión de nuevo."
        );
      }

      throw new Error("Error al cargar los datos del servidor.");
    }

    const fechas = await resFechas.json();
    return { fechas: fechas || [] };
  } catch (error) {
    console.error("Error en el servicio fetchIncidenteGet:", error.message);
    throw error;
  }
};

  export const createEvent = async (token, datosParaEnviar) => {
    try {
      const response = await fetch(`${apiUrl}/fechas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(datosParaEnviar),
      });
      if (!response.ok) {
        throw new Error("Error al ingresar un nuevo evento");
      }
      
      return response.json();
      
    } catch (error) {
      console.error("Error en el servicio createEvent:", error.message);
      throw error;
    }
  };