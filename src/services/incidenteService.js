const apiUrl = import.meta.env.VITE_API_URL;

export const fetchIncidenteGet = async (token, matricula) => {
  try {
    const resIncidente = await fetch(`${apiUrl}/incidente/${matricula}`, {
      headers: {
        "x-auth-token": token,
      },
    });

    if (!resIncidente.ok) {
      if (resIncidente.status === 401) {
        throw new Error(
          "Autorización rechazada. Por favor, inicia sesión de nuevo."
        );
      }

      throw new Error("Error al cargar los datos del servidor.");
    }

    const incidentes = await resIncidente.json();
    return { incidentes: incidentes || [] };
  } catch (error) {
    console.error("Error en el servicio fetchIncidenteGet:", error.message);
    throw error;
  }
};

export const fetchIncidentePost = async (token, matricula, datosParaEnviar) => {
  try {
     const resIncidente = await fetch(`${apiUrl}/incidente/${matricula}`, {
      method:"POST",
      headers: {
        "x-auth-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosParaEnviar),
    });

    if (!resIncidente.ok) {
      if (resIncidente.status === 401) {
        throw new Error(
          "Autorización rechazada. Por favor, inicia sesión de nuevo."
        );
      }

      throw new Error("Error al cargar los datos del servidor.");
    }

    const incidentes = await resIncidente.json();
    return { incidentes: incidentes || [] };
  } catch (error) {
     console.error("Error en el servicio fetchIncidentePost:", error.message);
    throw error;
  }
};
